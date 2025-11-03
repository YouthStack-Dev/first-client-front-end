import React, { useState, useRef, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  APIProvider,
  Map,
  Marker,
  InfoWindow,
  useMap,
} from "@vis.gl/react-google-maps";
import { Users, Merge, Split, Trash2, Route, Zap } from "lucide-react";
import { API_CLIENT } from "../../Api/API_Client";
import endpoint from "../../Api/Endpoints";
import { useSelector } from "react-redux";
import { selectBookingsByShift } from "../../redux/features/routes/roureSlice";

// Import components
import RouteRenderer from "./RouteRenderer";
import MapToolbar from "./MapToolbar";
import ClusterCard from "./ClusterCard";
import MergedRouteCard from "./MergedRouteCard";
import MergeConfirmationModal from "../modals/MergeConfirmationModal";
import ClusterDetailsModal from "../modals/ClusterDetailsModal";

// Utility functions
const calculateDistance = (point1, point2) => {
  const R = 6371;
  const dLat = ((point2.lat - point1.lat) * Math.PI) / 180;
  const dLng = ((point2.lng - point1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((point1.lat * Math.PI) / 180) *
      Math.cos((point2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const calculateRouteDistance = (route) => {
  let totalDistance = 0;
  for (let i = 0; i < route.length - 1; i++) {
    totalDistance += calculateDistance(route[i], route[i + 1]);
  }
  return totalDistance;
};

// Advanced shortest path with Google Maps Distance Matrix API
const findOptimalRouteSequenceWithGoogle = async (
  pickupPoints,
  destination,
  bookingData
) => {
  if (pickupPoints.length === 0) return { sequence: [], bookings: [] };
  if (pickupPoints.length === 1)
    return { sequence: pickupPoints, bookings: bookingData };

  try {
    if (!window.google?.maps) {
      throw new Error("Google Maps not loaded");
    }

    const service = new google.maps.DistanceMatrixService();

    const origins = pickupPoints.map(
      (p) => new google.maps.LatLng(p.lat, p.lng)
    );
    const destinations = [
      ...pickupPoints.map((p) => new google.maps.LatLng(p.lat, p.lng)),
      new google.maps.LatLng(destination.lat, destination.lng),
    ];

    const matrixResult = await new Promise((resolve, reject) => {
      service.getDistanceMatrix(
        {
          origins: origins,
          destinations: destinations,
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
        },
        (response, status) => {
          if (status === google.maps.DistanceMatrixStatus.OK) {
            resolve(response);
          } else {
            reject(new Error(`Distance Matrix failed: ${status}`));
          }
        }
      );
    });

    const distanceMatrix = [];
    for (let i = 0; i < pickupPoints.length; i++) {
      distanceMatrix[i] = [];
      for (let j = 0; j < destinations.length; j++) {
        const element = matrixResult.rows[i].elements[j];
        distanceMatrix[i][j] =
          element.status === "OK" ? element.distance.value : Infinity;
      }
    }

    const visited = new Set();
    const sequence = [];
    const bookingSequence = [];

    let currentIndex = 0;
    let minDistToDestination = distanceMatrix[0][pickupPoints.length];

    for (let i = 1; i < pickupPoints.length; i++) {
      const distToDestination = distanceMatrix[i][pickupPoints.length];
      if (distToDestination < minDistToDestination) {
        minDistToDestination = distToDestination;
        currentIndex = i;
      }
    }

    sequence.push(pickupPoints[currentIndex]);
    bookingSequence.push(bookingData[currentIndex]);
    visited.add(currentIndex);

    while (visited.size < pickupPoints.length) {
      let nearestIndex = -1;
      let nearestDistance = Infinity;

      for (let i = 0; i < pickupPoints.length; i++) {
        if (!visited.has(i)) {
          const distance = distanceMatrix[currentIndex][i];
          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestIndex = i;
          }
        }
      }

      if (nearestIndex !== -1) {
        sequence.push(pickupPoints[nearestIndex]);
        bookingSequence.push(bookingData[nearestIndex]);
        visited.add(nearestIndex);
        currentIndex = nearestIndex;
      }
    }

    let improved = true;
    let iterations = 0;
    const maxIterations = 50;

    while (improved && iterations < maxIterations) {
      improved = false;
      iterations++;

      for (let i = 0; i < sequence.length - 1; i++) {
        for (let j = i + 2; j < sequence.length; j++) {
          let currentDist = 0;
          for (let k = i; k < j; k++) {
            const fromIdx = pickupPoints.findIndex(
              (p) => p.lat === sequence[k].lat && p.lng === sequence[k].lng
            );
            const toIdx = pickupPoints.findIndex(
              (p) =>
                p.lat === sequence[k + 1].lat && p.lng === sequence[k + 1].lng
            );
            currentDist += distanceMatrix[fromIdx][toIdx];
          }

          const reversedSegment = sequence.slice(i, j + 1).reverse();
          let reversedDist = 0;
          for (let k = 0; k < reversedSegment.length - 1; k++) {
            const fromIdx = pickupPoints.findIndex(
              (p) =>
                p.lat === reversedSegment[k].lat &&
                p.lng === reversedSegment[k].lng
            );
            const toIdx = pickupPoints.findIndex(
              (p) =>
                p.lat === reversedSegment[k + 1].lat &&
                p.lng === reversedSegment[k + 1].lng
            );
            reversedDist += distanceMatrix[fromIdx][toIdx];
          }

          if (reversedDist < currentDist - 100) {
            const segmentBookings = bookingSequence.slice(i, j + 1).reverse();
            sequence.splice(i, j - i + 1, ...reversedSegment);
            bookingSequence.splice(i, j - i + 1, ...segmentBookings);
            improved = true;
          }
        }
      }
    }

    return { sequence, bookings: bookingSequence };
  } catch (error) {
    console.error("Google Maps optimization error:", error);
    return findOptimalRouteSequenceFallback(
      pickupPoints,
      destination,
      bookingData
    );
  }
};

// Fallback optimization using haversine distance
const findOptimalRouteSequenceFallback = (
  pickupPoints,
  destination,
  bookingData
) => {
  if (pickupPoints.length === 0) return { sequence: [], bookings: [] };
  if (pickupPoints.length === 1)
    return { sequence: pickupPoints, bookings: bookingData };

  let startIndex = 0;
  let minDistance = calculateDistance(destination, pickupPoints[0]);

  for (let i = 1; i < pickupPoints.length; i++) {
    const distance = calculateDistance(destination, pickupPoints[i]);
    if (distance < minDistance) {
      minDistance = distance;
      startIndex = i;
    }
  }

  const points = [...pickupPoints];
  const bookings = [...bookingData];
  const sequence = [];
  const bookingSequence = [];
  let currentPoint = points[startIndex];
  let currentBooking = bookings[startIndex];

  sequence.push(currentPoint);
  bookingSequence.push(currentBooking);
  points.splice(startIndex, 1);
  bookings.splice(startIndex, 1);

  while (points.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = calculateDistance(currentPoint, points[0]);

    for (let i = 1; i < points.length; i++) {
      const distance = calculateDistance(currentPoint, points[i]);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }

    sequence.push(points[nearestIndex]);
    bookingSequence.push(bookings[nearestIndex]);
    currentPoint = points[nearestIndex];
    currentBooking = bookings[nearestIndex];
    points.splice(nearestIndex, 1);
    bookings.splice(nearestIndex, 1);
  }

  return { sequence, bookings: bookingSequence };
};

const getClusterColor = (clusterId) => {
  const colors = [
    "#3B82F6",
    "#EF4444",
    "#10B981",
    "#F59E0B",
    "#8B5CF6",
    "#EC4899",
    "#14B8A6",
    "#F97316",
    "#6366F1",
    "#84CC16",
  ];
  const numericId =
    typeof clusterId === "string"
      ? parseInt(clusterId.replace(/\D/g, "")) || 0
      : clusterId;
  return colors[Math.abs(numericId) % colors.length];
};

const isEmptyData = (data) => {
  return !data || !data.clusters || data.clusters.length === 0;
};

const ClusterMapViewer = ({ mode = "suggestions" }) => {
  const { shiftId, date } = useParams();
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiMessage, setApiMessage] = useState("");
  const [selectedMergedRoutes, setSelectedMergedRoutes] = useState(new Set());
  const [selectedClusters, setSelectedClusters] = useState(new Set());
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [showRoutes, setShowRoutes] = useState(true);
  const [routeWidth, setRouteWidth] = useState("medium");
  const [commonDestination, setCommonDestination] = useState(null);
  const [selectedClusterDetails, setSelectedClusterDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergedRoutes, setMergedRoutes] = useState({});
  const [savedRoutes, setSavedRoutes] = useState({});
  const [mergeOptimization, setMergeOptimization] = useState(true);

  // New states for shortest path optimization
  const [shortPath, setShortPath] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizedBookingOrder, setOptimizedBookingOrder] = useState([]);
  const [totalDistance, setTotalDistance] = useState(0);

  const bookings = useSelector(selectBookingsByShift(shiftId));

  // Fetch data from API
  useEffect(() => {
    const fetchRouteData = async () => {
      try {
        setLoading(true);
        setError(null);
        setApiMessage("");
        setRouteData(null);

        let apiEndpoint = "";
        if (mode === "suggestions") {
          apiEndpoint = `${endpoint.routesuggestion}?booking_date=${date}&shift_id=${shiftId}&tenant_id=SAM001`;
        } else if (mode === "saved") {
          apiEndpoint = `${endpoint.savedRoutes}?tenant_id=SAM001&booking_date=${date}&shift_id=${shiftId}`;
        }

        const response = await API_CLIENT.get(apiEndpoint);

        if (response.data.success) {
          const apiData = response.data.data;
          const message = response.data.message || "";

          if (message) {
            setApiMessage(message);
          }

          if (isEmptyData(apiData)) {
            setRouteData({ route_clusters: [] });
            return;
          }

          const transformedData = {
            route_clusters: apiData.clusters
              ? apiData.clusters.map((cluster) => ({
                  cluster_id: cluster.cluster_id,
                  bookings: cluster.bookings.map((booking) => ({
                    booking_id: booking.booking_id,
                    employee_code: booking.employee_code,
                    employee_id: booking.employee_id,
                    pickup_latitude: booking.pickup_latitude,
                    pickup_longitude: booking.pickup_longitude,
                    pickup_location: booking.pickup_location,
                    drop_latitude: booking.drop_latitude,
                    drop_longitude: booking.drop_longitude,
                    drop_location: booking.drop_location,
                    status: booking.status,
                    team_id: booking.team_id,
                    booking_date: booking.booking_date,
                    reason: booking.reason,
                    tenant_id: booking.tenant_id,
                    shift_id: booking.shift_id,
                    created_at: booking.created_at,
                    updated_at: booking.updated_at,
                  })),
                }))
              : [],
            total_clusters: apiData.total_clusters || 0,
            total_bookings: apiData.total_bookings || 0,
            shift: apiData.shift || null,
          };

          setRouteData(transformedData);

          if (
            apiData.clusters &&
            apiData.clusters.length > 0 &&
            apiData.clusters[0].bookings.length > 0
          ) {
            const firstBooking = apiData.clusters[0].bookings[0];
            setCommonDestination({
              lat: firstBooking.drop_latitude,
              lng: firstBooking.drop_longitude,
              address: firstBooking.drop_location,
            });
          } else {
            setCommonDestination(null);
          }
        } else {
          throw new Error(response.data.message || "Failed to fetch data");
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to fetch route data"
        );
        console.error("Error fetching route data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (shiftId && date) {
      fetchRouteData();
    } else {
      setLoading(false);
      setError("Missing shift ID or date parameters");
    }
  }, [mode, shiftId, date]);

  // Optimize route when shortPath is toggled
  useEffect(() => {
    const optimizeRoute = async () => {
      if (!shortPath || !routeData || !commonDestination) {
        setOptimizedBookingOrder([]);
        return;
      }

      const allSelectedBookings = [];

      selectedClusters.forEach((clusterId) => {
        const cluster = routeData.route_clusters.find(
          (c) => c.cluster_id === clusterId
        );
        if (cluster) {
          cluster.bookings.forEach((booking) => {
            allSelectedBookings.push(booking);
          });
        }
      });

      Object.values(mergedRoutes).forEach((mergedRoute) => {
        if (selectedMergedRoutes.has(mergedRoute.clusterId)) {
          mergedRoute.bookings.forEach((booking) => {
            allSelectedBookings.push(booking);
          });
        }
      });

      if (allSelectedBookings.length === 0) {
        setOptimizedBookingOrder([]);
        return;
      }

      setOptimizing(true);
      console.log(
        `🔄 Optimizing route for ${allSelectedBookings.length} bookings using Google Maps API...`
      );

      try {
        const pickupPoints = allSelectedBookings.map((b) => ({
          lat: b.pickup_latitude,
          lng: b.pickup_longitude,
        }));

        const result = await findOptimalRouteSequenceWithGoogle(
          pickupPoints,
          commonDestination,
          allSelectedBookings
        );

        setOptimizedBookingOrder(result.bookings);

        console.log("✅ Route optimization complete!");
        console.log(
          "Optimized booking order:",
          result.bookings.map((b) => b.employee_code).join(" → ")
        );
      } catch (error) {
        console.error("❌ Optimization error:", error);
        setOptimizedBookingOrder(allSelectedBookings);
      } finally {
        setOptimizing(false);
      }
    };

    const timeoutId = setTimeout(optimizeRoute, 500);
    return () => clearTimeout(timeoutId);
  }, [
    shortPath,
    selectedClusters,
    selectedMergedRoutes,
    routeData,
    commonDestination,
    mergedRoutes,
  ]);

  const handleToggleMergedRouteSelection = (mergedRouteId) => {
    const newSelected = new Set(selectedMergedRoutes);
    if (newSelected.has(mergedRouteId)) {
      newSelected.delete(mergedRouteId);
    } else {
      newSelected.add(mergedRouteId);
    }
    setSelectedMergedRoutes(newSelected);
  };

  const handleClusterToggle = (clusterId) => {
    const newSelected = new Set(selectedClusters);
    if (newSelected.has(clusterId)) {
      newSelected.delete(clusterId);
    } else {
      newSelected.add(clusterId);
    }
    setSelectedClusters(newSelected);
  };

  const handleMergeClusters = async () => {
    if (selectedClusters.size < 2) {
      alert("Please select at least 2 clusters to merge");
      return;
    }
    setShowMergeModal(true);
  };

  const handleConfirmMerge = async () => {
    const selectedClusterArray = Array.from(selectedClusters);
    const mergedId = `merged-${Date.now()}`;

    const allBookings = [];
    const allPickupPoints = [];

    selectedClusterArray.forEach((clusterId) => {
      const cluster = routeData.route_clusters.find(
        (c) => c.cluster_id === clusterId
      );
      if (cluster) {
        allBookings.push(...cluster.bookings);
        cluster.bookings.forEach((booking) => {
          allPickupPoints.push({
            lat: booking.pickup_latitude,
            lng: booking.pickup_longitude,
            bookingId: booking.booking_id,
            employeeCode: booking.employee_code,
          });
        });
      }
    });

    setOptimizing(true);
    let result;

    if (mergeOptimization) {
      result = await findOptimalRouteSequenceWithGoogle(
        allPickupPoints,
        commonDestination,
        allBookings
      );
    } else {
      result = { sequence: allPickupPoints, bookings: allBookings };
    }

    setOptimizing(false);

    const mergedRoute = {
      clusterId: mergedId,
      originalClusterIds: selectedClusterArray,
      bookings: result.bookings,
      optimizedPath: [...result.sequence, commonDestination],
      optimalSequence: result.sequence,
      createdAt: new Date().toISOString(),
    };

    setMergedRoutes((prev) => ({
      ...prev,
      [mergedId]: mergedRoute,
    }));

    setSelectedMergedRoutes((prev) => new Set(prev).add(mergedId));
    setSelectedClusters(new Set());
    setShowMergeModal(false);
  };

  const handleUnmerge = (mergedRouteId) => {
    setMergedRoutes((prev) => {
      const newMergedRoutes = { ...prev };
      delete newMergedRoutes[mergedRouteId];
      return newMergedRoutes;
    });

    setSelectedMergedRoutes((prev) => {
      const newSelected = new Set(prev);
      newSelected.delete(mergedRouteId);
      return newSelected;
    });
  };

  const handleDeleteMergedRoute = (mergedRouteId) => {
    if (window.confirm("Are you sure you want to delete this merged route?")) {
      handleUnmerge(mergedRouteId);
    }
  };

  const handleSaveRoute = (routeId) => {
    const routeToSave = mergedRoutes[routeId];
    if (!routeToSave) return;

    setSavedRoutes((prev) => ({
      ...prev,
      [routeId]: {
        ...routeToSave,
        savedAt: new Date().toISOString(),
      },
    }));

    alert("Route saved successfully!");
  };

  const handleShowClusterDetails = (cluster) => {
    const routes = getRoutes();
    const clusterRoute = routes.find((r) => r.clusterId === cluster.cluster_id);
    setSelectedClusterDetails({
      cluster,
      clusterRoute,
    });
    setIsModalOpen(true);
  };

  const getRoutes = () => {
    if (
      !routeData ||
      !routeData.route_clusters ||
      routeData.route_clusters.length === 0 ||
      !commonDestination
    )
      return [];

    const routes = [];

    if (shortPath && optimizedBookingOrder.length > 0) {
      // Single optimized route for all selections
      const optimizedPath = [
        ...optimizedBookingOrder.map((b) => ({
          lat: b.pickup_latitude,
          lng: b.pickup_longitude,
        })),
        commonDestination,
      ];

      routes.push({
        clusterId: "optimized-single-route",
        optimizedPath: optimizedPath,
        optimalSequence: optimizedBookingOrder.map((b) => ({
          lat: b.pickup_latitude,
          lng: b.pickup_longitude,
        })),
        isOptimized: true,
      });
    } else {
      // Original cluster routes
      routeData.route_clusters.forEach((cluster) => {
        if (selectedClusters.has(cluster.cluster_id)) {
          const pickupPoints = cluster.bookings.map((booking) => ({
            lat: booking.pickup_latitude,
            lng: booking.pickup_longitude,
            bookingId: booking.booking_id,
            employeeCode: booking.employee_code,
          }));

          const { sequence } = findOptimalRouteSequenceFallback(
            pickupPoints,
            commonDestination,
            cluster.bookings
          );

          const optimizedPath = [...sequence, commonDestination];

          routes.push({
            clusterId: cluster.cluster_id,
            optimizedPath: optimizedPath,
            optimalSequence: sequence,
          });
        }
      });

      // Merged routes
      Object.values(mergedRoutes).forEach((mergedRoute) => {
        if (selectedMergedRoutes.has(mergedRoute.clusterId)) {
          routes.push({
            clusterId: mergedRoute.clusterId,
            optimizedPath: mergedRoute.optimizedPath,
            optimalSequence: mergedRoute.optimalSequence,
            isMerged: true,
          });
        }
      });
    }

    return routes;
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClusterDetails(null);
  };

  const markers = useMemo(() => {
    if (
      !routeData ||
      !routeData.route_clusters ||
      routeData.route_clusters.length === 0
    )
      return [];

    const markers = [];

    routeData.route_clusters.forEach((cluster) => {
      if (selectedClusters.has(cluster.cluster_id)) {
        cluster.bookings.forEach((booking) => {
          markers.push({
            clusterId: cluster.cluster_id,
            booking,
            position: {
              lat: booking.pickup_latitude,
              lng: booking.pickup_longitude,
            },
            type: "pickup",
          });
        });
      }
    });

    Object.values(mergedRoutes).forEach((mergedRoute) => {
      if (selectedMergedRoutes.has(mergedRoute.clusterId)) {
        mergedRoute.bookings.forEach((booking) => {
          markers.push({
            clusterId: mergedRoute.clusterId,
            booking,
            position: {
              lat: booking.pickup_latitude,
              lng: booking.pickup_longitude,
            },
            type: "pickup",
            isMerged: true,
          });
        });
      }
    });

    if (commonDestination) {
      markers.push({
        clusterId: "destination",
        booking: null,
        position: commonDestination,
        type: "destination",
      });
    }

    return markers;
  }, [
    routeData,
    selectedClusters,
    mergedRoutes,
    commonDestination,
    selectedMergedRoutes,
  ]);

  const routes = useMemo(() => {
    if (
      !routeData ||
      !routeData.route_clusters ||
      routeData.route_clusters.length === 0 ||
      !commonDestination
    )
      return [];

    const routes = [];

    if (shortPath && optimizedBookingOrder.length > 0) {
      const optimizedPath = [
        ...optimizedBookingOrder.map((b) => ({
          lat: b.pickup_latitude,
          lng: b.pickup_longitude,
        })),
        commonDestination,
      ];

      routes.push({
        clusterId: "optimized-single-route",
        optimizedPath: optimizedPath,
        color: "#6366F1",
        isOptimized: true,
        isSelected: true,
      });
    } else {
      routeData.route_clusters.forEach((cluster) => {
        if (selectedClusters.has(cluster.cluster_id)) {
          const pickupPoints = cluster.bookings.map((booking) => ({
            lat: booking.pickup_latitude,
            lng: booking.pickup_longitude,
          }));

          const { sequence } = findOptimalRouteSequenceFallback(
            pickupPoints,
            commonDestination,
            cluster.bookings
          );

          const optimizedPath = [...sequence, commonDestination];

          routes.push({
            clusterId: cluster.cluster_id,
            optimizedPath: optimizedPath,
            color: getClusterColor(cluster.cluster_id),
            isSelected: true,
          });
        }
      });

      Object.values(mergedRoutes).forEach((mergedRoute) => {
        if (selectedMergedRoutes.has(mergedRoute.clusterId)) {
          routes.push({
            clusterId: mergedRoute.clusterId,
            optimizedPath: mergedRoute.optimizedPath,
            color: "#8B5CF6",
            isMerged: true,
            isSelected: true,
          });
        }
      });
    }

    return routes;
  }, [
    routeData,
    selectedClusters,
    mergedRoutes,
    commonDestination,
    selectedMergedRoutes,
    shortPath,
    optimizedBookingOrder,
  ]);

  const getMarkerIcon = (marker) => {
    if (marker.type === "destination") {
      return {
        path: "M 0, 0 m -5, 0 a 5,5 0 1,0 10,0 a 5,5 0 1,0 -10,0",
        scale: 2,
        fillColor: "#DC2626",
        fillOpacity: 0.9,
        strokeColor: "#ffffff",
        strokeWeight: 2,
      };
    }

    return {
      path: "M 0, 0 m -5, 0 a 5,5 0 1,0 10,0 a 5,5 0 1,0 -10,0",
      scale: 1.6,
      fillColor: marker.isMerged
        ? "#8B5CF6"
        : getClusterColor(marker.clusterId),
      fillOpacity: 0.9,
      strokeColor: "#ffffff",
      strokeWeight: 2,
    };
  };

  const API_KEY = import.meta.env.VITE_GOOGLE_API || "";

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-lg">
          Loading {mode === "suggestions" ? "suggested" : "saved"} routes...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-2">Error loading routes</div>
          <div className="text-sm text-gray-600">{error}</div>
        </div>
      </div>
    );
  }

  if (
    !routeData ||
    isEmptyData(routeData) ||
    routeData.route_clusters.length === 0
  ) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-lg text-gray-600 mb-4">
            No {mode === "suggestions" ? "suggested" : "saved"} routes found
          </div>
          {apiMessage ? (
            <div className="text-sm text-gray-500 bg-gray-100 p-4 rounded-lg">
              {apiMessage}
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              No routes available for the selected shift and date.
            </div>
          )}
          <div className="mt-4 text-xs text-gray-400">
            Shift: {shiftId} · Date: {date}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-1/3 bg-white border-r border-gray-200 overflow-y-auto flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
          <h2 className="text-xl font-semibold text-gray-800">
            {mode === "suggestions" ? "Suggested Routes" : "Saved Routes"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {routeData.total_clusters} clusters · {routeData.total_bookings}{" "}
            bookings
            {Object.keys(mergedRoutes).length > 0 &&
              ` · ${Object.keys(mergedRoutes).length} merged`}
          </p>
        </div>

        <MapToolbar
          selectedClusters={selectedClusters}
          routeWidth={routeWidth}
          showRoutes={showRoutes}
          shortPath={shortPath}
          optimizing={optimizing}
          totalDistance={totalDistance}
          onMergeClusters={handleMergeClusters}
          onRouteWidthChange={setRouteWidth}
          onToggleRoutes={() => setShowRoutes(!showRoutes)}
          onToggleShortPath={() => setShortPath(!shortPath)}
          mergeOptimization={mergeOptimization}
          onToggleOptimization={() => setMergeOptimization(!mergeOptimization)}
        />

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {Object.keys(mergedRoutes).length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Merge className="w-4 h-4 text-purple-600" />
                  Merged Routes
                </h3>
                <span className="text-xs text-gray-500 bg-purple-100 px-2 py-1 rounded">
                  {Object.keys(mergedRoutes).length} merged
                </span>
              </div>
              <div className="space-y-2">
                {Object.values(mergedRoutes).map((mergedRoute) => (
                  <MergedRouteCard
                    key={mergedRoute.clusterId}
                    mergedRoute={mergedRoute}
                    onSaveRoute={handleSaveRoute}
                    onUnmerge={handleUnmerge}
                    onDelete={handleDeleteMergedRoute}
                    isSaved={!!savedRoutes[mergedRoute.clusterId]}
                    isSelected={selectedMergedRoutes.has(mergedRoute.clusterId)}
                    onToggleSelect={handleToggleMergedRouteSelection}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">Clusters</h3>
            <span className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded">
              {routeData.route_clusters.length} total
            </span>
          </div>
          {routeData.route_clusters.map((cluster) => (
            <ClusterCard
              key={cluster.cluster_id}
              cluster={cluster}
              isSelected={selectedClusters.has(cluster.cluster_id)}
              onToggleSelect={handleClusterToggle}
              onShowDetails={handleShowClusterDetails}
              getClusterColor={getClusterColor}
              isMerged={Object.values(mergedRoutes).some((merged) =>
                merged.originalClusterIds.includes(cluster.cluster_id)
              )}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 relative">
        <APIProvider apiKey={API_KEY}>
          <Map
            defaultCenter={commonDestination || { lat: 12.935, lng: 77.62 }}
            defaultZoom={13}
            mapId="route-cluster-map"
            gestureHandling="greedy"
            disableDefaultUI={false}
          >
            {markers.map((marker, index) => (
              <Marker
                key={`${marker.clusterId}-${marker.type}-${index}`}
                position={marker.position}
                onClick={() => setSelectedMarker(marker)}
                icon={getMarkerIcon(marker)}
              />
            ))}

            {showRoutes && (
              <RouteRenderer
                routes={routes}
                showRoutes={showRoutes}
                routeWidth={routeWidth}
                onRouteDistanceCalculated={setTotalDistance}
              />
            )}

            {selectedMarker && (
              <InfoWindow
                position={selectedMarker.position}
                onCloseClick={() => setSelectedMarker(null)}
              >
                <div className="p-2">
                  {selectedMarker.type === "destination" ? (
                    <>
                      <p className="font-semibold text-sm mb-1 text-red-700">
                        Common Destination
                      </p>
                      <p className="text-xs text-gray-600 mb-1">
                        {commonDestination?.address}
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedMarker.position.lat.toFixed(4)},{" "}
                        {selectedMarker.position.lng.toFixed(4)}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-sm mb-1">
                        {selectedMarker.isMerged
                          ? "Merged Cluster"
                          : `Cluster ${selectedMarker.clusterId}`}{" "}
                        - Pickup
                      </p>
                      <p className="text-xs text-gray-600 mb-1">
                        {selectedMarker.booking.employee_code}
                      </p>
                      <p className="text-xs text-gray-500">
                        Booking ID: {selectedMarker.booking.booking_id}
                      </p>
                      {selectedMarker.isMerged && (
                        <p className="text-xs text-purple-600 font-medium mt-1">
                          Merged Route
                        </p>
                      )}
                    </>
                  )}
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      </div>

      <MergeConfirmationModal
        showMergeModal={showMergeModal}
        setShowMergeModal={setShowMergeModal}
        selectedClusters={selectedClusters}
        onConfirmMerge={handleConfirmMerge}
        routeData={routeData}
        commonDestination={commonDestination}
        mergeOptimization={mergeOptimization}
        onToggleOptimization={() => setMergeOptimization(!mergeOptimization)}
      />

      <ClusterDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        selectedClusterDetails={selectedClusterDetails}
        commonDestination={commonDestination}
        getClusterColor={getClusterColor}
      />
    </div>
  );
};

export default ClusterMapViewer;

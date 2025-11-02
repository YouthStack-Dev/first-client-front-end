import React, { useState, useRef, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  APIProvider,
  Map,
  Marker,
  InfoWindow,
  useMap,
} from "@vis.gl/react-google-maps";
import { Users, Merge, Split, Trash2, Route } from "lucide-react";
import { API_CLIENT } from "../../Api/API_Client";
import endpoint from "../../Api/Endpoints";

// Import components
import RouteRenderer from "./RouteRenderer";
import MapToolbar from "./MapToolbar";
import ClusterCard from "./ClusterCard";
import MergedRouteCard from "./MergedRouteCard";
import MergeConfirmationModal from "../modals/MergeConfirmationModal";
import ClusterDetailsModal from "../modals/ClusterDetailsModal";

// Import utilities
import {
  calculateDistance,
  findOptimalRouteSequence,
  getClusterColor,
  getWidthSettings,
  isEmptyData,
  optimizeMergedRoute,
} from "../../utils/routeHelpers";
import { useSelector } from "react-redux";
import { selectBookingsByShift } from "../../redux/features/routes/roureSlice";

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

  // New states for merge functionality
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergedRoutes, setMergedRoutes] = useState({});
  const [savedRoutes, setSavedRoutes] = useState({});
  const [mergeOptimization, setMergeOptimization] = useState(true);

  const bookings = useSelector(selectBookingsByShift(shiftId));

  const handleToggleMergedRouteSelection = (mergedRouteId) => {
    const newSelected = new Set(selectedMergedRoutes);
    if (newSelected.has(mergedRouteId)) {
      newSelected.delete(mergedRouteId);
    } else {
      newSelected.add(mergedRouteId);
    }
    setSelectedMergedRoutes(newSelected);
  };

  // Fetch data based on mode using Axios
  useEffect(() => {
    const fetchRouteData = async () => {
      try {
        setLoading(true);
        setError(null);
        setApiMessage("");
        setRouteData(null);

        let apiEndpoint = "";
        if (mode === "suggestions") {
          apiEndpoint = `${
            endpoint.routesuggestion
          }?booking_date=${date}&shift_id=${shiftId}&${"SAM001"}`;
        } else if (mode === "saved") {
          apiEndpoint = `${
            endpoint.savedRoutes
          }?tenant_id=${"SAM001"}&booking_date=${date}&shift_id=${shiftId}`;
        }

        const response = await API_CLIENT.get(apiEndpoint);

        if (response.data.success) {
          const apiData = response.data.data;
          const message = response.data.message || "";

          // Store API message for empty states
          if (message) {
            setApiMessage(message);
          }

          // Check if data is empty
          if (isEmptyData(apiData)) {
            setRouteData({ route_clusters: [] });
            return;
          }

          // Transform API data to match your component structure
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

          // Set common destination from the first booking's drop location if available
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

  // Handle cluster selection toggle
  const handleClusterToggle = (clusterId) => {
    const newSelected = new Set(selectedClusters);
    if (newSelected.has(clusterId)) {
      newSelected.delete(clusterId);
    } else {
      newSelected.add(clusterId);
    }
    setSelectedClusters(newSelected);
  };

  // Handle merge clusters
  const handleMergeClusters = () => {
    if (selectedClusters.size < 2) {
      alert("Please select at least 2 clusters to merge");
      return;
    }
    setShowMergeModal(true);
  };

  // Calculate route efficiency before merging
  const calculateRouteEfficiency = (clusterIds) => {
    if (!routeData || !commonDestination)
      return { totalDistance: 0, optimizedDistance: 0 };

    let totalDistance = 0;
    const allPickupPoints = [];

    clusterIds.forEach((clusterId) => {
      const cluster = routeData.route_clusters.find(
        (c) => c.cluster_id === clusterId
      );
      if (cluster) {
        const pickupPoints = cluster.bookings.map((booking) => ({
          lat: booking.pickup_latitude,
          lng: booking.pickup_longitude,
          bookingId: booking.booking_id,
        }));

        // Calculate individual cluster distance
        const clusterSequence = findOptimalRouteSequence(
          pickupPoints,
          commonDestination
        );
        const clusterDistance = calculateRouteDistance([
          ...clusterSequence,
          commonDestination,
        ]);
        totalDistance += clusterDistance;

        allPickupPoints.push(...pickupPoints);
      }
    });

    // Calculate optimized merged distance
    const mergedSequence = findOptimalRouteSequence(
      allPickupPoints,
      commonDestination
    );
    const optimizedDistance = calculateRouteDistance([
      ...mergedSequence,
      commonDestination,
    ]);

    return { totalDistance, optimizedDistance };
  };

  // Calculate distance for a route path
  const calculateRouteDistance = (path) => {
    let distance = 0;
    for (let i = 0; i < path.length - 1; i++) {
      distance += calculateDistance(path[i], path[i + 1]);
    }
    return distance;
  };

  // Confirm merge with optimized route
  const handleConfirmMerge = () => {
    const selectedClusterArray = Array.from(selectedClusters);
    const mergedId = `merged-${Date.now()}`;

    // Get all bookings from selected clusters
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

    // Calculate optimized route
    let optimalSequence;
    if (mergeOptimization) {
      optimalSequence = findOptimalRouteSequence(
        allPickupPoints,
        commonDestination
      );
    } else {
      // Simple concatenation without optimization
      optimalSequence = allPickupPoints;
    }

    // Create merged route with optimization data
    const { totalDistance, optimizedDistance } =
      calculateRouteEfficiency(selectedClusterArray);
    const efficiencyImprovement = totalDistance - optimizedDistance;

    const mergedRoute = {
      clusterId: mergedId,
      originalClusterIds: selectedClusterArray,
      bookings: allBookings,
      optimizedPath: [...optimalSequence, commonDestination],
      optimalSequence: optimalSequence,
      createdAt: new Date().toISOString(),
      efficiencyData: {
        originalDistance: totalDistance,
        optimizedDistance: optimizedDistance,
        improvement: efficiencyImprovement,
        improvementPercentage: (
          (efficiencyImprovement / totalDistance) *
          100
        ).toFixed(1),
      },
    };

    // Update merged routes state
    setMergedRoutes((prev) => ({
      ...prev,
      [mergedId]: mergedRoute,
    }));

    // Automatically select the newly merged route for display
    setSelectedMergedRoutes((prev) => new Set(prev).add(mergedId));

    // Remove original clusters from selected
    setSelectedClusters(new Set());

    setShowMergeModal(false);
  };

  // Handle unmerge
  const handleUnmerge = (mergedRouteId) => {
    setMergedRoutes((prev) => {
      const newMergedRoutes = { ...prev };
      delete newMergedRoutes[mergedRouteId];
      return newMergedRoutes;
    });

    // Remove from selected merged routes
    setSelectedMergedRoutes((prev) => {
      const newSelected = new Set(prev);
      newSelected.delete(mergedRouteId);
      return newSelected;
    });
  };

  // Handle delete merged route
  const handleDeleteMergedRoute = (mergedRouteId) => {
    if (window.confirm("Are you sure you want to delete this merged route?")) {
      setMergedRoutes((prev) => {
        const newMergedRoutes = { ...prev };
        delete newMergedRoutes[mergedRouteId];
        return newMergedRoutes;
      });

      // Remove from selected merged routes
      setSelectedMergedRoutes((prev) => {
        const newSelected = new Set(prev);
        newSelected.delete(mergedRouteId);
        return newSelected;
      });
    }
  };

  // Save route
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
    console.log(" this are the saved routes :", savedRoutes);

    alert("Route saved successfully!");
  };

  // Show cluster details in modal
  const handleShowClusterDetails = (cluster) => {
    console.log(" this is the cluseter:", cluster);

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

    // Original cluster routes
    routeData.route_clusters.forEach((cluster) => {
      if (selectedClusters.has(cluster.cluster_id)) {
        const pickupPoints = cluster.bookings.map((booking) => ({
          lat: booking.pickup_latitude,
          lng: booking.pickup_longitude,
          bookingId: booking.booking_id,
          employeeCode: booking.employee_code,
        }));

        const optimalSequence = findOptimalRouteSequence(
          pickupPoints,
          commonDestination
        );

        const optimizedPath = [...optimalSequence, commonDestination];

        routes.push({
          clusterId: cluster.cluster_id,
          optimizedPath: optimizedPath,
          optimalSequence: optimalSequence,
        });
      }
    });

    // Merged routes
    Object.values(mergedRoutes).forEach((mergedRoute) => {
      const pickupPoints = mergedRoute.bookings.map((booking) => ({
        lat: booking.pickup_latitude,
        lng: booking.pickup_longitude,
        bookingId: booking.booking_id,
        employeeCode: booking.employee_code,
      }));

      const optimalSequence = findOptimalRouteSequence(
        pickupPoints,
        commonDestination
      );

      const optimizedPath = [...optimalSequence, commonDestination];

      routes.push({
        clusterId: mergedRoute.clusterId,
        optimizedPath: optimizedPath,
        optimalSequence: optimalSequence,
        isMerged: true,
      });
    });

    return routes;
  };
  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClusterDetails(null);
  };

  // Get all markers including merged routes - Memoized for performance
  const markers = useMemo(() => {
    if (
      !routeData ||
      !routeData.route_clusters ||
      routeData.route_clusters.length === 0
    )
      return [];

    const markers = [];

    // Add markers from original clusters (only if selected)
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

    // Add markers from merged routes (only if selected)
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

    // Common destination marker
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

  // Generate routes including merged routes - Memoized for performance
  const routes = useMemo(() => {
    if (
      !routeData ||
      !routeData.route_clusters ||
      routeData.route_clusters.length === 0 ||
      !commonDestination
    )
      return [];

    const routes = [];

    // Original cluster routes (only if selected)
    routeData.route_clusters.forEach((cluster) => {
      if (selectedClusters.has(cluster.cluster_id)) {
        const pickupPoints = cluster.bookings.map((booking) => ({
          lat: booking.pickup_latitude,
          lng: booking.pickup_longitude,
          bookingId: booking.booking_id,
          employeeCode: booking.employee_code,
        }));

        const optimalSequence = findOptimalRouteSequence(
          pickupPoints,
          commonDestination
        );

        const optimizedPath = [...optimalSequence, commonDestination];

        routes.push({
          clusterId: cluster.cluster_id,
          optimizedPath: optimizedPath,
          optimalSequence: optimalSequence,
          isSelected: true,
        });
      }
    });

    // Merged routes (only if selected for display)
    Object.values(mergedRoutes).forEach((mergedRoute) => {
      if (selectedMergedRoutes.has(mergedRoute.clusterId)) {
        routes.push({
          clusterId: mergedRoute.clusterId,
          optimizedPath: mergedRoute.optimizedPath,
          optimalSequence: mergedRoute.optimalSequence,
          isMerged: true,
          efficiencyData: mergedRoute.efficiencyData,
          isSelected: true,
        });
      }
    });

    return routes;
  }, [
    routeData,
    selectedClusters,
    mergedRoutes,
    commonDestination,
    selectedMergedRoutes,
  ]);

  // Helper function to create marker icon configuration
  const getMarkerIcon = (marker) => {
    if (marker.type === "destination") {
      return {
        path: "M 0, 0 m -5, 0 a 5,5 0 1,0 10,0 a 5,5 0 1,0 -10,0", // Circle
        scale: 2,
        fillColor: "#DC2626", // Red for destination
        fillOpacity: 0.9,
        strokeColor: "#ffffff",
        strokeWeight: 2,
      };
    }

    // For pickup markers
    return {
      path: "M 0, 0 m -5, 0 a 5,5 0 1,0 10,0 a 5,5 0 1,0 -10,0", // Circle
      scale: 1.6,
      fillColor: marker.isMerged
        ? "#8B5CF6" // Purple for merged clusters
        : getClusterColor(marker.clusterId),
      fillOpacity: 0.9,
      strokeColor: "#ffffff",
      strokeWeight: 2,
    };
  };

  // Helper function to create marker label
  const getMarkerLabel = (marker) => {
    if (marker.type === "destination") {
      return {
        text: "DEST",
        color: "#ffffff",
        fontSize: "10px",
        fontWeight: "bold",
      };
    }

    if (marker.type === "pickup") {
      return {
        text: marker.isMerged ? "M" : "P",
        color: "#ffffff",
        fontSize: "10px",
        fontWeight: "bold",
      };
    }

    return undefined;
  };

  const API_KEY = import.meta.env.VITE_GOOGLE_API || "";

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-lg">
          Loading {mode === "suggestions" ? "suggested" : "saved"} routes...
        </div>
      </div>
    );
  }

  // Error state
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

  // No data state
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
      {/* Left Sidebar - Compact Cluster List */}
      <div className="w-1/3 bg-white border-r border-gray-200 overflow-y-auto flex flex-col">
        {/* Header */}
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

        {/* Enhanced Toolbar */}
        <MapToolbar
          selectedClusters={selectedClusters}
          routeWidth={routeWidth}
          showRoutes={showRoutes}
          onMergeClusters={handleMergeClusters}
          onRouteWidthChange={setRouteWidth}
          onToggleRoutes={() => setShowRoutes(!showRoutes)}
          mergeOptimization={mergeOptimization}
          onToggleOptimization={() => setMergeOptimization(!mergeOptimization)}
        />

        {/* Cluster List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Merged Routes Section */}
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

          {/* Original Clusters Section */}
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

      {/* Right Side - Map */}
      <div className="flex-1 relative">
        <APIProvider apiKey={API_KEY}>
          <Map
            defaultCenter={commonDestination || { lat: 12.935, lng: 77.62 }}
            defaultZoom={13}
            mapId="route-cluster-map"
            gestureHandling="greedy"
            disableDefaultUI={false}
          >
            {/* Render markers */}
            {markers.map((marker, index) => (
              <Marker
                key={`${marker.clusterId}-${marker.type}-${index}`}
                position={marker.position}
                onClick={() => setSelectedMarker(marker)}
                icon={getMarkerIcon(marker)}
                label={getMarkerLabel(marker)}
              />
            ))}

            {/* Render routes */}
            {showRoutes && (
              <RouteRenderer
                routes={routes}
                showRoutes={showRoutes}
                routeWidth={routeWidth}
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

      {/* Enhanced Merge Confirmation Modal */}
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

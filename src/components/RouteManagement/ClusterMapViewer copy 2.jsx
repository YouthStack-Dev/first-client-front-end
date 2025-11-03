import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  APIProvider,
  Map,
  Marker,
  InfoWindow,
  useMap,
} from "@vis.gl/react-google-maps";
import {
  Users,
  ChevronDown,
  ChevronRight,
  Check,
  Save,
  Trash2,
  Merge,
  Zap,
} from "lucide-react";
import { API_CLIENT } from "../../Api/API_Client";
import endpoint from "../../Api/Endpoints";
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

// Calculate total distance for a route
const calculateRouteDistance = (route) => {
  let totalDistance = 0;
  for (let i = 0; i < route.length - 1; i++) {
    totalDistance += calculateDistance(route[i], route[i + 1]);
  }
  return totalDistance;
};

// Advanced shortest path algorithm with 2-opt optimization
const findOptimalRouteSequence = (pickupPoints, destination) => {
  if (pickupPoints.length === 0) return [];
  if (pickupPoints.length === 1) return pickupPoints;

  // Step 1: Find the starting point closest to destination
  let startIndex = 0;
  let minDistance = calculateDistance(destination, pickupPoints[0]);

  for (let i = 1; i < pickupPoints.length; i++) {
    const distance = calculateDistance(destination, pickupPoints[i]);
    if (distance < minDistance) {
      minDistance = distance;
      startIndex = i;
    }
  }

  // Step 2: Build initial route using nearest neighbor from starting point
  const points = [...pickupPoints];
  const sequence = [];
  let currentPoint = points[startIndex];

  sequence.push(currentPoint);
  points.splice(startIndex, 1);

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
    currentPoint = points[nearestIndex];
    points.splice(nearestIndex, 1);
  }

  // Step 3: Apply 2-opt optimization to improve the route
  let improved = true;
  let iterations = 0;
  const maxIterations = 100;

  while (improved && iterations < maxIterations) {
    improved = false;
    iterations++;

    for (let i = 0; i < sequence.length - 1; i++) {
      for (let j = i + 2; j < sequence.length; j++) {
        const point1 = i === 0 ? destination : sequence[i - 1];
        const point2 = sequence[i];
        const point3 = sequence[j];
        const point4 =
          j === sequence.length - 1 ? destination : sequence[j + 1];

        // Current distance: point1 -> point2 and point3 -> point4
        const currentDistance =
          calculateDistance(point1, point2) + calculateDistance(point3, point4);

        // New distance if we reverse the segment: point1 -> point3 and point2 -> point4
        const newDistance =
          calculateDistance(point1, point3) + calculateDistance(point2, point4);

        if (newDistance < currentDistance - 0.001) {
          // Reverse the segment between i and j
          const segment = sequence.slice(i, j + 1).reverse();
          sequence.splice(i, j - i + 1, ...segment);
          improved = true;
        }
      }
    }
  }

  return sequence;
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

// RouteRenderer Component
const RouteRenderer = ({ routes, routeWidth, onRouteDistanceCalculated }) => {
  const map = useMap();
  const directionsRenderersRef = useRef([]);
  const directionsServiceRef = useRef(null);

  useEffect(() => {
    if (!directionsServiceRef.current && window.google?.maps) {
      directionsServiceRef.current = new google.maps.DirectionsService();
    }

    directionsRenderersRef.current.forEach((renderer) => {
      renderer.setMap(null);
    });
    directionsRenderersRef.current = [];

    if (
      !map ||
      !routes ||
      routes.length === 0 ||
      !directionsServiceRef.current
    ) {
      onRouteDistanceCalculated && onRouteDistanceCalculated(0);
      return;
    }

    const getStrokeWeight = () => {
      switch (routeWidth) {
        case "thin":
          return 4;
        case "medium":
          return 8;
        case "thick":
          return 12;
        default:
          return 8;
      }
    };

    const strokeWeight = getStrokeWeight();
    let totalDistance = 0;
    let completedRequests = 0;

    routes.forEach((route, index) => {
      if (!route.optimizedPath || route.optimizedPath.length < 2) {
        completedRequests++;
        return;
      }

      const origin = route.optimizedPath[0];
      const destination = route.optimizedPath[route.optimizedPath.length - 1];
      const waypoints = route.optimizedPath.slice(1, -1).map((location) => ({
        location: location,
        stopover: true,
      }));

      const request = {
        origin: origin,
        destination: destination,
        waypoints: waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: false,
      };

      directionsServiceRef.current.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          const directionsRenderer = new google.maps.DirectionsRenderer({
            map: map,
            directions: result,
            suppressMarkers: true,
            preserveViewport: true,
            polylineOptions: {
              strokeColor: route.color,
              strokeOpacity: route.isOptimized ? 1 : 0.8,
              strokeWeight: route.isOptimized ? strokeWeight + 2 : strokeWeight,
              zIndex: route.isOptimized ? 200 : 100 + index,
            },
          });

          directionsRenderersRef.current.push(directionsRenderer);

          let routeDistance = 0;
          result.routes[0].legs.forEach((leg) => {
            routeDistance += leg.distance.value;
          });
          totalDistance += routeDistance;
        }

        completedRequests++;
        if (completedRequests === routes.length) {
          onRouteDistanceCalculated &&
            onRouteDistanceCalculated(totalDistance / 1000);
        }
      });
    });

    return () => {
      directionsRenderersRef.current.forEach((renderer) => {
        renderer.setMap(null);
      });
      directionsRenderersRef.current = [];
    };
  }, [map, routes, routeWidth, onRouteDistanceCalculated]);

  return null;
};

// RouteCard Component
const RouteCard = ({
  route,
  isExpanded,
  onToggleExpand,
  isSelected,
  onToggleSelect,
  onDeleteBooking,
}) => {
  const color = getClusterColor(route.route_id);

  return (
    <div
      className={`border rounded-lg transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-50 shadow-md"
          : "border-gray-300 bg-white"
      }`}
    >
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(route.route_id)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />

            <button
              onClick={onToggleExpand}
              className="flex items-center gap-2 flex-1 text-left hover:bg-gray-50 rounded p-1"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="font-medium text-gray-800">
                  Route #{route.route_id}
                </span>
              </div>
            </button>
          </div>
        </div>

        <div className="mt-2 ml-6 flex items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{route.bookings.length} bookings</span>
          </div>
          {route.estimations && (
            <>
              <span className="flex items-center gap-1">
                <span>📏</span>
                {route.estimations.total_distance_km} km
              </span>
              <span className="flex items-center gap-1">
                <span>⏱️</span>
                {route.estimations.total_time_minutes} min
              </span>
            </>
          )}
        </div>

        {isExpanded && route.estimations && (
          <div className="mt-3 ml-6 pt-3 border-t border-gray-200">
            <div className="space-y-2">
              {route.bookings.map((booking) => (
                <div
                  key={booking.booking_id}
                  className="bg-gray-50 rounded p-2.5 text-xs border border-gray-200 relative group"
                >
                  <button
                    onClick={() => onDeleteBooking(booking.booking_id)}
                    className="absolute top-2 right-2 p-1 rounded bg-red-100 text-red-600 hover:bg-red-200 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete booking"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>

                  <div className="flex items-center justify-between mb-2 pr-8">
                    <span className="font-medium text-gray-800">
                      {booking.employee_code}
                    </span>
                    <span className="text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                      ID: {booking.booking_id}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-gray-600 mb-2">
                    <div className="bg-green-50 p-1.5 rounded">
                      <span className="text-gray-500 font-medium">Pickup:</span>{" "}
                      <span className="text-green-700 font-semibold">
                        {
                          route.estimations.estimated_pickup_times[
                            booking.booking_id
                          ]
                        }
                      </span>
                    </div>
                    <div className="bg-blue-50 p-1.5 rounded">
                      <span className="text-gray-500 font-medium">Drop:</span>{" "}
                      <span className="text-blue-700 font-semibold">
                        {
                          route.estimations.estimated_drop_times[
                            booking.booking_id
                          ]
                        }
                      </span>
                    </div>
                  </div>
                  <div className="text-gray-600 flex items-start gap-1">
                    <span className="text-gray-400">📍</span>
                    <span className="flex-1">
                      {booking.pickup_location.split(",").slice(0, 2).join(",")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ClusterCard Component
const ClusterCard = ({
  cluster,
  isExpanded,
  onToggleExpand,
  isClusterSelected,
  onToggleCluster,
  selectedBookings,
  onToggleBooking,
}) => {
  const color = getClusterColor(cluster.cluster_id);
  const selectedCount = cluster.bookings.filter((b) =>
    selectedBookings.has(b.booking_id)
  ).length;

  return (
    <div
      className={`border rounded-lg transition-all ${
        isClusterSelected
          ? "border-blue-500 bg-blue-50 shadow-md"
          : "border-gray-300 bg-white"
      }`}
    >
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <input
              type="checkbox"
              checked={isClusterSelected}
              onChange={() => onToggleCluster(cluster.cluster_id)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />

            <button
              onClick={onToggleExpand}
              className="flex items-center gap-2 flex-1 text-left hover:bg-gray-50 rounded p-1"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="font-medium text-gray-800">
                  Cluster {cluster.cluster_id}
                </span>
                {selectedCount > 0 && !isClusterSelected && (
                  <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                    {selectedCount} selected
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        <div className="mt-2 ml-6 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{cluster.bookings.length} bookings</span>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-3 ml-6 pt-3 border-t border-gray-200 space-y-2">
            {cluster.bookings.map((booking) => {
              const isSelected = selectedBookings.has(booking.booking_id);
              const isDisabled = isClusterSelected;

              return (
                <div
                  key={booking.booking_id}
                  onClick={() =>
                    !isDisabled &&
                    onToggleBooking(cluster.cluster_id, booking.booking_id)
                  }
                  className={`cursor-pointer rounded p-2.5 text-xs transition-all border ${
                    isDisabled
                      ? "bg-gray-100 border-gray-300 cursor-not-allowed opacity-60"
                      : isSelected
                      ? "bg-blue-100 border-blue-400 shadow-sm"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected || isDisabled
                          ? "bg-blue-500 border-blue-500"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      {(isSelected || isDisabled) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-medium text-gray-800">
                          {booking.employee_code}
                        </span>
                        <span className="text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                          ID: {booking.booking_id}
                        </span>
                      </div>
                      <div className="text-gray-600 flex items-start gap-1">
                        <span className="text-gray-400">📍</span>
                        <span className="flex-1 truncate">
                          {booking.pickup_location
                            .split(",")
                            .slice(0, 2)
                            .join(",")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// MapToolbar Component
const MapToolbar = ({
  mode,
  selectedBookings,
  selectedRoutes,
  routeWidth,
  showRoutes,
  shortPath,
  totalDistance,
  onSave,
  onMerge,
  onRouteWidthChange,
  onToggleRoutes,
  onToggleShortPath,
}) => {
  return (
    <div className="bg-gray-50 border-b border-gray-200 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleRoutes}
            className={`px-3 py-2 text-sm rounded-md transition-colors ${
              showRoutes
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {showRoutes ? "Hide Routes" : "Show Routes"}
          </button>

          {mode === "suggestions" && (
            <button
              onClick={onToggleShortPath}
              className={`flex items-center space-x-1 px-3 py-2 text-sm rounded-md transition-colors ${
                shortPath
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              title="Combine ALL selected bookings into single optimized shortest path route"
            >
              <Zap className="w-4 h-4" />
              <span>Short Path (Optimized)</span>
            </button>
          )}

          <select
            value={routeWidth}
            onChange={(e) => onRouteWidthChange(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="thin">Thin</option>
            <option value="medium">Medium</option>
            <option value="thick">Thick</option>
          </select>

          {totalDistance > 0 && (
            <div className="px-3 py-2 text-sm bg-indigo-100 text-indigo-700 rounded-md font-medium">
              📏 {totalDistance.toFixed(2)} km
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {mode === "suggestions" && (
            <button
              onClick={onSave}
              disabled={selectedBookings === 0}
              className={`flex items-center space-x-1 px-4 py-2 text-sm rounded-md transition-colors ${
                selectedBookings > 0
                  ? "bg-green-500 text-white hover:bg-green-600 shadow-sm"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Save className="w-4 h-4" />
              <span>Save Route ({selectedBookings})</span>
            </button>
          )}

          {mode === "saved" && (
            <button
              onClick={onMerge}
              disabled={selectedRoutes.size < 2}
              className={`flex items-center space-x-1 px-4 py-2 text-sm rounded-md transition-colors ${
                selectedRoutes.size >= 2
                  ? "bg-purple-500 text-white hover:bg-purple-600 shadow-sm"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Merge className="w-4 h-4" />
              <span>Merge Routes ({selectedRoutes.size})</span>
            </button>
          )}
        </div>
      </div>

      {mode === "suggestions" && selectedBookings > 0 && (
        <div className="text-xs text-green-700 bg-green-50 p-2 rounded mt-2 border border-green-200">
          ✓ {selectedBookings} booking(s) selected
          {shortPath && " • Single optimized shortest path enabled"}
        </div>
      )}

      {mode === "saved" && selectedRoutes.size > 0 && (
        <div className="text-xs text-purple-700 bg-purple-50 p-2 rounded mt-2 border border-purple-200">
          ✓ {selectedRoutes.size} route(s) selected for merging
        </div>
      )}
    </div>
  );
};

// Main Component
const ClusterMapViewer = ({
  mode = "suggestions",
  shiftId = "1",
  date = "2025-11-01",
}) => {
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBookings, setSelectedBookings] = useState(new Set());
  const [selectedClusters, setSelectedClusters] = useState(new Set());
  const [selectedRoutes, setSelectedRoutes] = useState(new Set());
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [showRoutes, setShowRoutes] = useState(true);
  const [shortPath, setShortPath] = useState(false);
  const [routeWidth, setRouteWidth] = useState("medium");
  const [commonDestination, setCommonDestination] = useState(null);
  const [totalDistance, setTotalDistance] = useState(0);
  useEffect(() => {
    const fetchRouteData = async () => {
      try {
        setLoading(true);
        setError(null);

        let apiEndpoint = "";

        if (mode === "suggestions") {
          apiEndpoint = `${endpoint.routesuggestion}?booking_date=${date}&shift_id=${shiftId}&tenant_id=SAM001`;
        } else if (mode === "saved") {
          apiEndpoint = `${endpoint.savedRoutes}?tenant_id=SAM001&booking_date=${date}&shift_id=${shiftId}`;
        }

        const response = await API_CLIENT.get(apiEndpoint);

        if (mode === "suggestions") {
          // Handle suggestions response
          if (response.data?.success && response.data?.data) {
            const { clusters, total_clusters, total_bookings } =
              response.data.data;

            setRouteData({
              route_clusters: clusters,
              total_clusters: total_clusters,
              total_bookings: total_bookings,
            });

            // Extract common destination from first booking if available
            if (
              clusters &&
              clusters.length > 0 &&
              clusters[0].bookings &&
              clusters[0].bookings.length > 0
            ) {
              const firstBooking = clusters[0].bookings[0];
              setCommonDestination({
                lat: firstBooking.drop_latitude,
                lng: firstBooking.drop_longitude,
                address: firstBooking.drop_location,
              });
            }
          } else {
            throw new Error("Invalid response format from suggestions API");
          }
        } else {
          // Handle saved routes response
          if (response.data?.routes) {
            setRouteData({ routes: response.data.routes });

            // Extract common destination from first route if available
            if (
              response.data.routes.length > 0 &&
              response.data.routes[0].bookings.length > 0
            ) {
              const firstBooking = response.data.routes[0].bookings[0];
              setCommonDestination({
                lat: firstBooking.drop_latitude,
                lng: firstBooking.drop_longitude,
                address: firstBooking.drop_location,
              });
            }
          } else {
            throw new Error("Invalid response format from saved routes API");
          }
        }
      } catch (err) {
        console.error("Error fetching route data:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to fetch route data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRouteData();
  }, [mode, shiftId, date]);

  const handleToggleCluster = (clusterId) => {
    const newSelected = new Set(selectedClusters);
    if (newSelected.has(clusterId)) {
      newSelected.delete(clusterId);
      const cluster = routeData.route_clusters.find(
        (c) => c.cluster_id === clusterId
      );
      if (cluster) {
        const newBookings = new Set(selectedBookings);
        cluster.bookings.forEach((b) => newBookings.delete(b.booking_id));
        setSelectedBookings(newBookings);
      }
    } else {
      newSelected.add(clusterId);
      const cluster = routeData.route_clusters.find(
        (c) => c.cluster_id === clusterId
      );
      if (cluster) {
        const newBookings = new Set(selectedBookings);
        cluster.bookings.forEach((b) => newBookings.add(b.booking_id));
        setSelectedBookings(newBookings);
      }
    }
    setSelectedClusters(newSelected);
  };

  const getTotalSelectedBookings = () => {
    let total = 0;

    selectedClusters.forEach((clusterId) => {
      const cluster = routeData?.route_clusters?.find(
        (c) => c.cluster_id === clusterId
      );
      if (cluster) {
        total += cluster.bookings.length;
      }
    });

    selectedBookings.forEach((bookingId) => {
      let isInSelectedCluster = false;
      selectedClusters.forEach((clusterId) => {
        const cluster = routeData?.route_clusters?.find(
          (c) => c.cluster_id === clusterId
        );
        if (cluster?.bookings.some((b) => b.booking_id === bookingId)) {
          isInSelectedCluster = true;
        }
      });
      if (!isInSelectedCluster) {
        total++;
      }
    });

    return total;
  };

  const handleToggleBooking = (clusterId, bookingId) => {
    if (selectedClusters.has(clusterId)) return;

    const newSelected = new Set(selectedBookings);
    if (newSelected.has(bookingId)) {
      newSelected.delete(bookingId);
    } else {
      newSelected.add(bookingId);
    }
    setSelectedBookings(newSelected);
  };

  const handleToggleRoute = (routeId) => {
    const newSelected = new Set(selectedRoutes);
    if (newSelected.has(routeId)) {
      newSelected.delete(routeId);
    } else {
      newSelected.add(routeId);
    }
    setSelectedRoutes(newSelected);
  };

  const handleToggleExpand = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleSave = () => {
    const totalSelected = getTotalSelectedBookings();
    const allBookingIds = [];

    selectedClusters.forEach((clusterId) => {
      const cluster = routeData.route_clusters.find(
        (c) => c.cluster_id === clusterId
      );
      if (cluster) {
        cluster.bookings.forEach((b) => allBookingIds.push(b.booking_id));
      }
    });

    routeData.route_clusters.forEach((cluster) => {
      if (!selectedClusters.has(cluster.cluster_id)) {
        cluster.bookings.forEach((booking) => {
          if (selectedBookings.has(booking.booking_id)) {
            allBookingIds.push(booking.booking_id);
          }
        });
      }
    });

    const payload = {
      groups: [
        {
          booking_ids: allBookingIds,
        },
      ],
    };
    console.log("Save payload:", JSON.stringify(payload, null, 2));
    alert(`✓ Saved ${totalSelected} bookings!\n\nCheck console for payload.`);
  };

  const handleMerge = () => {
    const routeIds = Array.from(selectedRoutes);
    console.log("Merge routes:", JSON.stringify(routeIds, null, 2));
    alert(
      `✓ Merging ${selectedRoutes.size} routes!\n\nRoute IDs: ${routeIds.join(
        ", "
      )}\n\nCheck console for details.`
    );
  };

  const handleDeleteBooking = (bookingId) => {
    console.log("Delete booking ID:", bookingId);
    alert(`Delete booking ID: ${bookingId}\n\nCheck console for details.`);
  };

  const markers = useMemo(() => {
    if (!routeData || !commonDestination) return [];

    const markers = [];

    if (mode === "suggestions" && routeData.route_clusters) {
      routeData.route_clusters.forEach((cluster) => {
        const isClusterSelected = selectedClusters.has(cluster.cluster_id);

        cluster.bookings.forEach((booking) => {
          const isBookingSelected = selectedBookings.has(booking.booking_id);

          if (isClusterSelected || isBookingSelected) {
            markers.push({
              id: `cluster-${cluster.cluster_id}-${booking.booking_id}`,
              booking,
              clusterId: cluster.cluster_id,
              position: {
                lat: booking.pickup_latitude,
                lng: booking.pickup_longitude,
              },
              type: "pickup",
            });
          }
        });
      });
    } else if (mode === "saved" && routeData.routes) {
      routeData.routes.forEach((route) => {
        if (selectedRoutes.has(route.route_id)) {
          route.bookings.forEach((booking) => {
            markers.push({
              id: `route-${route.route_id}-${booking.booking_id}`,
              booking,
              routeId: route.route_id,
              position: {
                lat: booking.pickup_latitude,
                lng: booking.pickup_longitude,
              },
              type: "pickup",
            });
          });
        }
      });
    }

    if (markers.length > 0) {
      markers.push({
        id: "destination",
        position: commonDestination,
        type: "destination",
      });
    }

    return markers;
  }, [
    routeData,
    selectedClusters,
    selectedBookings,
    selectedRoutes,
    commonDestination,
    mode,
  ]);

  const routes = useMemo(() => {
    if (!routeData || !commonDestination || !showRoutes) return [];

    const routes = [];

    if (mode === "suggestions" && routeData.route_clusters) {
      const allSelectedBookings = [];

      // Collect all selected bookings from selected clusters
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

      // Collect individual selected bookings
      routeData.route_clusters.forEach((cluster) => {
        if (!selectedClusters.has(cluster.cluster_id)) {
          cluster.bookings.forEach((booking) => {
            if (selectedBookings.has(booking.booking_id)) {
              allSelectedBookings.push(booking);
            }
          });
        }
      });

      if (allSelectedBookings.length > 0) {
        if (shortPath) {
          // SINGLE OPTIMIZED ROUTE for ALL selected bookings
          console.log(
            `Optimizing route for ${allSelectedBookings.length} bookings`
          );

          const pickupPoints = allSelectedBookings.map((b) => ({
            lat: b.pickup_latitude,
            lng: b.pickup_longitude,
          }));

          // Find the single optimal route through all points
          const optimizedSequence = findOptimalRouteSequence(
            pickupPoints,
            commonDestination
          );
          const optimizedPath = [...optimizedSequence, commonDestination];

          console.log(
            "Optimized route created with distance:",
            calculateRouteDistance(optimizedPath).toFixed(2),
            "km"
          );

          // Create ONE single route with distinctive styling
          routes.push({
            id: "optimized-single-route",
            optimizedPath,
            color: "#6366F1", // Indigo color for the optimized route
            isOptimized: true,
          });
        } else {
          // Show separate routes for each cluster/booking when NOT in short path mode
          selectedClusters.forEach((clusterId) => {
            const cluster = routeData.route_clusters.find(
              (c) => c.cluster_id === clusterId
            );

            if (cluster) {
              const pickupPoints = cluster.bookings.map((b) => ({
                lat: b.pickup_latitude,
                lng: b.pickup_longitude,
              }));

              const optimizedPath = [
                ...findOptimalRouteSequence(pickupPoints, commonDestination),
                commonDestination,
              ];

              routes.push({
                id: `cluster-${clusterId}`,
                optimizedPath,
                color: getClusterColor(clusterId),
                isOptimized: false,
              });
            }
          });

          // Individual bookings get their own routes
          routeData.route_clusters.forEach((cluster) => {
            if (!selectedClusters.has(cluster.cluster_id)) {
              cluster.bookings.forEach((booking) => {
                if (selectedBookings.has(booking.booking_id)) {
                  const pickupPoint = {
                    lat: booking.pickup_latitude,
                    lng: booking.pickup_longitude,
                  };

                  routes.push({
                    id: `booking-${booking.booking_id}`,
                    optimizedPath: [pickupPoint, commonDestination],
                    color: getClusterColor(cluster.cluster_id),
                    isOptimized: false,
                  });
                }
              });
            }
          });
        }
      }
    } else if (mode === "saved" && routeData.routes) {
      selectedRoutes.forEach((routeId) => {
        const route = routeData.routes.find((r) => r.route_id === routeId);

        if (route) {
          const pickupPoints = route.bookings.map((b) => ({
            lat: b.pickup_latitude,
            lng: b.pickup_longitude,
          }));

          const optimizedPath = [
            ...findOptimalRouteSequence(pickupPoints, commonDestination),
            commonDestination,
          ];

          routes.push({
            id: `route-${routeId}`,
            optimizedPath,
            color: getClusterColor(routeId),
            isOptimized: false,
          });
        }
      });
    }

    return routes;
  }, [
    routeData,
    selectedClusters,
    selectedBookings,
    selectedRoutes,
    commonDestination,
    showRoutes,
    shortPath,
    mode,
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

    const color =
      mode === "suggestions"
        ? getClusterColor(marker.clusterId)
        : getClusterColor(marker.routeId);

    return {
      path: "M 0, 0 m -5, 0 a 5,5 0 1,0 10,0 a 5,5 0 1,0 -10,0",
      scale: 1.6,
      fillColor: color,
      fillOpacity: 0.9,
      strokeColor: "#ffffff",
      strokeWeight: 2,
    };
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-lg text-gray-700">
            Loading {mode === "suggestions" ? "suggested" : "saved"} routes...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-lg text-red-600 font-semibold mb-2">
            Error loading routes
          </div>
          <div className="text-sm text-gray-600 bg-red-50 p-4 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  const totalItems =
    mode === "suggestions"
      ? routeData?.route_clusters?.length || 0
      : routeData?.routes?.length || 0;

  const totalBookings =
    mode === "suggestions"
      ? routeData?.total_bookings || 0
      : routeData?.routes?.reduce((sum, r) => sum + r.bookings.length, 0) || 0;

  const API_KEY = import.meta.env.VITE_GOOGLE_API || "";

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-1/3 bg-white border-r border-gray-200 overflow-y-auto flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800">
            {mode === "suggestions" ? "Suggested Routes" : "Saved Routes"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {totalItems} {mode === "suggestions" ? "clusters" : "routes"} ·{" "}
            {totalBookings} bookings
          </p>
        </div>

        <MapToolbar
          mode={mode}
          selectedBookings={getTotalSelectedBookings()}
          selectedRoutes={selectedRoutes}
          routeWidth={routeWidth}
          showRoutes={showRoutes}
          shortPath={shortPath}
          totalDistance={totalDistance}
          onSave={handleSave}
          onMerge={handleMerge}
          onRouteWidthChange={setRouteWidth}
          onToggleRoutes={() => setShowRoutes(!showRoutes)}
          onToggleShortPath={() => setShortPath(!shortPath)}
        />

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {mode === "suggestions" && routeData?.route_clusters && (
            <>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">
                  Clusters
                </h3>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {routeData.route_clusters.length} total
                </span>
              </div>
              {routeData.route_clusters.map((cluster) => (
                <ClusterCard
                  key={cluster.cluster_id}
                  cluster={cluster}
                  isExpanded={expandedItems.has(cluster.cluster_id)}
                  onToggleExpand={() => handleToggleExpand(cluster.cluster_id)}
                  isClusterSelected={selectedClusters.has(cluster.cluster_id)}
                  onToggleCluster={handleToggleCluster}
                  selectedBookings={selectedBookings}
                  onToggleBooking={handleToggleBooking}
                />
              ))}
            </>
          )}

          {mode === "saved" && routeData?.routes && (
            <>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">Routes</h3>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  {routeData.routes.length} saved
                </span>
              </div>
              {routeData.routes.map((route) => (
                <RouteCard
                  key={route.route_id}
                  route={route}
                  isExpanded={expandedItems.has(route.route_id)}
                  onToggleExpand={() => handleToggleExpand(route.route_id)}
                  isSelected={selectedRoutes.has(route.route_id)}
                  onToggleSelect={handleToggleRoute}
                  onDeleteBooking={handleDeleteBooking}
                />
              ))}
            </>
          )}
        </div>
      </div>

      <div className="flex-1 relative">
        <APIProvider apiKey={API_KEY}>
          <Map
            defaultCenter={commonDestination || { lat: 12.9716, lng: 77.5946 }}
            defaultZoom={12}
            mapId="route-cluster-map"
            gestureHandling="greedy"
            disableDefaultUI={false}
          >
            {markers.map((marker) => (
              <Marker
                key={marker.id}
                position={marker.position}
                onClick={() => setSelectedMarker(marker)}
                icon={getMarkerIcon(marker)}
              />
            ))}

            {showRoutes && routes.length > 0 && (
              <RouteRenderer
                routes={routes}
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
                      <p className="font-semibold text-sm text-red-700 mb-1">
                        🏁 Destination
                      </p>
                      <p className="text-xs text-gray-600">
                        {commonDestination?.address}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {selectedMarker.position.lat.toFixed(4)},{" "}
                        {selectedMarker.position.lng.toFixed(4)}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-sm mb-1">
                        {mode === "suggestions"
                          ? `Cluster ${selectedMarker.clusterId}`
                          : `Route #${selectedMarker.routeId}`}
                      </p>
                      <p className="text-xs text-gray-700 font-medium">
                        {selectedMarker.booking.employee_code}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Booking ID: {selectedMarker.booking.booking_id}
                      </p>
                      <p className="text-xs text-gray-600 mt-2">
                        📍{" "}
                        {selectedMarker.booking.pickup_location
                          .split(",")
                          .slice(0, 2)
                          .join(",")}
                      </p>
                    </>
                  )}
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      </div>
    </div>
  );
};

export default ClusterMapViewer;

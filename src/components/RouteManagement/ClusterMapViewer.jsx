import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  APIProvider,
  Map,
  Marker,
  InfoWindow,
  useMap,
} from "@vis.gl/react-google-maps";
import {
  ChevronDown,
  ChevronUp,
  Users,
  X,
  MapPin,
  Route,
  Navigation,
} from "lucide-react";
import { API_CLIENT } from "../../Api/API_Client";
import endpoint from "../../Api/Endpoints";

// Component to handle route drawing using Directions API
const RouteRenderer = ({ routes, showRoutes, routeWidth }) => {
  const map = useMap();
  const directionsRenderersRef = useRef([]);
  const directionsServiceRef = useRef(new google.maps.DirectionsService());

  useEffect(() => {
    // Clear existing directions renderers
    directionsRenderersRef.current.forEach((renderer) => {
      renderer.setMap(null);
    });
    directionsRenderersRef.current = [];

    if (!map || !showRoutes || routes.length === 0) return;

    // Get width settings
    const widths = getWidthSettings(routeWidth);

    // Create optimized routes for each cluster
    routes.forEach((clusterRoute) => {
      if (clusterRoute.optimizedPath && clusterRoute.optimizedPath.length > 1) {
        const waypoints = clusterRoute.optimizedPath
          .slice(1, -1)
          .map((location) => ({
            location: location,
            stopover: false,
          }));

        const request = {
          origin: clusterRoute.optimizedPath[0],
          destination:
            clusterRoute.optimizedPath[clusterRoute.optimizedPath.length - 1],
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
                strokeColor: getClusterColor(clusterRoute.clusterId),
                strokeOpacity: 0.9,
                strokeWeight: widths.optimized,
              },
            });

            directionsRenderersRef.current.push(directionsRenderer);
          } else {
            console.warn(
              `Directions request failed for cluster ${clusterRoute.clusterId}:`,
              status
            );

            // Fallback to polyline
            const polyline = new google.maps.Polyline({
              path: clusterRoute.optimizedPath,
              geodesic: true,
              strokeColor: getClusterColor(clusterRoute.clusterId),
              strokeOpacity: 0.9,
              strokeWeight: widths.optimized,
              map: map,
            });
          }
        });
      }
    });

    // Cleanup function
    return () => {
      directionsRenderersRef.current.forEach((renderer) => {
        renderer.setMap(null);
      });
      directionsRenderersRef.current = [];
    };
  }, [map, routes, showRoutes, routeWidth]);

  return null;
};

// Helper function to calculate distance between two points
const calculateDistance = (point1, point2) => {
  const R = 6371; // Earth's radius in km
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

// Find optimal route sequence using nearest neighbor algorithm starting from destination
const findOptimalRouteSequence = (pickupPoints, destination) => {
  if (pickupPoints.length === 0) return [];

  const points = [...pickupPoints];
  const sequence = [];

  // Start from the destination
  let currentPoint = destination;

  while (points.length > 0) {
    // Find nearest point to current point
    let nearestIndex = 0;
    let nearestDistance = calculateDistance(currentPoint, points[0]);

    for (let i = 1; i < points.length; i++) {
      const distance = calculateDistance(currentPoint, points[i]);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }

    // Add nearest point to sequence and remove from available points
    sequence.push(points[nearestIndex]);
    currentPoint = points[nearestIndex];
    points.splice(nearestIndex, 1);
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
    "#06B6D4",
    "#F43F5E",
  ];
  return colors[(clusterId - 1) % colors.length];
};

const getWidthSettings = (routeWidth) => {
  switch (routeWidth) {
    case "thin":
      return { optimized: 4, normal: 3 };
    case "medium":
      return { optimized: 8, normal: 6 };
    case "thick":
      return { optimized: 12, normal: 8 };
    case "very-thick":
      return { optimized: 16, normal: 12 };
    default:
      return { optimized: 8, normal: 6 };
  }
};

// Helper function to check if data is empty
const isEmptyData = (data) => {
  if (!data) return true;

  // Check for empty clusters array
  if (data.route_clusters && Array.isArray(data.route_clusters)) {
    return data.route_clusters.length === 0;
  }

  // Check for empty shifts array (from your API response example)
  if (data.shifts && Array.isArray(data.shifts)) {
    return data.shifts.length === 0;
  }

  // Check for empty data object
  if (Object.keys(data).length === 0) {
    return true;
  }

  return false;
};

const ClusterMapViewer = ({ mode = "suggestions" }) => {
  const { shiftId, date } = useParams();
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiMessage, setApiMessage] = useState("");

  const [selectedClusters, setSelectedClusters] = useState(new Set());
  const [expandedCluster, setExpandedCluster] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [showRoutes, setShowRoutes] = useState(true);
  const [routeWidth, setRouteWidth] = useState("medium");
  const [commonDestination, setCommonDestination] = useState(null);
  const [selectedClusterDetails, setSelectedClusterDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  // Toggle booking details
  const handleExpandToggle = (clusterId) => {
    setExpandedCluster(expandedCluster === clusterId ? null : clusterId);
  };

  // Get all markers for selected clusters
  const getMarkers = () => {
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
          // Pickup point marker
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

        // Common destination marker (only add once per cluster)
        if (commonDestination) {
          markers.push({
            clusterId: cluster.cluster_id,
            booking: null,
            position: commonDestination,
            type: "destination",
          });
        }
      }
    });
    return markers;
  };

  // Generate single optimized route for each cluster
  const getRoutes = () => {
    if (
      !routeData ||
      !routeData.route_clusters ||
      routeData.route_clusters.length === 0 ||
      !commonDestination
    )
      return [];

    const routes = [];

    routeData.route_clusters.forEach((cluster) => {
      if (selectedClusters.has(cluster.cluster_id)) {
        // Get all pickup points for this cluster
        const pickupPoints = cluster.bookings.map((booking) => ({
          lat: booking.pickup_latitude,
          lng: booking.pickup_longitude,
          bookingId: booking.booking_id,
          employeeCode: booking.employee_code,
        }));

        // Find optimal sequence starting from destination
        const optimalSequence = findOptimalRouteSequence(
          pickupPoints,
          commonDestination
        );

        // Create single optimized route: destination -> pickup1 -> pickup2 -> ... -> back to destination
        const optimizedPath = [...optimalSequence, commonDestination];

        routes.push({
          clusterId: cluster.cluster_id,
          optimizedPath: optimizedPath,
          optimalSequence: optimalSequence,
        });
      }
    });

    return routes;
  };

  const markers = getMarkers();
  const routes = getRoutes();

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

  // No data state - handles both empty data and the specific API response you provided
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
  const handleClusterToggle = (clusterId) => {
    const newSelected = new Set(selectedClusters);
    if (newSelected.has(clusterId)) {
      newSelected.delete(clusterId);
    } else {
      newSelected.add(clusterId);
    }
    setSelectedClusters(newSelected);
  };

  // Show cluster details in modal
  const handleShowClusterDetails = (cluster) => {
    const clusterRoute = routes.find((r) => r.clusterId === cluster.cluster_id);
    setSelectedClusterDetails({
      cluster,
      clusterRoute,
    });
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClusterDetails(null);
  };

  return (
    <div className="flex h-screen bg-gray-50">
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
                icon={{
                  path:
                    marker.type === "destination"
                      ? google.maps.SymbolPath.CIRCLE
                      : google.maps.SymbolPath.CIRCLE,
                  scale: marker.type === "destination" ? 10 : 8,
                  fillColor:
                    marker.type === "destination"
                      ? "#DC2626"
                      : getClusterColor(marker.clusterId),
                  fillOpacity: 0.9,
                  strokeColor: "#ffffff",
                  strokeWeight: 2,
                }}
                label={
                  marker.type === "destination"
                    ? {
                        text: "DEST",
                        color: "#ffffff",
                        fontSize: "10px",
                        fontWeight: "bold",
                      }
                    : marker.type === "pickup"
                    ? {
                        text: "P",
                        color: "#ffffff",
                        fontSize: "10px",
                        fontWeight: "bold",
                      }
                    : undefined
                }
              />
            ))}

            {/* Render single optimized route for each cluster */}
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
                        Cluster {selectedMarker.clusterId} - Pickup
                      </p>
                      <p className="text-xs text-gray-600 mb-1">
                        {selectedMarker.booking.employee_code}
                      </p>
                      <p className="text-xs text-gray-500">
                        Booking ID: {selectedMarker.booking.booking_id}
                      </p>
                    </>
                  )}
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      </div>

      {/* Left Sidebar - Compact Cluster List */}
      <div className="w-2/4 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
          <h2 className="text-xl font-semibold text-gray-800">
            {mode === "suggestions" ? "Suggested Routes" : "Saved Routes"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {routeData.total_clusters} clusters · {routeData.total_bookings}{" "}
            bookings
          </p>

          <div className="mt-3 flex flex-col gap-2">
            <button
              onClick={() => setShowRoutes(!showRoutes)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                showRoutes
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : "bg-gray-100 text-gray-700 border border-gray-200"
              }`}
            >
              <Route className="w-4 h-4" />
              {showRoutes ? "Hide Routes" : "Show Routes"}
            </button>

            {showRoutes && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-gray-700">
                  Route Width:
                </label>
                <select
                  value={routeWidth}
                  onChange={(e) => setRouteWidth(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="thin">Thin</option>
                  <option value="medium">Medium</option>
                  <option value="thick">Thick</option>
                  <option value="very-thick">Very Thick</option>
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 space-y-2">
          {routeData.route_clusters.map((cluster) => {
            const isSelected = selectedClusters.has(cluster.cluster_id);
            const clusterColor = getClusterColor(cluster.cluster_id);
            const clusterRoute = routes.find(
              (r) => r.clusterId === cluster.cluster_id
            );

            return (
              <div
                key={cluster.cluster_id}
                className={`border rounded-lg p-3 transition-all ${
                  isSelected
                    ? "border-blue-500 shadow-md bg-blue-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleClusterToggle(cluster.cluster_id)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-800 truncate">
                      Cluster {cluster.cluster_id}
                    </h3>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-600">
                          {cluster.bookings.length} bookings
                        </span>
                      </div>
                      {clusterRoute?.optimalSequence && (
                        <span className="text-xs text-green-600 font-medium">
                          {clusterRoute.optimalSequence.length + 1} stops
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleShowClusterDetails(cluster)}
                    className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors text-xs font-medium text-gray-700"
                  >
                    <span>{cluster.bookings.length}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cluster Details Modal */}
      {isModalOpen && selectedClusterDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                  style={{
                    backgroundColor: getClusterColor(
                      selectedClusterDetails.cluster.cluster_id
                    ),
                  }}
                >
                  {selectedClusterDetails.cluster.cluster_id}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Cluster {selectedClusterDetails.cluster.cluster_id} Details
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedClusterDetails.cluster.bookings.length} bookings
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[60vh] p-4">
              {/* Optimized Sequence Section */}
              {selectedClusterDetails.clusterRoute?.optimalSequence &&
                selectedClusterDetails.clusterRoute.optimalSequence.length >
                  0 && (
                  <div className="mb-6 bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Route className="w-4 h-4 text-green-600" />
                      <p className="text-sm font-medium text-green-800">
                        Optimized Pickup Sequence
                      </p>
                    </div>
                    <div className="space-y-2">
                      {selectedClusterDetails.clusterRoute.optimalSequence.map(
                        (point, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-2 bg-white rounded border border-green-100"
                          >
                            <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-semibold flex-shrink-0">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-800">
                                Employee {point.employeeCode}
                              </p>
                              <p className="text-xs text-gray-500">
                                {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                              </p>
                            </div>
                          </div>
                        )
                      )}
                      <div className="flex items-center gap-3 p-2 bg-blue-50 rounded border border-blue-200">
                        <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-semibold flex-shrink-0">
                          {selectedClusterDetails.clusterRoute.optimalSequence
                            .length + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-800">
                            Destination
                          </p>
                          <p className="text-xs text-blue-600">
                            {commonDestination?.address}
                          </p>
                          <p className="text-xs text-blue-500">
                            {commonDestination?.lat.toFixed(4)},{" "}
                            {commonDestination?.lng.toFixed(4)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              {/* Bookings List */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-800 mb-3">Bookings</h4>
                {selectedClusterDetails.cluster.bookings.map((booking) => (
                  <div
                    key={booking.booking_id}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {booking.employee_code}
                          </p>
                          <p className="text-xs text-gray-500">
                            Booking ID: {booking.booking_id}
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        {booking.status}
                      </span>
                    </div>

                    <div className="text-xs text-gray-600 space-y-1 ml-6">
                      <div className="flex justify-between">
                        <span className="font-medium">Pickup:</span>
                        <span>
                          {booking.pickup_latitude.toFixed(4)},{" "}
                          {booking.pickup_longitude.toFixed(4)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Drop:</span>
                        <span className="text-right max-w-[200px] truncate">
                          {commonDestination?.address || booking.drop_location}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClusterMapViewer;

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  APIProvider,
  Map,
  Marker,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { API_CLIENT } from "../../Api/API_Client";
import endpoint from "../../Api/Endpoints";
import ClusterCard from "./ClusterCard";
import SavedRouteCard from "./SavedRouteCard";
import { useParams } from "react-router-dom";
import MapToolbar from "./MapToolbar";

// DirectionsRenderer component (unchanged)
const DirectionsRenderer = ({ routes, showRoutes, onRouteCalculated }) => {
  const map = useMap();
  const routesLibrary = useMapsLibrary("routes");
  const [directionsRenderers, setDirectionsRenderers] = useState([]);
  const [directionsServices, setDirectionsServices] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (!routesLibrary) return;
    setDirectionsServices(new routesLibrary.DirectionsService());
  }, [routesLibrary]);

  useEffect(() => {
    if (
      !map ||
      !routesLibrary ||
      !directionsServices ||
      !showRoutes ||
      routes.length === 0
    ) {
      directionsRenderers.forEach((renderer) => renderer.setMap(null));
      setDirectionsRenderers([]);
      setIsCalculating(false);
      return;
    }

    directionsRenderers.forEach((renderer) => renderer.setMap(null));

    const newRenderers = [];
    let totalDistanceSum = 0;
    let totalDurationSum = 0;
    let completedRoutes = 0;

    setIsCalculating(true);

    routes.forEach((route, index) => {
      if (route.path.length < 2) {
        completedRoutes++;
        return;
      }

      const origin = route.path[0];
      const destination = route.path[route.path.length - 1];

      const waypoints = route.path.slice(1, -1).map((point) => ({
        location: new google.maps.LatLng(point.lat, point.lng),
        stopover: true,
      }));

      const renderer = new routesLibrary.DirectionsRenderer({
        map: map,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: route.color || "#3B82F6",
          strokeWeight: 4,
          strokeOpacity: 0.8,
        },
        preserveViewport: true,
      });

      directionsServices.route(
        {
          origin: new google.maps.LatLng(origin.lat, origin.lng),
          destination: new google.maps.LatLng(destination.lat, destination.lng),
          waypoints: waypoints,
          optimizeWaypoints: route.optimize || false,
          travelMode: google.maps.TravelMode.DRIVING,
          provideRouteAlternatives: false,
          avoidHighways: route.preferLocalRoads || false,
          avoidTolls: false,
          avoidFerries: false,
        },
        (result, status) => {
          completedRoutes++;

          if (status === google.maps.DirectionsStatus.OK) {
            renderer.setDirections(result);

            let totalDistance = 0;
            let totalDuration = 0;

            result.routes[0].legs.forEach((leg) => {
              totalDistance += leg.distance.value;
              totalDuration += leg.duration.value;
            });

            const distanceKm = (totalDistance / 1000).toFixed(2);
            const durationMin = Math.round(totalDuration / 60);

            totalDistanceSum += parseFloat(distanceKm);
            totalDurationSum += durationMin;

            if (completedRoutes === routes.length && onRouteCalculated) {
              onRouteCalculated({
                routeId: route.id,
                distance: distanceKm,
                duration: durationMin,
                totalDistance: totalDistanceSum,
                totalDuration: totalDurationSum,
                waypointOrder: result.routes[0].waypoint_order,
              });
              setIsCalculating(false);
            }
          } else {
            console.error(
              `❌ Directions request failed for route ${route.id}:`,
              status
            );
            if (completedRoutes === routes.length) {
              setIsCalculating(false);
            }
          }
        }
      );

      newRenderers.push(renderer);
    });

    setDirectionsRenderers(newRenderers);

    return () => {
      newRenderers.forEach((renderer) => renderer.setMap(null));
    };
  }, [map, routesLibrary, directionsServices, routes, showRoutes]);

  return null;
};

const ClusterMapViewer = ({ mode }) => {
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commonDestination, setCommonDestination] = useState(null);

  // Selection states
  const [selectedClusters, setSelectedClusters] = useState(new Set());
  const [selectedBookings, setSelectedBookings] = useState(new Set());
  const [selectedRoutes, setSelectedRoutes] = useState(new Set());

  // Route settings
  const [showRoutes, setShowRoutes] = useState(true);
  const [shortPath, setShortPath] = useState(true);
  const [preferLocalRoads, setPreferLocalRoads] = useState(false);

  // Route metrics
  const [totalDistance, setTotalDistance] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [optimizedOrder, setOptimizedOrder] = useState(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isMerging, setIsMerging] = useState(false);

  const { shiftId, date } = useParams();
  const handleDeleteRoute = async (routeId) => {
    try {
      // API call to delete the route
      await API_CLIENT.delete(`/v1/routes/${routeId}`);

      // Update local state
      setRouteData((prev) => ({
        ...prev,
        routes: prev.routes.filter((route) => route.route_id !== routeId),
      }));

      // Also remove from selected routes if it was selected
      setSelectedRoutes((prev) => {
        const newSelected = new Set(prev);
        newSelected.delete(routeId);
        return newSelected;
      });

      console.log(`Route ${routeId} deleted successfully`);
    } catch (error) {
      console.error("Failed to delete route:", error);
      alert("Failed to delete route. Please try again.");
    }
  };
  // Fetch route data
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
          if (response.data?.success && response.data?.data) {
            const { clusters, total_clusters, total_bookings } =
              response.data.data;

            setRouteData({
              route_clusters: clusters || [],
              total_clusters: total_clusters || 0,
              total_bookings: total_bookings || 0,
            });

            if (clusters?.length > 0 && clusters[0].bookings?.length > 0) {
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
          if (response.data?.success && response.data?.data?.shifts) {
            const allRoutes = [];

            response.data.data.shifts.forEach((shift) => {
              if (shift.routes?.length > 0) {
                shift.routes.forEach((route) => {
                  allRoutes.push({
                    ...route,
                    shift_id: shift.shift_id,
                    shift_time: shift.shift_time,
                    log_type: shift.log_type,
                  });
                });
              }
            });

            setRouteData({
              routes: allRoutes,
              total_routes: response.data.data.total_routes || 0,
              total_shifts: response.data.data.total_shifts || 0,
            });

            if (allRoutes.length > 0 && allRoutes[0].bookings?.length > 0) {
              const firstBooking = allRoutes[0].bookings[0];
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

  // Calculate markers
  const markers = useMemo(() => {
    if (!routeData || !commonDestination) return [];

    const markers = [];

    if (mode === "suggestions" && routeData.route_clusters) {
      routeData.route_clusters.forEach((cluster) => {
        cluster.bookings?.forEach((booking) => {
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
        });
      });
    } else if (mode === "saved" && routeData.routes) {
      routeData.routes.forEach((route) => {
        route.bookings?.forEach((booking) => {
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
      });
    }

    markers.push({
      id: "destination",
      position: commonDestination,
      type: "destination",
    });

    return markers;
  }, [routeData, commonDestination, mode]);

  // Calculate active routes
  const activeRoutes = useMemo(() => {
    if (!routeData || !commonDestination) return [];

    const routes = [];

    if (mode === "suggestions" && routeData.route_clusters) {
      const allSelectedBookings = [];

      routeData.route_clusters.forEach((cluster) => {
        cluster.bookings?.forEach((booking) => {
          if (selectedBookings.has(booking.booking_id)) {
            allSelectedBookings.push(booking);
          }
        });
      });

      if (allSelectedBookings.length > 0) {
        const path = allSelectedBookings.map((booking) => ({
          lat: booking.pickup_latitude,
          lng: booking.pickup_longitude,
        }));

        path.push(commonDestination);

        routes.push({
          id: `optimized-route`,
          path: path,
          color: "#10B981",
          bookingCount: allSelectedBookings.length,
          optimize: shortPath,
          preferLocalRoads: preferLocalRoads,
        });
      }
    } else if (mode === "saved" && routeData.routes) {
      const allSelectedBookings = [];

      selectedRoutes.forEach((routeId) => {
        const route = routeData.routes.find((r) => r.route_id === routeId);
        if (route) {
          allSelectedBookings.push(...route.bookings);
        }
      });

      if (allSelectedBookings.length > 0) {
        const path = allSelectedBookings.map((booking) => ({
          lat: booking.pickup_latitude,
          lng: booking.pickup_longitude,
        }));

        path.push(commonDestination);

        routes.push({
          id: `combined-optimized-route`,
          path: path,
          color: "#8B5CF6",
          bookingCount: allSelectedBookings.length,
          optimize: shortPath,
          preferLocalRoads: preferLocalRoads,
        });
      }
    }

    return routes;
  }, [
    selectedBookings,
    selectedRoutes,
    routeData,
    commonDestination,
    mode,
    shortPath,
    preferLocalRoads,
  ]);

  const handleRouteCalculated = useCallback((routeInfo) => {
    setTotalDistance(routeInfo.totalDistance);
    setTotalDuration(routeInfo.totalDuration);
    setOptimizedOrder(routeInfo.waypointOrder);
  }, []);

  const getMarkerIcon = useCallback(
    (marker) => {
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

      let isSelected = false;
      if (mode === "suggestions") {
        isSelected =
          selectedClusters.has(marker.clusterId) ||
          selectedBookings.has(marker.booking?.booking_id);
      } else {
        isSelected = selectedRoutes.has(marker.routeId);
      }

      return {
        path: "M 0, 0 m -5, 0 a 5,5 0 1,0 10,0 a 5,5 0 1,0 -10,0",
        scale: isSelected ? 2 : 1.6,
        fillColor: isSelected ? "#10B981" : "#3B82F6",
        fillOpacity: 0.9,
        strokeColor: "#ffffff",
        strokeWeight: 2,
      };
    },
    [mode, selectedClusters, selectedBookings, selectedRoutes]
  );

  const handleClusterSelect = useCallback((clusterId, bookings) => {
    setSelectedClusters((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(clusterId)) {
        newSet.delete(clusterId);
      } else {
        newSet.add(clusterId);
      }
      return newSet;
    });

    setSelectedBookings((prev) => {
      const newSet = new Set(prev);
      bookings.forEach((booking) => {
        if (prev.has(booking.booking_id)) {
          newSet.delete(booking.booking_id);
        } else {
          newSet.add(booking.booking_id);
        }
      });
      return newSet;
    });
  }, []);

  const handleBookingSelect = useCallback((bookingId) => {
    setSelectedBookings((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(bookingId)) {
        newSet.delete(bookingId);
      } else {
        newSet.add(bookingId);
      }
      return newSet;
    });
  }, []);

  const handleRouteSelect = useCallback((routeId) => {
    setSelectedRoutes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(routeId)) {
        newSet.delete(routeId);
      } else {
        newSet.add(routeId);
      }
      return newSet;
    });
  }, []);

  const handleDeleteBooking = useCallback(async (routeId, bookingId) => {
    try {
      await API_CLIENT.delete(`/v1/routes/${routeId}/bookings/${bookingId}`);

      setRouteData((prev) => {
        if (!prev?.routes) return prev;

        const updatedRoutes = prev.routes
          .map((route) => {
            if (route.route_id === routeId) {
              return {
                ...route,
                bookings: route.bookings.filter(
                  (booking) => booking.booking_id !== bookingId
                ),
              };
            }
            return route;
          })
          .filter((route) => route.bookings.length > 0);

        return {
          ...prev,
          routes: updatedRoutes,
          total_routes: updatedRoutes.length,
        };
      });

      console.log(`Booking ${bookingId} removed from route ${routeId}`);
    } catch (error) {
      console.error("Failed to delete booking:", error);
      alert("Failed to remove booking. Please try again.");
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (selectedBookings.size === 0) {
      alert("Please select at least one booking to save.");
      return;
    }

    const selectedBookingIds = Array.from(selectedBookings);

    const requestData = {
      groups: [
        {
          booking_ids: selectedBookingIds,
        },
      ],
    };

    try {
      setIsSaving(true);

      const response = await API_CLIENT.post("/v1/routes/", requestData);

      console.log("Response from server:", response.data);

      if (routeData?.route_clusters) {
        const updatedClusters = routeData.route_clusters
          .map((cluster) => ({
            ...cluster,
            bookings: cluster.bookings.filter(
              (booking) => !selectedBookings.has(booking.booking_id)
            ),
          }))
          .filter((cluster) => cluster.bookings.length > 0);

        setRouteData((prev) => ({
          ...prev,
          route_clusters: updatedClusters,
          total_clusters: updatedClusters.length,
          total_bookings: updatedClusters.reduce(
            (sum, cluster) => sum + cluster.bookings.length,
            0
          ),
        }));
      }

      setSelectedClusters(new Set());
      setSelectedBookings(new Set());

      alert(
        `Successfully saved ${selectedBookingIds.length} booking(s)! Route distance: ${totalDistance} km`
      );
    } catch (error) {
      console.error("Save failed:", error);
      const message =
        error.response?.data?.message ||
        "Failed to save bookings. Please try again.";
      alert(message);
    } finally {
      setIsSaving(false);
    }
  }, [selectedBookings, routeData, totalDistance]);

  // ✅ UPDATED: Handle merge with proper state update
  const handleMerge = useCallback(async () => {
    if (selectedRoutes.size < 2) {
      alert("Please select at least two routes to merge.");
      return;
    }

    const routeIds = Array.from(selectedRoutes);

    const requestData = {
      route_ids: routeIds,
    };

    console.log("Merging routes:", requestData);

    try {
      setIsMerging(true);

      // Call the merge API
      const response = await API_CLIENT.post(
        "/v1/routes/merge?tenant_id=SAM001",
        requestData
      );

      console.log("Merge response:", response.data);

      if (response.data?.success && response.data?.data) {
        const mergedRoute = response.data.data;

        // Extract shift info from the first selected route
        const firstSelectedRoute = routeData.routes.find((r) =>
          selectedRoutes.has(r.route_id)
        );

        // Create the new merged route with all necessary fields
        const newMergedRoute = {
          route_id: mergedRoute.route_id,
          bookings: mergedRoute.bookings || [],
          estimations: mergedRoute.estimations || null,
          shift_id: firstSelectedRoute?.shift_id || shiftId,
          shift_time: firstSelectedRoute?.shift_time || "",
          log_type: firstSelectedRoute?.log_type || "Login",
        };

        // Update route data: remove merged routes and add the new one
        setRouteData((prev) => {
          if (!prev?.routes) return prev;

          // Filter out the merged routes
          const remainingRoutes = prev.routes.filter(
            (route) => !selectedRoutes.has(route.route_id)
          );

          // Add the new merged route
          const updatedRoutes = [...remainingRoutes, newMergedRoute];

          return {
            ...prev,
            routes: updatedRoutes,
            total_routes: updatedRoutes.length,
          };
        });

        // Clear selection
        setSelectedRoutes(new Set());

        // Show success message
        alert(
          `Successfully merged ${routeIds.length} routes into route #${mergedRoute.route_id}!`
        );
      }
    } catch (error) {
      console.error("Merge failed:", error);
      const message =
        error.response?.data?.message ||
        "Failed to merge routes. Please try again.";
      alert(message);
    } finally {
      setIsMerging(false);
    }
  }, [selectedRoutes, routeData, shiftId]);

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

  const selectedStops =
    mode === "suggestions"
      ? selectedBookings.size
      : routeData?.routes
          ?.filter((r) => selectedRoutes.has(r.route_id))
          .reduce((sum, r) => sum + r.bookings.length, 0) || 0;

  const API_KEY = import.meta.env.VITE_GOOGLE_API || "";

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
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
                icon={getMarkerIcon(marker)}
              />
            ))}

            <DirectionsRenderer
              routes={activeRoutes}
              showRoutes={showRoutes}
              onRouteCalculated={handleRouteCalculated}
            />
          </Map>
        </APIProvider>
      </div>

      <div className="w-1/3 bg-gradient-to-b from-gray-50 to-white border-l border-gray-200 shadow-2xl flex flex-col h-full">
        <div className="flex-shrink-0 bg-white border-b border-gray-200 z-20">
          <div className="p-6 pb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-bold text-gray-900">
                {mode === "suggestions" ? "Suggested Routes" : "Saved Routes"}
              </h2>
              <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-bold rounded-full shadow-lg">
                {totalItems} {mode === "suggestions" ? "clusters" : "routes"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span className="font-medium">
                {totalBookings} total bookings
              </span>
              {mode === "suggestions" && selectedBookings.size > 0 && (
                <div className="text-right">
                  <div className="text-green-600 font-bold">
                    {selectedBookings.size} selected
                  </div>
                  {totalDistance > 0 && (
                    <div className="text-xs text-gray-500">
                      {totalDistance.toFixed(2)} km • {totalDuration} min
                    </div>
                  )}
                </div>
              )}
              {mode === "saved" && selectedRoutes.size > 0 && (
                <div className="text-right">
                  <div className="text-purple-600 font-bold">
                    {selectedRoutes.size} routes selected
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="px-6 pb-4">
            <MapToolbar
              mode={mode}
              selectedBookings={selectedBookings.size}
              selectedRoutes={selectedRoutes}
              showRoutes={showRoutes}
              shortPath={shortPath}
              totalDistance={totalDistance}
              onSave={handleSave}
              onMerge={handleMerge}
              onToggleRoutes={() => setShowRoutes(!showRoutes)}
              onToggleShortPath={() => setShortPath(!shortPath)}
              isSaving={isSaving}
              isMerging={isMerging}
            />

            <div className="mt-3 pt-3 border-t border-gray-200">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-gray-900 transition-colors">
                <input
                  type="checkbox"
                  checked={preferLocalRoads}
                  onChange={(e) => setPreferLocalRoads(e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="font-medium">
                  Prefer local roads (avoid highways)
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {mode === "suggestions" && routeData?.route_clusters ? (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-800">Clusters</h3>
                {selectedClusters.size > 0 && (
                  <span className="text-sm text-blue-600 font-bold px-3 py-1 bg-blue-50 rounded-full">
                    {selectedClusters.size} selected
                  </span>
                )}
              </div>

              {routeData.route_clusters.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">✅</div>
                  <p className="text-lg font-semibold text-gray-700">
                    All bookings saved!
                  </p>
                  <p className="text-sm mt-2">No clusters remaining.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {routeData.route_clusters.map((cluster) => (
                    <ClusterCard
                      key={cluster.cluster_id}
                      cluster={cluster}
                      onClusterSelect={handleClusterSelect}
                      onBookingSelect={handleBookingSelect}
                      selectedClusters={selectedClusters}
                      selectedBookings={selectedBookings}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : mode === "saved" && routeData?.routes ? (
            <div className="p-4 space-y-4">
              {selectedRoutes.size > 0 && (
                <div className="flex items-center justify-end mb-2">
                  <span className="text-sm text-purple-600 font-bold px-3 py-1 bg-purple-50 rounded-full">
                    {selectedRoutes.size} selected
                  </span>
                </div>
              )}

              {routeData.routes.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-lg font-semibold text-gray-700">
                    No saved routes found
                  </p>
                  <p className="text-sm mt-2">
                    Create routes from suggestions first.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {routeData.routes.map((route) => (
                    <SavedRouteCard
                      route={route}
                      isSelected={selectedRoutes.has(route.route_id)}
                      onRouteSelect={handleRouteSelect}
                      onDeleteBooking={handleDeleteBooking}
                      onDeleteRoute={handleDeleteRoute}
                      selectedBookings={selectedBookings}
                      onBookingSelect={handleBookingSelect}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center text-gray-500">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-lg font-semibold text-gray-700">
                  No {mode === "suggestions" ? "clusters" : "routes"} found
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClusterMapViewer;

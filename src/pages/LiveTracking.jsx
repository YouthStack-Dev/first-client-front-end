import React, { useState, useMemo } from "react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { Search, X, AlertCircle, RefreshCw, MapPin } from "lucide-react";
import LiveRouteCard from "./LiveRouteCard";
import MapMarkers from "./MapMarker";
import SelectedRouteOverlay from "./SelectedRouteOverlay";
import { useDriverLocations } from "../hooks/useDriverLocations";
import { logDebug } from "../utils/logger";

const LiveTracking = ({
  routes: apiRoutes = [],
  loading = false,
  selectedCompany = null,
}) => {
  const [routeSearch, setRouteSearch] = useState("");
  const [selectedRouteIds, setSelectedRouteIds] = useState([]);
  const [focusedRouteId, setFocusedRouteId] = useState(null);
  const [syncLoading, setSyncLoading] = useState(false);

  const API_KEY = import.meta.env.VITE_GOOGLE_API || "";

  // Use selected company location or default location
  const companyLocation = useMemo(() => {
    if (selectedCompany?.location) {
      return {
        lat:
          selectedCompany.location.latitude ||
          selectedCompany.location.lat ||
          12.9716,
        lng:
          selectedCompany.location.longitude ||
          selectedCompany.location.lng ||
          77.5946,
      };
    }
    return { lat: 12.9716, lng: 77.5946 };
  }, [selectedCompany]);

  // Process API routes - NO DUMMY DATA FALLBACK
  const allRoutes = useMemo(() => {
    if (!apiRoutes || !Array.isArray(apiRoutes)) {
      logDebug("No valid routes data received");
      return [];
    }

    return apiRoutes.map((route) => {
      // Extract route ID from various possible fields
      const routeId =
        route.id || route.route_id || route._id || `route-${Math.random()}`;

      // Extract driver info
      const driver = route.driver || {
        id: route.driver_id || null,
        name: route.driver_name || "Unknown Driver",
      };

      // Extract vehicle info
      const vehicle = route.vehicle || {
        rc_number: route.vehicle_number || "Unknown Vehicle",
        vehicle_id: route.vehicle_id,
      };

      // Extract stops - ensure it's an array
      let stops = [];
      if (route.stops && Array.isArray(route.stops)) {
        stops = route.stops;
      } else if (route.route_stops && Array.isArray(route.route_stops)) {
        stops = route.route_stops;
      }

      // Extract shift info if available
      const shift = route.shift || route.shift_info || null;

      return {
        ...route,
        route_id: routeId,
        driver,
        vehicle,
        stops,
        shift,
        // Add status with fallback
        status: route.status || "Ongoing",
      };
    });
  }, [apiRoutes]);

  // Get all driver IDs for selected routes
  const trackedDriverIds = useMemo(() => {
    return allRoutes
      .filter((route) => selectedRouteIds.includes(route.route_id))
      .map((route) => route?.driver?.id)
      .filter(Boolean);
  }, [selectedRouteIds, allRoutes]);

  // Use custom hook for location tracking
  const { driverLocations, loadingLocations, locationErrors } =
    useDriverLocations(trackedDriverIds);

  // Filter routes based on search
  const filteredRoutes = useMemo(() => {
    if (!allRoutes.length) return [];

    return allRoutes.filter((route) => {
      const vehicleNumber = route?.vehicle?.rc_number || "";
      const driverName = route?.driver?.name || "";
      const searchTerm = routeSearch.toLowerCase();

      return (
        vehicleNumber.toLowerCase().includes(searchTerm) ||
        driverName.toLowerCase().includes(searchTerm)
      );
    });
  }, [routeSearch, allRoutes]);

  // Get selected routes with their locations
  const selectedRoutes = useMemo(() => {
    return allRoutes
      .filter((route) => selectedRouteIds.includes(route.route_id))
      .map((route) => {
        const driverId = route?.driver?.id;
        const firebaseLocation = driverLocations[driverId];

        // Extract location from firebase data
        let currentLocation = null;
        let hasLiveLocation = false;

        if (firebaseLocation) {
          // Handle different possible location structures
          if (firebaseLocation.lat && firebaseLocation.lng) {
            currentLocation = {
              lat: firebaseLocation.lat,
              lng: firebaseLocation.lng,
            };
            hasLiveLocation = true;
          } else if (firebaseLocation.coordinates) {
            currentLocation = {
              lat: firebaseLocation.coordinates.lat,
              lng: firebaseLocation.coordinates.lng,
            };
            hasLiveLocation = true;
          } else if (firebaseLocation.latitude && firebaseLocation.longitude) {
            currentLocation = {
              lat: firebaseLocation.latitude,
              lng: firebaseLocation.longitude,
            };
            hasLiveLocation = true;
          }
        }

        // If no valid firebase location, use first stop's pickup location
        if (!currentLocation && route.stops?.[0]) {
          currentLocation = {
            lat: route.stops[0].pickup_latitude || route.stops[0].latitude,
            lng: route.stops[0].pickup_longitude || route.stops[0].longitude,
          };
        }

        // If still no location, check route's current location
        if (!currentLocation && route.current_location) {
          currentLocation = {
            lat: route.current_location.latitude || route.current_location.lat,
            lng: route.current_location.longitude || route.current_location.lng,
          };
        }

        // Final fallback to company location
        if (!currentLocation) {
          currentLocation = companyLocation;
        }

        return {
          ...route,
          currentLocation,
          hasLiveLocation,
          isLoading: loadingLocations[driverId],
          error: locationErrors[driverId],
        };
      });
  }, [
    selectedRouteIds,
    driverLocations,
    loadingLocations,
    locationErrors,
    companyLocation,
    allRoutes,
  ]);

  // Get focused route for overlay
  const focusedRoute = useMemo(() => {
    return selectedRoutes.find((route) => route.route_id === focusedRouteId);
  }, [selectedRoutes, focusedRouteId]);

  // Handle route selection (toggle)
  const handleRouteSelect = (route) => {
    setSelectedRouteIds((prev) => {
      if (prev.includes(route.route_id)) {
        const newSelection = prev.filter((id) => id !== route.route_id);
        if (focusedRouteId === route.route_id) {
          setFocusedRouteId(newSelection[0] || null);
        }
        return newSelection;
      } else {
        setFocusedRouteId(route.route_id);
        return [...prev, route.route_id];
      }
    });
  };

  // Handle route focus (for overlay)
  const handleRouteFocus = (routeId) => {
    setFocusedRouteId(routeId);
  };

  const clearSearch = () => setRouteSearch("");
  const clearFocus = () => setFocusedRouteId(null);

  return (
    <div className="mb-8">
      <div
        className="bg-white shadow-lg border border-gray-200 overflow-hidden"
        style={{ height: "600px" }}
      >
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Live Route Tracking
              </h2>
              <p className="text-sm text-gray-600">
                {selectedCompany ? selectedCompany.name : null}
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by vehicle number or driver name..."
              value={routeSearch}
              onChange={(e) => setRouteSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg 
                       focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                       hover:border-gray-300 transition-all duration-200 
                       bg-white shadow-sm placeholder-gray-400"
            />
            {routeSearch && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center 
                         text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-2">
            <p className="text-xs text-gray-500">
              {loading ? (
                <span className="text-blue-500">Loading routes...</span>
              ) : (
                <>
                  <span className="font-medium">{filteredRoutes.length}</span>{" "}
                  of <span className="font-medium">{allRoutes.length}</span>{" "}
                  routes
                </>
              )}
            </p>

            {selectedRouteIds.length > 0 && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {selectedRouteIds.length} tracked
              </span>
            )}

            {Object.keys(driverLocations).length > 0 && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                {Object.keys(driverLocations).length} live locations
              </span>
            )}

            {allRoutes.length === 0 && !loading && (
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                No ongoing routes
              </span>
            )}
          </div>
        </div>

        <div className="flex h-[calc(100%-120px)]">
          {/* Map Section */}
          <div className="flex-1 relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-3"></div>
                  <p className="text-gray-600">Loading map data...</p>
                </div>
              </div>
            ) : (
              <APIProvider apiKey={API_KEY}>
                <Map
                  defaultCenter={companyLocation}
                  defaultZoom={13}
                  mapId="company-route-map"
                  gestureHandling="greedy"
                  style={{ width: "100%", height: "100%" }}
                  fullscreenControl={false}
                  streetViewControl={false}
                  mapTypeControl={false}
                >
                  <MapMarkers
                    companyLocation={companyLocation}
                    selectedRoutes={selectedRoutes}
                    onMarkerClick={handleRouteFocus}
                  />
                </Map>
              </APIProvider>
            )}

            {/* Status Panel */}
            <div className="absolute top-4 left-4 bg-black/80 text-white text-xs p-2 rounded-lg max-w-xs">
              <div className="font-mono space-y-1">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-green-400" />
                  <span>Routes: {allRoutes.length}</span>
                </div>
                <div>Tracked: {selectedRouteIds.length}</div>
                <div>Live Locations: {Object.keys(driverLocations).length}</div>
                {focusedRoute && (
                  <>
                    <div className="border-t border-gray-600 pt-1 mt-1">
                      Focused: {focusedRoute.vehicle?.rc_number || "Unknown"}
                    </div>
                    <div className="text-green-400">
                      {focusedRoute.hasLiveLocation
                        ? "● Live Tracking"
                        : "● Static Position"}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Selected Route Overlay */}
            {focusedRoute && (
              <SelectedRouteOverlay route={focusedRoute} onClose={clearFocus} />
            )}
          </div>

          {/* Route List Sidebar */}
          <div className="w-80 border-l border-gray-200 overflow-y-auto">
            <div className="divide-y divide-gray-100">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
                  <p className="text-sm text-gray-500">Loading routes...</p>
                </div>
              ) : filteredRoutes.length > 0 ? (
                filteredRoutes.map((route) => (
                  <LiveRouteCard
                    key={route.route_id}
                    route={route}
                    isSelected={selectedRouteIds.includes(route.route_id)}
                    isFocused={focusedRouteId === route.route_id}
                    onSelect={handleRouteSelect}
                    onFocus={handleRouteFocus}
                    hasLiveLocation={!!driverLocations[route?.driver?.id]}
                    isLoading={loadingLocations[route?.driver?.id]}
                    error={locationErrors[route?.driver?.id]}
                  />
                ))
              ) : routeSearch ? (
                <div className="p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No routes found</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Try adjusting your search
                  </p>
                  <button
                    onClick={clearSearch}
                    className="mt-3 text-sm text-blue-500 hover:text-blue-600"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No ongoing routes</p>
                  <p className="text-xs text-gray-400 mt-1">
                    All routes are completed or haven't started yet
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTracking;

// components/LiveTracking.jsx
import React, { useState, useMemo } from "react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { Search, X, AlertCircle } from "lucide-react";
import LiveRouteCard from "./LiveRouteCard";
import MapMarkers from "./MapMarker";
import SelectedRouteOverlay from "./SelectedRouteOverlay";
import { ongoingRoutes } from "../staticData/routedata";
import { useDriverLocations } from "../hooks/useDriverLocations";
// import LiveRouteCard from "./LiveRouteCard";
// import MapMarkers from "./MapMarkers";
// import SelectedRouteOverlay from "./SelectedRouteOverlay";
// import { ongoingRoutes } from "../staticData/routedata";
// import { useDriverLocations } from "../hooks/useDriverLocations";

const LiveTracking = () => {
  const [routeSearch, setRouteSearch] = useState("");
  const [selectedRouteIds, setSelectedRouteIds] = useState([]); // Multi-selection
  const [focusedRouteId, setFocusedRouteId] = useState(null);

  const API_KEY = import.meta.env.VITE_GOOGLE_API || "";
  const companyLocation = { lat: 12.9716, lng: 77.5946 };

  // Get all driver IDs for selected routes
  const trackedDriverIds = useMemo(() => {
    return ongoingRoutes
      .filter((route) => selectedRouteIds.includes(route.id))
      .map((route) => route.driverId)
      .filter(Boolean);
  }, [selectedRouteIds]);

  // Use custom hook for location tracking
  const { driverLocations, loadingLocations, locationErrors } =
    useDriverLocations(trackedDriverIds);

  // Filter routes based on search
  const filteredRoutes = useMemo(() => {
    return ongoingRoutes.filter(
      (route) =>
        route.vehicleNumber.toLowerCase().includes(routeSearch.toLowerCase()) ||
        route.driver.toLowerCase().includes(routeSearch.toLowerCase())
    );
  }, [routeSearch]);

  // Get selected routes with their locations
  const selectedRoutes = useMemo(() => {
    return ongoingRoutes
      .filter((route) => selectedRouteIds.includes(route.id))
      .map((route) => ({
        ...route,
        currentLocation: driverLocations[route.driverId] || route.location,
        hasLiveLocation: !!driverLocations[route.driverId],
        isLoading: loadingLocations[route.driverId],
        error: locationErrors[route.driverId],
      }));
  }, [selectedRouteIds, driverLocations, loadingLocations, locationErrors]);

  // Get focused route for overlay
  const focusedRoute = useMemo(() => {
    return selectedRoutes.find((route) => route.id === focusedRouteId);
  }, [selectedRoutes, focusedRouteId]);

  // Handle route selection (toggle)
  const handleRouteSelect = (route) => {
    setSelectedRouteIds((prev) => {
      if (prev.includes(route.id)) {
        // Deselect
        const newSelection = prev.filter((id) => id !== route.id);
        // If focused route was deselected, clear focus or set to first selected
        if (focusedRouteId === route.id) {
          setFocusedRouteId(newSelection[0] || null);
        }
        return newSelection;
      } else {
        // Select and focus
        setFocusedRouteId(route.id);
        return [...prev, route.id];
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
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Live Tracking
      </h2>

      <div
        className="bg-white shadow-lg border border-gray-200 overflow-hidden"
        style={{ height: "600px" }}
      >
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
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
          <p className="text-xs text-gray-500 mt-2">
            {filteredRoutes.length} of {ongoingRoutes.length} routes
            {selectedRouteIds.length > 0 &&
              ` • ${selectedRouteIds.length} tracked`}
            {Object.keys(driverLocations).length > 0 &&
              ` • ${Object.keys(driverLocations).length} live`}
            <span className="ml-2 text-green-600">
              • Real-time updates active
            </span>
          </p>
        </div>

        <div className="flex h-[calc(100%-80px)]">
          {/* Map Section */}
          <div className="flex-1 relative">
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

            {/* Debug Info Panel */}
            <div className="absolute top-4 left-4 bg-black/80 text-white text-xs p-2 rounded-lg max-w-xs">
              <div className="font-mono space-y-1">
                <div>Tracked: {selectedRouteIds.length} routes</div>
                <div>Live: {Object.keys(driverLocations).length} drivers</div>
                {focusedRoute && (
                  <>
                    <div className="border-t border-gray-600 pt-1 mt-1">
                      Focused: {focusedRoute.vehicleNumber}
                    </div>
                    <div>
                      Source:{" "}
                      {focusedRoute.hasLiveLocation ? "Firebase" : "Static"}
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
              {filteredRoutes.length > 0 ? (
                filteredRoutes.map((route) => (
                  <LiveRouteCard
                    key={route.id}
                    route={route}
                    isSelected={selectedRouteIds.includes(route.id)}
                    isFocused={focusedRouteId === route.id}
                    onSelect={handleRouteSelect}
                    onFocus={handleRouteFocus}
                    hasLiveLocation={!!driverLocations[route.driverId]}
                    isLoading={loadingLocations[route.driverId]}
                    error={locationErrors[route.driverId]}
                  />
                ))
              ) : (
                <div className="p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No routes found</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Try adjusting your search
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

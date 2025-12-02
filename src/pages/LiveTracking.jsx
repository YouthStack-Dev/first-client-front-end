import React, { useState, useMemo, useEffect } from "react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { Search, X, AlertCircle, RefreshCw } from "lucide-react";
import LiveRouteCard from "./LiveRouteCard";
import MapMarkers from "./MapMarker";
import SelectedRouteOverlay from "./SelectedRouteOverlay";
import { dummyroutes } from "../staticData/routedata";
import { useDriverLocations } from "../hooks/useDriverLocations";
import { API_CLIENT } from "../Api/API_Client";
import { logDebug } from "../utils/logger";
import ToolBar from "../components/ui/ToolBar";
import SelectField from "../components/ui/SelectField";

const LiveTracking = () => {
  const [routeSearch, setRouteSearch] = useState("");
  const [selectedRouteIds, setSelectedRouteIds] = useState([]); // Multi-selection
  const [focusedRouteId, setFocusedRouteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const API_KEY = import.meta.env.VITE_GOOGLE_API || "";
  const companyLocation = { lat: 12.9716, lng: 77.5946 };
  const [selectedCompany, setSelectedCompany] = useState("");

  const fetchOngooingRoutes = async () => {
    const response = await API_CLIENT.get("/v1/routes/");
    logDebug("Ongoing Routes Response:", response.data);
  };

  useEffect(() => {
    fetchOngooingRoutes();
  }, []);

  logDebug("Selected Route IDs:", selectedRouteIds);

  // Get all driver IDs for selected routes
  const trackedDriverIds = useMemo(() => {
    return dummyroutes
      .filter((route) => selectedRouteIds.includes(route.route_id))
      .map((route) => route?.driver?.id)
      .filter(Boolean);
  }, [selectedRouteIds]);

  logDebug("Tracked Driver IDs:", trackedDriverIds);

  // Use custom hook for location tracking
  const { driverLocations, loadingLocations, locationErrors } =
    useDriverLocations(trackedDriverIds);
  logDebug(
    "Driver Locations:",
    driverLocations,
    loadingLocations,
    locationErrors
  );
  // Filter routes based on search
  const filteredRoutes = useMemo(() => {
    return dummyroutes.filter(
      (route) =>
        route?.vehicle?.rc_number
          .toLowerCase()
          .includes(routeSearch.toLowerCase()) ||
        route?.driver?.name?.toLowerCase().includes(routeSearch.toLowerCase())
    );
  }, [routeSearch]);

  // Get selected routes with their locations
  // In the selectedRoutes computation, update to handle different location structures
  const selectedRoutes = useMemo(() => {
    return dummyroutes
      .filter((route) => selectedRouteIds.includes(route.route_id))
      .map((route) => {
        const driverId = route?.driver?.id;
        const firebaseLocation = driverLocations[driverId];

        // Extract location from firebase data
        let currentLocation = null;

        if (firebaseLocation) {
          // Handle different possible location structures
          if (firebaseLocation.lat && firebaseLocation.lng) {
            // Direct lat/lng properties
            currentLocation = {
              lat: firebaseLocation.lat,
              lng: firebaseLocation.lng,
            };
          } else if (firebaseLocation.coordinates) {
            // Nested coordinates
            currentLocation = {
              lat: firebaseLocation.coordinates.lat,
              lng: firebaseLocation.coordinates.lng,
            };
          } else if (firebaseLocation.latitude && firebaseLocation.longitude) {
            // Different property names
            currentLocation = {
              lat: firebaseLocation.latitude,
              lng: firebaseLocation.longitude,
            };
          }
        }

        // If no valid firebase location, use first stop's pickup location
        if (!currentLocation && route.stops?.[0]) {
          currentLocation = {
            lat: route.stops[0].pickup_latitude,
            lng: route.stops[0].pickup_longitude,
          };
        }

        // Final fallback to company location
        if (!currentLocation) {
          currentLocation = companyLocation;
        }

        return {
          ...route,
          currentLocation,
          hasLiveLocation: !!firebaseLocation,
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
  ]);

  // Get focused route for overlay
  const focusedRoute = useMemo(() => {
    return selectedRoutes.find((route) => route.route_id === focusedRouteId);
  }, [selectedRoutes, focusedRouteId]);

  // Handle route selection (toggle)
  const handleRouteSelect = (route) => {
    setSelectedRouteIds((prev) => {
      if (prev.includes(route.route_id)) {
        // Deselect
        const newSelection = prev.filter((id) => id !== route.route_id);
        // If focused route was deselected, clear focus or set to first selected
        if (focusedRouteId === route.route_id) {
          setFocusedRouteId(newSelection[0] || null);
        }
        return newSelection;
      } else {
        // Select and focus
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
  const handleSync = () => {
    logDebug("Syncing data...");
  };

  const companyOptions = [
    { value: "", label: "All company" },
    { value: "company1", label: "company 1" },
    { value: "company2", label: "company 2" },
    { value: "company3", label: "company 3" },
  ];

  return (
    <div className="mb-8">
      <ToolBar
        rightElements={
          <div className="flex items-center gap-4">
            {"admin" === "admin" ? (
              <SelectField
                label="Company"
                value={selectedCompany}
                onChange={setSelectedCompany}
                options={companyOptions}
              />
            ) : null}
            <button
              onClick={handleSync}
              disabled={loading}
              className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm 
             hover:bg-blue-600 disabled:bg-blue-300 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  Sync
                </>
              )}
            </button>
          </div>
        }
      />
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
            {filteredRoutes.length} of {dummyroutes.length} routes
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
                      Focused: {focusedRoute.vehicle?.rc_number || "Unknown"}
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

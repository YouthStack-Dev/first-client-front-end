import React, { useState, useMemo, useCallback } from "react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { Search, X, AlertCircle, MapPin, Radio, Navigation } from "lucide-react";
import LiveRouteCard from "./LiveRouteCard";
import MapMarkers from "./MapMarker";
import SelectedRouteOverlay from "./SelectedRouteOverlay";
import { useDriverLocations } from "../hooks/useDriverLocations";
import { logDebug } from "../utils/logger";

const DEFAULT_LOCATION = { lat: 12.9716, lng: 77.5946 };

const extractLocation = (obj, latKeys, lngKeys) => {
  const lat = latKeys.map((k) => obj?.[k]).find(Boolean);
  const lng = lngKeys.map((k) => obj?.[k]).find(Boolean);
  return lat && lng ? { lat, lng } : null;
};

const LiveTracking = ({
  routes: apiRoutes = [],
  loading = false,
  selectedCompany = null,
}) => {
  const [routeSearch, setRouteSearch] = useState("");
  const [selectedRouteIds, setSelectedRouteIds] = useState([]);
  const [focusedRouteId, setFocusedRouteId] = useState(null);

  const API_KEY = import.meta.env.VITE_GOOGLE_API || "";

  const companyLocation = useMemo(() => {
    if (!selectedCompany?.location) return DEFAULT_LOCATION;
    return (
      extractLocation(selectedCompany.location, ["latitude", "lat"], ["longitude", "lng"]) ||
      DEFAULT_LOCATION
    );
  }, [selectedCompany]);

  const allRoutes = useMemo(() => {
    if (!Array.isArray(apiRoutes)) return [];

    return apiRoutes.map((route, index) => {
      const routeId = route.id || route.route_id || route._id || `route-${index}`;

      const driver = route.driver || {
        id: route.driver_id || null,
        name: route.driver_name || "Unknown Driver",
      };

      const vehicle = route.vehicle || {
        rc_number: route.vehicle_number || "Unknown Vehicle",
        vehicle_id: route.vehicle_id,
      };

      const vendorId = route.vendor?.id || null;

      let stops = [];
      if (Array.isArray(route.stops)) stops = route.stops;
      else if (Array.isArray(route.route_stops)) stops = route.route_stops;

      const shift = route.shift || route.shift_info || null;

      return {
        ...route,
        route_id: routeId,
        driver,
        vehicle,
        vendorId,
        stops,
        shift,
        status: route.status || "Ongoing",
      };
    });
  }, [apiRoutes]);

  const trackedDrivers = useMemo(() =>
    allRoutes
      .filter((r) => selectedRouteIds.includes(r.route_id))
      .map((r) => ({
        driverId: r?.driver?.id,
        vendorId: r?.vendorId,
      }))
      .filter((d) => d.driverId && d.vendorId),
    [selectedRouteIds, allRoutes]
  );

  const { driverLocations, loadingLocations, locationErrors } =
    useDriverLocations(trackedDrivers);

  const filteredRoutes = useMemo(() => {
    const term = routeSearch.toLowerCase();
    if (!term) return allRoutes;
    return allRoutes.filter(
      (r) =>
        (r?.vehicle?.rc_number || "").toLowerCase().includes(term) ||
        (r?.driver?.name || "").toLowerCase().includes(term)
    );
  }, [routeSearch, allRoutes]);

  const selectedRoutes = useMemo(() => {
    return allRoutes
      .filter((r) => selectedRouteIds.includes(r.route_id))
      .map((route) => {
        const driverId = route?.driver?.id;
        const fb = driverLocations[driverId];

        let currentLocation = null;
        let hasLiveLocation = false;

        if (fb) {
          currentLocation =
            extractLocation(fb, ["lat", "latitude"], ["lng", "longitude"]) ||
            extractLocation(fb?.coordinates, ["lat", "latitude"], ["lng", "longitude"]);
          if (currentLocation) hasLiveLocation = true;
        }

        if (!currentLocation && route.stops?.[0]) {
          currentLocation = extractLocation(
            route.stops[0],
            ["pickup_latitude", "latitude"],
            ["pickup_longitude", "longitude"]
          );
        }

        if (!currentLocation && route.current_location) {
          currentLocation = extractLocation(
            route.current_location,
            ["latitude", "lat"],
            ["longitude", "lng"]
          );
        }

        currentLocation = currentLocation || companyLocation;

        return {
          ...route,
          currentLocation,
          hasLiveLocation,
          isLoading: loadingLocations[driverId],
          error: locationErrors[driverId],
        };
      });
  }, [selectedRouteIds, driverLocations, loadingLocations, locationErrors, companyLocation, allRoutes]);

  const focusedRoute = useMemo(
    () => selectedRoutes.find((r) => r.route_id === focusedRouteId),
    [selectedRoutes, focusedRouteId]
  );

  const handleRouteSelect = useCallback(
    (route) => {
      const isSelected = selectedRouteIds.includes(route.route_id);
      if (isSelected) {
        const newSelection = selectedRouteIds.filter((id) => id !== route.route_id);
        setSelectedRouteIds(newSelection);
        if (focusedRouteId === route.route_id) {
          setFocusedRouteId(newSelection[0] || null);
        }
      } else {
        setSelectedRouteIds((prev) => [...prev, route.route_id]);
        setFocusedRouteId(route.route_id);
      }
    },
    [selectedRouteIds, focusedRouteId]
  );

  const handleRouteFocus = useCallback((routeId) => setFocusedRouteId(routeId), []);
  const clearSearch = useCallback(() => setRouteSearch(""), []);
  const clearFocus = useCallback(() => setFocusedRouteId(null), []);

  const liveCount = Object.keys(driverLocations).length;

  return (
    // ── FIX: use calc(100vh - 160px) so map fills the screen ─────────────────
    // 160px accounts for top navbar + page padding
    <div className="mb-4">
      <div
        className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        style={{ height: "calc(100vh - 160px)", minHeight: "600px" }}
      >
        {/* ── Header ── */}
        <div className="px-5 pt-4 pb-3 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <h2 className="text-base font-semibold text-gray-900 tracking-tight">
                  Live Route Tracking
                </h2>
              </div>
              {selectedCompany?.name && (
                <p className="text-xs text-gray-400 mt-0.5 ml-4">
                  {selectedCompany.name}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {selectedRouteIds.length > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-full">
                  <Navigation className="w-3 h-3" />
                  {selectedRouteIds.length} tracked
                </span>
              )}
              {liveCount > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-100 px-2.5 py-1 rounded-full">
                  <Radio className="w-3 h-3" />
                  {liveCount} live
                </span>
              )}
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by vehicle number or driver name…"
              value={routeSearch}
              onChange={(e) => setRouteSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2 text-sm border border-gray-200 rounded-lg
                         focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                         hover:border-gray-300 transition-all bg-white placeholder-gray-400"
            />
            {routeSearch && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <p className="text-xs text-gray-400 mt-2">
            {loading ? (
              <span className="text-blue-500 font-medium">Fetching routes…</span>
            ) : (
              <>
                <span className="font-medium text-gray-600">{filteredRoutes.length}</span>{" "}
                of{" "}
                <span className="font-medium text-gray-600">{allRoutes.length}</span>{" "}
                routes shown
                {allRoutes.length === 0 && (
                  <span className="ml-2 text-amber-500 font-medium">— No ongoing routes</span>
                )}
              </>
            )}
          </p>
        </div>

        {/* ── Body: Map + Sidebar ── */}
        <div className="flex" style={{ height: "calc(100% - 130px)" }}>

          {/* ── Map ── */}
          <div className="flex-1 relative bg-slate-100">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-slate-50/80 backdrop-blur-sm">
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Loading map data…</p>
                </div>
              </div>
            )}

            {!API_KEY && (
              <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-amber-500/90 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1.5 rounded-lg shadow pointer-events-none">
                <AlertCircle className="w-3.5 h-3.5" />
                Dev mode — add VITE_GOOGLE_API for full maps
              </div>
            )}

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

            {/* Floating status badge */}
            <div className="absolute top-3 left-3 bg-gray-900/75 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-xl shadow-lg pointer-events-none">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span className="font-semibold">
                  {allRoutes.length} routes · {selectedRouteIds.length} tracked
                </span>
              </div>
              {focusedRoute && (
                <div className="border-t border-white/10 pt-1 mt-1 space-y-0.5">
                  <div className="text-gray-300">
                    {focusedRoute.vehicle?.rc_number || "Unknown"}
                  </div>
                  <div className={focusedRoute.hasLiveLocation ? "text-emerald-400" : "text-amber-400"}>
                    {focusedRoute.hasLiveLocation ? "● Live tracking" : "● Static position"}
                  </div>
                </div>
              )}
            </div>

            {focusedRoute && (
              <SelectedRouteOverlay route={focusedRoute} onClose={clearFocus} />
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="w-72 border-l border-gray-100 overflow-y-auto bg-white flex-shrink-0">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-400">Loading routes…</p>
              </div>
            ) : filteredRoutes.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {filteredRoutes.map((route) => (
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
                ))}
              </div>
            ) : (
              <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                  <AlertCircle className="w-7 h-7 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-500">
                  {routeSearch ? "No routes found" : "No ongoing routes"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {routeSearch
                    ? "Try a different search term"
                    : "All routes are completed or haven't started yet"}
                </p>
                {routeSearch && (
                  <button
                    onClick={clearSearch}
                    className="mt-3 text-xs font-medium text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTracking;
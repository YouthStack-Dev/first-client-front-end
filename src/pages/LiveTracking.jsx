import React, { useState, useMemo, useCallback } from "react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { Search, X, AlertCircle, MapPin, Radio, Navigation, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";
import LiveRouteCard from "./LiveRouteCard";
import MapMarkers from "./MapMarker";
import SelectedRouteOverlay from "./SelectedRouteOverlay";
import { useDriverLocations } from "../hooks/useDriverLocations";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_LOCATION = { lat: 12.9716, lng: 77.5946 };

const LAYOUT = {
  HEADER_OFFSET: 160,
  MIN_HEIGHT:    600,
  INNER_HEADER:  130,
  SIDEBAR_WIDTH: 288,
};

const MAP_CONFIG = {
  id:              "company-route-map",
  defaultZoom:     13,
  gestureHandling: "greedy",
};

const MAX_TRACKED = 5;

// ─────────────────────────────────────────────────────────────────────────────
// Status groups — order defines priority (Ongoing always first)
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_GROUPS = [
  {
    key:      "ongoing",
    label:    "Ongoing",
    statuses: ["Ongoing"],
    dot:      "#1D9E75",
    bg:       "#E1F5EE",
    text:     "#085041",
    badge:    "#0F6E56",
  },
  {
    key:      "driver_assigned",
    label:    "Driver assigned",
    statuses: ["Driver Assigned"],
    dot:      "#378ADD",
    bg:       "#E6F1FB",
    text:     "#0C447C",
    badge:    "#185FA5",
  },
  {
    key:      "vendor_assigned",
    label:    "Vendor assigned",
    statuses: ["Vendor Assigned"],
    dot:      "#EF9F27",
    bg:       "#FAEEDA",
    text:     "#633806",
    badge:    "#BA7517",
  },
  {
    key:      "planned",
    label:    "Planned",
    statuses: ["Planned"],
    dot:      "#888780",
    bg:       "#F1EFE8",
    text:     "#444441",
    badge:    "#5F5E5A",
  },
  {
    key:      "other",
    label:    "Other",
    statuses: [],          // catch-all
    dot:      "#B4B2A9",
    bg:       "#F1EFE8",
    text:     "#5F5E5A",
    badge:    "#888780",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Dev-only logger
// ─────────────────────────────────────────────────────────────────────────────
const devWarn = (msg) => {
  if (import.meta.env.DEV) console.warn(msg);
};

// ─────────────────────────────────────────────────────────────────────────────
// Utility — safely extracts { lat, lng } from an object
// ─────────────────────────────────────────────────────────────────────────────
const extractLocation = (obj, latKeys, lngKeys) => {
  const lat = latKeys.map((k) => obj?.[k]).find(Boolean);
  const lng = lngKeys.map((k) => obj?.[k]).find(Boolean);
  return lat && lng ? { lat, lng } : null;
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper — which group does a route belong to?
// ─────────────────────────────────────────────────────────────────────────────
const getStatusGroup = (status = "") => {
  const normalized = status.trim().toLowerCase();
  return (
    STATUS_GROUPS.find((g) =>
      g.statuses.some((s) => s.toLowerCase() === normalized)
    ) ?? STATUS_GROUPS.find((g) => g.key === "other")
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// StatusGroupHeader
// ─────────────────────────────────────────────────────────────────────────────
const StatusGroupHeader = ({ group, count, isOpen, onToggle }) => (
  <button
    onClick={onToggle}
    style={{
      width: "100%", display: "flex", alignItems: "center",
      justifyContent: "space-between", padding: "6px 12px",
      background: group.bg, border: "none", borderBottom: "0.5px solid rgba(0,0,0,0.06)",
      cursor: "pointer",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: group.dot, display: "inline-block", flexShrink: 0 }} />
      <span style={{ fontSize: 11, fontWeight: 600, color: group.text, letterSpacing: "0.05em", textTransform: "uppercase" }}>
        {group.label}
      </span>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 10, fontWeight: 600, color: "white", background: group.badge, padding: "1px 7px", borderRadius: 20 }}>
        {count}
      </span>
      {isOpen
        ? <ChevronDown  style={{ width: 13, height: 13, color: group.text }} />
        : <ChevronRight style={{ width: 13, height: 13, color: group.text }} />
      }
    </div>
  </button>
);

// ─────────────────────────────────────────────────────────────────────────────
// EmptyRouteState
// ─────────────────────────────────────────────────────────────────────────────
const EmptyRouteState = ({ routeSearch, onClear }) => (
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
        onClick={onClear}
        className="mt-3 text-xs font-medium text-blue-500 hover:text-blue-600 transition-colors"
      >
        Clear search
      </button>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// LiveTracking
// ─────────────────────────────────────────────────────────────────────────────
const LiveTracking = ({
  routes: apiRoutes = [],
  loading = false,
  selectedCompany = null,
}) => {
  // ── UI State ──────────────────────────────────────────────────────────────
  const [routeSearch,    setRouteSearch]    = useState("");

  // ── Selection State ───────────────────────────────────────────────────────
  const [selectedRouteIds, setSelectedRouteIds] = useState([]);
  const [focusedRouteId,   setFocusedRouteId]   = useState(null);

  // ── Group collapse state — Ongoing open by default, rest collapsed ─────────
  const [openGroups, setOpenGroups] = useState({
    ongoing:         true,
    driver_assigned: false,
    vendor_assigned: false,
    planned:         false,
    other:           false,
  });

  const API_KEY = import.meta.env.VITE_GOOGLE_API || "";

  // ── Company location with fallback chain ──────────────────────────────────
  const companyLocation = useMemo(() => {
    if (!selectedCompany) {
      devWarn("⚠️ No company → using hardcoded default");
      return DEFAULT_LOCATION;
    }
    const extracted =
      extractLocation(selectedCompany?.location, ["latitude", "lat"], ["longitude", "lng"]) ||
      extractLocation(selectedCompany,            ["latitude", "lat"], ["longitude", "lng"]);

    if (!extracted) {
      devWarn("⚠️ Could not extract location → using hardcoded default");
      return DEFAULT_LOCATION;
    }
    return extracted;
  }, [selectedCompany]);

  // ── Normalize API routes ──────────────────────────────────────────────────
  const allRoutes = useMemo(() => {
    if (!Array.isArray(apiRoutes)) return [];
    return apiRoutes.map((route, index) => {
      const routeId  = route.id || route.route_id || route._id || `route-${index}`;
      const driver   = route.driver  || { id: route.driver_id || null,    name: route.driver_name    || "Unknown Driver"  };
      const vehicle  = route.vehicle || { rc_number: route.vehicle_number || "Unknown Vehicle", vehicle_id: route.vehicle_id };
      const vendorId = route.vendor?.id || null;
      const stops    = Array.isArray(route.stops) ? route.stops : Array.isArray(route.route_stops) ? route.route_stops : [];
      const shift    = route.shift || route.shift_info || null;

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

  // ── Filtered routes (search) ──────────────────────────────────────────────
  const filteredRoutes = useMemo(() => {
    const term = routeSearch.toLowerCase();
    if (!term) return allRoutes;
    return allRoutes.filter(
      (r) =>
        (r?.vehicle?.rc_number || "").toLowerCase().includes(term) ||
        (r?.driver?.name       || "").toLowerCase().includes(term)
    );
  }, [routeSearch, allRoutes]);

  // ── Routes grouped by status ──────────────────────────────────────────────
  const groupedRoutes = useMemo(() => {
    return STATUS_GROUPS.map((group) => {
      const routes =
        group.key === "other"
          ? filteredRoutes.filter((r) => {
              const known = STATUS_GROUPS.flatMap((g) => g.statuses).map((s) => s.toLowerCase());
              return !known.includes((r.status || "").toLowerCase());
            })
          : filteredRoutes.filter((r) =>
              group.statuses.some((s) => s.toLowerCase() === (r.status || "").toLowerCase())
            );
      return { ...group, routes };
    }).filter((g) => g.routes.length > 0);
  }, [filteredRoutes]);

  // ── Drivers to track via Firebase ─────────────────────────────────────────
  const trackedDrivers = useMemo(() => {
    return allRoutes
      .filter((r) => selectedRouteIds.includes(r.route_id))
      .map((r) => ({ driverId: r?.driver?.id, vendorId: r?.vendorId }))
      .filter((d) => d.driverId && d.vendorId);
  },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [JSON.stringify(selectedRouteIds), JSON.stringify(allRoutes.map((r) => r.route_id))]);

  const { driverLocations, loadingLocations, locationErrors } =
    useDriverLocations(trackedDrivers);

  // ── Selected routes enriched with live location ───────────────────────────
  const selectedRoutes = useMemo(() => {
    return allRoutes
      .filter((r) => selectedRouteIds.includes(r.route_id))
      .map((route) => {
        const driverId = route?.driver?.id;
        const fb       = driverLocations[driverId];

        let currentLocation = null;
        let hasLiveLocation = false;

        if (fb) {
          currentLocation =
            extractLocation(fb,              ["lat", "latitude"], ["lng", "longitude"]) ||
            extractLocation(fb?.coordinates, ["lat", "latitude"], ["lng", "longitude"]);
          if (currentLocation) hasLiveLocation = true;
        }
        if (!currentLocation && route.stops?.[0]) {
          currentLocation = extractLocation(route.stops[0], ["pickup_latitude", "latitude"], ["pickup_longitude", "longitude"]);
        }
        if (!currentLocation && route.current_location) {
          currentLocation = extractLocation(route.current_location, ["latitude", "lat"], ["longitude", "lng"]);
        }
        currentLocation = currentLocation || companyLocation;

        return { ...route, currentLocation, hasLiveLocation, isLoading: loadingLocations[driverId], error: locationErrors[driverId] };
      });
  }, [selectedRouteIds, driverLocations, loadingLocations, locationErrors, companyLocation, allRoutes]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const focusedRoute = useMemo(
    () => selectedRoutes.find((r) => r.route_id === focusedRouteId),
    [selectedRoutes, focusedRouteId]
  );

  const liveCount = useMemo(
    () => Object.keys(driverLocations).length,
    [driverLocations]
  );

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleRouteSelect = useCallback(
    (route) => {
      const isSelected = selectedRouteIds.includes(route.route_id);

      if (isSelected) {
        const newSelection = selectedRouteIds.filter((id) => id !== route.route_id);
        setSelectedRouteIds(newSelection);
        if (focusedRouteId === route.route_id) setFocusedRouteId(newSelection[0] || null);
      } else {
        // ✅ Max 5 tracked at once
        if (selectedRouteIds.length >= MAX_TRACKED) {
          toast.warning(`Max ${MAX_TRACKED} routes can be tracked at once. Deselect one first.`);
          return;
        }
        setSelectedRouteIds((prev) => [...prev, route.route_id]);
        setFocusedRouteId(route.route_id);
      }
    },
    [selectedRouteIds, focusedRouteId]
  );

  const handleRouteFocus    = useCallback((routeId) => setFocusedRouteId(routeId), []);
  const clearSearch         = useCallback(() => setRouteSearch(""),      []);
  const clearFocus          = useCallback(() => setFocusedRouteId(null), []);

  const handleSearchKeyDown = useCallback((e) => {
    if (e.key === "Escape") clearSearch();
  }, [clearSearch]);

  const toggleGroup = useCallback((groupKey) => {
    setOpenGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="mb-4">
      <div
        className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        style={{ height: `calc(100vh - ${LAYOUT.HEADER_OFFSET}px)`, minHeight: `${LAYOUT.MIN_HEIGHT}px` }}
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
                <p className="text-xs text-gray-400 mt-0.5 ml-4">{selectedCompany.name}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {selectedRouteIds.length > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-full">
                  <Navigation className="w-3 h-3" />
                  {selectedRouteIds.length}/{MAX_TRACKED} tracked
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

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by vehicle number or driver name…"
              value={routeSearch}
              onChange={(e) => setRouteSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full pl-9 pr-9 py-2 text-sm border border-gray-200 rounded-lg
                         focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                         hover:border-gray-300 transition-all bg-white placeholder-gray-400"
            />
            {routeSearch && (
              <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
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
        <div className="flex" style={{ height: `calc(100% - ${LAYOUT.INNER_HEADER}px)` }}>

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
                center={companyLocation}
                defaultZoom={MAP_CONFIG.defaultZoom}
                mapId={MAP_CONFIG.id}
                gestureHandling={MAP_CONFIG.gestureHandling}
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
                  <div className="text-gray-300">{focusedRoute.vehicle?.rc_number || "Unknown"}</div>
                  <div className={focusedRoute.hasLiveLocation ? "text-emerald-400" : "text-amber-400"}>
                    {focusedRoute.hasLiveLocation ? "● Live tracking" : "● Static position"}
                  </div>
                </div>
              )}
            </div>

            {focusedRoute && <SelectedRouteOverlay route={focusedRoute} onClose={clearFocus} />}
          </div>

          {/* ── Sidebar ── */}
          <div
            className="border-l border-gray-100 overflow-y-auto bg-white flex-shrink-0"
            style={{ width: LAYOUT.SIDEBAR_WIDTH }}
          >
            {/* Sidebar header with total count */}
            <div className="px-4 py-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between sticky top-0 z-10">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Routes</span>
              <span className="text-xs font-medium bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                {filteredRoutes.length}
              </span>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-400">Loading routes…</p>
              </div>
            ) : filteredRoutes.length === 0 ? (
              <EmptyRouteState routeSearch={routeSearch} onClear={clearSearch} />
            ) : (
              // ✅ Grouped by status — Ongoing always first
              groupedRoutes.map((group) => (
                <div key={group.key}>
                  <StatusGroupHeader
                    group={group}
                    count={group.routes.length}
                    isOpen={openGroups[group.key]}
                    onToggle={() => toggleGroup(group.key)}
                  />
                  {openGroups[group.key] && (
                    <div className="divide-y divide-gray-50">
                      {group.routes.map((route) => (
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
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTracking;
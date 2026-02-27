// VendorRouteManagement.jsx
import React, { useState, useCallback, useEffect, useMemo } from "react";
import SavedRouteCard from "./SavedRouteCard";
import MapToolbar from "./MapToolbar";
import AssignDriverModal from "./AssignDriverModal";
import { API_CLIENT } from "../../Api/API_Client";
import { useRouteDirections, useSelection } from "@hooks/useRouteDirections";
import { CompanyMarker, RouteDirections, RouteMarkers } from "./MapComponents";
import { APIProvider, Map } from "@vis.gl/react-google-maps";

const logDebug = (message, data = null) => {
  if (import.meta.env.DEV) {
    console.log(`[VendorRouteManagement] ${message}`, data || "");
  }
};

const API_KEY = import.meta.env.VITE_GOOGLE_API || "";

// ✅ CHANGE: Added shift style map — gives each shift type a distinct color identity
// instead of every shift header being the same plain gray box
const SHIFT_STYLE = {
  IN:  { label: "IN  (Login)",  bg: "bg-blue-50",   border: "border-blue-200",  text: "text-blue-700",  dot: "bg-blue-500"  },
  OUT: { label: "OUT (Logout)", bg: "bg-orange-50",  border: "border-orange-200", text: "text-orange-700", dot: "bg-orange-500" },
};

const VendorRouteManagement = () => {
  // ✅ CHANGE: Removed selectedLocation state entirely — the lat/lng block it powered
  // was showing raw coordinates to vendors which is dev-facing info, not useful in prod
  const [isAssignDriverModalOpen, setIsAssignDriverModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingDate, setBookingDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [routesByShift, setRoutesByShift] = useState([]);

  const { getRouteColor } = useRouteDirections();
  const {
    selectedRoutes,
    selectedBookings,
    handleRouteSelect,
    handleBookingSelect,
    clearAllSelections,
  } = useSelection();

  const firstTenantLoc = useMemo(() => {
    if (routesByShift.length > 0 && routesByShift[0].routes.length > 0) {
      return {
        lat: routesByShift[0].routes[0].tenant.latitude,
        lng: routesByShift[0].routes[0].tenant.longitude,
      };
    }
    return { lat: 12.933463, lng: 77.540186 };
  }, [routesByShift]);

  const fetchRoutes = useCallback(async () => {
    if (!bookingDate) {
      setError("Missing booking date");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await API_CLIENT.get(`/routes/?booking_date=${bookingDate}`);
      if (response.data.success) {
        const shifts = response.data.data.shifts || [];
        const grouped = shifts.map((shift) => ({
          shift_id: shift.shift_id,
          log_type: shift.log_type,
          shift_time: shift.shift_time,
          routes: shift.routes || [],
        }));
        setRoutesByShift(grouped);
        logDebug("Route data fetched successfully", { shiftCount: grouped.length });
      } else {
        const errorMsg = response.data.message || "Failed to fetch route data";
        setError(errorMsg);
        logDebug("API returned error", errorMsg);
      }
    } catch (err) {
      console.error("Error fetching route data:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to fetch route data";
      setError(errorMessage);
      logDebug("Fetch route data error", errorMessage);
    } finally {
      setLoading(false);
    }
  }, [bookingDate]);

  useEffect(() => {
    fetchRoutes();
  }, [bookingDate, fetchRoutes]);

  const handleAssignVehicle = () => {
    if (selectedRoutes.size === 0) return;
    setIsAssignDriverModalOpen(true);
  };

  const handleVehicleAssignment = async (vehicleId) => {
    try {
      if (selectedRoutes.size > 1) {
        alert("Assigning more than one route is not implemented yet. Please select only one route.");
        return;
      }
      if (selectedRoutes.size === 0) {
        alert("Please select at least one route to assign a vehicle.");
        return;
      }
      const routeId = Array.from(selectedRoutes)[0];
      await API_CLIENT.put(`/routes/assign-vehicle?route_id=${routeId}&vehicle_id=${vehicleId}`);
      await fetchRoutes();
      setIsAssignDriverModalOpen(false);
      alert("Successfully assigned driver and vehicle to route");
      clearAllSelections();
    } catch (err) {
      console.error("Error assigning driver:", err);
      alert("Failed to assign driver. Please try again.");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Map Container — 60% width */}
      <div className="w-[60%] relative">
        <APIProvider apiKey={API_KEY}>
          {/* ✅ CHANGE: Added key={bookingDate} to Map so it fully re-mounts when the date
               changes, forcing defaultCenter to apply to the new location.
               Before this, switching dates never re-centered the map. */}
          <Map
            key={bookingDate}
            defaultCenter={firstTenantLoc}
            defaultZoom={11}
            mapId="company-route-map"
            gestureHandling="greedy"
            style={{ width: "100%", height: "100%" }}
            fullscreenControl={false}
            streetViewControl={false}
            mapTypeControl={false}
          >
            <CompanyMarker position={firstTenantLoc} />
            {Array.from(selectedRoutes).map((routeId, routeIndex) => {
              let foundRoute = null;
              let logType = "OUT";
              for (const shift of routesByShift) {
                const r = shift.routes.find((r) => r.route_id === routeId);
                if (r) {
                  foundRoute = r;
                  logType = shift.log_type;
                  break;
                }
              }
              if (!foundRoute) return null;
              const color = getRouteColor(routeIndex);
              return (
                <div key={`route-${routeId}`}>
                  <RouteDirections logType={logType} route={foundRoute} color={color} routeIndex={routeIndex} />
                  <RouteMarkers logType={logType} route={foundRoute} color={color} routeIndex={routeIndex} />
                </div>
              );
            })}
          </Map>
        </APIProvider>
      </div>

      {/* Sidebar — 40% width */}
      <div className="w-[40%] shrink-0 bg-white shadow-lg flex flex-col overflow-hidden border-l border-gray-200">

        {/* Sticky header — stays in place while route list scrolls */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-200 shrink-0">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Vendor Route Management</h2>

          {/* ✅ CHANGE: Booking date + Assign Vendor + Sync all in one toolbar row.
               Date input is flex-1 so it takes remaining space,
               buttons stay compact on the right. Cleaner than stacking them vertically. */}
          <div className="flex items-center justify-between gap-2">
            {/* Left: date + selected count */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                id="bookingDate"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-36 px-2 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {/* Always visible count — shows 0 when nothing selected */}
              <span className="text-sm text-gray-500 whitespace-nowrap">
                <span className="text-lg font-bold text-gray-900">{selectedRoutes.size}</span> route{selectedRoutes.size !== 1 ? "s" : ""} selected
              </span>
            </div>

            {/* Right: action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleAssignVehicle}
                disabled={selectedRoutes.size === 0}
                className="px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
              >
                Assign Vehicle
              </button>
              <button
                onClick={fetchRoutes}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="text-base leading-none">↻</span>
                )}
                Sync
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable route list — only this area scrolls now */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {loading && (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" />
              <p className="mt-2 text-sm text-gray-500">Loading routes...</p>
            </div>
          )}

          {error && !loading && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 mb-3">{error}</p>
              <button
                onClick={fetchRoutes}
                className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* ✅ CHANGE: Empty state now has an icon and tells the vendor to try
                   a different date instead of just saying "No routes found" with nothing else */}
              {routesByShift.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="text-4xl mb-3">🗺️</div>
                  <p className="text-sm font-medium text-gray-700">No routes for this date</p>
                  <p className="text-xs text-gray-400 mt-1">Try selecting a different date above</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {routesByShift.map(({ shift_id, log_type, shift_time, routes }) => {
                    const style = SHIFT_STYLE[log_type] || {
                      label: log_type,
                      bg: "bg-gray-50",
                      border: "border-gray-200",
                      text: "text-gray-700",
                      dot: "bg-gray-400",
                    };

                    return (
                      // ✅ CHANGE: Shift container border color now matches the shift type color
                      <div key={shift_id} className={`border rounded-xl overflow-hidden ${style.border}`}>

                        {/* ✅ CHANGE: Shift header redesigned — colored background, colored dot,
                             route count shown as a small pill badge on the right.
                             Was: plain gray bg with small text and a separate <p> for count.
                             Now: scannable at a glance, visually distinct per shift type. */}
                        <div className={`px-3 py-2.5 flex items-center justify-between ${style.bg}`}>
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
                            <span className={`text-xs font-semibold ${style.text}`}>
                              {style.label}
                            </span>
                            <span className={`text-xs opacity-70 ${style.text}`}>
                              · {shift_time}
                            </span>
                          </div>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${style.bg} ${style.text} ${style.border}`}>
                            {routes.length} {routes.length !== 1 ? "routes" : "route"}
                          </span>
                        </div>

                        <div className="p-3 space-y-2">
                          {routes.length === 0 ? (
                            <p className="text-center py-4 text-sm text-gray-400">
                              No routes for this shift
                            </p>
                          ) : (
                            routes.map((route) => (
                              <SavedRouteCard
                                key={route.route_id}
                                route={route}
                                isSelected={selectedRoutes.has(route.route_id)}
                                onRouteSelect={handleRouteSelect}               
                                selectedBookings={selectedBookings}
                                onBookingSelect={handleBookingSelect}
                              />
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <AssignDriverModal
        isOpen={isAssignDriverModalOpen}
        onClose={() => setIsAssignDriverModalOpen(false)}
        onAssign={handleVehicleAssignment}
        selectedRoutesCount={selectedRoutes.size}
        routeIds={Array.from(selectedRoutes)}
      />
    </div>
  );
};

export default VendorRouteManagement;
// VendorRouteManagement.jsx
import React, { useState, useCallback, useEffect } from "react";
import SavedRouteCard from "./SavedRouteCard";
import MapToolbar from "./MapToolbar";
import AssignDriverModal from "./AssignDriverModal";
import { API_CLIENT } from "../../Api/API_Client";
import { useRouteDirections, useSelection } from "@hooks/useRouteDirections";
import { CompanyMarker, RouteDirections, RouteMarkers } from "./MapComponents";
import { APIProvider, Map } from "@vis.gl/react-google-maps";

// Debug utility function
const logDebug = (message, data = null) => {
  if (import.meta.env.DEV) {
    console.log(`[VendorRouteManagement] ${message}`, data || "");
  }
};
const API_KEY = import.meta.env.VITE_GOOGLE_API || "";

const VendorRouteManagement = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [savedRoutes, setSavedRoutes] = useState([]);
  const [isAssignDriverModalOpen, setIsAssignDriverModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingDate, setBookingDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [routesByShift, setRoutesByShift] = useState([]);
  // Hook state
  const [shiftId, setShiftId] = useState(null);
  const { getRouteColor } = useRouteDirections();
  const {
    selectedRoutes,
    selectedBookings,
    handleRouteSelect,
    handleBookingSelect,
    clearAllSelections,
  } = useSelection();
  const [selectedRouteId, setSelectedRouteId] = useState(null);

  // Determine company location from first route tenant, fallback default
  const firstTenantLoc =
    routesByShift.length > 0 && routesByShift[0].routes.length > 0
      ? {
          lat: routesByShift[0].routes[0].tenant.latitude,
          lng: routesByShift[0].routes[0].tenant.longitude,
        }
      : { lat: 12.933463, lng: 77.540186 };

  // Fetch and organize routes by shift/log type
  const fetchRouteData = useCallback(async () => {
    if (!bookingDate) {
      setError("Missing booking date");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const apiEndpoint = `/v1/routes/?&booking_date=${bookingDate}`;
      const response = await API_CLIENT.get(apiEndpoint);

      if (response.data.success) {
        const shifts = response.data.data.shifts || [];
        // Organize routes by shift with logType
        const grouped = shifts.map((shift) => ({
          shift_id: shift.shift_id,
          log_type: shift.log_type,
          shift_time: shift.shift_time,
          routes: shift.routes || [],
        }));
        setRoutesByShift(grouped);

        // Flatten all shift routes for backward compatibility or aggregate display
        setSavedRoutes(grouped.flatMap((s) => s.routes));

        logDebug("Route data fetched successfully", {
          shiftCount: grouped.length,
        });
      } else {
        const errorMsg = response.data.message || "Failed to fetch route data";
        setError(errorMsg);
        logDebug("API returned error", errorMsg);
      }
    } catch (err) {
      console.error("Error fetching route data:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch route data";
      setError(errorMessage);
      logDebug("Fetch route data error", errorMessage);
    } finally {
      setLoading(false);
    }
  }, [bookingDate]);

  // Fetch routes callback for refresh
  const fetchRoutes = useCallback(async () => {
    try {
      setLoading(true);
      await fetchRouteData();
    } catch (err) {
      console.error("Error fetching routes:", err);
      setError("Failed to fetch routes");
    }
  }, [fetchRouteData]);

  // Fetch routes on load
  useEffect(() => {
    fetchRouteData();
  }, [bookingDate, fetchRouteData]);

  const resetSelection = () => {
    setSelectedLocation(null);
    clearAllSelections();
  };

  const handleAssignVehicle = () => {
    if (selectedRoutes.size === 0) return;
    setIsAssignDriverModalOpen(true);
  };

  const handleVehicleAssignment = async (vehicleId) => {
    try {
      if (selectedRoutes.size > 1) {
        alert(
          "Assigning more than one route is not implemented yet. Please select only one route."
        );
        return;
      }
      if (selectedRoutes.size === 0) {
        alert("Please select at least one route to assign a vehicle.");
        return;
      }
      const routeId = Array.from(selectedRoutes)[0];

      await API_CLIENT.put(
        `/v1/routes/assign-vehicle?route_id=${routeId}&vehicle_id=${vehicleId}`
      );
      await fetchRoutes();
      setIsAssignDriverModalOpen(false);
      alert("Successfully assigned driver and vehicle to route");
      clearAllSelections();
      setSelectedRouteId(null);
    } catch (err) {
      console.error("Error assigning driver:", err);
      alert("Failed to assign driver. Please try again.");
    }
  };

  const handleDateChange = (newDate) => {
    setBookingDate(newDate);
  };

  const handleRetry = () => {
    fetchRoutes();
  };

  // Render
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Map Container */}
      <div className="flex-1 relative">
        <APIProvider apiKey={API_KEY}>
          <Map
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
            {/* Selected Routes: find the route object and its parent shift & logType */}
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
                  <RouteDirections
                    logType={logType}
                    route={foundRoute}
                    color={color}
                    routeIndex={routeIndex}
                  />
                  <RouteMarkers
                    logType={logType}
                    route={foundRoute}
                    color={color}
                    routeIndex={routeIndex}
                  />
                </div>
              );
            })}
          </Map>
        </APIProvider>
      </div>

      {/* Sidebar */}
      <div className="w-1/2 bg-white shadow-lg p-4 overflow-y-auto border-l border-gray-200">
        <h2 className="text-xl font-bold mb-4">Vendor Route Management</h2>
        <div className="mb-4">
          <label
            htmlFor="bookingDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Booking Date:
          </label>
          <input
            type="date"
            id="bookingDate"
            value={bookingDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {/* Loading and Error States */}
        {loading && (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading routes...</p>
          </div>
        )}
        {error && !loading && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 mb-2">{error}</p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}
        {/* Management Toolbar */}
        {!loading && !error && (
          <>
            <MapToolbar
              selectedRoutes={selectedRoutes}
              onAssignVehicle={handleAssignVehicle}
              panelType="vendor"
            />
            <div className="space-y-4 mt-4">
              {selectedLocation && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <h3 className="font-semibold">Selected Location</h3>
                  <p className="text-sm">
                    Lat: {selectedLocation.lat.toFixed(6)}
                    <br />
                    Lng: {selectedLocation.lng.toFixed(6)}
                  </p>
                  <button
                    onClick={resetSelection}
                    className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                  >
                    Clear Selection
                  </button>
                </div>
              )}
              {/* Routes grouped by shift/log_type */}
              <div className="space-y-6">
                {routesByShift.map(
                  ({ shift_id, log_type, shift_time, routes }) => (
                    <div key={shift_id} className="border rounded-lg">
                      <div className="bg-gray-50 px-3 py-2 border-b">
                        <h3 className="font-semibold text-sm">
                          {log_type} Shift - {shift_time}
                        </h3>
                        <p className="text-xs text-gray-600">
                          {routes.length} route{routes.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="p-3 space-y-3 max-h-96 overflow-y-auto">
                        {routes.length === 0 ? (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            No routes for this shift
                          </div>
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
                  )
                )}
              </div>
              {routesByShift.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  No routes found for the selected date.
                </div>
              )}
            </div>
          </>
        )}
      </div>
      {/* Assign Driver Modal */}
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

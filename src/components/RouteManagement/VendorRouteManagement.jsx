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
  const [routeData, setRouteData] = useState([]);
  const [shifts, setShifts] = useState([]);

  // Fixed: Removed duplicate state variables - use the ones from hook
  const [shiftId, setShiftId] = useState(null);

  // Fixed: Use the custom hook for selection management
  const { getRouteColor, getBookingColor } = useRouteDirections();
  const {
    selectedRoutes,
    selectedBookings,
    handleRouteSelect,
    handleBookingSelect,
    clearAllSelections,
  } = useSelection();

  // Fixed: Removed duplicate state variables that conflict with hook
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const logType = "IN";

  const companyLocation =
    routeData.length > 0
      ? {
          lat: routeData[0].tenant.latitude,
          lng: routeData[0].tenant.longitude,
        }
      : { lat: 12.933463, lng: 77.540186 };

  const fetchRouteData = useCallback(async () => {
    if (!shiftId || !bookingDate) {
      setError("Missing shift ID or date");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const apiEndpoint = `/v1/routes/?&booking_date=${bookingDate}`;
      const response = await API_CLIENT.get(apiEndpoint);

      if (response.data.success) {
        // Extract routes from the first shift (assuming single shift for now)
        const routes = response.data.data.shifts[0]?.routes || [];
        setRouteData(routes);

        // Fixed: Also update savedRoutes to be used in the component
        setSavedRoutes(routes);

        logDebug("Route data fetched successfully", {
          routeCount: routes.length,
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
  }, [shiftId, bookingDate]); // Fixed: Use bookingDate instead of separate date state

  // Fixed: Separate function to fetch routes (was referenced but not defined)
  const fetchRoutes = useCallback(async () => {
    try {
      setLoading(true);
      await fetchRouteData();
    } catch (err) {
      console.error("Error fetching routes:", err);
      setError("Failed to fetch routes");
    }
  }, [fetchRouteData]);

  // Fetch routes on component mount and when bookingDate changes
  useEffect(() => {
    // Fixed: Initialize shiftId if needed
    if (!shiftId) {
      setShiftId("default_shift_id");
    }
  }, [bookingDate, shiftId]);

  // Fixed: Added useEffect to actually fetch data when shiftId or bookingDate changes
  useEffect(() => {
    if (shiftId && bookingDate) {
      fetchRouteData();
    }
  }, [shiftId, bookingDate, fetchRouteData]);

  const resetSelection = () => {
    setSelectedLocation(null);
    clearAllSelections(); // Fixed: Use the hook's clear function
  };

  // Fixed: Removed duplicate handlers - using the ones from useSelection hook

  // Handler for assigning vehicle/driver (vendor panel)
  const handleAssignVehicle = () => {
    if (selectedRoutes.size === 0) return;
    setIsAssignDriverModalOpen(true);
  };

  const handleVehicleAssignment = async (vehicleId) => {
    try {
      console.log(vehicleId, "to routes:", Array.from(selectedRoutes));

      // Validation: Check if more than one route is selected
      if (selectedRoutes.size > 1) {
        alert(
          "Assigning more than one route is not implemented yet. Please select only one route."
        );
        return;
      }

      // Validation: Check if no routes are selected
      if (selectedRoutes.size === 0) {
        alert("Please select at least one route to assign a vehicle.");
        return;
      }

      // Get the single route ID (since we've validated there's only one)
      const routeId = Array.from(selectedRoutes)[0];

      // Make single API call to assign vehicle to the route
      await API_CLIENT.put(
        `/v1/routes/assign-vehicle?route_id=${routeId}&vehicle_id=${vehicleId}`
      );

      // Refresh routes data from server
      await fetchRoutes();

      // Close modal and show success message
      setIsAssignDriverModalOpen(false);
      alert("Successfully assigned driver and vehicle to route");

      // Clear selection using hook function
      clearAllSelections();
      setSelectedRouteId(null);
    } catch (err) {
      console.error("Error assigning driver:", err);
      alert("Failed to assign driver. Please try again.");
    }
  };

  // Handler for date change
  const handleDateChange = (newDate) => {
    setBookingDate(newDate);
  };

  // Retry loading routes
  const handleRetry = () => {
    fetchRoutes();
  };

  // Helper function to find booking by ID
  const findBookingById = (bookingId, unroutedBookings, routeData) => {
    // First check unrouted bookings
    const unroutedBooking = unroutedBookings?.find(
      (booking) => booking.booking_id === bookingId
    );
    if (unroutedBooking) return unroutedBooking;

    // Then check all routes' bookings
    for (const route of routeData) {
      const routeBooking = route.bookings?.find(
        (booking) => booking.booking_id === bookingId
      );
      if (routeBooking) return routeBooking;
    }

    return null;
  };

  // Fixed: Group routes by shift for better organization
  const routesByShift = shifts.map((shift) => ({
    shift,
    routes: routeData.filter((route) => route.shift_id === shift.shift_id),
  }));

  // Fixed: Alternative grouping if shifts is empty - group by shift_id from routeData
  const effectiveRoutesByShift =
    shifts.length > 0
      ? routesByShift
      : routeData.length > 0
      ? [
          {
            shift: {
              shift_id: "default",
              log_type: "OUT",
              shift_time: "All Day",
            },
            routes: routeData,
          },
        ]
      : [];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Map Container */}
      <div className="flex-1 relative">
        <APIProvider apiKey={API_KEY}>
          <Map
            defaultCenter={companyLocation}
            defaultZoom={11}
            mapId="company-route-map"
            gestureHandling="greedy"
            style={{ width: "100%", height: "100%" }}
            fullscreenControl={false}
            streetViewControl={false}
            mapTypeControl={false}
          >
            <CompanyMarker position={companyLocation} />

            {/* Selected Routes */}
            {Array.from(selectedRoutes).map((routeId, routeIndex) => {
              const route = routeData.find((r) => r.route_id === routeId);
              if (!route) return null;

              const color = getRouteColor(routeIndex);

              return (
                <div key={`route-${routeId}`}>
                  <RouteDirections
                    logType={logType}
                    route={route}
                    color={color}
                    routeIndex={routeIndex}
                  />
                  <RouteMarkers
                    logType={logType}
                    route={route}
                    color={color}
                    routeIndex={routeIndex}
                  />
                </div>
              );
            })}
          </Map>
        </APIProvider>
      </div>

      {/* Sidebar for route management controls */}
      <div className="w-1/2 bg-white shadow-lg p-4 overflow-y-auto border-l border-gray-200">
        <h2 className="text-xl font-bold mb-4">Vendor Route Management</h2>

        {/* Date Selector */}
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

        {/* Map Toolbar for vendor panel */}
        {!loading && !error && (
          <>
            <MapToolbar
              selectedRoutes={selectedRoutes}
              onAssignVehicle={handleAssignVehicle}
              panelType="vendor"
            />

            <div className="space-y-4 mt-4">
              {/* Selected Location Section */}
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

              {/* Routes organized by shift */}
              <div className="space-y-6">
                {effectiveRoutesByShift.map(({ shift, routes }) => (
                  <div key={shift.shift_id} className="border rounded-lg">
                    <div className="bg-gray-50 px-3 py-2 border-b">
                      <h3 className="font-semibold text-sm">
                        {shift.log_type} Shift - {shift.shift_time}
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
                ))}
              </div>

              {/* Empty state when no shifts */}
              {effectiveRoutesByShift.length === 0 && !loading && (
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

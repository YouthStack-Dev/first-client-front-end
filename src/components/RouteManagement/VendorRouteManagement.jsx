// VendorRouteManagement.jsx
import React, { useState, useCallback, useEffect } from "react";
import SavedRouteCard from "./SavedRouteCard";
import MapToolbar from "./MapToolbar";
import AssignDriverModal from "./AssignDriverModal";
import { API_CLIENT } from "../../Api/API_Client";

const VendorRouteManagement = () => {
  const [mapCenter, setMapCenter] = useState({ lat: 12.9716, lng: 77.5946 });
  const [mapZoom, setMapZoom] = useState(12);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [savedRoutes, setSavedRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [selectedBookings, setSelectedBookings] = useState(new Set());
  const [selectedRoutes, setSelectedRoutes] = useState(new Set());
  const [isAssignDriverModalOpen, setIsAssignDriverModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingDate, setBookingDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const [shifts, setShifts] = useState([]);

  // Transform API response to match component structure
  const transformApiResponse = (apiData) => {
    const transformedRoutes = [];

    apiData.data.shifts.forEach((shift) => {
      shift.routes.forEach((route) => {
        // Transform stops to bookings format
        const bookings = route.stops.map((stop) => ({
          booking_id: stop.booking_id,
          employee_id: stop.employee_id,
          employee_code: stop.employee_code,
          pickup_location: stop.pickup_location,
          drop_location: stop.drop_location,
          pickup_latitude: stop.pickup_latitude,
          pickup_longitude: stop.pickup_longitude,
          drop_latitude: stop.drop_latitude,
          drop_longitude: stop.drop_longitude,
          status: stop.status,
          estimated_pick_up_time: stop.estimated_pick_up_time,
          estimated_distance: stop.estimated_distance,
          booking_date: stop.booking_date,
        }));

        transformedRoutes.push({
          route_id: route.route_id,
          route_code: route.route_code || `Route-${route.route_id}`,
          status: route.status,
          driver: route.driver,
          vehicle: route.vehicle,
          vendor: route.vendor,
          bookings: bookings,
          summary: route.summary,
          shift_id: shift.shift_id,
          shift_time: shift.shift_time,
          log_type: shift.log_type,
        });
      });
    });

    return transformedRoutes;
  };

  // Fetch routes from backend
  const fetchRoutes = useCallback(
    async (date = bookingDate) => {
      try {
        setLoading(true);
        setError(null);

        const response = await API_CLIENT.get(`/v1/routes/`, {
          params: {
            booking_date: date,
          },
        });

        if (response.data.success) {
          const transformedRoutes = transformApiResponse(response.data);
          setSavedRoutes(transformedRoutes);
          setShifts(response.data.data.shifts);
        } else {
          throw new Error(response.data.message || "Failed to fetch routes");
        }
      } catch (err) {
        console.error("Error fetching routes:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load routes. Please try again."
        );
        // Fallback to dummy data if needed
      } finally {
        setLoading(false);
      }
    },
    [bookingDate]
  );

  // Fetch routes on component mount and when bookingDate changes
  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const handleMapClick = useCallback((event) => {
    const { latLng } = event.detail;
    const lat = latLng.lat();
    const lng = latLng.lng();

    const newLocation = { lat, lng };
    setSelectedLocation(newLocation);
    console.log("Selected location:", newLocation);
  }, []);

  const handleMapLoad = useCallback((map) => {
    console.log("Map loaded, ready for vendor route management");
  }, []);

  const resetSelection = () => {
    setSelectedLocation(null);
  };

  // Handler for route selection
  const handleRouteSelect = (routeId) => {
    const newSelectedRoutes = new Set(selectedRoutes);

    if (newSelectedRoutes.has(routeId)) {
      newSelectedRoutes.delete(routeId);
    } else {
      newSelectedRoutes.add(routeId);
    }

    setSelectedRoutes(newSelectedRoutes);
    setSelectedRouteId(routeId === selectedRouteId ? null : routeId);
    setSelectedBookings(new Set());
  };

  // Handler for booking selection
  const handleBookingSelect = (bookingId) => {
    const newSelectedBookings = new Set(selectedBookings);
    if (newSelectedBookings.has(bookingId)) {
      newSelectedBookings.delete(bookingId);
    } else {
      newSelectedBookings.add(bookingId);
    }
    setSelectedBookings(newSelectedBookings);
  };

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

      // Clear selection
      setSelectedRoutes(new Set());
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

  // Group routes by shift for better organization
  const routesByShift = shifts.map((shift) => ({
    shift,
    routes: savedRoutes.filter((route) => route.shift_id === shift.shift_id),
  }));

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Map Container */}
      <div className="flex-1 relative"></div>

      {/* Sidebar for route management controls */}
      <div className="w-2/1 bg-white shadow-lg p-4 overflow-y-auto border-l border-gray-200">
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
                {routesByShift.map(({ shift, routes }) => (
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

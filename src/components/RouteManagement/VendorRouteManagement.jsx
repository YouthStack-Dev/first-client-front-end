// VendorRouteManagement.jsx
import React, { useState, useCallback } from "react";
import GoogleMapView from "../ui/GoogleMapView";
import { dummyRoutes } from "../../staticData/routedata";
import SavedRouteCard from "./SavedRouteCard";
import MapToolbar from "./MapToolbar";
import AssignDriverModal from "./AssignDriverModal"; // We'll create this component

const VendorRouteManagement = () => {
  const [mapCenter, setMapCenter] = useState({ lat: 12.9716, lng: 77.5946 });
  const [mapZoom, setMapZoom] = useState(12);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [savedRoutes, setSavedRoutes] = useState(dummyRoutes);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [selectedBookings, setSelectedBookings] = useState(new Set());
  const [selectedRoutes, setSelectedRoutes] = useState(new Set());
  const [isAssignDriverModalOpen, setIsAssignDriverModalOpen] = useState(false);

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
    setSelectedBookings(new Set()); // Clear booking selection when route changes
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

  // Handler for deleting a booking from route
  const handleDeleteBooking = (routeId, bookingId) => {
    setSavedRoutes((prevRoutes) =>
      prevRoutes.map((route) => {
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
    );
    // Also remove from selected bookings if it was selected
    if (selectedBookings.has(bookingId)) {
      const newSelectedBookings = new Set(selectedBookings);
      newSelectedBookings.delete(bookingId);
      setSelectedBookings(newSelectedBookings);
    }
  };

  // Handler for deleting entire route
  const handleDeleteRoute = (routeId) => {
    setSavedRoutes((prevRoutes) =>
      prevRoutes.filter((route) => route.route_id !== routeId)
    );

    // Remove from selected routes
    const newSelectedRoutes = new Set(selectedRoutes);
    newSelectedRoutes.delete(routeId);
    setSelectedRoutes(newSelectedRoutes);

    if (selectedRouteId === routeId) {
      setSelectedRouteId(null);
      setSelectedBookings(new Set());
    }
  };

  // Handler for assigning vehicle/driver (vendor panel)
  const handleAssignVehicle = () => {
    if (selectedRoutes.size === 0) return;
    setIsAssignDriverModalOpen(true);
  };

  // Handler for assigning driver from modal
  const handleDriverAssignment = (driverId, vehicleId) => {
    console.log(
      "Assigning driver:",
      driverId,
      "and vehicle:",
      vehicleId,
      "to routes:",
      Array.from(selectedRoutes)
    );

    // Update the routes with assigned driver and vehicle
    setSavedRoutes((prevRoutes) =>
      prevRoutes.map((route) => {
        if (selectedRoutes.has(route.route_id)) {
          return {
            ...route,
            driver: { id: driverId, name: `Driver ${driverId}` }, // You would get actual driver data
            vehicle: { id: vehicleId, rc_number: `Vehicle ${vehicleId}` }, // You would get actual vehicle data
          };
        }
        return route;
      })
    );

    // Close modal and show success message
    setIsAssignDriverModalOpen(false);
    alert(
      `Successfully assigned driver and vehicle to ${selectedRoutes.size} route(s)`
    );
  };

  // Handler for merging routes (company panel - kept for future use)
  const handleMergeRoutes = () => {
    if (selectedRoutes.size < 2) return;
    console.log("Merging routes:", Array.from(selectedRoutes));
    // Add your merge logic here
  };

  // Handler for assigning vendor (company panel - kept for future use)
  const handleAssignVendor = () => {
    if (selectedRoutes.size === 0) return;
    console.log("Assigning vendor to routes:", Array.from(selectedRoutes));
    // Add your vendor assignment logic here
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Map Container */}
      <div className="flex-1 relative">
        <GoogleMapView
          center={mapCenter}
          zoom={mapZoom}
          onMapClick={handleMapClick}
          onMapLoad={handleMapLoad}
          className="w-full h-full"
          gestureHandling="greedy"
          disableDefaultUI={false}
        >
          {/* Map content goes here */}
        </GoogleMapView>
      </div>

      {/* Sidebar for route management controls */}
      <div className="w-96 bg-white shadow-lg p-4 overflow-y-auto border-l border-gray-200">
        <h2 className="text-xl font-bold mb-4">Vendor Route Management</h2>

        {/* Map Toolbar for vendor panel */}
        <MapToolbar
          selectedRoutes={selectedRoutes}
          onAssignVehicle={handleAssignVehicle}
          onMerge={handleMergeRoutes}
          onAssignVendor={handleAssignVendor}
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

          {/* Selection Info */}
          {selectedRoutes.size > 0 && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-sm">Selection Info</h3>
              <p className="text-xs text-gray-600 mt-1">
                {selectedRoutes.size} route
                {selectedRoutes.size !== 1 ? "s" : ""} selected
                {selectedBookings.size > 0 &&
                  ` • ${selectedBookings.size} booking${
                    selectedBookings.size !== 1 ? "s" : ""
                  } selected`}
              </p>
            </div>
          )}

          {/* Saved Routes Section */}
          <div className="border rounded-lg">
            <div className="p-3 bg-gray-50 border-b">
              <h3 className="font-semibold">
                Saved Routes ({savedRoutes.length})
              </h3>
            </div>
            <div className="p-3 space-y-3 max-h-96 overflow-y-auto">
              {savedRoutes.map((route) => (
                <SavedRouteCard
                  key={route.route_id}
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
          </div>

          {/* Statistics Section */}
          <div className="p-3 border rounded-lg">
            <h3 className="font-semibold mb-2">Route Statistics</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="font-semibold text-lg">
                  {savedRoutes.reduce(
                    (total, route) => total + (route.bookings?.length || 0),
                    0
                  )}
                </div>
                <div className="text-xs text-gray-600">Total Bookings</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="font-semibold text-lg">
                  {savedRoutes.length}
                </div>
                <div className="text-xs text-gray-600">Active Routes</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Driver Modal */}
      <AssignDriverModal
        isOpen={isAssignDriverModalOpen}
        onClose={() => setIsAssignDriverModalOpen(false)}
        onAssign={handleDriverAssignment}
        selectedRoutesCount={selectedRoutes.size}
        routeIds={Array.from(selectedRoutes)}
      />
    </div>
  );
};

export default VendorRouteManagement;

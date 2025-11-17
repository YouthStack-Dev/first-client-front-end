import { useState, useEffect, useCallback } from "react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { API_CLIENT } from "@Api/API_Client";
import { useParams } from "react-router-dom";
import {
  CompanyMarker,
  RouteDirections,
  BookingDirections,
  RouteMarkers,
  BookingMarkers,
  SelectionSummary,
} from "./MapComponents";
import SavedRouteCard from "@components/RouteManagement/SavedRouteCard";
import UnroutedBookingsSection from "@components/RouteManagement/UnroutedBookingsSection";
import { findBookingById } from "@utils/routeUtils";
import { useRouteDirections, useSelection } from "@hooks/useRouteDirections";
import MapToolbar from "./MapToolbar";
import VendorAssignModal from "./VendorAssignModal";

const API_KEY = import.meta.env.VITE_GOOGLE_API || "";

// Debug utility function
const logDebug = (message, data = null) => {
  if (import.meta.env.DEV) {
    console.log(`[ShiftRoutingManagement] ${message}`, data || "");
  }
};

const ShiftRoutingManagement = () => {
  const [routeData, setRouteData] = useState([]);
  const [unroutedBookings, setUnroutedBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unroutedLoading, setUnroutedLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMerging, setIsMerging] = useState(false);
  const { shiftId, shiftType, date } = useParams();
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [isAssigningVendor, setIsAssigningVendor] = useState(false);

  // Use shiftType from URL as logType
  const logType = shiftType || "OUT";

  // Fetch route data
  const fetchRouteData = useCallback(async () => {
    if (!shiftId || !date) {
      setError("Missing shift ID or date");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const apiEndpoint = `/v1/routes/?&shift_id=${shiftId}&booking_date=${date}`;
      const response = await API_CLIENT.get(apiEndpoint);

      if (response.data.success) {
        // Extract routes from the first shift (assuming single shift for now)
        const routes = response.data.data.shifts[0]?.routes || [];
        setRouteData(routes);
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
  }, [shiftId, date]);

  // Fetch unrouted bookings
  const fetchUnroutedBookings = useCallback(async () => {
    if (!shiftId || !date) return;

    try {
      setUnroutedLoading(true);
      const apiEndpoint = `/v1/routes/unrouted?shift_id=${shiftId}&booking_date=${date}`;
      const response = await API_CLIENT.get(apiEndpoint);

      if (response.data.success) {
        const bookings = response.data.data.bookings || [];
        setUnroutedBookings(bookings);
        logDebug("Unrouted bookings fetched", {
          bookingCount: bookings.length,
        });
      }
    } catch (err) {
      console.error("Error fetching unrouted bookings:", err);
      logDebug("Fetch unrouted bookings error", err.message);
    } finally {
      setUnroutedLoading(false);
    }
  }, [shiftId, date]);

  // Fetch data on component mount and when dependencies change
  useEffect(() => {
    if (shiftId && date) {
      fetchRouteData();
      fetchUnroutedBookings();
    }
  }, [shiftId, date, fetchRouteData, fetchUnroutedBookings]);

  const { getRouteColor, getBookingColor } = useRouteDirections();
  const {
    selectedRoutes,
    selectedBookings,
    handleRouteSelect,
    handleBookingSelect,
    clearAllSelections,
  } = useSelection();

  // Toolbar action handlers
  const handleMerge = useCallback(async () => {
    if (selectedRoutes.size < 2) {
      alert("Please select at least two routes to merge.");
      return;
    }

    const routeIds = Array.from(selectedRoutes);
    const requestData = { route_ids: routeIds };

    logDebug("Merging routes", requestData);

    try {
      setIsMerging(true);
      const response = await API_CLIENT.post(
        "/v1/routes/merge?tenant_id=SAM001",
        requestData
      );

      if (response.data?.success && response.data?.data) {
        const mergedRoute = response.data.data;

        alert(
          `Successfully merged ${routeIds.length} routes into route #${mergedRoute.route_id}!`
        );

        // Refresh data to show the merged route
        await fetchRouteData();
        await fetchUnroutedBookings();
        clearAllSelections();

        logDebug("Routes merged successfully", mergedRoute);
      } else {
        throw new Error(response.data?.message || "Merge failed");
      }
    } catch (error) {
      console.error("Merge failed:", error);
      const message =
        error.response?.data?.message ||
        "Failed to merge routes. Please try again.";
      alert(message);
      logDebug("Merge error", error);
    } finally {
      setIsMerging(false);
    }
  }, [
    selectedRoutes,
    fetchRouteData,
    fetchUnroutedBookings,
    clearAllSelections,
  ]);

  const handleAssignVendorClick = useCallback(() => {
    if (selectedRoutes.size === 0) {
      alert("Please select at least one route to assign to a vendor.");
      return;
    }
    setIsVendorModalOpen(true);
  }, [selectedRoutes]);

  const handleAssignVendor = useCallback(
    async (assignmentData) => {
      if (assignmentData.routeIds.length === 0) {
        alert("Please select at least one route to assign to a vendor.");
        return;
      }

      try {
        setIsAssigningVendor(true);
        const routeId = assignmentData.routeIds[0];
        const vendorId = assignmentData.vendor.vendor_id;

        logDebug("Assigning vendor to route", { routeId, vendorId });

        const response = await API_CLIENT.put(
          `/v1/routes/assign-vendor?vendor_id=${vendorId}&route_id=${routeId}`,
          {
            notes: assignmentData.notes,
            tenant_id: "SAM001",
          }
        );

        if (response.data?.success) {
          alert(
            `Successfully assigned ${assignmentData.vendor.name} to route #${routeId}!`
          );
          setIsVendorModalOpen(false);
          await fetchRouteData();
          clearAllSelections();
          logDebug("Vendor assigned successfully");
        } else {
          throw new Error(response.data?.message || "Vendor assignment failed");
        }
      } catch (error) {
        console.error("Failed to assign vendor:", error);
        const message =
          error.response?.data?.message ||
          "Failed to assign vendor. Please try again.";
        alert(message);
        logDebug("Vendor assignment error", error);
      } finally {
        setIsAssigningVendor(false);
      }
    },
    [fetchRouteData, clearAllSelections]
  );

  const handleAssignVehicle = useCallback(() => {
    if (selectedRoutes.size === 0) {
      alert("Please select at least one route to assign a vehicle.");
      return;
    }

    logDebug("Assigning vehicle to routes", Array.from(selectedRoutes));
    // TODO: Implement vehicle assignment logic
    // This could open a modal or make an API call
    alert("Vehicle assignment feature coming soon!");
  }, [selectedRoutes]);

  const handleSync = useCallback(async () => {
    logDebug("Syncing data...");
    try {
      setLoading(true);
      setUnroutedLoading(true);
      await Promise.all([fetchRouteData(), fetchUnroutedBookings()]);
      alert("Data synced successfully!");
    } catch (error) {
      console.error("Sync failed:", error);
      alert("Failed to sync data. Please try again.");
    }
  }, [fetchRouteData, fetchUnroutedBookings]);

  // Get company location from the first route's tenant data, or use default
  const companyLocation =
    routeData.length > 0
      ? {
          lat: routeData[0].tenant.latitude,
          lng: routeData[0].tenant.longitude,
        }
      : { lat: 12.933463, lng: 77.540186 }; // Default fallback

  // Handle refresh data
  const handleRefreshData = useCallback(() => {
    fetchRouteData();
    fetchUnroutedBookings();
    clearAllSelections();
  }, [fetchRouteData, fetchUnroutedBookings, clearAllSelections]);

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading routes...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center text-red-600">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-lg font-semibold">Error loading data</p>
          <p className="mt-2">{error}</p>
          <button
            onClick={handleRefreshData}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* LEFT MAP SECTION */}
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
                    route={route}
                    logType={logType}
                    color={color}
                    routeIndex={routeIndex}
                  />
                  <RouteMarkers
                    route={route}
                    logType={logType}
                    color={color}
                    routeIndex={routeIndex}
                  />
                </div>
              );
            })}

            {/* Selected Bookings */}
            {Array.from(selectedBookings).map((bookingId, bookingIndex) => {
              const booking = findBookingById(
                bookingId,
                unroutedBookings,
                routeData
              );
              if (!booking) return null;

              const color = getBookingColor(bookingIndex);

              return (
                <div key={`booking-${bookingId}`}>
                  <BookingDirections
                    booking={booking}
                    color={color}
                    bookingIndex={bookingIndex}
                  />
                  <BookingMarkers
                    booking={booking}
                    color={color}
                    bookingIndex={bookingIndex}
                  />
                </div>
              );
            })}
          </Map>
        </APIProvider>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-2/5 bg-gradient-to-b from-gray-50 to-white border-l border-gray-200 shadow-2xl flex flex-col h-full min-w-96">
        {/* RIGHT PANEL HEADER with MapToolbar */}
        <div className="border-b border-gray-200 py-4 bg-white">
          <MapToolbar
            selectedRoutes={selectedRoutes}
            selectedBookings={selectedBookings}
            onMerge={handleMerge}
            onAssignVendor={handleAssignVendorClick}
            onAssignVehicle={handleAssignVehicle}
            onSync={handleSync}
            panelType="company"
            isMerging={isMerging}
          />
        </div>

        {/* Vendor Assignment Modal */}
        <VendorAssignModal
          isOpen={isVendorModalOpen}
          onClose={() => setIsVendorModalOpen(false)}
          selectedRoutes={selectedRoutes}
          onAssignVendor={handleAssignVendor}
          isAssigning={isAssigningVendor}
        />

        {/* SCROLLABLE CONTENT SECTION */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Unrouted Bookings Section */}
          <UnroutedBookingsSection
            unroutedBookings={unroutedBookings}
            selectedBookings={selectedBookings}
            onBookingSelect={handleBookingSelect}
            loading={unroutedLoading}
          />

          {/* Selection Summary and Routes */}
          <div className="p-4 space-y-4">
            <SelectionSummary
              selectedRoutes={selectedRoutes}
              selectedBookings={selectedBookings}
              onClearAll={clearAllSelections}
            />

            {routeData.length > 0 ? (
              <div className="space-y-4">
                {routeData.map((route) => (
                  <SavedRouteCard
                    key={route.route_id}
                    route={route}
                    isSelected={selectedRoutes.has(route.route_id)}
                    onRouteSelect={handleRouteSelect}
                    selectedBookings={selectedBookings}
                    onBookingSelect={handleBookingSelect}
                    OnOperation={handleRefreshData}
                    onRouteUpdate={() =>
                      logDebug("Route updated", route.route_id)
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-lg font-semibold text-gray-700">
                  No routes found
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  There are no routes available for the selected shift and date.
                </p>
                <button
                  onClick={handleRefreshData}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Refresh
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftRoutingManagement;

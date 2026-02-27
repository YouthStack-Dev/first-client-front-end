import { useState, useEffect, useCallback, useMemo } from "react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { API_CLIENT } from "@Api/API_Client";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../redux/features/auth/authSlice";
import { AlertCircle } from "lucide-react";
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
import AssignDriverModal from "./AssignDriverModal";

const API_KEY = import.meta.env.VITE_GOOGLE_API || "";

const logDebug = (message, data = null) => {
  if (import.meta.env.DEV) {
    console.log(`[ShiftRoutingManagement] ${message}`, data || "");
  }
};

const ShiftRoutingManagement = () => {
  const [routeData, setRouteData] = useState([]);
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [unroutedBookings, setUnroutedBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unroutedLoading, setUnroutedLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMerging, setIsMerging] = useState(false);
  const { shiftId, shiftType, date } = useParams();
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [isAssigningVendor, setIsAssigningVendor] = useState(false);
  const [isCreatingRoute, setIsCreatingRoute] = useState(false);
  const [isAssignDriverModalOpen, setIsAssignDriverModalOpen] = useState(false);

  // ✅ Get tenant_id from Redux auth state (decoded from JWT)
  const currentUser = useSelector(selectCurrentUser);
  const tenantId = currentUser?.tenant_id;

  const logType = shiftType || "OUT";

  const fetchRouteData = useCallback(async () => {
    if (!shiftId || !date) {
      setError("Missing shift ID or date");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const apiEndpoint = `/routes/?shift_id=${shiftId}&booking_date=${date}`;
      const response = await API_CLIENT.get(apiEndpoint);
      if (response.data.success) {
        const routes = response.data.data.shifts[0]?.routes || [];
        setRouteData(routes);
        setFilteredRoutes(routes);
        logDebug("Route data fetched successfully", { routeCount: routes.length });
      } else {
        const errorMsg = response.data.message || "Failed to fetch route data";
        setError(errorMsg);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch route data";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [shiftId, date]);

  const fetchUnroutedBookings = useCallback(async () => {
    if (!shiftId || !date) return;
    try {
      setUnroutedLoading(true);
      const apiEndpoint = `/routes/unrouted?shift_id=${shiftId}&booking_date=${date}`;
      const response = await API_CLIENT.get(apiEndpoint);
      if (response.data.success) {
        const bookings = response.data.data.bookings || [];
        setUnroutedBookings(bookings);
      }
    } catch (err) {
      console.error("Error fetching unrouted bookings:", err);
    } finally {
      setUnroutedLoading(false);
    }
  }, [shiftId, date]);

  useEffect(() => {
    if (shiftId && date) {
      fetchRouteData();
      fetchUnroutedBookings();
    }
  }, [shiftId, date, fetchRouteData, fetchUnroutedBookings]);

  const handleSearch = useCallback((query) => {
    if (!query || query.trim() === "") {
      setFilteredRoutes(routeData);
      return;
    }
    const lowerQuery = query.toLowerCase().trim();
    const filtered = routeData.filter((route) => {
      return (
        route.route_id?.toString().includes(lowerQuery) ||
        route.route_code?.toLowerCase().includes(lowerQuery) ||
        route.driver?.name?.toLowerCase().includes(lowerQuery) ||
        route.vehicle?.rc_number?.toLowerCase().includes(lowerQuery) ||
        route.vendor?.name?.toLowerCase().includes(lowerQuery) ||
        route.stops?.some(stop =>
          stop.employee_name?.toLowerCase().includes(lowerQuery) ||
          stop.employee_id?.toString().includes(lowerQuery) ||
          stop.booking_id?.toString().includes(lowerQuery) ||
          stop.pickup_location?.toLowerCase().includes(lowerQuery) ||
          stop.drop_location?.toLowerCase().includes(lowerQuery)
        )
      );
    });
    setFilteredRoutes(filtered);
    logDebug("Search results", { query, resultsCount: filtered.length });
  }, [routeData]);

  const { getRouteColor, getBookingColor } = useRouteDirections();
  const {
    selectedRoutes,
    selectedBookings,
    handleRouteSelect,
    handleBookingSelect,
    clearAllSelections,
  } = useSelection();

  // ✅ Derive company location — null if missing, no silent hardcoded fallback
  const { companyLocation, locationError } = useMemo(() => {
    if (routeData.length === 0) return { companyLocation: null, locationError: null };

    const lat = routeData[0]?.tenant?.latitude;
    const lng = routeData[0]?.tenant?.longitude;

    if (!lat || !lng) {
      return {
        companyLocation: null,
        locationError: "Company location is missing. Please update tenant location settings.",
      };
    }

    return { companyLocation: { lat, lng }, locationError: null };
  }, [routeData]);

  const handleMerge = useCallback(async () => {
    if (selectedRoutes.size < 2) {
      alert("Please select at least two routes to merge.");
      return;
    }
    const routeIds = Array.from(selectedRoutes);
    try {
      setIsMerging(true);
      const response = await API_CLIENT.post("/routes/merge", { route_ids: routeIds });
      if (response.data?.success && response.data?.data) {
        const mergedRoute = response.data.data;
        alert(`Successfully merged ${routeIds.length} routes into route #${mergedRoute.route_id}!`);
        await fetchRouteData();
        await fetchUnroutedBookings();
        clearAllSelections();
      } else {
        throw new Error(response.data?.message || "Merge failed");
      }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to merge routes. Please try again.";
      alert(message);
    } finally {
      setIsMerging(false);
    }
  }, [selectedRoutes, fetchRouteData, fetchUnroutedBookings, clearAllSelections]);

  const handleAssignVendorClick = useCallback(() => {
    if (selectedRoutes.size === 0) {
      alert("Please select at least one route to assign to a vendor.");
      return;
    }
    setIsVendorModalOpen(true);
  }, [selectedRoutes]);

  // ✅ Single button — handles both single and bulk assign based on selection count
  const handleAssignVendor = useCallback(
    async (assignmentData) => {
      if (assignmentData.routeIds.length === 0) {
        alert("Please select at least one route to assign to a vendor.");
        return;
      }
      try {
        setIsAssigningVendor(true);
        const vendorId = assignmentData.vendor.vendor_id;

        if (assignmentData.routeIds.length === 1) {
          // ── Single route assign ──
          const routeId = assignmentData.routeIds[0];
          const response = await API_CLIENT.put(
            `/routes/assign-vendor?vendor_id=${vendorId}&route_id=${routeId}`,
            { notes: assignmentData.notes, tenant_id: tenantId }
          );
          if (!response.data?.success) {
            throw new Error(response.data?.message || "Vendor assignment failed");
          }
          alert(`Successfully assigned ${assignmentData.vendor.name} to route #${routeId}!`);
        } else {
          // ── Bulk route assign ──
          const response = await API_CLIENT.put(
            `/routes/assign-vendor/bulk`,
            {
              route_ids: assignmentData.routeIds,
              vendor_id: vendorId,
              tenant_id: tenantId,
            }
          );
          if (!response.data?.success) {
            throw new Error(response.data?.message || "Bulk vendor assignment failed");
          }
          alert(`Successfully assigned ${assignmentData.vendor.name} to ${assignmentData.routeIds.length} routes!`);
        }

        setIsVendorModalOpen(false);
        await fetchRouteData();
        clearAllSelections();
      } catch (error) {
        const message = error.response?.data?.message || "Failed to assign vendor. Please try again.";
        alert(message);
      } finally {
        setIsAssigningVendor(false);
      }
    },
    [fetchRouteData, clearAllSelections, tenantId]
  );

  const handleAssignVehicle = useCallback(() => {
    if (selectedRoutes.size === 0) {
      alert("Please select at least one route to assign a vehicle.");
      return;
    }
    setIsAssignDriverModalOpen(true);
  }, [selectedRoutes]);

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
      await fetchRouteData();
      setIsAssignDriverModalOpen(false);
      alert("Successfully assigned driver and vehicle to route");
      clearAllSelections();
    } catch (err) {
      console.error("Error assigning driver:", err);
      alert("Failed to assign driver. Please try again.");
    }
  };

  const handleSync = useCallback(async () => {
    try {
      setLoading(true);
      setUnroutedLoading(true);
      await Promise.all([fetchRouteData(), fetchUnroutedBookings()]);
      alert("Data synced successfully!");
    } catch (error) {
      alert("Failed to sync data. Please try again.");
    }
  }, [fetchRouteData, fetchUnroutedBookings]);

  const handleCreateRouteClick = useCallback(async () => {
    if (selectedBookings.size === 0) {
      alert("Please select at least one booking to create a route.");
      return;
    }
    setIsCreatingRoute(true);
    try {
      const bookingIds = Array.from(selectedBookings);
      const payload = { booking_ids: bookingIds, optimize: true };
      const response = await API_CLIENT.post("/routes/new-route", payload);
      if (response.data?.success) {
        const newRoute = response.data?.data;
        alert(`Route created successfully!${newRoute?.route_code ? ` Route code: ${newRoute.route_code}` : ""}`);
        await fetchRouteData();
        await fetchUnroutedBookings();
        clearAllSelections();
      } else {
        throw new Error(response.data?.message || "Failed to create route");
      }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to create route. Please try again.";
      alert(message);
    } finally {
      setIsCreatingRoute(false);
    }
  }, [selectedBookings, fetchRouteData, fetchUnroutedBookings, clearAllSelections]);

  const handleRefreshData = useCallback(() => {
    fetchRouteData();
    fetchUnroutedBookings();
    clearAllSelections();
  }, [fetchRouteData, fetchUnroutedBookings, clearAllSelections]);

  if (loading) {
    return (
      <div className="flex h-full bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading routes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full bg-gray-50 items-center justify-center">
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
    <div className="flex h-full bg-gray-50 overflow-hidden">

      {/* LEFT MAP SECTION */}
      <div className="w-[55%] relative">

        {/* ✅ Location error banner — shown over map when tenant lat/lng is missing */}
        {locationError && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50
            bg-red-50 border border-red-200 text-red-700 text-xs font-medium
            px-4 py-2 rounded-lg shadow-md flex items-center gap-2 whitespace-nowrap">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {locationError}
          </div>
        )}

        <APIProvider apiKey={API_KEY}>
          <Map
            defaultCenter={companyLocation ?? { lat: 20.5937, lng: 78.9629 }} // ✅ India center as neutral init-only fallback
            defaultZoom={companyLocation ? 11 : 5}                             // ✅ zoom out if no specific location
            mapId="company-route-map"
            gestureHandling="greedy"
            style={{ width: "100%", height: "100%" }}
            fullscreenControl={false}
            streetViewControl={false}
            mapTypeControl={false}
          >
            {/* ✅ Only render marker if location is valid */}
            {companyLocation && <CompanyMarker position={companyLocation} />}

            {Array.from(selectedRoutes).map((routeId, routeIndex) => {
              const route = routeData.find((r) => r.route_id === routeId);
              if (!route) return null;
              const color = getRouteColor(routeIndex);
              return (
                <div key={`route-${routeId}`}>
                  <RouteDirections route={route} logType={logType} color={color} routeIndex={routeIndex} />
                  <RouteMarkers route={route} logType={logType} color={color} routeIndex={routeIndex} />
                </div>
              );
            })}
            {Array.from(selectedBookings).map((bookingId, bookingIndex) => {
              const booking = findBookingById(bookingId, unroutedBookings, routeData);
              if (!booking) return null;
              const color = getBookingColor(bookingIndex);
              return (
                <div key={`booking-${bookingId}`}>
                  <BookingDirections booking={booking} color={color} bookingIndex={bookingIndex} />
                  <BookingMarkers booking={booking} color={color} bookingIndex={bookingIndex} />
                </div>
              );
            })}
          </Map>
        </APIProvider>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-[45%] bg-gradient-to-b from-gray-50 to-white border-l border-gray-200 shadow-2xl flex flex-col min-h-0 min-w-96">

        {/* FIXED TOOLBAR */}
        <div className="flex-shrink-0 border-b border-gray-200 bg-white">
          <MapToolbar
            selectedRoutes={selectedRoutes}
            selectedBookings={selectedBookings}
            onMerge={handleMerge}
            onAssignVendor={handleAssignVendorClick}
            onAssignVehicle={handleAssignVehicle}
            onSync={handleSync}
            onSearch={handleSearch}
            onCreateRoute={handleCreateRouteClick}
            panelType="company"
            isMerging={isMerging}
            isCreatingRoute={isCreatingRoute}
            routes={routeData}
          />
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
          <UnroutedBookingsSection
            unroutedBookings={unroutedBookings}
            selectedBookings={selectedBookings}
            onBookingSelect={handleBookingSelect}
            loading={unroutedLoading}
          />
          <div className="p-3 space-y-2">
            <SelectionSummary
              selectedRoutes={selectedRoutes}
              selectedBookings={selectedBookings}
              onClearAll={clearAllSelections}
            />
            {filteredRoutes.length !== routeData.length && (
              <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                Showing {filteredRoutes.length} of {routeData.length} routes
              </div>
            )}
            {filteredRoutes.length > 0 ? (
              <div className="space-y-2">
                {filteredRoutes.map((route) => (
                  <SavedRouteCard
                    key={route.route_id}
                    route={route}
                    isSelected={selectedRoutes.has(route.route_id)}
                    onRouteSelect={handleRouteSelect}
                    selectedBookings={selectedBookings}
                    onBookingSelect={handleBookingSelect}
                    showStops={false}
                    showBookingDetails={false}
                    OnOperation={handleRefreshData}
                    detachBooking={handleRefreshData}
                    onRouteUpdate={() => logDebug("Route updated", route.route_id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">
                  {routeData.length === 0 ? "📭" : "🔍"}
                </div>
                <p className="text-lg font-semibold text-gray-700">
                  {routeData.length === 0 ? "No routes found" : "No matching routes"}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {routeData.length === 0
                    ? "There are no routes available for the selected shift and date."
                    : "Try adjusting your search terms or clear the search to see all routes."}
                </p>
                <button
                  onClick={handleRefreshData}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  {routeData.length === 0 ? "Refresh" : "Clear Search"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODALS */}
      <VendorAssignModal
        isOpen={isVendorModalOpen}
        onClose={() => setIsVendorModalOpen(false)}
        selectedRoutes={selectedRoutes}
        onAssignVendor={handleAssignVendor}
        isAssigning={isAssigningVendor}
      />
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

export default ShiftRoutingManagement;
import React, { useState, useEffect, useCallback } from "react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { API_CLIENT } from "../../Api/API_Client";
import SavedRouteCard from "./SavedRouteCard";
import { useParams } from "react-router-dom";
import MapToolbar from "./MapToolbar";
import UnroutedBookingsSection from "./UnroutedBookingsSection";
import VendorAssignModal from "./VendorAssignModal";
import DirectionsRenderer from "./DirectionsRenderer";
import RouteMarkers from "./RouteMarkers";
import { logDebug } from "@utils/logger";
const ClusterMapViewer = () => {
  const [routeData, setRouteData] = useState(null);
  const [unroutedBookings, setUnroutedBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unroutedLoading, setUnroutedLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commonDestination, setCommonDestination] = useState(null);

  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [isAssigningVendor, setIsAssigningVendor] = useState(false);

  // Selection states
  const [selectedBookings, setSelectedBookings] = useState(new Set());
  const [selectedRoutes, setSelectedRoutes] = useState(new Set());

  // Route settings
  const [showRoutes, setShowRoutes] = useState(true);
  const [shortPath, setShortPath] = useState(true);
  const [preferLocalRoads, setPreferLocalRoads] = useState(false);

  const [isMerging, setIsMerging] = useState(false);

  const { shiftId, date } = useParams();

  // Transform API stops to bookings format for compatibility
  const transformStopsToBookings = (stops) => {
    return stops.map((stop) => ({
      booking_id: stop.booking_id,
      tenant_id: stop.tenant_id,
      employee_id: stop.employee_id,
      employee_code: stop.employee_code,
      shift_id: stop.shift_id,
      team_id: stop.team_id,
      booking_date: stop.booking_date,
      pickup_latitude: stop.pickup_latitude,
      pickup_longitude: stop.pickup_longitude,
      pickup_location: stop.pickup_location,
      drop_latitude: stop.drop_latitude,
      drop_longitude: stop.drop_longitude,
      drop_location: stop.drop_location,
      status: stop.status,
      reason: stop.reason,
      is_active: stop.is_active,
      created_at: stop.created_at,
      updated_at: stop.updated_at,
      order_id: stop.order_id,
      estimated_pick_up_time: stop.estimated_pick_up_time,
      estimated_drop_time: stop.estimated_drop_time,
      estimated_distance: stop.estimated_distance,
      actual_pick_up_time: stop.actual_pick_up_time,
      actual_drop_time: stop.actual_drop_time,
      actual_distance: stop.actual_distance,
    }));
  };

  // Fetch unrouted bookings
  const fetchUnroutedBookings = async () => {
    try {
      setUnroutedLoading(true);
      const apiEndpoint = `/v1/routes/unrouted?shift_id=${shiftId}&booking_date=${date}`;
      const response = await API_CLIENT.get(apiEndpoint);

      if (response.data?.success) {
        setUnroutedBookings(response.data.data?.bookings || []);
      } else {
        throw new Error("Invalid response format from unrouted bookings API");
      }
    } catch (err) {
      console.error("Error fetching unrouted bookings:", err);
    } finally {
      setUnroutedLoading(false);
    }
  };

  // Fetch route data
  const fetchRouteData = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiEndpoint = `/v1/routes/?&shift_id=${shiftId}&booking_date=${date}`;
      const response = await API_CLIENT.get(apiEndpoint);

      if (response.data?.success && response.data?.data?.shifts) {
        const allRoutes = [];

        response.data.data.shifts.forEach((shift) => {
          if (shift.routes?.length > 0) {
            shift.routes.forEach((route) => {
              const transformedRoute = {
                ...route,
                shift_id: shift.shift_id,
                shift_time: shift.shift_time,
                log_type: shift.log_type,
                bookings: transformStopsToBookings(route.stops || []),
                original_stops: route.stops || [],
              };

              allRoutes.push(transformedRoute);
            });
          }
        });

        const transformedData = {
          routes: allRoutes,
          total_routes: response.data.data.total_routes || 0,
          total_shifts: response.data.data.total_shifts || 0,
          original_data: response.data.data,
        };

        setRouteData(transformedData);

        // Set common destination from first stop if available
        if (allRoutes.length > 0 && allRoutes[0].stops?.length > 0) {
          const firstStop = allRoutes[0].stops[0];
          setCommonDestination({
            lat: firstStop.drop_latitude,
            lng: firstStop.drop_longitude,
            address: firstStop.drop_location,
          });
        }
      } else {
        throw new Error("Invalid response format from saved routes API");
      }
    } catch (err) {
      console.error("Error fetching route data:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch route data"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch both route data and unrouted bookings
  useEffect(() => {
    const fetchAllData = async () => {
      await Promise.all([fetchRouteData(), fetchUnroutedBookings()]);
    };

    fetchAllData();
  }, [shiftId, date]);

  const handleAssignVendor = async (assignmentData) => {
    if (assignmentData.routeIds.length > 1) {
      alert(
        "Multiple route assignment is not possible. Please select only one route to assign to a vendor."
      );
      return;
    }

    if (assignmentData.routeIds.length === 0) {
      alert("Please select at least one route to assign to a vendor.");
      return;
    }

    try {
      setIsAssigningVendor(true);
      const routeId = assignmentData.routeIds[0];
      const vendorId = assignmentData.vendor.vendor_id;

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
      }
    } catch (error) {
      console.error("Failed to assign vendor:", error);
      const message =
        error.response?.data?.message ||
        "Failed to assign vendor. Please try again.";
      alert(message);
    } finally {
      setIsAssigningVendor(false);
    }
  };

  const handleRouteSelect = useCallback((routeId) => {
    setSelectedRoutes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(routeId)) {
        newSet.delete(routeId);
      } else {
        newSet.add(routeId);
      }
      return newSet;
    });
  }, []);

  const handleDeleteBooking = useCallback(async (routeId, bookingId) => {
    try {
      await API_CLIENT.delete(`/v1/routes/${routeId}/bookings/${bookingId}`);

      setRouteData((prev) => {
        if (!prev?.routes) return prev;

        const updatedRoutes = prev.routes
          .map((route) => {
            if (route.route_id === routeId) {
              const updatedStops =
                route.stops?.filter((stop) => stop.booking_id !== bookingId) ||
                [];
              const updatedBookings =
                route.bookings?.filter(
                  (booking) => booking.booking_id !== bookingId
                ) || [];

              return {
                ...route,
                stops: updatedStops,
                bookings: updatedBookings,
              };
            }
            return route;
          })
          .filter(
            (route) =>
              (route.stops && route.stops.length > 0) ||
              (route.bookings && route.bookings.length > 0)
          );

        return {
          ...prev,
          routes: updatedRoutes,
          total_routes: updatedRoutes.length,
        };
      });

      fetchUnroutedBookings();
    } catch (error) {
      console.error("Failed to delete booking:", error);
      alert("Failed to remove booking. Please try again.");
    }
  }, []);

  const handleDeleteRoute = async (routeId) => {
    try {
      await API_CLIENT.delete(`/v1/routes/${routeId}`);

      setRouteData((prev) => ({
        ...prev,
        routes: prev.routes.filter((route) => route.route_id !== routeId),
      }));

      setSelectedRoutes((prev) => {
        const newSelected = new Set(prev);
        newSelected.delete(routeId);
        return newSelected;
      });
    } catch (error) {
      console.error("Failed to delete route:", error);
      alert("Failed to delete route. Please try again.");
    }
  };

  const handleMerge = useCallback(async () => {
    if (selectedRoutes.size < 2) {
      alert("Please select at least two routes to merge.");
      return;
    }

    const routeIds = Array.from(selectedRoutes);
    const requestData = { route_ids: routeIds };
    logDebug("Merging routes with data:", requestData);
    try {
      setIsMerging(true);
      const response = await API_CLIENT.post(
        "/v1/routes/merge?tenant_id=SAM001",
        requestData
      );

      if (response.data?.success && response.data?.data) {
        const mergedRoute = response.data.data;
        const firstSelectedRoute = routeData.routes.find((r) =>
          selectedRoutes.has(r.route_id)
        );

        const newMergedRoute = {
          route_id: mergedRoute.route_id,
          stops: mergedRoute.stops || [],
          bookings: transformStopsToBookings(mergedRoute.stops || []),
          estimations: mergedRoute.estimations || null,
          summary: mergedRoute.summary || null,
          shift_id: firstSelectedRoute?.shift_id || shiftId,
          shift_time: firstSelectedRoute?.shift_time || "",
          log_type: firstSelectedRoute?.log_type || "Login",
        };

        setRouteData((prev) => {
          if (!prev?.routes) return prev;
          const remainingRoutes = prev.routes.filter(
            (route) => !selectedRoutes.has(route.route_id)
          );
          const updatedRoutes = [...remainingRoutes, newMergedRoute];

          return {
            ...prev,
            routes: updatedRoutes,
            total_routes: updatedRoutes.length,
          };
        });

        setSelectedRoutes(new Set());
        alert(
          `Successfully merged ${routeIds.length} routes into route #${mergedRoute.route_id}!`
        );
      }
    } catch (error) {
      console.error("Merge failed:", error);
      const message =
        error.response?.data?.message ||
        "Failed to merge routes. Please try again.";
      alert(message);
    } finally {
      setIsMerging(false);
    }
  }, [selectedRoutes, routeData, shiftId]);

  const handleBookingSelect = useCallback((bookingId) => {
    setSelectedBookings((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(bookingId)) {
        newSet.delete(bookingId);
      } else {
        newSet.add(bookingId);
      }
      return newSet;
    });
  }, []);

  const API_KEY = import.meta.env.VITE_GOOGLE_API || "";

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-lg text-gray-700">Loading routes...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-lg text-red-600 font-semibold mb-2">
            Error loading routes
          </div>
          <div className="text-sm text-gray-600 bg-red-50 p-4 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div className="flex-1 relative">
        <APIProvider apiKey={API_KEY}>
          <Map
            defaultCenter={commonDestination || { lat: 12.9716, lng: 77.5946 }}
            defaultZoom={12}
            mapId="route-cluster-map"
            disableDefaultUI={false}
            gestureHandling={"greedy"}
          >
            {/* Directions Renderer - Just shows the path */}
            {routeData?.routes && (
              <DirectionsRenderer
                routes={routeData.routes}
                selectedRouteIds={selectedRoutes}
                showRoutes={showRoutes}
                shortPath={shortPath}
                preferLocalRoads={preferLocalRoads}
              />
            )}

            {/* Route Markers */}
            {routeData?.routes && (
              <RouteMarkers
                routes={routeData.routes}
                selectedRouteIds={selectedRoutes}
              />
            )}
          </Map>
        </APIProvider>
      </div>

      <div className="w-2/1 bg-gradient-to-b from-gray-50 to-white border-l border-gray-200 shadow-2xl flex flex-col h-full">
        <div className="flex-shrink-0 bg-white border-b border-gray-200 z-20">
          <div className="p-6 pb-4">
            <h1 className="text-2xl font-bold text-gray-800">
              Route Management
            </h1>
            {selectedRoutes.size > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                Showing directions for {selectedRoutes.size} selected route(s)
              </div>
            )}
          </div>

          <div className="px-6 pb-4">
            <MapToolbar
              selectedRoutes={selectedRoutes}
              showRoutes={showRoutes}
              shortPath={shortPath}
              onMerge={handleMerge}
              onAssignVendor={() => setIsVendorModalOpen(true)}
              onToggleRoutes={() => setShowRoutes(!showRoutes)}
              onToggleShortPath={() => setShortPath(!shortPath)}
              isMerging={isMerging}
              panelType="company"
            />

            <VendorAssignModal
              isOpen={isVendorModalOpen}
              onClose={() => setIsVendorModalOpen(false)}
              selectedRoutes={selectedRoutes}
              onAssignVendor={handleAssignVendor}
              isAssigning={isAssigningVendor}
            />

            <div className="mt-3 pt-3 border-t border-gray-200">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-gray-900 transition-colors">
                <input
                  type="checkbox"
                  checked={preferLocalRoads}
                  onChange={(e) => setPreferLocalRoads(e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="font-medium">
                  Prefer local roads (avoid highways)
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <UnroutedBookingsSection
            unroutedBookings={unroutedBookings}
            unroutedLoading={unroutedLoading}
            selectedBookings={selectedBookings}
            onBookingSelect={handleBookingSelect}
          />

          <div className="p-4 space-y-4">
            {selectedRoutes.size > 0 && (
              <div className="flex items-center justify-end mb-2">
                <span className="text-sm text-purple-600 font-bold px-3 py-1 bg-purple-50 rounded-full">
                  {selectedRoutes.size} selected
                </span>
              </div>
            )}

            {(!routeData?.routes || routeData.routes.length === 0) &&
            unroutedBookings.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-lg font-semibold text-gray-700">
                  No routes or bookings found
                </p>
                <p className="text-sm mt-2">
                  Create routes from suggestions first.
                </p>
              </div>
            ) : routeData?.routes && routeData.routes.length > 0 ? (
              <div className="space-y-4">
                {routeData.routes.map((route) => (
                  <SavedRouteCard
                    key={route.route_id}
                    route={route}
                    isSelected={selectedRoutes.has(route.route_id)}
                    onRouteSelect={handleRouteSelect}
                    onDeleteBooking={handleDeleteBooking}
                    onDeleteRoute={handleDeleteRoute}
                    selectedBookings={selectedBookings}
                    onBookingSelect={handleBookingSelect} // ✅ This was missing
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClusterMapViewer;

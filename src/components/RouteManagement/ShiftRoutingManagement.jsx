import { useState, useEffect, useCallback, useMemo } from "react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { API_CLIENT } from "@Api/API_Client";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../redux/features/auth/authSlice";
import { AlertCircle, CheckCircle2, X, Info, AlertTriangle, Ban } from "lucide-react";
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
import AssignEscortModal from "./AssignEscortModal";
import BulkDispatchModal from "./BulkDispatchModal";

const API_KEY = import.meta.env.VITE_GOOGLE_API || "";

const logDebug = (message, data = null) => {
  if (import.meta.env.DEV) {
    console.log(`[ShiftRoutingManagement] ${message}`, data || "");
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Toast — lightweight in-app notification
// ─────────────────────────────────────────────────────────────────────────────
const Toast = ({ toasts, onDismiss }) => {
  if (!toasts.length) return null;
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 99999,
      display: "flex", flexDirection: "column", gap: 8, maxWidth: 360,
    }}>
      {toasts.map((t) => {
        const styles = {
          success: { bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d", icon: <CheckCircle2 size={15} /> },
          error:   { bg: "#fef2f2", border: "#fecaca", text: "#b91c1c", icon: <AlertCircle  size={15} /> },
          info:    { bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8", icon: <Info          size={15} /> },
          warning: { bg: "#fffbeb", border: "#fde68a", text: "#b45309", icon: <AlertTriangle size={15} /> },
        }[t.type] ?? { bg: "#f8fafc", border: "#e2e8f0", text: "#334155", icon: <Info size={15} /> };
        return (
          <div key={t.id} style={{
            display: "flex", alignItems: "flex-start", gap: 10,
            padding: "12px 14px", borderRadius: 10,
            background: styles.bg, border: `1px solid ${styles.border}`,
            boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
            color: styles.text, fontSize: 13, fontWeight: 500,
            animation: "toastIn 0.22s cubic-bezier(0.34,1.56,0.64,1)",
          }}>
            <span style={{ flexShrink: 0, marginTop: 1 }}>{styles.icon}</span>
            <span style={{ flex: 1, lineHeight: 1.5 }}>{t.message}</span>
            <button onClick={() => onDismiss(t.id)} style={{
              background: "none", border: "none", cursor: "pointer",
              color: styles.text, opacity: 0.6, padding: 0, flexShrink: 0,
            }}>
              <X size={13} />
            </button>
          </div>
        );
      })}
      <style>{`@keyframes toastIn { from{opacity:0;transform:translateY(10px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }`}</style>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DriverRestBlockModal — shown on 409 DRIVER_INSUFFICIENT_REST
// ─────────────────────────────────────────────────────────────────────────────
const DriverRestBlockModal = ({ data, onClose }) => {
  if (!data) return null;
  const { rest_gap_minutes, required_rest_minutes, last_trip_end, driver_id } = data;

  const formatDateTime = (iso) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString(undefined, {
        dateStyle: "medium", timeStyle: "short",
      });
    } catch {
      return iso;
    }
  };

  const restShortfall = required_rest_minutes - rest_gap_minutes;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 99998,
      background: "rgba(0,0,0,0.45)", display: "flex",
      alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div style={{
        background: "#fff", borderRadius: 14, width: "100%", maxWidth: 420,
        boxShadow: "0 20px 60px rgba(0,0,0,0.18)", overflow: "hidden",
      }}>
        {/* header */}
        <div style={{
          background: "#fef2f2", borderBottom: "1px solid #fecaca",
          padding: "16px 20px", display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <Ban size={18} color="#dc2626" />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#991b1b", margin: 0 }}>
              Assignment blocked
            </p>
            <p style={{ fontSize: 12, color: "#b91c1c", margin: "2px 0 0", opacity: 0.8 }}>
              Driver has insufficient rest
            </p>
          </div>
          <button onClick={onClose} style={{
            marginLeft: "auto", background: "none", border: "none",
            cursor: "pointer", color: "#b91c1c", opacity: 0.6, padding: 4,
          }}>
            <X size={16} />
          </button>
        </div>

        {/* body */}
        <div style={{ padding: "20px 20px 8px" }}>
          <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, marginBottom: 16 }}>
            Cannot assign this driver — they have not had enough rest since their last trip.
          </p>

          {/* stat row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Rest available",  value: `${rest_gap_minutes} min`,      accent: false, bad: true  },
              { label: "Rest required",   value: `${required_rest_minutes} min`, accent: true,  bad: false },
              { label: "Shortfall",       value: `${restShortfall} min`,         accent: false, bad: true  },
              { label: "Last trip ended", value: formatDateTime(last_trip_end),  accent: false, bad: false },
            ].map(({ label, value, accent, bad }) => (
              <div key={label} style={{
                padding: "10px 12px", borderRadius: 8,
                background: bad ? "#fef2f2" : accent ? "#eff6ff" : "#f8fafc",
                border: `1px solid ${bad ? "#fecaca" : accent ? "#bfdbfe" : "#e5e7eb"}`,
              }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: bad ? "#b91c1c" : accent ? "#1d4ed8" : "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 3px" }}>
                  {label}
                </p>
                <p style={{ fontSize: 13, fontWeight: 700, color: bad ? "#991b1b" : accent ? "#1e40af" : "#111827", margin: 0 }}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 20, lineHeight: 1.5 }}>
            To proceed, either wait until the driver has had{" "}
            <strong style={{ color: "#374151" }}>{required_rest_minutes} minutes</strong> of rest,
            or assign a different driver to this route.
          </p>
        </div>

        {/* footer */}
        <div style={{
          padding: "12px 20px 16px", display: "flex", justifyContent: "flex-end",
        }}>
          <button onClick={onClose} style={{
            padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: "#111827", color: "#fff", border: "none", cursor: "pointer",
          }}>
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// useToast hook
// ─────────────────────────────────────────────────────────────────────────────
const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const push = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => dismiss(id), duration);
  }, [dismiss]);
  const toast = useMemo(() => ({
    success: (msg)            => push(msg, "success"),
    error:   (msg)            => push(msg, "error"),
    info:    (msg)            => push(msg, "info"),
    warning: (msg, dur = 6000) => push(msg, "warning", dur),
  }), [push]);
  return { toasts, toast, dismiss };
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper — parse driver_rest_insufficient warning string
// e.g. "driver_rest_insufficient: gap=45m (required 840m)"
// ─────────────────────────────────────────────────────────────────────────────
const parseRestWarning = (warningStr) => {
  const gapMatch      = warningStr.match(/gap=(\d+)m/);
  const requiredMatch = warningStr.match(/required\s+(\d+)m/);
  return {
    gap:      gapMatch      ? parseInt(gapMatch[1])      : null,
    required: requiredMatch ? parseInt(requiredMatch[1]) : null,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// ShiftRoutingManagement
// ─────────────────────────────────────────────────────────────────────────────
const ShiftRoutingManagement = () => {
  const [routeData,            setRouteData]            = useState([]);
  const [filteredRoutes,       setFilteredRoutes]       = useState([]);
  const [unroutedBookings,     setUnroutedBookings]     = useState([]);
  const [loading,              setLoading]              = useState(true);
  const [unroutedLoading,      setUnroutedLoading]      = useState(true);
  const [error,                setError]                = useState(null);
  const [isMerging,            setIsMerging]            = useState(false);
  const [isAssigningVehicle,   setIsAssigningVehicle]   = useState(false);
  const [isVendorModalOpen,    setIsVendorModalOpen]    = useState(false);
  const [isAssigningVendor,    setIsAssigningVendor]    = useState(false);
  const [isCreatingRoute,      setIsCreatingRoute]      = useState(false);
  const [isAssignDriverModalOpen, setIsAssignDriverModalOpen] = useState(false);
  const [isEscortModalOpen,    setIsEscortModalOpen]    = useState(false);
  const [escortRouteId,        setEscortRouteId]        = useState(null);
  const [isDispatchModalOpen,  setIsDispatchModalOpen]  = useState(false);

  // ── NEW: driver rest block modal state ─────────────────────────────────────
  const [restBlockData, setRestBlockData] = useState(null); // null = closed

  const { shiftId, shiftType, date } = useParams();
  const { toasts, toast, dismiss } = useToast();

  const currentUser = useSelector(selectCurrentUser);
  const tenantId    = currentUser?.tenant_id;
  const logType     = shiftType || "OUT";

  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchRouteData = useCallback(async () => {
    if (!shiftId || !date) { setError("Missing shift ID or date"); setLoading(false); return; }
    try {
      setLoading(true); setError(null);
      const response = await API_CLIENT.get(`/routes/?shift_id=${shiftId}&booking_date=${date}`);
      if (response.data.success) {
        const routes = response.data.data.shifts[0]?.routes || [];
        setRouteData(routes);
        setFilteredRoutes(routes);
        logDebug("Route data fetched successfully", { routeCount: routes.length });
      } else {
        setError(response.data.message || "Failed to fetch route data");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to fetch route data");
    } finally {
      setLoading(false);
    }
  }, [shiftId, date]);

  const fetchUnroutedBookings = useCallback(async () => {
    if (!shiftId || !date) return;
    try {
      setUnroutedLoading(true);
      const response = await API_CLIENT.get(`/routes/unrouted?shift_id=${shiftId}&booking_date=${date}`);
      if (response.data.success) setUnroutedBookings(response.data.data.bookings || []);
    } catch (err) {
      console.error("Error fetching unrouted bookings:", err);
    } finally {
      setUnroutedLoading(false);
    }
  }, [shiftId, date]);

  useEffect(() => {
    if (shiftId && date) { fetchRouteData(); fetchUnroutedBookings(); }
  }, [shiftId, date, fetchRouteData, fetchUnroutedBookings]);

  // ── Search ─────────────────────────────────────────────────────────────────
  const handleSearch = useCallback((query) => {
    if (!query?.trim()) { setFilteredRoutes(routeData); return; }
    const q = query.toLowerCase().trim();
    setFilteredRoutes(routeData.filter((route) =>
      route.route_id?.toString().includes(q) ||
      route.route_code?.toLowerCase().includes(q) ||
      route.driver?.name?.toLowerCase().includes(q) ||
      route.vehicle?.rc_number?.toLowerCase().includes(q) ||
      route.vendor?.name?.toLowerCase().includes(q) ||
      route.stops?.some((stop) =>
        stop.employee_name?.toLowerCase().includes(q) ||
        stop.employee_id?.toString().includes(q) ||
        stop.booking_id?.toString().includes(q) ||
        stop.pickup_location?.toLowerCase().includes(q) ||
        stop.drop_location?.toLowerCase().includes(q)
      )
    ));
    logDebug("Search applied", { query: q });
  }, [routeData]);

  const { getRouteColor, getBookingColor } = useRouteDirections();
  const {
    selectedRoutes, selectedBookings,
    handleRouteSelect, handleBookingSelect, clearAllSelections,
  } = useSelection();

  const { companyLocation, locationError } = useMemo(() => {
    if (!routeData.length) return { companyLocation: null, locationError: null };
    const lat = routeData[0]?.tenant?.latitude;
    const lng = routeData[0]?.tenant?.longitude;
    if (!lat || !lng) return { companyLocation: null, locationError: "Company location is missing. Please update tenant location settings." };
    return { companyLocation: { lat, lng }, locationError: null };
  }, [routeData]);

  // ── Merge ──────────────────────────────────────────────────────────────────
  const handleMerge = useCallback(async () => {
    if (selectedRoutes.size < 2) { toast.info("Please select at least two routes to merge."); return; }
    const routeIds = Array.from(selectedRoutes);
    try {
      setIsMerging(true);
      const response = await API_CLIENT.post("/routes/merge", { route_ids: routeIds });
      if (response.data?.success && response.data?.data) {
        toast.success(`Merged ${routeIds.length} routes into route #${response.data.data.route_id}`);
        await fetchRouteData();
        await fetchUnroutedBookings();
        clearAllSelections();
      } else {
        throw new Error(response.data?.message || "Merge failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to merge routes. Please try again.");
    } finally {
      setIsMerging(false);
    }
  }, [selectedRoutes, fetchRouteData, fetchUnroutedBookings, clearAllSelections, toast]);

  // ── Assign Vendor ──────────────────────────────────────────────────────────
  const handleAssignVendorClick = useCallback(() => {
    if (selectedRoutes.size === 0) { toast.info("Please select at least one route to assign to a vendor."); return; }
    setIsVendorModalOpen(true);
  }, [selectedRoutes, toast]);

  const handleAssignVendor = useCallback(async (assignmentData) => {
    if (!assignmentData.routeIds.length) { toast.info("Please select at least one route."); return; }
    try {
      setIsAssigningVendor(true);
      const vendorId = assignmentData.vendor.vendor_id;
      if (assignmentData.routeIds.length === 1) {
        const routeId = assignmentData.routeIds[0];
        const response = await API_CLIENT.put(
          `/routes/assign-vendor?vendor_id=${vendorId}&route_id=${routeId}`,
          { notes: assignmentData.notes, tenant_id: tenantId }
        );
        if (!response.data?.success) throw new Error(response.data?.message || "Vendor assignment failed");
        toast.success(`Assigned ${assignmentData.vendor.name} to route #${routeId}`);
      } else {
        const response = await API_CLIENT.put(`/routes/assign-vendor/bulk`, {
          route_ids: assignmentData.routeIds, vendor_id: vendorId, tenant_id: tenantId,
        });
        if (!response.data?.success) throw new Error(response.data?.message || "Bulk vendor assignment failed");
        toast.success(`Assigned ${assignmentData.vendor.name} to ${assignmentData.routeIds.length} routes`);
      }
      setIsVendorModalOpen(false);
      await fetchRouteData();
      clearAllSelections();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign vendor. Please try again.");
    } finally {
      setIsAssigningVendor(false);
    }
  }, [fetchRouteData, clearAllSelections, tenantId, toast]);

  // ── Assign Vehicle ─────────────────────────────────────────────────────────
  const handleAssignVehicle = useCallback(() => {
    if (selectedRoutes.size === 0) { toast.info("Please select at least one route to assign a vehicle."); return; }
    setIsAssignDriverModalOpen(true);
  }, [selectedRoutes, toast]);

  const handleVehicleAssignment = async (vehicleId) => {
    if (selectedRoutes.size > 1) {
      toast.info("Bulk vehicle assignment is not supported yet. Please select only one route.");
      return;
    }
    if (selectedRoutes.size === 0) { toast.info("Please select at least one route."); return; }

    const routeId = Array.from(selectedRoutes)[0];
    try {
      setIsAssigningVehicle(true);
      const params = new URLSearchParams({ route_id: routeId, vehicle_id: vehicleId });
      if (tenantId) params.append("tenant_id", tenantId);

      const response = await API_CLIENT.put(`/routes/assign-vehicle?${params}`);
      const resData   = response.data?.data ?? response.data;
      const warnings  = resData?.warnings ?? [];

      // ── Case A: success, no warnings ──────────────────────────────────────
      if (!warnings.length) {
        toast.success("Vehicle assigned successfully. Notifications will be sent automatically.");
      }

      // ── Case B: success but driver rest warning ───────────────────────────
      const restWarning = warnings.find((w) => w.includes("driver_rest_insufficient"));
      if (restWarning) {
        const { gap, required } = parseRestWarning(restWarning);
        const gapStr      = gap      != null ? `${gap} minutes`      : "an unknown duration";
        const reqStr      = required != null ? `${required} minutes` : "the required amount";
        toast.warning(
          `Warning: Driver has only ${gapStr} of rest. Required rest is ${reqStr}. Assignment was saved.`,
          7000
        );
      }

      await fetchRouteData();
      setIsAssignDriverModalOpen(false);
      clearAllSelections();

    } catch (err) {
      const status    = err.response?.status;
      const detail    = err.response?.data?.detail;
      const errorCode = detail?.error_code;

      // ── Case C: 409 driver rest block ─────────────────────────────────────
      if (status === 409 && errorCode === "DRIVER_INSUFFICIENT_REST") {
        setRestBlockData(detail?.details ?? {});
        // do NOT close the assign modal — let the user dismiss the block modal first
        return;
      }

      // ── All other errors ──────────────────────────────────────────────────
      toast.error(
        detail?.message ||
        err.response?.data?.message ||
        "Failed to assign vehicle. Please try again."
      );
    } finally {
      setIsAssigningVehicle(false);
    }
  };

  // ── Escort ────────────────────────────────────────────────────────────────
  const handleAssignEscort = useCallback(() => {
    if (selectedRoutes.size === 0) { toast.info("Please select at least one route to assign an escort."); return; }
    if (selectedRoutes.size > 1)   { toast.info("Please select only one route to assign an escort."); return; }
    setEscortRouteId(Array.from(selectedRoutes)[0]);
    setIsEscortModalOpen(true);
  }, [selectedRoutes, toast]);

  // ── Dispatch ───────────────────────────────────────────────────────────────
  const handleDispatchClick = useCallback(() => {
    if (selectedRoutes.size === 0) { toast.info("Please select at least one route to dispatch."); return; }
    setIsDispatchModalOpen(true);
  }, [selectedRoutes, toast]);

  // ── Sync ───────────────────────────────────────────────────────────────────
  const handleSync = useCallback(async () => {
    try {
      setLoading(true); setUnroutedLoading(true);
      await Promise.all([fetchRouteData(), fetchUnroutedBookings()]);
      toast.success("Data synced successfully");
    } catch {
      toast.error("Failed to sync data. Please try again.");
    }
  }, [fetchRouteData, fetchUnroutedBookings, toast]);

  // ── Create route ───────────────────────────────────────────────────────────
  const handleCreateRouteClick = useCallback(async () => {
    if (selectedBookings.size === 0) { toast.info("Please select at least one booking to create a route."); return; }
    setIsCreatingRoute(true);
    try {
      const response = await API_CLIENT.post("/routes/new-route", {
        booking_ids: Array.from(selectedBookings), optimize: true,
      });
      if (response.data?.success) {
        const newRoute = response.data?.data;
        toast.success(`Route created successfully${newRoute?.route_code ? ` — ${newRoute.route_code}` : ""}`);
        await fetchRouteData();
        await fetchUnroutedBookings();
        clearAllSelections();
      } else {
        throw new Error(response.data?.message || "Failed to create route");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create route. Please try again.");
    } finally {
      setIsCreatingRoute(false);
    }
  }, [selectedBookings, fetchRouteData, fetchUnroutedBookings, clearAllSelections, toast]);

  const handleRefreshData = useCallback(() => {
    fetchRouteData();
    fetchUnroutedBookings();
    clearAllSelections();
  }, [fetchRouteData, fetchUnroutedBookings, clearAllSelections]);

  const selectedRouteObjects = useMemo(() =>
    Array.from(selectedRoutes)
      .map((id) => routeData.find((r) => r.route_id === id))
      .filter(Boolean),
    [selectedRoutes, routeData]
  );

  // ── Loading / error screens ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-full bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
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
          <button onClick={handleRefreshData} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
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
        {locationError && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-red-50 border border-red-200 text-red-700 text-xs font-medium px-4 py-2 rounded-lg shadow-md flex items-center gap-2 whitespace-nowrap">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {locationError}
          </div>
        )}
        <APIProvider apiKey={API_KEY}>
          <Map
            defaultCenter={companyLocation ?? { lat: 20.5937, lng: 78.9629 }}
            defaultZoom={companyLocation ? 11 : 5}
            mapId="company-route-map"
            gestureHandling="greedy"
            style={{ width: "100%", height: "100%" }}
            fullscreenControl={false}
            streetViewControl={false}
            mapTypeControl={false}
          >
            {companyLocation && <CompanyMarker position={companyLocation} />}
            {Array.from(selectedRoutes).map((routeId, routeIndex) => {
              const route = routeData.find((r) => r.route_id === routeId);
              if (!route) return null;
              const color = getRouteColor(routeIndex);
              return (
                <div key={`route-${routeId}`}>
                  <RouteDirections route={route} logType={logType} color={color} routeIndex={routeIndex} />
                  <RouteMarkers    route={route} logType={logType} color={color} routeIndex={routeIndex} />
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
                  <BookingMarkers    booking={booking} color={color} bookingIndex={bookingIndex} />
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
            onAssignEscort={handleAssignEscort}
            onAssignVehicle={handleAssignVehicle}
            onDispatch={handleDispatchClick}
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
                    showEscortButton={false}
                    tenantId={tenantId}
                    onToast={toast}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">{routeData.length === 0 ? "📭" : "🔍"}</div>
                <p className="text-lg font-semibold text-gray-700">
                  {routeData.length === 0 ? "No routes found" : "No matching routes"}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {routeData.length === 0
                    ? "There are no routes available for the selected shift and date."
                    : "Try adjusting your search terms or clear the search to see all routes."}
                </p>
                <button onClick={handleRefreshData} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
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
        tenantId={tenantId}
        isAssigning={isAssigningVehicle}
      />

      <AssignEscortModal
        isOpen={isEscortModalOpen}
        onClose={() => setIsEscortModalOpen(false)}
        routeId={escortRouteId}
        triggerReason="Manual assignment"
        tenantId={tenantId}
        onSuccess={async () => {
          setIsEscortModalOpen(false);
          setEscortRouteId(null);
          await fetchRouteData();
          clearAllSelections();
        }}
      />

      <BulkDispatchModal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        routes={selectedRouteObjects}
        tenantId={tenantId}
        onSuccess={handleRefreshData}
        shiftId={shiftId}
        shiftCode={shiftId}
        bookingDate={date}
      />

      {/* ── NEW: driver rest block modal (409) ── */}
      {restBlockData && (
        <DriverRestBlockModal
          data={restBlockData}
          onClose={() => setRestBlockData(null)}
        />
      )}

      {/* Toast notification system */}
      <Toast toasts={toasts} onDismiss={dismiss} />
    </div>
  );
};

export default ShiftRoutingManagement;
import React, { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  MapPin,
  Clock,
  User,
  Truck,
  Building,
  Navigation,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  Info,
  Edit,
  Users,
} from "lucide-react";
import ReusableButton from "../ui/ReusableButton";
import ConfirmationModal from "../modals/ConfirmationModal";
import { API_CLIENT } from "../../Api/API_Client";
import BookingCard from "../ui/BookingCard";
import { logDebug, logError } from "../../utils/logger";
import RouteEditModal from "../RouteManagement/Routeeditmodal";

const CHIP_COLORS = [
  { bg: "#ede9fe", text: "#5b21b6", border: "#7c3aed" },
  { bg: "#dbeafe", text: "#1e40af", border: "#2563eb" },
  { bg: "#d1fae5", text: "#065f46", border: "#059669" },
  { bg: "#fef3c7", text: "#92400e", border: "#d97706" },
  { bg: "#ffe4e6", text: "#9f1239", border: "#e11d48" },
  { bg: "#e0f2fe", text: "#0369a1", border: "#0284c7" },
  { bg: "#f3e8ff", text: "#7e22ce", border: "#9333ea" },
];

const getChipColor = (code = "") => {
  const sum = code.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return CHIP_COLORS[sum % CHIP_COLORS.length];
};

const getCodeInitials = (code = "") => {
  const letters = code.replace(/\d/g, "");
  const digits = code.replace(/\D/g, "");
  if (letters && digits) return (letters[0] + digits.slice(-1)).toUpperCase();
  return code.slice(0, 2).toUpperCase();
};

const shortLocation = (loc = "") => loc.split(",")[0].trim();

const EmployeeChip = ({ stop, zIndex }) => {
  const [hovered, setHovered] = useState(false);
  const color = getChipColor(stop.employee_code);

  return (
    <div
      style={{ position: "relative", display: "inline-flex", zIndex }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          width: 26, height: 26, borderRadius: "50%",
          background: color.bg,
          border: `2px solid ${hovered ? color.border : "#fff"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 10, fontWeight: 800, color: color.text,
          cursor: "pointer",
          transition: "transform 0.15s, box-shadow 0.15s, border-color 0.15s",
          transform: hovered ? "scale(1.18) translateY(-2px)" : "scale(1)",
          boxShadow: hovered ? `0 3px 10px ${color.border}55` : "0 1px 3px rgba(0,0,0,0.12)",
          userSelect: "none", flexShrink: 0,
        }}
      >
        {getCodeInitials(stop.employee_code)}
      </div>

      {hovered && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 8px)", left: "50%",
          transform: "translateX(-50%)", background: "#1e293b", color: "#f8fafc",
          borderRadius: 9, padding: "8px 12px", whiteSpace: "nowrap",
          fontSize: 12, zIndex: 9999, pointerEvents: "none",
          boxShadow: "0 6px 20px rgba(0,0,0,0.28)",
        }}>
          <div style={{ fontWeight: 800, marginBottom: 3 }}>{stop.employee_code}</div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>📍 {shortLocation(stop.pickup_location)}</div>
          <div style={{
            position: "absolute", top: "100%", left: "50%",
            transform: "translateX(-50%)", borderWidth: "5px 5px 0",
            borderStyle: "solid", borderColor: "#1e293b transparent transparent",
          }} />
        </div>
      )}
    </div>
  );
};

const EmployeeMiniCard = ({ stop }) => {
  const color = getChipColor(stop.employee_code);
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 8,
      background: "#fff", border: `1px solid ${color.border}33`,
      borderRadius: 8, padding: "6px 10px", minWidth: 175, flexShrink: 0,
    }}>
      <div style={{
        width: 26, height: 26, borderRadius: "50%",
        background: color.bg, color: color.text,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 10, fontWeight: 800, flexShrink: 0, marginTop: 1,
      }}>
        {getCodeInitials(stop.employee_code)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 11, color: "#1e293b", marginBottom: 3 }}>
          {stop.employee_code}
          {stop.employee_name && (
            <span style={{ fontWeight: 400, color: "#64748b", marginLeft: 4 }}>
              · {stop.employee_name}
            </span>
          )}
        </div>
        <div style={{ fontSize: 10, color: "#64748b", display: "flex", alignItems: "center", gap: 3, marginBottom: 2 }}>
          <MapPin size={8} color="#22c55e" />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 110 }}>
            {shortLocation(stop.pickup_location || "N/A")}
          </span>
        </div>
        <div style={{ fontSize: 10, color: "#64748b", display: "flex", alignItems: "center", gap: 3 }}>
          <MapPin size={8} color="#ef4444" />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 110 }}>
            {shortLocation(stop.drop_location || "N/A")}
          </span>
        </div>
      </div>
      <span style={{
        width: 7, height: 7, borderRadius: "50%", flexShrink: 0, marginTop: 4,
        background: stop.status === "Scheduled" ? "#22c55e" : "#f59e0b",
      }} />
    </div>
  );
};

const OverflowPopover = ({ stops }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-flex" }}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        style={{
          width: 26, height: 26, borderRadius: "50%",
          background: open ? "#1e3a5f" : "#f1f5f9",
          border: `2px solid ${open ? "#2563eb" : "#e2e8f0"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 10, fontWeight: 800, color: open ? "#fff" : "#475569",
          cursor: "pointer", transition: "all 0.15s", flexShrink: 0, fontFamily: "inherit",
        }}
      >
        +{stops.length}
      </button>
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute", bottom: "calc(100% + 10px)", left: "50%",
            transform: "translateX(-50%)", background: "#fff",
            borderRadius: 12, border: "1px solid #e2e8f0",
            boxShadow: "0 8px 32px rgba(0,0,0,0.14)", zIndex: 9999,
            minWidth: 220, overflow: "hidden",
          }}
        >
          <div style={{ padding: "8px 12px", borderBottom: "1px solid #f1f5f9", fontSize: 11, fontWeight: 700, color: "#94a3b8", display: "flex", alignItems: "center", gap: 5 }}>
            <Users size={10} /> {stops.length} more employee{stops.length !== 1 ? "s" : ""}
          </div>
          <div style={{ maxHeight: 200, overflowY: "auto" }}>
            {stops.map((stop) => {
              const color = getChipColor(stop.employee_code);
              return (
                <div key={stop.booking_id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px" }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: color.bg, color: color.text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800 }}>
                    {getCodeInitials(stop.employee_code)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 12, color: "#1e293b" }}>{stop.employee_code}</div>
                    <div style={{ fontSize: 10, color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      📍 {shortLocation(stop.pickup_location)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", borderWidth: "6px 6px 0", borderStyle: "solid", borderColor: "#fff transparent transparent" }} />
        </div>
      )}
    </div>
  );
};

const SavedRouteCard = ({
  route,
  isSelected,
  onRouteSelect,
  selectedBookings,
  onBookingSelect,
  OnOperation,
  detachBooking,
  onRouteUpdate,
}) => {
  const [isEmployeeExpanded, setIsEmployeeExpanded] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDeleteRouteModal, setShowDeleteRouteModal] = useState(false);
  const [showUpdateRouteModal, setShowUpdateRouteModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const renderSafeValue = (value, fallback = "N/A") => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === "object") {
      if (value.name) return value.name;
      return JSON.stringify(value);
    }
    return value;
  };

  const canDeleteRoute = () => {
    if (route.status?.toLowerCase() === "completed") {
      setAlertMessage("This route cannot be deleted as it has been completed.");
      return false;
    }
    if (route.driver?.name && route.driver.name !== "Not assigned") {
      setAlertMessage("This route cannot be deleted as a driver has already been assigned.");
      return false;
    }
    return true;
  };

  const handleDeleteRouteClick = () => {
    if (!canDeleteRoute()) { setShowAlertModal(true); return; }
    setShowDeleteRouteModal(true);
  };

  const handleUpdateRouteClick = () => {
    if (!selectedBookings || selectedBookings.size === 0) {
      setAlertMessage("Please select at least one booking to add to this route.");
      setShowAlertModal(true);
      return;
    }
    setShowUpdateRouteModal(true);
  };

  const handleBookingDetach = async (booking_id, stop, routeId) => {
    try {
      await API_CLIENT.put(`/routes/${routeId}`, { operation: "remove", booking_ids: [booking_id] });
      detachBooking();
    } catch (error) {
      logError("Failed to detach booking:", error);
      alert("Failed to detach booking. Please try again.");
    }
  };

  const confirmDeleteRoute = async () => {
    try {
      await API_CLIENT.delete(`/routes/${route.route_id}`);
      OnOperation();
      setShowDeleteRouteModal(false);
    } catch (error) {
      alert("Failed to delete route. Please try again.");
    }
  };

  const confirmUpdateRoute = async () => {
    try {
      const bookingIdsArray = Array.from(selectedBookings);
      await API_CLIENT.put(`/routes/${route.route_id}`, { operation: "add", booking_ids: bookingIdsArray });
      OnOperation();
      setShowUpdateRouteModal(false);
      if (onRouteUpdate) onRouteUpdate(route);
    } catch (error) {
      logError("Failed to update route:", error);
      alert("Failed to update route. Please try again.");
    }
  };

  const handleRouteClick = (e) => {
    if (e.target.closest("button") || e.target.closest('input[type="checkbox"]')) return;
    onRouteSelect(route.route_id);
  };

  const handleBookingClick = (e, bookingId) => {
    if (e.target.closest("button")) return;
    onBookingSelect && onBookingSelect(bookingId);
  };

  const handleModalSave = () => {
    OnOperation();
  };

  const getStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case "ongoing":   return { color: "bg-blue-100 text-blue-700 border-blue-200",   icon: <PlayCircle className="w-3 h-3" /> };
      case "completed": return { color: "bg-green-100 text-green-700 border-green-200", icon: <CheckCircle2 className="w-3 h-3" /> };
      case "cancelled": return { color: "bg-red-100 text-red-700 border-red-200",       icon: <AlertCircle className="w-3 h-3" /> };
      default:          return { color: "bg-gray-100 text-gray-700 border-gray-200",    icon: <AlertCircle className="w-3 h-3" /> };
    }
  };

  const isDeleteDisabled =
    route.status?.toLowerCase() === "completed" ||
    (route.driver?.name && route.driver.name !== "Not assigned");

  const routeStatusInfo = getStatusInfo(route.status);
  const stops = route.stops || [];
  const maxChips = 5;
  const visibleChips = stops.slice(0, maxChips);
  const overflowChips = stops.slice(maxChips);

  const hasDriver = route.driver?.name && route.driver.name !== "Not assigned";
  const hasVehicle = route.vehicle?.rc_number && route.vehicle.rc_number !== "Not assigned";

  return (
    <>
      <style>{`
        .emp-mini-scroll::-webkit-scrollbar { height: 4px; }
        .emp-mini-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
        .chips-row:hover .chips-label { color: #7c3aed !important; }
        .chips-row:hover .chips-label strong { color: #7c3aed !important; }
      `}</style>

      {/* ✅ overflow-x:hidden on outer card prevents horizontal scrollbar */}
      <div
        className={`bg-white border rounded-lg transition-all cursor-pointer overflow-x-hidden ${
          isSelected ? "border-purple-500 shadow-md bg-purple-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
        } ${isDeleteDisabled ? "opacity-80" : ""}`}
        onClick={handleRouteClick}
      >
        <div className="p-2.5">
          <div className="flex items-start gap-2">

            <div className="mt-1 w-3 h-3 flex-shrink-0 flex items-center justify-center">
              {isSelected && <div className="w-2.5 h-2.5 bg-purple-600 rounded-full" />}
            </div>

            <div className="flex-1 min-w-0 space-y-1.5">

              {/* ══ ROW 1 ══ */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-sm text-gray-900">
                  ID {renderSafeValue(route.route_id)}
                </span>

                <span className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded border ${routeStatusInfo.color}`}>
                  {routeStatusInfo.icon}
                  {renderSafeValue(route.status)}
                </span>

                {hasDriver && route.status?.toLowerCase() !== "completed" && (
                  <>
                    <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded border bg-orange-50 text-orange-700 border-orange-200">
                      <User className="w-3 h-3" />
                      <span className="truncate max-w-[90px]">{route.driver.name}</span>
                    </span>
                    {hasVehicle && (
                      <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded border bg-green-50 text-green-700 border-green-200">
                        <Truck className="w-3 h-3" />
                        <span className="truncate max-w-[80px]">{route.vehicle.rc_number}</span>
                      </span>
                    )}
                  </>
                )}

                {route.status?.toLowerCase() === "completed" && (
                  <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded border bg-yellow-100 text-yellow-700 border-yellow-200">
                    <Info className="w-3 h-3" /> Read Only
                  </span>
                )}

                <div className="flex-1" />

                <div className="flex items-center gap-0.5">
                  {onRouteUpdate && (
                    <ReusableButton module="route" action="update" icon={Edit} title="Update route"
                      onClick={handleUpdateRouteClick} size={14}
                      className="p-1 rounded text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors" />
                  )}
                  <ReusableButton module="route" action="delete" icon={Trash2}
                    title={isDeleteDisabled ? "Delete restricted" : "Delete route"}
                    onClick={handleDeleteRouteClick} size={14} disabled={isDeleteDisabled}
                    className={`p-1 rounded transition-colors ${isDeleteDisabled ? "text-gray-300 cursor-not-allowed" : "text-red-500 hover:text-red-700 hover:bg-red-50"}`}
                  />
                </div>
              </div>

              {/* ══ ROW 2 ══ */}
              <div className="flex items-center gap-1.5 flex-wrap text-xs text-gray-600">
                {!hasDriver && (
                  <>
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3 text-purple-400 flex-shrink-0" />
                      <span className="truncate max-w-[90px]">No driver</span>
                    </div>
                    <span className="text-gray-300">·</span>
                    <div className="flex items-center gap-1">
                      <Truck className="w-3 h-3 text-green-400 flex-shrink-0" />
                      <span className="truncate max-w-[80px]">No vehicle</span>
                    </div>
                    <span className="text-gray-300">·</span>
                  </>
                )}
                <div className="flex items-center gap-1">
                  <Building className="w-3 h-3 text-orange-400 flex-shrink-0" />
                  <span className="truncate max-w-[80px]">{renderSafeValue(route.vendor?.name, "No vendor")}</span>
                </div>
                {route.summary?.total_distance_km && <>
                  <span className="text-gray-300">·</span>
                  <div className="flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-green-400 flex-shrink-0" />
                    <span>{route.summary.total_distance_km} km</span>
                  </div>
                </>}
                {route.summary?.total_time_minutes && <>
                  <span className="text-gray-300">·</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-blue-400 flex-shrink-0" />
                    <span>{route.summary.total_time_minutes} min</span>
                  </div>
                </>}
                <span className="text-gray-300">·</span>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-red-400 flex-shrink-0" />
                  <span>{stops.length} stops</span>
                </div>
              </div>

              {/* ══ ROW 3 ══ */}
              {stops.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">

                    {/* ✅ Removed -mx-1 (was causing horizontal overflow). Kept hover highlight via padding only. */}
                    <div
                      className="chips-row flex items-center gap-1.5 cursor-pointer rounded px-1 py-0.5 hover:bg-purple-50 transition-colors"
                      title="Click to view & edit bookings"
                      onClick={(e) => { e.stopPropagation(); setIsEditModalOpen(true); }}
                    >
                      <div className="flex items-center">
                        {visibleChips.map((stop, i) => (
                          <div key={stop.booking_id} style={{ marginLeft: i === 0 ? 0 : -7, position: "relative", zIndex: visibleChips.length - i }}>
                            <EmployeeChip stop={stop} zIndex={visibleChips.length - i} />
                          </div>
                        ))}
                        {overflowChips.length > 0 && (
                          <div style={{ marginLeft: -7, position: "relative", zIndex: 0 }}>
                            <OverflowPopover stops={overflowChips} />
                          </div>
                        )}
                      </div>
                      <span className="chips-label text-xs text-gray-500 ml-1 transition-colors">
                        <strong className="text-gray-700">{stops.length}</strong> employee{stops.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="flex-1" />

                    <button
                      onClick={(e) => { e.stopPropagation(); setIsEmployeeExpanded(!isEmployeeExpanded); }}
                      className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 hover:bg-purple-50 px-2 py-0.5 rounded transition-colors"
                    >
                      {isEmployeeExpanded ? "Hide details" : "Show details"}
                      {isEmployeeExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                    </button>
                  </div>

                  {isEmployeeExpanded && (
                    <div
                      className="emp-mini-scroll"
                      style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, paddingTop: 2 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {stops.map((stop) => (
                        <EmployeeMiniCard key={stop.booking_id} stop={stop} />
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      <RouteEditModal
        route={route}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleModalSave}
        selectedBookings={selectedBookings}
        onBookingSelect={onBookingSelect}
        onRemoveFromRoute={(bookingId, stop) => handleBookingDetach(bookingId, stop, route.route_id)}
        isDeleteDisabled={isDeleteDisabled}
      />

      <ConfirmationModal show={showDeleteRouteModal} title="Delete Route"
        message="Are you sure you want to delete this entire route? This action cannot be undone."
        onConfirm={confirmDeleteRoute} onCancel={() => setShowDeleteRouteModal(false)} />

      <ConfirmationModal show={showUpdateRouteModal} title="Update Route"
        message={`Are you sure you want to add ${selectedBookings?.size || 0} booking${selectedBookings?.size !== 1 ? "s" : ""} to route ${route.route_code}?`}
        onConfirm={confirmUpdateRoute} onCancel={() => setShowUpdateRouteModal(false)} confirmText="Add Bookings" />

      <ConfirmationModal show={showAlertModal} title="Action Restricted" message={alertMessage}
        onConfirm={() => { setShowAlertModal(false); setAlertMessage(""); }}
        onCancel={() => { setShowAlertModal(false); setAlertMessage(""); }}
        confirmText="OK" showCancel={false} />
    </>
  );
};

export default SavedRouteCard;
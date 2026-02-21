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

// ─────────────────────────────────────────────────────────────────────────────
// Employee Chip Helpers  (uses only employee_code — no name needed)
// ─────────────────────────────────────────────────────────────────────────────

const CHIP_COLORS = [
  { bg: "#ede9fe", text: "#5b21b6", border: "#7c3aed" },
  { bg: "#dbeafe", text: "#1e40af", border: "#2563eb" },
  { bg: "#d1fae5", text: "#065f46", border: "#059669" },
  { bg: "#fef3c7", text: "#92400e", border: "#d97706" },
  { bg: "#ffe4e6", text: "#9f1239", border: "#e11d48" },
  { bg: "#e0f2fe", text: "#0369a1", border: "#0284c7" },
  { bg: "#f3e8ff", text: "#7e22ce", border: "#9333ea" },
];

// Deterministic color from employee_code — same code always = same color
const getChipColor = (code = "") => {
  const sum = code.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return CHIP_COLORS[sum % CHIP_COLORS.length];
};

// "EMP455" → "E5"  |  "DRV12" → "D2"  |  "ABC" → "AB"
const getCodeInitials = (code = "") => {
  const letters = code.replace(/\d/g, "");
  const digits  = code.replace(/\D/g, "");
  if (letters && digits) return (letters[0] + digits.slice(-1)).toUpperCase();
  return code.slice(0, 2).toUpperCase();
};

// "Hebbal, Outer Ring Rd, ..." → "Hebbal"
const shortLocation = (loc = "") => loc.split(",")[0].trim();

// ─────────────────────────────────────────────────────────────────────────────
// EmployeeChip — single avatar circle with hover tooltip
// ─────────────────────────────────────────────────────────────────────────────
const EmployeeChip = ({ stop, zIndex }) => {
  const [hovered, setHovered] = useState(false);
  const color = getChipColor(stop.employee_code);

  return (
    <div
      style={{ position: "relative", display: "inline-flex", zIndex }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Avatar */}
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: color.bg,
          border: `2px solid ${hovered ? color.border : "#fff"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 10,
          fontWeight: 800,
          color: color.text,
          cursor: "default",
          transition: "transform 0.15s, box-shadow 0.15s, border-color 0.15s",
          transform: hovered ? "scale(1.18) translateY(-2px)" : "scale(1)",
          boxShadow: hovered
            ? `0 3px 10px ${color.border}55`
            : "0 1px 3px rgba(0,0,0,0.12)",
          userSelect: "none",
          flexShrink: 0,
        }}
      >
        {getCodeInitials(stop.employee_code)}
      </div>

      {/* Tooltip — only mounted on hover */}
      {hovered && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 10px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#1e293b",
            color: "#f8fafc",
            borderRadius: 9,
            padding: "8px 12px",
            whiteSpace: "nowrap",
            fontSize: 12,
            zIndex: 9999,
            pointerEvents: "none",
            boxShadow: "0 6px 20px rgba(0,0,0,0.28)",
            animation: "empChipTipIn 0.12s ease",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span
              style={{
                background: color.bg,
                color: color.text,
                borderRadius: 5,
                padding: "1px 7px",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.04em",
              }}
            >
              {stop.employee_code}
            </span>
            <span
              style={{
                fontSize: 10,
                padding: "1px 6px",
                background: stop.status === "Scheduled" ? "#d1fae5" : "#fef3c7",
                color: stop.status === "Scheduled" ? "#065f46" : "#92400e",
                borderRadius: 5,
                fontWeight: 600,
              }}
            >
              {stop.status}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#94a3b8", fontSize: 11 }}>
            <MapPin size={10} color="#64748b" />
            {shortLocation(stop.pickup_location)}
          </div>
          <div style={{ color: "#64748b", fontSize: 10, marginTop: 2 }}>
            Stop #{stop.order_id}
            {stop.estimated_distance ? ` · ${stop.estimated_distance} km` : ""}
          </div>
          {/* Arrow */}
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              borderWidth: "5px 5px 0",
              borderStyle: "solid",
              borderColor: "#1e293b transparent transparent",
            }}
          />
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// OverflowPopover — "+N" badge that opens a dropdown listing hidden employees
// ─────────────────────────────────────────────────────────────────────────────
const OverflowPopover = ({ stops }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-flex" }}>
      {/* +N button */}
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: open ? "#1e3a5f" : "#f1f5f9",
          border: `2px solid ${open ? "#2563eb" : "#e2e8f0"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 10,
          fontWeight: 800,
          color: open ? "#fff" : "#475569",
          cursor: "pointer",
          transition: "all 0.15s",
          flexShrink: 0,
          fontFamily: "inherit",
        }}
      >
        +{stops.length}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            bottom: "calc(100% + 10px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#fff",
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
            zIndex: 9999,
            minWidth: 230,
            overflow: "hidden",
            animation: "empPopoverIn 0.15s ease",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "9px 14px",
              borderBottom: "1px solid #f1f5f9",
              fontSize: 11,
              fontWeight: 700,
              color: "#94a3b8",
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Users size={11} color="#94a3b8" />
            {stops.length} more employee{stops.length !== 1 ? "s" : ""}
          </div>

          {/* List */}
          <div style={{ maxHeight: 210, overflowY: "auto" }}>
            {stops.map((stop) => {
              const color = getChipColor(stop.employee_code);
              return (
                <div
                  key={stop.booking_id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 14px",
                    transition: "background 0.1s",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      background: color.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      fontWeight: 800,
                      color: color.text,
                      flexShrink: 0,
                    }}
                  >
                    {getCodeInitials(stop.employee_code)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 12, color: "#1e293b", letterSpacing: "0.03em" }}>
                      {stop.employee_code}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#94a3b8",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      Stop #{stop.order_id} · 📍 {shortLocation(stop.pickup_location)}
                    </div>
                  </div>
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: stop.status === "Scheduled" ? "#22c55e" : "#f59e0b",
                      flexShrink: 0,
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Arrow */}
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              borderWidth: "6px 6px 0",
              borderStyle: "solid",
              borderColor: "#fff transparent transparent",
              filter: "drop-shadow(0 1px 0 #e2e8f0)",
            }}
          />
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// EmployeeStrip — full chip row: avatars + overflow + count label
// ─────────────────────────────────────────────────────────────────────────────
const EmployeeStrip = ({ stops = [], maxVisible = 5 }) => {
  if (!stops.length) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Users size={13} color="#cbd5e1" />
        <span style={{ fontSize: 12, color: "#cbd5e1" }}>No employees assigned</span>
      </div>
    );
  }

  const sorted   = [...stops].sort((a, b) => (a.order_id ?? 0) - (b.order_id ?? 0));
  const visible  = sorted.slice(0, maxVisible);
  const overflow = sorted.slice(maxVisible);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        {visible.map((stop, i) => (
          <div
            key={stop.booking_id}
            style={{ marginLeft: i === 0 ? 0 : -8, position: "relative", zIndex: visible.length - i }}
          >
            <EmployeeChip stop={stop} zIndex={visible.length - i} />
          </div>
        ))}
        {overflow.length > 0 && (
          <div style={{ marginLeft: -8, position: "relative", zIndex: 0 }}>
            <OverflowPopover stops={overflow} />
          </div>
        )}
      </div>
      <span style={{ fontSize: 12, color: "#64748b", marginLeft: 4, userSelect: "none" }}>
        <strong style={{ color: "#374151" }}>{stops.length}</strong>{" "}
        employee{stops.length !== 1 ? "s" : ""}
      </span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SavedRouteCard — your original component unchanged except the preview section
// ─────────────────────────────────────────────────────────────────────────────
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
  const [isExpanded, setIsExpanded] = useState(false);
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
      setAlertMessage(
        "This route cannot be deleted as a driver has already been assigned. To override this restriction, please contact the vendor."
      );
      return false;
    }
    return true;
  };

  const canDeleteBooking = (stop) => {
    if (route.status?.toLowerCase() === "completed") {
      setAlertMessage("Bookings cannot be removed from a completed route.");
      return false;
    }
    if (route.driver?.name && route.driver.name !== "Not assigned") {
      setAlertMessage(
        "Bookings cannot be removed as a driver has already been assigned to this route. To make changes, please contact the vendor."
      );
      return false;
    }
    return true;
  };

  const handleDeleteRouteClick = (e) => {
    if (!canDeleteRoute()) {
      setShowAlertModal(true);
      return;
    }
    setShowDeleteRouteModal(true);
  };

  const handleUpdateRouteClick = (e) => {
    logDebug(" selectedBookings:", selectedBookings);
    if (!selectedBookings || selectedBookings.size === 0) {
      setAlertMessage("Please select at least one booking to add to this route.");
      setShowAlertModal(true);
      return;
    }
    setShowUpdateRouteModal(true);
  };

  const handleBookingDetach = async (booking_id, stop, routeId) => {
    logDebug("Detaching booking:", booking_id, "from route:", routeId);
    logDebug(" this is the booking id to be removed:", booking_id);
    try {
      await API_CLIENT.put(`/routes/${routeId}`, {
        operation: "remove",
        booking_ids: [booking_id],
      });
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
      console.error("Failed to delete route:", error);
      alert("Failed to delete route. Please try again.");
    }
  };

  const cancelDeleteRoute = () => {
    setShowDeleteRouteModal(false);
  };

  const closeAlertModal = () => {
    setShowAlertModal(false);
    setAlertMessage("");
  };

  const handleRouteClick = (e) => {
    if (
      e.target.closest("button") ||
      e.target.closest('input[type="checkbox"]')
    ) {
      return;
    }
    onRouteSelect(route.route_id);
  };

  const handleBookingClick = (e, bookingId) => {
    if (e.target.closest("button")) {
      return;
    }
    onBookingSelect && onBookingSelect(bookingId);
  };

  const handleExpandClick = (e) => {
    setIsExpanded(!isExpanded);
  };

  const renderResourceInfo = (icon, value, label, fallback = "Not assigned") => {
    return (
      <div className="flex items-center gap-1.5 text-xs">
        {icon}
        <span className="text-gray-600">{label}:</span>
        <span className={`font-medium ${value ? "text-gray-900" : "text-gray-400"}`}>
          {renderSafeValue(value, fallback)}
        </span>
      </div>
    );
  };

  const renderSummaryStat = (icon, value, label, unit = "") => {
    return (
      <div className="flex items-center gap-1.5 text-xs">
        {icon}
        <span className="text-gray-600">{label}:</span>
        <span className="font-medium text-gray-900">
          {renderSafeValue(value)}{unit}
        </span>
      </div>
    );
  };

  const getStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case "ongoing":
        return {
          color: "bg-blue-100 text-blue-700 border-blue-200",
          icon: <PlayCircle className="w-3 h-3" />,
        };
      case "completed":
        return {
          color: "bg-green-100 text-green-700 border-green-200",
          icon: <CheckCircle2 className="w-3 h-3" />,
        };
      case "cancelled":
        return {
          color: "bg-red-100 text-red-700 border-red-200",
          icon: <AlertCircle className="w-3 h-3" />,
        };
      default:
        return {
          color: "bg-gray-100 text-gray-700 border-gray-200",
          icon: <AlertCircle className="w-3 h-3" />,
        };
    }
  };

  const confirmUpdateRoute = async () => {
    try {
      const bookingIdsArray = Array.from(selectedBookings);
      const updateData = {
        operation: "add",
        booking_ids: bookingIdsArray,
      };
      console.log("Update Route Data:", updateData);
      await API_CLIENT.put(`/routes/${route.route_id}`, updateData);
      OnOperation();
      setShowUpdateRouteModal(false);
      if (onRouteUpdate) {
        onRouteUpdate(route);
      }
    } catch (error) {
      logError("Failed to update route:", error);
      alert("Failed to update route. Please try again.");
    }
  };

  const cancelUpdateRoute = () => {
    setShowUpdateRouteModal(false);
  };

  const isDeleteDisabled =
    route.status?.toLowerCase() === "completed" ||
    (route.driver?.name && route.driver.name !== "Not assigned");

  const routeStatusInfo = getStatusInfo(route.status);

  return (
    <>
      {/* Scoped keyframe animations */}
      <style>{`
        @keyframes empChipTipIn {
          from { opacity: 0; transform: translateX(-50%) translateY(4px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes empPopoverIn {
          from { opacity: 0; transform: translateX(-50%) scale(0.94); }
          to   { opacity: 1; transform: translateX(-50%) scale(1); }
        }
      `}</style>

      <div
        className={`bg-white border rounded-lg transition-all cursor-pointer ${
          isSelected
            ? "border-purple-500 shadow-md bg-purple-50"
            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
        } ${isDeleteDisabled ? "opacity-80" : ""}`}
        onClick={handleRouteClick}
      >
        {/* Route Header */}
        <div className="p-3">
          <div className="flex items-start gap-3">
            {/* Selection Indicator */}
            <div className="mt-1 w-4 h-4 flex items-center justify-center">
              {isSelected && (
                <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
              )}
            </div>

            {/* Route Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">
                    ID {renderSafeValue(route.route_id)}
                  </span>
                  <span
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded border ${routeStatusInfo.color}`}
                  >
                    {routeStatusInfo.icon}
                    {renderSafeValue(route.status)}
                  </span>

                  {route.status?.toLowerCase() === "completed" && (
                    <span className="flex items-center gap-1 text-xs px-2 py-1 rounded border bg-yellow-100 text-yellow-700 border-yellow-200">
                      <Info className="w-3 h-3" />
                      Read Only
                    </span>
                  )}
                  {route.driver?.name &&
                    route.driver.name !== "Not assigned" &&
                    route.status?.toLowerCase() !== "completed" && (
                      <span className="flex items-center gap-1 text-xs px-2 py-1 rounded border bg-orange-100 text-orange-700 border-orange-200">
                        <User className="w-3 h-3" />
                        Driver Assigned
                      </span>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1">
                  {onRouteUpdate && (
                    <ReusableButton
                      module="route"
                      action="update"
                      icon={Edit}
                      title="Update route details"
                      onClick={handleUpdateRouteClick}
                      size={16}
                      className="p-1.5 rounded transition-colors text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                    />
                  )}
                  <ReusableButton
                    module="route"
                    action="delete"
                    icon={Trash2}
                    title={
                      isDeleteDisabled
                        ? "Delete restricted - check route status or driver assignment"
                        : "Delete entire route"
                    }
                    onClick={handleDeleteRouteClick}
                    size={16}
                    className={`p-1.5 rounded transition-colors group ${
                      isDeleteDisabled
                        ? "text-gray-400 cursor-not-allowed hover:bg-gray-50"
                        : "text-red-500 hover:text-red-700 hover:bg-red-50"
                    }`}
                    disabled={isDeleteDisabled}
                  />
                  {/* Plain button — expand/collapse is a UI toggle, not a permission-gated action */}
                  <button
                    title={isExpanded ? "Collapse" : "Expand"}
                    onClick={handleExpandClick}
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-600"
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Resource Information */}
              <div className="flex flex-wrap gap-3 mb-2">
                {renderResourceInfo(
                  <User className="w-3 h-3 text-purple-500" />,
                  route.driver?.name,
                  "Driver"
                )}
                {renderResourceInfo(
                  <Truck className="w-3 h-3 text-green-500" />,
                  route.vehicle?.rc_number,
                  "Vehicle"
                )}
                {renderResourceInfo(
                  <Building className="w-3 h-3 text-orange-500" />,
                  route.vendor?.name,
                  "Vendor"
                )}
              </div>

              {/* Route Summary */}
              {route.summary && (
                <div className="flex flex-wrap gap-3 mb-2 p-2 bg-gray-50 rounded border border-gray-200">
                  {renderSummaryStat(
                    <Navigation className="w-3 h-3 text-green-500" />,
                    route.summary.total_distance_km,
                    "Distance",
                    " km"
                  )}
                  {renderSummaryStat(
                    <Clock className="w-3 h-3 text-blue-500" />,
                    route.summary.total_time_minutes,
                    "Time",
                    " min"
                  )}
                  <div className="flex items-center gap-1.5 text-xs">
                    <MapPin className="w-3 h-3 text-red-500" />
                    <span className="text-gray-600">Stops:</span>
                    <span className="font-medium text-gray-900">
                      {route.stops?.length || 0}
                    </span>
                  </div>
                </div>
              )}

              {/* ✅ REPLACED: old text preview → Employee Chip Strip */}
              {!isExpanded && route.stops && (
                <div className="mt-1 px-2 py-2 bg-slate-50 rounded-lg border border-slate-100">
                  <EmployeeStrip stops={route.stops} maxVisible={5} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Expanded Stop List — completely unchanged */}
        {isExpanded && route.stops && (
          <div className="border-t border-gray-200 bg-gray-50 p-3">
            <div className="space-y-2">
              {route.stops.map((stop, index) => (
                <BookingCard
                  key={stop.booking_id}
                  stop={stop}
                  index={index}
                  isSelected={selectedBookings?.has(stop.booking_id)}
                  isDeleteDisabled={isDeleteDisabled}
                  onBookingClick={handleBookingClick}
                  onRemoveFromRoute={(bookingId, stop) =>
                    handleBookingDetach(bookingId, stop, route.route_id)
                  }
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Route Confirmation Modal */}
      <ConfirmationModal
        show={showDeleteRouteModal}
        title="Delete Route"
        message="Are you sure you want to delete this entire route? This action cannot be undone."
        onConfirm={confirmDeleteRoute}
        onCancel={cancelDeleteRoute}
      />

      {/* Update Route Confirmation Modal */}
      <ConfirmationModal
        show={showUpdateRouteModal}
        title="Update Route"
        message={`Are you sure you want to add ${
          selectedBookings?.size || 0
        } booking${selectedBookings?.size !== 1 ? "s" : ""} to route ${
          route.route_code
        }?`}
        onConfirm={confirmUpdateRoute}
        onCancel={cancelUpdateRoute}
        confirmText="Add Bookings"
      />

      {/* Alert Modal for Restricted Actions */}
      <ConfirmationModal
        show={showAlertModal}
        title="Action Restricted"
        message={alertMessage}
        onConfirm={closeAlertModal}
        onCancel={closeAlertModal}
        confirmText="OK"
        showCancel={false}
      />
    </>
  );
};

export default SavedRouteCard;

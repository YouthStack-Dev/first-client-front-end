import React, { useState } from "react";
import {
  ChevronDown, ChevronUp, Trash2,
  MapPin, Clock, User, Truck, Building,
  Navigation, Info, Edit, Shield,
  PlayCircle, CheckCircle2, AlertCircle,
} from "lucide-react";

import ReusableButton    from "../ui/ReusableButton";
import Tooltip           from "../ui/Tooltip";
import ConfirmationModal from "../modals/ConfirmationModal";
import RouteEditModal    from "../RouteManagement/Routeeditmodal";
import AssignEscortModal from "../RouteManagement/AssignEscortModal";

import {
  EmployeeChip,
  EmployeeMiniCard,
  OverflowPopover,
} from "../RouteManagement/EmployeeChipComponents";

import { renderSafeValue, getStatusInfo, isFemaleGender } from "../RouteManagement/routeCardUtils";
import { ESCORT_COLORS, MAX_VISIBLE_CHIPS } from "../RouteManagement/routeCardConstants";
import { API_CLIENT } from "../../Api/API_Client";
import { logError }   from "../../utils/logger";

const STATUS_ICONS = {
  Clock:        <Clock className="w-3 h-3" />,
  PlayCircle:   <PlayCircle className="w-3 h-3" />,
  CheckCircle2: <CheckCircle2 className="w-3 h-3" />,
  AlertCircle:  <AlertCircle className="w-3 h-3" />,
  User:         <User className="w-3 h-3" />,
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
  tenantId,
  showEscortButton = true,
  onToast,   // ✅ NEW
}) => {
  const [isEmployeeExpanded, setIsEmployeeExpanded] = useState(false);
  const [isEditModalOpen,    setIsEditModalOpen]    = useState(false);
  const [isEscortModalOpen,  setIsEscortModalOpen]  = useState(false);
  const [assignedEscort,     setAssignedEscort]     = useState(route.escort ?? null);
  const [showDeleteModal,    setShowDeleteModal]    = useState(false);
  const [showUpdateModal,    setShowUpdateModal]    = useState(false);
  const [showAlertModal,     setShowAlertModal]     = useState(false);
  const [alertMessage,       setAlertMessage]       = useState("");

  const stops          = route.stops || [];
  const visibleChips   = stops.slice(0, MAX_VISIBLE_CHIPS);
  const overflowChips  = stops.slice(MAX_VISIBLE_CHIPS);
  const hasDriver      = route.driver?.name  && route.driver.name  !== "Not assigned";
  const hasVehicle     = route.vehicle?.rc_number && route.vehicle.rc_number !== "Not assigned";
  const hasFemale      = stops.some((s) => isFemaleGender(s.gender));
  const escortRequired = !!route.escort_required;
  const isCompleted    = route.status?.toLowerCase() === "completed";
  const isDeleteDisabled = isCompleted || !!hasDriver;
  const statusInfo     = getStatusInfo(route.status);

  const cardClass = (() => {
    if (isSelected) return "border-purple-500 shadow-md bg-purple-50";
    if (hasFemale)  return "border-pink-300 bg-pink-50 hover:border-pink-400 hover:bg-pink-100";
    return "border-gray-200 hover:border-gray-300 hover:bg-gray-50";
  })();

  // ✅ showAlert: uses onToast if available, otherwise falls back to modal
  const showAlert = (message) => {
    if (onToast?.info) { onToast.info(message); return; }
    setAlertMessage(message);
    setShowAlertModal(true);
  };

  const handleRouteClick = (e) => {
    if (e.target.closest("button") || e.target.closest('input[type="checkbox"]')) return;
    onRouteSelect(route.route_id);
  };

  const handleModalSave = () => OnOperation();

  const handleEscortAssigned = (escort) => {
    setAssignedEscort(escort);
    setIsEscortModalOpen(false);
    OnOperation?.();
  };

  const handleDeleteClick = () => {
    if (isCompleted) return showAlert("This route cannot be deleted as it has been completed.");
    if (hasDriver)   return showAlert("This route cannot be deleted as a driver has already been assigned.");
    setShowDeleteModal(true);
  };

  const handleUpdateClick = () => {
    if (!selectedBookings?.size) return showAlert("Please select at least one booking to add to this route.");
    setShowUpdateModal(true);
  };

  const handleBookingDetach = async (bookingId, _stop, routeId) => {
    try {
      await API_CLIENT.put(`/routes/${routeId}`, { operation: "remove", booking_ids: [bookingId] });
      detachBooking();
    } catch (err) {
      logError("Failed to detach booking:", err);
      // ✅ uses onToast if available
      if (onToast?.error) onToast.error("Failed to detach booking. Please try again.");
      else alert("Failed to detach booking. Please try again.");
    }
  };

  const confirmDelete = async () => {
    try {
      await API_CLIENT.delete(`/routes/${route.route_id}`);
      OnOperation();
      setShowDeleteModal(false);
      onToast?.success?.(`Route ${route.route_code ?? `#${route.route_id}`} deleted`);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to delete route. Please try again.";
      if (onToast?.error) onToast.error(msg);
      else alert(msg);
    }
  };

  const confirmUpdate = async () => {
    try {
      await API_CLIENT.put(`/routes/${route.route_id}`, {
        operation: "add",
        booking_ids: Array.from(selectedBookings),
      });
      OnOperation();
      setShowUpdateModal(false);
      onRouteUpdate?.(route);
      onToast?.success?.(`Added ${selectedBookings?.size ?? 0} booking${selectedBookings?.size !== 1 ? "s" : ""} to route ${route.route_code}`);
    } catch (err) {
      logError("Failed to update route:", err);
      const msg = err?.response?.data?.message || "Failed to update route. Please try again.";
      if (onToast?.error) onToast.error(msg);
      else alert(msg);
    }
  };

  const escortBtnStyle = assignedEscort ? ESCORT_COLORS.assigned : ESCORT_COLORS.unassigned;

  return (
    <>
      <style>{`
        .emp-mini-scroll::-webkit-scrollbar       { height: 4px; }
        .emp-mini-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
        .chips-row:hover .chips-label             { color: #7c3aed !important; }
        .chips-row:hover .chips-label strong      { color: #7c3aed !important; }
        @keyframes escortPulse {
          0%,100% { box-shadow: 0 0 0 0 #f9a8d455; }
          50%      { box-shadow: 0 0 0 4px #fce7f399, 0 0 0 1.5px #f9a8d4; }
        }
      `}</style>

      <div
        className={`bg-white border rounded-lg transition-all cursor-pointer overflow-x-hidden ${cardClass} ${isDeleteDisabled ? "opacity-80" : ""}`}
        onClick={handleRouteClick}
      >
        <div className="p-2.5">
          <div className="flex items-start gap-2">

            <div className="mt-1 w-3 h-3 flex-shrink-0 flex items-center justify-center">
              {isSelected && <div className="w-2.5 h-2.5 bg-purple-600 rounded-full" />}
            </div>

            <div className="flex-1 min-w-0 space-y-1.5">

              {/* ROW 1 */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-sm text-gray-900">
                  ID {renderSafeValue(route.route_id)}
                </span>
                <span className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded border font-medium ${statusInfo.color}`}>
                  {STATUS_ICONS[statusInfo.iconName]}
                  <span className="capitalize">{renderSafeValue(route.status)}</span>
                </span>
                {hasDriver && !isCompleted && (
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
                {isCompleted && (
                  <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded border bg-yellow-100 text-yellow-700 border-yellow-200">
                    <Info className="w-3 h-3" /> Read Only
                  </span>
                )}
                {assignedEscort && (
                  <span
                    className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded border font-medium"
                    style={{ background: ESCORT_COLORS.badge.bg, color: ESCORT_COLORS.badge.text, borderColor: ESCORT_COLORS.badge.border }}
                  >
                    <Shield className="w-3 h-3" />
                    <span className="truncate max-w-[90px]">{assignedEscort.name || "Escort assigned"}</span>
                  </span>
                )}
                <div className="flex-1" />

                {showEscortButton && (
                  <Tooltip
                    text={
                      isCompleted       ? "Completed route is read-only"
                      : assignedEscort  ? "Change escort assignment"
                      : escortRequired  ? "Escort required for this route"
                      : "Assign escort for this route"
                    }
                    position="top"
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); if (isCompleted) return; setIsEscortModalOpen(true); }}
                      disabled={isCompleted}
                      style={{
                        display: "flex", alignItems: "center", gap: 4,
                        padding: "3px 8px", borderRadius: 7, border: "none",
                        background: escortBtnStyle.bg, color: escortBtnStyle.text,
                        boxShadow: escortBtnStyle.shadow,
                        fontSize: 11, fontWeight: 700,
                        cursor: isCompleted ? "not-allowed" : "pointer",
                        opacity: isCompleted ? 0.55 : 1, fontFamily: "inherit",
                        whiteSpace: "nowrap", transition: "all 0.15s",
                        animation: !assignedEscort && !isCompleted ? "escortPulse 2.4s ease-in-out infinite" : "none",
                      }}
                    >
                      <Shield size={11} />
                      {assignedEscort ? "Escort ✓" : "Assign Escort"}
                    </button>
                  </Tooltip>
                )}

                <div className="flex items-center gap-1 border border-gray-200 rounded-lg overflow-visible divide-x divide-gray-200">
                  {onRouteUpdate && (
                    <Tooltip text="Edit route" position="top">
                      <ReusableButton
                        module="route" action="update" icon={Edit}
                        onClick={handleUpdateClick} size={13}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors rounded-l-lg"
                      />
                    </Tooltip>
                  )}
                  <Tooltip
                    text={
                      isDeleteDisabled
                        ? isCompleted ? "Cannot delete a completed route" : "Cannot delete — driver already assigned"
                        : "Delete route"
                    }
                    position="top"
                  >
                    <ReusableButton
                      module="route" action="delete" icon={Trash2}
                      onClick={handleDeleteClick} size={13}
                      disabled={isDeleteDisabled}
                      className={`p-1.5 transition-colors rounded-r-lg ${
                        isDeleteDisabled ? "text-gray-300 cursor-not-allowed bg-gray-50" : "text-gray-500 hover:text-red-600 hover:bg-red-50"
                      }`}
                    />
                  </Tooltip>
                </div>
              </div>

              {/* ROW 2 */}
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
                {route.summary?.total_distance_km && (
                  <>
                    <span className="text-gray-300">·</span>
                    <div className="flex items-center gap-1">
                      <Navigation className="w-3 h-3 text-green-400 flex-shrink-0" />
                      <span>{route.summary.total_distance_km} km</span>
                    </div>
                  </>
                )}
                {route.summary?.total_time_minutes && (
                  <>
                    <span className="text-gray-300">·</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-400 flex-shrink-0" />
                      <span>{route.summary.total_time_minutes} min</span>
                    </div>
                  </>
                )}
                <span className="text-gray-300">·</span>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-red-400 flex-shrink-0" />
                  <span>{stops.length} stops</span>
                </div>
              </div>

              {/* ROW 3 */}
              {stops.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
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
                      onClick={(e) => { e.stopPropagation(); setIsEmployeeExpanded((v) => !v); }}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-2 py-0.5 rounded transition-colors"
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

      {/* Modals */}
      <AssignEscortModal
        isOpen={isEscortModalOpen}
        onClose={() => setIsEscortModalOpen(false)}
        routeId={route.route_id}
        triggerReason="Escort required"
        tenantId={tenantId}
        onSuccess={handleEscortAssigned}
      />
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
      <ConfirmationModal
        show={showDeleteModal}
        title="Delete Route"
        message="Are you sure you want to delete this entire route? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
      <ConfirmationModal
        show={showUpdateModal}
        title="Update Route"
        message={`Are you sure you want to add ${selectedBookings?.size || 0} booking${selectedBookings?.size !== 1 ? "s" : ""} to route ${route.route_code}?`}
        onConfirm={confirmUpdate}
        onCancel={() => setShowUpdateModal(false)}
        confirmText="Add Bookings"
      />
      {/* Fallback alert modal — only used if onToast not provided */}
      <ConfirmationModal
        show={showAlertModal}
        title="Action Restricted"
        message={alertMessage}
        onConfirm={() => { setShowAlertModal(false); setAlertMessage(""); }}
        onCancel={() =>  { setShowAlertModal(false); setAlertMessage(""); }}
        confirmText="OK"
        showCancel={false}
      />
    </>
  );
};

export default SavedRouteCard;
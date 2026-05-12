import React, { useState, useCallback } from "react";
import {
  Clock,
  Eye,
  RefreshCw,
  Navigation,
  Route,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Car,
  Building,
  BellRing,
  X,
  AlertTriangle,
} from "lucide-react";
import BookingDetailsModal from "../modals/BookingDetailsModal";
import NotificationLogsModal from "../modals/NotificationLogsModal";
import { API_CLIENT } from "../../Api/API_Client";

// ─────────────────────────────────────────────────────────────────────────────
// Toast component — renders at bottom-center, auto-dismisses
// ─────────────────────────────────────────────────────────────────────────────
const Toast = ({ toasts, onDismiss }) => {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium animate-slide-up
            ${t.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
            }`}
        >
          {t.type === "success"
            ? <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
            : <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          }
          <span>{t.message}</span>
          <button
            onClick={() => onDismiss(t.id)}
            className="ml-1 p-0.5 rounded hover:bg-black/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// useToast hook
// ─────────────────────────────────────────────────────────────────────────────
const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success", duration = 3500) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, dismiss };
};

// ─────────────────────────────────────────────────────────────────────────────
// InlineDeleteConfirm — replaces action buttons inside the row
// ─────────────────────────────────────────────────────────────────────────────
const InlineDeleteConfirm = ({ onConfirm, onCancel, isDeleting }) => (
  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
    <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
    <span className="text-xs text-red-700 font-medium whitespace-nowrap">Delete routes?</span>
    <button
      onClick={onConfirm}
      disabled={isDeleting}
      className="px-2.5 py-1 text-xs font-semibold bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isDeleting
        ? <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
        : "Yes, delete"
      }
    </button>
    <button
      onClick={onCancel}
      disabled={isDeleting}
      className="px-2.5 py-1 text-xs font-semibold bg-white text-red-600 border border-red-200 rounded-md hover:bg-red-50 disabled:opacity-50 transition-colors"
    >
      Cancel
    </button>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// ShiftBookingsTable
// ─────────────────────────────────────────────────────────────────────────────
const ShiftBookingsTable = ({
  data,
  date,
  loading,
  selectedShiftType,
  onGenerateRoute,
  generatingRoute,
  onRefresh,
  tenantId,
}) => {
  const [modalState,      setModalState]      = useState({ isOpen: false, shiftId: null });
  const [deletingShift,   setDeletingShift]   = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [logsModal,       setLogsModal]       = useState({ isOpen: false, shiftId: null, shiftCode: null });
  const { toasts, addToast, dismiss }         = useToast();

  const isPastDate = React.useMemo(() => {
    if (!date) return false;
    const selected = new Date(date);
    selected.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selected < today;
  }, [date]);

  const shiftsData = React.useMemo(() => {
    if (!data) return [];
    if (data.data?.shifts) return data.data.shifts;
    if (Array.isArray(data)) return data;
    if (data.shifts) return data.shifts;
    return [];
  }, [data]);

  const filteredData = React.useMemo(() => {
    if (!shiftsData || !Array.isArray(shiftsData)) return [];
    if (selectedShiftType === "All") return shiftsData;
    return shiftsData.filter((shift) => {
      if (selectedShiftType === "In")  return shift.log_type === "IN";
      if (selectedShiftType === "Out") return shift.log_type === "OUT";
      return true;
    });
  }, [shiftsData, selectedShiftType]);

  const formatTime = (time) => {
    if (!time) return "-";
    try {
      const [hours, minutes] = time.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes || "00"} ${ampm}`;
    } catch { return time; }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short", month: "short", day: "numeric",
    });
  };

  const handleTotalClick = (shift) => setModalState({ isOpen: true, shiftId: shift.shift_id });
  const closeModal       = ()      => setModalState({ isOpen: false, shiftId: null });

  const needsRegeneration = (shift) => {
    const totalBookings  = shift.stats?.total_bookings  || 0;
    const routedBookings = shift.stats?.routed_bookings || 0;
    return totalBookings !== routedBookings;
  };

  const handleShiftRoute = (shift) => {
    if (!shift?.id) return;
    window.open(`/companies/shift/${shift.id}/${shift.log_type}/${date}/routing-map`, "_blank");
  };

  const handleGenerateClick = (shift) => {
    if (onGenerateRoute && shift.shift_id) onGenerateRoute(shift.shift_id);
  };

  // Step 1 — show inline confirm in the row
  const handleDeleteClick = (shift) => {
    if (isPastDate || !shift?.shift_id) return;
    setConfirmDeleteId(shift.shift_id);
  };

  // Step 2 — user confirmed, call API
  const handleDeleteConfirm = async (shift) => {
    if (!shift?.shift_id || !date) return;
    try {
      setDeletingShift(shift.shift_id);
      await API_CLIENT.delete("/routes/bulk", {
        params: { shift_id: shift.shift_id, route_date: date },
      });
      addToast(`Routes for ${shift.shift_code || shift.shift_id} deleted successfully`, "success");
      onRefresh?.();
    } catch {
      addToast("Failed to delete routes. Please try again.", "error");
    } finally {
      setDeletingShift(null);
      setConfirmDeleteId(null);
    }
  };

  const handleDeleteCancel = () => setConfirmDeleteId(null);

  const getShiftStatus = (shift) => {
    const total    = shift.stats?.total_bookings    || 0;
    const unrouted = shift.stats?.unrouted_bookings || 0;
    const routed   = shift.stats?.routed_bookings   || 0;
    if (total    === 0)             return { color: "gray",  text: "No Bookings", icon: AlertCircle };
    if (unrouted === 0)             return { color: "green", text: "Complete",    icon: CheckCircle };
    if (routed > 0 && unrouted > 0) return { color: "amber", text: "Partial",     icon: AlertCircle };
    return                                 { color: "red",   text: "Pending",     icon: XCircle    };
  };

  const safeData         = Array.isArray(filteredData) ? filteredData : [];
  const activeModalShift = safeData.find((s) => s.shift_id === modalState.shiftId);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-app-primary border-t-transparent mx-auto" />
          <p className="mt-2 text-app-text-secondary">Loading shifts...</p>
        </div>
      </div>
    );
  }

  if (!loading && safeData.length === 0) {
    return (
      <div className="bg-app-surface border border-app-border rounded-lg p-8 text-center">
        <Clock className="w-12 h-12 text-app-text-muted mx-auto mb-3" />
        <h3 className="text-lg font-medium text-app-text-primary mb-2">No shifts found</h3>
        <p className="text-app-text-secondary mb-4">
          {selectedShiftType === "All"
            ? `No shifts for ${formatDate(date)}`
            : `No ${selectedShiftType.toLowerCase()} shifts for ${formatDate(date)}`}
        </p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-app-tertiary text-app-text-secondary rounded-lg hover:bg-app-border transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <div className="bg-app-tertiary rounded-lg p-4">
          <p className="text-sm text-app-text-secondary mb-1">Shifts</p>
          <p className="text-xl font-semibold text-app-text-primary">{safeData.length}</p>
        </div>
        <div className="bg-app-tertiary rounded-lg p-4">
          <p className="text-sm text-app-text-secondary mb-1">Bookings</p>
          <p className="text-xl font-semibold text-app-text-primary">
            {safeData.reduce((sum, s) => sum + (s.stats?.total_bookings || 0), 0)}
          </p>
        </div>
        <div className="bg-app-tertiary rounded-lg p-4">
          <p className="text-sm text-app-text-secondary mb-1">Routes</p>
          <p className="text-xl font-semibold text-blue-600">
            {safeData.reduce((sum, s) => sum + (s.stats?.route_count || 0), 0)}
          </p>
        </div>
        <div className="bg-app-tertiary rounded-lg p-4">
          <p className="text-sm text-app-text-secondary mb-1">Unrouted</p>
          <p className="text-xl font-semibold text-amber-600">
            {safeData.reduce((sum, s) => sum + (s.stats?.unrouted_bookings || 0), 0)}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-app-surface rounded-lg border border-app-border">
        <div className="px-4 py-3 border-b border-app-border flex justify-between items-center">
          <div>
            <h3 className="font-medium text-app-text-primary">Shift Management</h3>
            <p className="text-sm text-app-text-secondary">
              {formatDate(date)} • {selectedShiftType} Shifts
              {isPastDate && (
                <span className="ml-2 text-xs text-amber-600 font-medium">Past Date</span>
              )}
            </p>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 text-app-text-secondary hover:text-app-text-primary hover:bg-app-tertiary rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[1000px]">
            <table className="w-full">
              <thead className="bg-app-tertiary/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-app-text-secondary">Shift Code</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-app-text-secondary">Time & Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-app-text-secondary">Bookings</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-app-text-secondary">Routes</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-app-text-secondary">Drivers</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-app-text-secondary">Vendors</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-app-text-secondary">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-app-text-secondary">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-app-border">
                {safeData.map((shift, index) => {
                  const status         = getShiftStatus(shift);
                  const StatusIcon     = status.icon;
                  const isConfirming   = confirmDeleteId === shift.shift_id;
                  const isThisDeleting = deletingShift   === shift.shift_id;
                  const completionRate = shift.stats?.total_bookings
                    ? Math.round(((shift.stats?.routed_bookings || 0) / shift.stats.total_bookings) * 100)
                    : 0;

                  return (
                    <tr
                      key={shift.shift_id || index}
                      className={`transition-colors ${isConfirming ? "bg-red-50/40" : "hover:bg-app-tertiary/30"}`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-app-text-primary">{shift.shift_code || shift.shift_id}</div>
                        <div className="text-xs text-app-text-secondary mt-1">ID: {shift.shift_id}</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-app-text-secondary" />
                          <span className="font-medium text-app-text-primary">{formatTime(shift.shift_time)}</span>
                        </div>
                        <div className="mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            shift.log_type === "IN"
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}>
                            {shift.log_type}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <button onClick={() => handleTotalClick(shift)} className="text-left hover:text-app-primary transition-colors w-full">
                          <div className="text-lg font-semibold text-app-text-primary">{shift.stats?.total_bookings || 0}</div>
                          <div className="text-xs text-app-text-secondary">Total Bookings</div>
                          <div className="text-xs text-amber-600 mt-1">{shift.stats?.unrouted_bookings || 0} unrouted</div>
                        </button>
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-lg font-semibold text-app-text-primary">{shift.stats?.route_count || 0}</div>
                        <div className="text-xs text-app-text-secondary">Routes</div>
                        <div className="text-xs text-app-text-secondary mt-1">{shift.stats?.routed_bookings || 0} routed</div>
                        {shift.stats?.total_bookings > 0 && (
                          <div className="mt-2">
                            <div className="text-xs text-app-text-secondary mb-1">{completionRate}% complete</div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div className="bg-app-primary h-1.5 rounded-full" style={{ width: `${completionRate}%` }} />
                            </div>
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-app-text-secondary" />
                          <div>
                            <div className="font-medium text-app-text-primary">{shift.stats?.driver_assigned || 0}</div>
                            <div className="text-xs text-app-text-secondary">Assigned</div>
                          </div>
                        </div>
                        {shift.stats?.driver_available !== undefined && (
                          <div className="text-xs text-app-text-secondary mt-1">{shift.stats.driver_available} available</div>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-app-text-secondary" />
                          <div>
                            <div className="font-medium text-app-text-primary">{shift.stats?.vendor_assigned || 0}</div>
                            <div className="text-xs text-app-text-secondary">Assigned</div>
                          </div>
                        </div>
                        {shift.stats?.vendor_available !== undefined && (
                          <div className="text-xs text-app-text-secondary mt-1">{shift.stats.vendor_available} available</div>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`w-4 h-4 ${
                            status.color === "green" ? "text-green-500" :
                            status.color === "amber" ? "text-amber-500" :
                            status.color === "red"   ? "text-red-500"   : "text-gray-400"
                          }`} />
                          <span className={`text-sm font-medium ${
                            status.color === "green" ? "text-green-700" :
                            status.color === "amber" ? "text-amber-700" :
                            status.color === "red"   ? "text-red-700"   : "text-gray-500"
                          }`}>
                            {status.text}
                          </span>
                        </div>
                        <div className="text-xs text-app-text-secondary mt-1">{shift.stats?.vehicle_assigned || 0} vehicles</div>
                      </td>

                      {/* ── Actions ── */}
                      <td className="px-4 py-3">
                        {isConfirming ? (
                          // Inline confirm replaces all buttons when delete is clicked
                          <InlineDeleteConfirm
                            onConfirm={() => handleDeleteConfirm(shift)}
                            onCancel={handleDeleteCancel}
                            isDeleting={isThisDeleting}
                          />
                        ) : (
                          <div className="flex items-center gap-1.5">

                            {/* 1. Generate / Regenerate */}
                            <button
                              onClick={() => handleGenerateClick(shift)}
                              disabled={generatingRoute === shift.shift_id}
                              className={`p-2 rounded-lg transition-colors ${
                                needsRegeneration(shift)
                                  ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                                  : "bg-app-primary/10 text-app-primary hover:bg-app-primary/20"
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                              title={needsRegeneration(shift) ? "Regenerate Routes" : "Generate Routes"}
                            >
                              {generatingRoute === shift.shift_id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                              ) : (
                                <Route className="w-4 h-4" />
                              )}
                            </button>

                            {/* 2. View Routes Map */}
                            <button
                              onClick={() => handleShiftRoute(shift)}
                              className="p-2 text-app-text-secondary hover:text-app-primary hover:bg-app-tertiary rounded-lg transition-colors"
                              title="View Routes Map"
                            >
                              <Navigation className="w-4 h-4" />
                            </button>

                            {/* 3. View Details */}
                            <button
                              onClick={() => handleTotalClick(shift)}
                              className="p-2 text-app-text-secondary hover:text-app-primary hover:bg-app-tertiary rounded-lg transition-colors"
                              title="View Booking Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* 4. Notification Logs */}
                            <button
                              onClick={() => setLogsModal({
                                isOpen:    true,
                                shiftId:   shift.shift_id,
                                shiftCode: shift.shift_code,
                              })}
                              className="p-2 text-app-text-secondary hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="View Notification Logs"
                            >
                              <BellRing className="w-4 h-4" />
                            </button>

                            {/* 5. Delete — shows inline confirm on click */}
                            <div className="relative group">
                              <button
                                onClick={() => handleDeleteClick(shift)}
                                disabled={isPastDate}
                                className={`p-2 rounded-lg transition-colors ${
                                  isPastDate
                                    ? "text-gray-300 cursor-not-allowed"
                                    : "text-red-500 hover:text-red-600 hover:bg-red-50"
                                } disabled:opacity-50`}
                                title="Delete Routes"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              {isPastDate && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                                  Cannot delete past routes
                                </div>
                              )}
                            </div>

                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="px-4 py-3 border-t border-app-border text-sm text-app-text-secondary flex justify-between items-center">
          <span>{safeData.length} shifts</span>
        </div>
      </div>

      {/* Booking Details Modal */}
      <BookingDetailsModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        shift={activeModalShift}
        bookings={activeModalShift?.bookings || []}
      />

      {/* Notification Logs Modal */}
      <NotificationLogsModal
        isOpen={logsModal.isOpen}
        onClose={() => setLogsModal({ isOpen: false, shiftId: null, shiftCode: null })}
        shiftId={logsModal.shiftId}
        shiftCode={logsModal.shiftCode}
        bookingDate={date}
        tenantId={tenantId ?? null}
      />

      {/* Toast notifications */}
      <Toast toasts={toasts} onDismiss={dismiss} />

      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.2s ease; }
      `}</style>
    </>
  );
};

export default ShiftBookingsTable;
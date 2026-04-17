import React, { useState, useRef, useEffect } from "react";
import {
  Clock,
  Users,
  MapPin,
  Package,
  Eye,
  RefreshCw,
  MoreVertical,
  Navigation,
  Zap,
  Trash2,
  FileText,
  Edit,
  Pause,
  Layers,
  AlertCircle,
  CheckCircle,
  XCircle,
  Download,
  Car,
  Building,
  Bell,           // ✅ NEW
} from "lucide-react";
import BookingDetailsModal from "../modals/BookingDetailsModal";
import NotificationLogsModal from "../modals/NotificationLogsModal"; // ✅ NEW
import { API_CLIENT } from "../../Api/API_Client";

// ── Dropdown rendered at fixed screen position to escape overflow clipping ──
const ActionMenu = ({ shift, anchorRect, onClose, onExport, onDelete, deletingShift, isPastDate }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!anchorRect) return null;

  return (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        top: anchorRect.bottom + 4,
        right: window.innerWidth - anchorRect.right,
        zIndex: 9999,
      }}
      className="w-44 bg-app-surface border border-app-border rounded-lg shadow-xl"
    >
      <div className="py-1">
        <button
          onClick={() => { onExport(); onClose(); }}
          className="w-full text-left px-3 py-2 text-sm text-app-text-secondary hover:bg-app-tertiary flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Export Report
        </button>

        {/* Delete — disabled for past dates */}
        <div className="relative group">
          <button
            onClick={() => { if (!isPastDate) { onDelete(); onClose(); } }}
            disabled={deletingShift === shift.shift_id || isPastDate}
            className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors
              ${isPastDate
                ? "text-gray-300 cursor-not-allowed"
                : "text-red-600 hover:bg-red-50"
              } disabled:opacity-50`}
          >
            {deletingShift === shift.shift_id ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Delete Routes
          </button>
          {isPastDate && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
              Cannot delete routes from past
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ShiftBookingsTable = ({
  data,
  date,
  loading,
  selectedShiftType,
  onGenerateRoute,
  generatingRoute,
  onRefresh,
  tenantId,        // ✅ NEW — pass down for admin users
}) => {
  const [modalState, setModalState] = useState({ isOpen: false, shiftId: null });
  const [deletingShift, setDeletingShift] = useState(null);
  const [actionMenu, setActionMenu] = useState({ shiftId: null, anchorRect: null });

  // ✅ NEW — notification logs modal state
  const [logsModal, setLogsModal] = useState({
    isOpen:    false,
    shiftId:   null,
    shiftCode: null,
  });

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
      if (selectedShiftType === "In") return shift.log_type === "IN";
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

  const handleTotalClick  = (shift) => setModalState({ isOpen: true, shiftId: shift.shift_id });
  const closeModal        = ()      => setModalState({ isOpen: false, shiftId: null });

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

  const handleShiftRoutesDelete = async (shift) => {
    if (!shift?.shift_id || !date) return;
    const isConfirmed = window.confirm(
      `Delete all routes for ${shift.shift_code || shift.shift_id} on ${formatDate(date)}?`
    );
    if (!isConfirmed) return;
    try {
      setDeletingShift(shift.shift_id);
      await API_CLIENT.delete("/routes/bulk", {
        params: { shift_id: shift.shift_id, route_date: date },
      });
      alert(`Routes for ${shift.shift_code || shift.shift_id} deleted successfully!`);
      onRefresh?.();
    } catch {
      alert("Failed to delete routes. Please try again.");
    } finally {
      setDeletingShift(null);
    }
  };

  const toggleActionMenu = (e, shiftId) => {
    if (actionMenu.shiftId === shiftId) {
      setActionMenu({ shiftId: null, anchorRect: null });
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setActionMenu({ shiftId, anchorRect: rect });
    }
  };

  const getShiftStatus = (shift) => {
    const total    = shift.stats?.total_bookings    || 0;
    const unrouted = shift.stats?.unrouted_bookings || 0;
    const routed   = shift.stats?.routed_bookings   || 0;
    if (total    === 0)                    return { color: "gray",  text: "No Bookings", icon: AlertCircle };
    if (unrouted === 0)                    return { color: "green", text: "Complete",    icon: CheckCircle };
    if (routed > 0 && unrouted > 0)        return { color: "amber", text: "Partial",     icon: AlertCircle };
    return                                        { color: "red",   text: "Pending",     icon: XCircle    };
  };

  const safeData         = Array.isArray(filteredData) ? filteredData : [];
  const activeShift      = safeData.find((s) => s.shift_id === actionMenu.shiftId);
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
              {isPastDate && <span className="ml-2 text-xs text-amber-600 font-medium" />}
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
                  const status     = getShiftStatus(shift);
                  const StatusIcon = status.icon;
                  const completionRate = shift.stats?.total_bookings
                    ? Math.round(((shift.stats?.routed_bookings || 0) / shift.stats.total_bookings) * 100)
                    : 0;

                  return (
                    <tr key={shift.shift_id || index} className="hover:bg-app-tertiary/30">

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
                        <div className="flex items-center gap-1.5">

                          {/* View Routes Map */}
                          <button
                            onClick={() => handleShiftRoute(shift)}
                            className="p-2 text-app-text-secondary hover:text-app-primary hover:bg-app-tertiary rounded-lg transition-colors"
                            title="View Routes Map"
                          >
                            <MapPin className="w-4 h-4" />
                          </button>

                          {/* View Details */}
                          <button
                            onClick={() => handleTotalClick(shift)}
                            className="p-2 text-app-text-secondary hover:text-app-primary hover:bg-app-tertiary rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* ✅ NEW — Notification Logs */}
                          <button
                            onClick={() => setLogsModal({
                              isOpen:    true,
                              shiftId:   shift.shift_id,
                              shiftCode: shift.shift_code,
                            })}
                            className="p-2 text-app-text-secondary hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="View Notification Logs"
                          >
                            <Bell className="w-4 h-4" />
                          </button>

                          {/* Generate / Regenerate */}
                          <button
                            onClick={() => handleGenerateClick(shift)}
                            disabled={generatingRoute === shift.shift_id}
                            className={`p-2 rounded-lg transition-colors ${
                              needsRegeneration(shift)
                                ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                                : "bg-app-primary/10 text-app-primary hover:bg-app-primary/20"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                            title={needsRegeneration(shift) ? "Regenerate" : "Generate"}
                          >
                            {generatingRoute === shift.shift_id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                            ) : (
                              <RefreshCw className="w-4 h-4" />
                            )}
                          </button>

                          {/* More options */}
                          <button
                            onClick={(e) => toggleActionMenu(e, shift.shift_id)}
                            className={`p-2 rounded-lg transition-colors ${
                              actionMenu.shiftId === shift.shift_id
                                ? "bg-app-tertiary text-app-primary"
                                : "text-app-text-secondary hover:text-app-primary hover:bg-app-tertiary"
                            }`}
                            title="More options"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
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
          <button onClick={() => {}} className="inline-flex items-center gap-2 text-app-text-secondary hover:text-app-text-primary">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Dropdown portal */}
      {actionMenu.shiftId && activeShift && (
        <ActionMenu
          shift={activeShift}
          anchorRect={actionMenu.anchorRect}
          onClose={() => setActionMenu({ shiftId: null, anchorRect: null })}
          onExport={() => {}}
          onDelete={() => handleShiftRoutesDelete(activeShift)}
          deletingShift={deletingShift}
          isPastDate={isPastDate}
        />
      )}

      {/* Booking Details Modal */}
      <BookingDetailsModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        shift={activeModalShift}
        bookings={activeModalShift?.bookings || []}
      />

      {/* ✅ NEW — Notification Logs Modal */}
      <NotificationLogsModal
        isOpen={logsModal.isOpen}
        onClose={() => setLogsModal({ isOpen: false, shiftId: null, shiftCode: null })}
        shiftId={logsModal.shiftId}
        shiftCode={logsModal.shiftCode}
        bookingDate={date}
        tenantId={tenantId ?? null}
      />
    </>
  );
};

export default ShiftBookingsTable;
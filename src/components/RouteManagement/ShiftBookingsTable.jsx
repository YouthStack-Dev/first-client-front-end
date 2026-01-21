import React, { useState } from "react";
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
} from "lucide-react";
import BookingDetailsModal from "../modals/BookingDetailsModal";
import { API_CLIENT } from "../../Api/API_Client";

const ShiftBookingsTable = ({
  data,
  date,
  loading,
  selectedShiftType,
  onGenerateRoute,
  generatingRoute,
  onRefresh,
}) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    shift: null,
    bookings: [],
  });
  const [deletingShift, setDeletingShift] = useState(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);

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
    } catch {
      return time;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const handleTotalClick = (shift) => {
    setModalState({
      isOpen: true,
      shift: shift,
      bookings: shift.bookings || [],
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      shift: null,
      bookings: [],
    });
  };

  const needsRegeneration = (shift) => {
    const totalBookings = shift.stats?.total_bookings || 0;
    const routedBookings = shift.stats?.routed_bookings || 0;
    return totalBookings !== routedBookings;
  };

  const handleShiftRoute = (shift) => {
    if (!shift?.id) return;
    const url = `/companies/shift/${shift.id}/${shift.log_type}/${date}/routing-map`;
    window.open(url, "_blank");
  };

  const handleGenerateClick = (shift) => {
    if (onGenerateRoute && shift.shift_id) {
      onGenerateRoute(shift.shift_id);
    }
  };

  const handleShiftRoutesDelete = async (shift) => {
    if (!shift?.shift_id || !date) return;

    const isConfirmed = window.confirm(
      `Delete all routes for ${
        shift.shift_code || shift.shift_id
      } on ${formatDate(date)}?`
    );

    if (!isConfirmed) return;

    try {
      setDeletingShift(shift.shift_id);
      await API_CLIENT.delete("/routes/bulk", {
        params: {
          shift_id: shift.shift_id,
          route_date: date,
        },
      });
      alert(
        `Routes for ${shift.shift_code || shift.shift_id} deleted successfully!`
      );
      onRefresh?.();
    } catch (error) {
      alert("Failed to delete routes. Please try again.");
    } finally {
      setDeletingShift(null);
    }
  };

  const toggleActionMenu = (shiftId) => {
    setActionMenuOpen(actionMenuOpen === shiftId ? null : shiftId);
  };

  const getShiftStatus = (shift) => {
    const total = shift.stats?.total_bookings || 0;
    const unrouted = shift.stats?.unrouted_bookings || 0;
    const routed = shift.stats?.routed_bookings || 0;

    if (total === 0)
      return { color: "gray", text: "No Bookings", icon: AlertCircle };
    if (unrouted === 0)
      return { color: "green", text: "Complete", icon: CheckCircle };
    if (routed > 0 && unrouted > 0)
      return { color: "amber", text: "Partial", icon: AlertCircle };
    return { color: "red", text: "Pending", icon: XCircle };
  };

  const safeData = Array.isArray(filteredData) ? filteredData : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-app-primary border-t-transparent mx-auto"></div>
          <p className="mt-2 text-app-text-secondary">Loading shifts...</p>
        </div>
      </div>
    );
  }

  if (!loading && safeData.length === 0) {
    return (
      <div className="bg-app-surface border border-app-border rounded-lg p-8 text-center">
        <Clock className="w-12 h-12 text-app-text-muted mx-auto mb-3" />
        <h3 className="text-lg font-medium text-app-text-primary mb-2">
          No shifts found
        </h3>
        <p className="text-app-text-secondary mb-4">
          {selectedShiftType === "All"
            ? `No shifts for ${formatDate(date)}`
            : `No ${selectedShiftType.toLowerCase()} shifts for ${formatDate(
                date
              )}`}
        </p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-app-tertiary text-app-text-secondary rounded-lg hover:bg-app-border transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Simple Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-app-tertiary rounded-lg p-4">
          <p className="text-sm text-app-text-secondary mb-1">Shifts</p>
          <p className="text-xl font-semibold text-app-text-primary">
            {safeData.length}
          </p>
        </div>
        <div className="bg-app-tertiary rounded-lg p-4">
          <p className="text-sm text-app-text-secondary mb-1">Bookings</p>
          <p className="text-xl font-semibold text-app-text-primary">
            {safeData.reduce(
              (sum, shift) => sum + (shift.stats?.total_bookings || 0),
              0
            )}
          </p>
        </div>
        <div className="bg-app-tertiary rounded-lg p-4">
          <p className="text-sm text-app-text-secondary mb-1">Unrouted</p>
          <p className="text-xl font-semibold text-amber-600">
            {safeData.reduce(
              (sum, shift) => sum + (shift.stats?.unrouted_bookings || 0),
              0
            )}
          </p>
        </div>
        <div className="bg-app-tertiary rounded-lg p-4">
          <p className="text-sm text-app-text-secondary mb-1">Drivers</p>
          <p className="text-xl font-semibold text-app-text-primary">
            {safeData.reduce(
              (sum, shift) => sum + (shift.stats?.driver_assigned || 0),
              0
            )}
          </p>
        </div>
      </div>

      {/* Simple Table */}
      <div className="bg-app-surface rounded-lg border border-app-border ">
        <div className="px-4 py-3 border-b border-app-border flex justify-between items-center">
          <div>
            <h3 className="font-medium text-app-text-primary">
              Shift Management
            </h3>
            <p className="text-sm text-app-text-secondary">
              {formatDate(date)} • {selectedShiftType} Shifts
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

        <div className="min-w-[1000px]">
          <table className="w-full">
            <thead className="bg-app-tertiary/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-app-text-secondary">
                  Shift Code
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-app-text-secondary">
                  Time & Type
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-app-text-secondary">
                  Bookings
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-app-text-secondary">
                  Routes
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-app-text-secondary">
                  Drivers
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-app-text-secondary">
                  Vendors
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-app-text-secondary">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-app-text-secondary">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-app-border">
              {safeData.map((shift, index) => {
                const status = getShiftStatus(shift);
                const StatusIcon = status.icon;
                const completionRate = shift.stats?.total_bookings
                  ? Math.round(
                      ((shift.stats?.routed_bookings || 0) /
                        shift.stats.total_bookings) *
                        100
                    )
                  : 0;

                return (
                  <tr
                    key={shift.shift_id || index}
                    className="hover:bg-app-tertiary/30"
                  >
                    {/* Shift Code Column */}
                    <td className="px-4 py-3">
                      <div className="font-medium text-app-text-primary">
                        {shift.shift_code || shift.shift_id}
                      </div>
                      <div className="text-xs text-app-text-secondary mt-1">
                        ID: {shift.shift_id}
                      </div>
                    </td>

                    {/* Time & Type Column */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-app-text-secondary" />
                        <span className="font-medium text-app-text-primary">
                          {formatTime(shift.shift_time)}
                        </span>
                      </div>
                      <div className="mt-1">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            shift.log_type === "IN"
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {shift.log_type}
                        </span>
                      </div>
                    </td>

                    {/* Bookings Column */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleTotalClick(shift)}
                        className="text-left hover:text-app-primary transition-colors w-full"
                      >
                        <div className="text-lg font-semibold text-app-text-primary">
                          {shift.stats?.total_bookings || 0}
                        </div>
                        <div className="text-xs text-app-text-secondary">
                          Total Bookings
                        </div>
                        <div className="text-xs text-amber-600 mt-1">
                          {shift.stats?.unrouted_bookings || 0} unrouted
                        </div>
                      </button>
                    </td>

                    {/* Routes Column */}
                    <td className="px-4 py-3">
                      <div className="text-lg font-semibold text-app-text-primary">
                        {shift.stats?.routed_bookings || 0}
                      </div>
                      <div className="text-xs text-app-text-secondary">
                        Routed
                      </div>
                      {shift.stats?.total_bookings > 0 && (
                        <div className="mt-2">
                          <div className="text-xs text-app-text-secondary mb-1">
                            {completionRate}% complete
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-app-primary h-1.5 rounded-full"
                              style={{ width: `${completionRate}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Drivers Column */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-app-text-secondary" />
                        <div>
                          <div className="font-medium text-app-text-primary">
                            {shift.stats?.driver_assigned || 0}
                          </div>
                          <div className="text-xs text-app-text-secondary">
                            Assigned
                          </div>
                        </div>
                      </div>
                      {shift.stats?.driver_available !== undefined && (
                        <div className="text-xs text-app-text-secondary mt-1">
                          {shift.stats.driver_available} available
                        </div>
                      )}
                    </td>

                    {/* Vendors Column */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-app-text-secondary" />
                        <div>
                          <div className="font-medium text-app-text-primary">
                            {shift.stats?.vendor_assigned || 0}
                          </div>
                          <div className="text-xs text-app-text-secondary">
                            Assigned
                          </div>
                        </div>
                      </div>
                      {shift.stats?.vendor_available !== undefined && (
                        <div className="text-xs text-app-text-secondary mt-1">
                          {shift.stats.vendor_available} available
                        </div>
                      )}
                    </td>

                    {/* Status Column */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <StatusIcon
                          className={`w-4 h-4 ${
                            status.color === "green"
                              ? "text-green-500"
                              : status.color === "amber"
                              ? "text-amber-500"
                              : status.color === "red"
                              ? "text-red-500"
                              : "text-gray-400"
                          }`}
                        />
                        <span
                          className={`text-sm font-medium ${
                            status.color === "green"
                              ? "text-green-700"
                              : status.color === "amber"
                              ? "text-amber-700"
                              : status.color === "red"
                              ? "text-red-700"
                              : "text-gray-500"
                          }`}
                        >
                          {status.text}
                        </span>
                      </div>
                      <div className="text-xs text-app-text-secondary mt-1">
                        {shift.stats?.vehicle_assigned || 0} vehicles
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {/* View Map Button */}
                        <button
                          onClick={() => handleShiftRoute(shift)}
                          className="p-2 text-app-text-secondary hover:text-app-primary hover:bg-app-tertiary rounded-lg transition-colors"
                          title="View Routes Map"
                        >
                          <Navigation className="w-4 h-4" />
                        </button>

                        {/* Generate/Regenerate Button */}
                        <button
                          onClick={() => handleGenerateClick(shift)}
                          disabled={generatingRoute === shift.shift_id}
                          className={`p-2 rounded-lg transition-colors ${
                            needsRegeneration(shift)
                              ? "text-amber-600 hover:bg-amber-50"
                              : "text-app-primary hover:bg-app-primary/10"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                          title={
                            needsRegeneration(shift) ? "Regenerate" : "Generate"
                          }
                        >
                          {generatingRoute === shift.shift_id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                          ) : (
                            <Zap className="w-4 h-4" />
                          )}
                        </button>

                        {/* More Menu */}
                        <div className="relative">
                          <button
                            onClick={() => toggleActionMenu(shift.shift_id)}
                            className="p-2 text-app-text-secondary hover:text-app-primary hover:bg-app-tertiary rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {actionMenuOpen === shift.shift_id && (
                            <div className="absolute right-0 mt-1 w-48 bg-app-surface border border-app-border rounded-lg shadow-lg z-10">
                              <div className="py-1">
                                <button
                                  onClick={() => {
                                    handleShiftRoute(shift);
                                    setActionMenuOpen(null);
                                  }}
                                  className="w-full text-left px-3 py-2 text-sm text-app-text-secondary hover:bg-app-tertiary flex items-center gap-2"
                                >
                                  <Layers className="w-4 h-4" />
                                  View Map
                                </button>
                                <button
                                  onClick={() => {
                                    handleTotalClick(shift);
                                    setActionMenuOpen(null);
                                  }}
                                  className="w-full text-left px-3 py-2 text-sm text-app-text-secondary hover:bg-app-tertiary flex items-center gap-2"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </button>
                                <button
                                  onClick={() => {
                                    // Export report functionality
                                    setActionMenuOpen(null);
                                  }}
                                  className="w-full text-left px-3 py-2 text-sm text-app-text-secondary hover:bg-app-tertiary flex items-center gap-2"
                                >
                                  <FileText className="w-4 h-4" />
                                  Export Report
                                </button>
                                <button
                                  onClick={() => handleShiftRoutesDelete(shift)}
                                  disabled={deletingShift === shift.shift_id}
                                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50"
                                >
                                  {deletingShift === shift.shift_id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                  Delete Routes
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Simple Footer */}
        <div className="px-4 py-3 border-t border-app-border text-sm text-app-text-secondary flex justify-between items-center">
          <span>{safeData.length} shifts</span>
          <button
            onClick={() => {
              /* Export functionality */
            }}
            className="inline-flex items-center gap-2 text-app-text-secondary hover:text-app-text-primary"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <BookingDetailsModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        shift={modalState.shift}
        bookings={modalState.bookings}
      />
    </>
  );
};

export default ShiftBookingsTable;

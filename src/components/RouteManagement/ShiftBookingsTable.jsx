import React, { useState } from "react";
import {
  Clock,
  Users,
  Truck,
  UserCircle,
  Route,
  AlertCircle,
  Trash2,
} from "lucide-react";
import BookingDetailsModal from "../modals/BookingDetailsModal";
import { API_CLIENT } from "../../Api/API_Client";
import { logDebug } from "../../utils/logger";

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

  // Extract shifts from API response
  const shiftsData = React.useMemo(() => {
    if (!data) return [];
    if (data.data?.shifts) return data.data.shifts;
    if (Array.isArray(data)) return data;
    if (data.shifts) return data.shifts;
    return [];
  }, [data]);

  // Filter data based on selected shift type
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
    if (typeof time !== "string") return "-";
    try {
      const [hours, minutes] = time.split(":");
      const hour = parseInt(hours);
      if (isNaN(hour)) return time;
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes || "00"} ${ampm}`;
    } catch (error) {
      return time;
    }
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

  // Helper function to check if regeneration is needed
  const needsRegeneration = (shift) => {
    const totalBookings = shift.stats?.total_bookings || 0;
    const routedBookings = shift.stats?.routed_bookings || 0;
    return totalBookings !== routedBookings;
  };

  const handleShiftRoute = (shift) => {
    if (!shift?.id) return;
    logDebug("Opening routing map for shift:", shift);
    const url = `/companies/shift/${shift.id}/${shift.log_type}/${date}/routing-map`;
    window.open(url, "_blank");
  };

  const handleGenerateClick = (shift) => {
    if (onGenerateRoute && shift.shift_id) {
      onGenerateRoute(shift.shift_id);
    }
  };

  // Delete shift routes function - fixed without page refresh
  const handleShiftRoutesDelete = async (shift) => {
    if (!shift?.shift_id || !date) {
      console.error("Shift ID and date are required");
      return;
    }

    const isConfirmed = window.confirm(
      `Are you sure you want to delete all routes for shift ${
        shift.shift_code || shift.shift_id
      } on ${date}?`
    );

    if (!isConfirmed) return;

    try {
      setDeletingShift(shift.shift_id);

      const response = await API_CLIENT.delete("/v1/routes/bulk", {
        params: {
          shift_id: shift.shift_id,
          route_date: date,
        },
      });

      console.log("Routes deleted successfully:", response.data);

      // Show success message
      alert(
        `Routes for shift ${
          shift.shift_code || shift.shift_id
        } deleted successfully!`
      );

      // ✅ REFRESH DATA: Call the refresh function to update the table
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Error deleting shift routes:", error);

      let errorMessage = "Failed to delete routes";

      if (error.isAxiosError || error.response) {
        if (error.response) {
          errorMessage =
            error.response.data?.message ||
            `Server error: ${error.response.status}`;
        } else if (error.request) {
          errorMessage =
            "No response from server. Please check your connection.";
        } else {
          errorMessage = error.message;
        }
      } else {
        errorMessage = error.message || "Unknown error occurred";
      }

      alert(`Failed to delete routes: ${errorMessage}`);
    } finally {
      setDeletingShift(null);
    }
  };

  const safeData = Array.isArray(filteredData) ? filteredData : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-400 border-t-transparent mx-auto"></div>
          <p className="mt-2 text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!loading && safeData.length === 0) {
    return (
      <div className="bg-white border border-gray-300 p-8">
        <div className="text-center text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No shifts found</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-gray-300">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-300">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">
                Shift
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">
                Total
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">
                Routed
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">
                Unrouted
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">
                Vendors
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">
                Drivers
              </th>

              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {safeData.map((shift, index) => (
              <tr key={shift.shift_id || index} className="hover:bg-gray-50">
                {/* Shift Details */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {formatTime(shift.shift_time)}
                    </span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ${
                        shift.log_type === "IN"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {shift.log_type || "-"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {shift.shift_code || "-"}
                  </p>
                </td>

                {/* Total */}
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleTotalClick(shift)}
                    className="text-sm font-medium text-gray-900 hover:text-blue-600 underline"
                  >
                    {shift.stats?.total_bookings || 0}
                  </button>
                </td>

                {/* Routed */}
                <td className="px-4 py-3">
                  <button className="text-sm font-medium text-green-700 hover:text-green-800 underline">
                    {shift.stats?.routed_bookings || 0}
                  </button>
                </td>

                {/* Unrouted */}
                <td className="px-4 py-3">
                  <button
                    className={`text-sm font-medium underline ${
                      (shift.stats?.unrouted_bookings || 0) > 0
                        ? "text-amber-600 hover:text-amber-700"
                        : "text-gray-600 hover:text-gray-700"
                    }`}
                  >
                    {shift.stats?.unrouted_bookings || 0}
                  </button>
                </td>

                {/* Vendors */}
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-700">
                    {shift.stats?.vendor_assigned || 0}
                  </span>
                </td>

                {/* Drivers */}
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-700">
                    {shift.stats?.driver_assigned || 0}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleShiftRoute(shift)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      Manage
                    </button>
                    <button
                      onClick={() => handleGenerateClick(shift)}
                      disabled={generatingRoute === shift.shift_id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {generatingRoute === shift.shift_id ? (
                        <>
                          <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-blue-700"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Route className="w-3.5 h-3.5" />
                          {needsRegeneration(shift) ? "Regenerate" : "Generate"}
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleShiftRoutesDelete(shift)}
                      disabled={deletingShift === shift.shift_id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingShift === shift.shift_id ? (
                        <>
                          <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-red-700"></div>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

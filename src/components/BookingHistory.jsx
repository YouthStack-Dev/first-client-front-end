import { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import BookingCard from "./booking/BookingCard";
import { API_CLIENT } from "../Api/API_Client";

const BookingHistory = ({
  bookings = [],
  onBack,
  filters = {},
  onFilterChange,
  onClearFilters,
  isLoading = false,
  isError = false,
  errorMessage = "",
  emptyMessage = "You haven't made any bookings yet.",
  title = "Booking History",
  showLocationInfo = true,
  onUpdateBooking,
}) => {
  // ✅ NEW: state to track which booking is pending cancel confirmation
  const [confirmCancel, setConfirmCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: {
        bg: "bg-green-100",
        text: "text-green-800",
        border: "border-green-200",
        icon: CheckCircle,
      },
      cancelled: {
        bg: "bg-red-100",
        text: "text-red-800",
        border: "border-red-200",
        icon: XCircle,
      },
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        border: "border-yellow-200",
        icon: Clock,
      },
      completed: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        border: "border-blue-200",
        icon: CheckCircle,
      },
    };

    const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}
      >
        <IconComponent className="w-3 h-3" />
        {status?.charAt(0).toUpperCase() + status?.slice(1) || "Pending"}
      </span>
    );
  };

  const getShiftType = (shiftId) => {
    const shiftTypes = {
      1: {
        label: "IN",
        bg: "bg-blue-100",
        text: "text-blue-800",
        border: "border-blue-200",
      },
      2: {
        label: "OUT",
        bg: "bg-purple-100",
        text: "text-purple-800",
        border: "border-purple-200",
      },
    };

    const shift = shiftTypes[shiftId] || shiftTypes[1];

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${shift.bg} ${shift.text} ${shift.border}`}
      >
        {shift.label}
      </span>
    );
  };

  const hasActiveFilters = filters.date || filters.status || filters.shiftType;

  // ✅ Step 1: Just open the modal (no window.confirm)
  const handleCancelClick = (bookingId) => {
    setConfirmCancel(bookingId);
  };

  // ✅ Step 2: Actual API call after user confirms in modal
  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    try {
      const response = await API_CLIENT.patch(`/bookings/cancel/${confirmCancel}`);

      if (response.status === 200 || response.status === 204) {
        console.log("Booking cancelled successfully:", response.data);
        setConfirmCancel(null);
        // ✅ Refresh the list — booking stays but status updates to Cancelled
        onFilterChange("date", filters.date);
      } else {
        throw new Error("Failed to cancel booking");
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      setConfirmCancel(null);
      const msg =
        error.response?.data?.message ||
        (error.request ? "Network error: Please check your connection" : "An unexpected error occurred");
      alert(`Error: ${msg}`);
    } finally {
      setIsCancelling(false);
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        </div>

        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 font-medium">Failed to load bookings</p>
        <p className="text-gray-500 text-sm mb-4">{errorMessage}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">

      {/* ✅ Custom Cancel Confirmation Modal */}
      {confirmCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !isCancelling && setConfirmCancel(null)}
          />

          {/* Modal Card */}
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 z-10">
            {/* Icon */}
            <div className="flex items-center justify-center w-14 h-14 bg-red-100 rounded-full mx-auto mb-4">
              <XCircle className="w-7 h-7 text-red-600" />
            </div>

            {/* Text */}
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
              Cancel Booking?
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmCancel(null)}
                disabled={isCancelling}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Keep Booking
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-medium text-sm hover:bg-red-700 transition-colors disabled:opacity-75"
              >
                {isCancelling ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>

        <div className="flex items-center gap-2 text-gray-600" />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            value={filters.date || ""}
            onChange={(e) => onFilterChange("date", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status || ""}
            onChange={(e) => onFilterChange("status", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Status</option>
            {filters.availableStatuses?.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters */}
        <div className="flex items-end">
          <button
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
            className="w-full px-4 py-2 border rounded-lg text-sm bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Count */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
        </p>
        {hasActiveFilters && (
          <p className="text-sm text-blue-600 font-medium">Filters Active</p>
        )}
      </div>

      {/* List */}
      <div className="space-y-4">
        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">No bookings found</p>
            <p className="text-gray-400 text-sm mt-1">{emptyMessage}</p>
          </div>
        ) : (
          bookings.map((booking) => (
            <BookingCard
              key={booking.booking_id}
              booking={booking}
              getStatusBadge={getStatusBadge}
              getShiftType={getShiftType}
              showLocationInfo={showLocationInfo}
              onCancelBooking={handleCancelClick} 
              onUpdateBooking={onUpdateBooking}
              cancellationCutoffWindow={60}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default BookingHistory;
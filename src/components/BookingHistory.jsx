// components/BookingHistory.jsx
import {
  ArrowLeft,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  Navigation,
} from "lucide-react";

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
}) => {
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

    const normalizedStatus = status?.toLowerCase();
    const config = statusConfig[normalizedStatus] || statusConfig.pending;
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

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
          </div>
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

  // Error state
  if (isError) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        </div>
        <div className="text-center py-12">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium mb-2">
            Failed to load bookings
          </p>
          <p className="text-gray-500 text-sm">{errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <div className="flex items-center gap-2 text-gray-600">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filters</span>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        {/* Date Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            value={filters.date || ""}
            onChange={(e) => onFilterChange("date", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status || ""}
            onChange={(e) => onFilterChange("status", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            {filters.availableStatuses?.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Shift Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Shift Type
          </label>
          <select
            value={filters.shiftType || ""}
            onChange={(e) => onFilterChange("shiftType", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Types</option>
            <option value="1">IN</option>
            <option value="2">OUT</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        <div className="flex items-end">
          <button
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
        </p>
        {hasActiveFilters && (
          <p className="text-sm text-blue-600 font-medium">Filters Active</p>
        )}
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">
              No bookings found
            </p>
            <p className="text-gray-400 text-sm mt-1">{emptyMessage}</p>
          </div>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking.booking_id}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center justify-center w-12 h-12 bg-blue-50 rounded-lg border border-blue-200">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {new Date(booking.booking_date).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Shift {booking.shift_id}
                      </span>
                      {getShiftType(booking.shift_id)}
                    </div>

                    {/* ✅ Show OTP only if it exists */}
                    {booking.OTP && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm font-medium text-gray-700">
                          OTP:
                        </span>
                        <span className="text-sm text-blue-600 font-semibold">
                          {booking.OTP}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {getStatusBadge(booking.status)}
                </div>
              </div>

              {/* Location Information */}
              {showLocationInfo && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-gray-700">
                        Pickup
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {booking.pickup_location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Navigation className="w-4 h-4 text-red-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-gray-700">Drop</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {booking.drop_location}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Booking ID: {booking.booking_id}
                </p>
                <p className="text-xs text-gray-500">
                  Created: {new Date(booking.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BookingHistory;

// components/BookingHistory.jsx
import { useState, useMemo } from 'react';
import { ArrowLeft, Filter, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';

const BookingHistory = ({ bookings = [], onBack }) => {
  const [filters, setFilters] = useState({
    date: '',
    status: '',
    logType: ''
  });

  // Filter bookings based on selected filters
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const matchesDate = !filters.date || booking.booking_date === filters.date;
      const matchesStatus = !filters.status || booking.status === filters.status;
      const matchesLogType = !filters.logType || booking.log_type === filters.logType;
      
      return matchesDate && matchesStatus && matchesLogType;
    });
  }, [bookings, filters]);

  const clearFilters = () => {
    setFilters({
      date: '',
      status: '',
      logType: ''
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200',
        icon: CheckCircle
      },
      cancelled: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-200',
        icon: XCircle
      },
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-200',
        icon: Clock
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        <IconComponent className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getLogTypeBadge = (logType) => {
    const isIn = logType === 'IN';
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
        isIn 
          ? 'bg-blue-100 text-blue-800 border-blue-200' 
          : 'bg-purple-100 text-purple-800 border-purple-200'
      }`}>
        {logType}
      </span>
    );
  };

  // Get unique values for filter dropdowns
  const uniqueDates = [...new Set(bookings.map(booking => booking.booking_date))].sort();
  const uniqueStatuses = [...new Set(bookings.map(booking => booking.status))];
  const uniqueLogTypes = [...new Set(bookings.map(booking => booking.log_type))];

  const hasActiveFilters = filters.date || filters.status || filters.logType;

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
            <span>Back to Profile</span>
          </button>
        </div>
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
          <select
            value={filters.date}
            onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Dates</option>
            {uniqueDates.map(date => (
              <option key={date} value={date}>
                {new Date(date).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            {uniqueStatuses.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Log Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Check Type
          </label>
          <select
            value={filters.logType}
            onChange={(e) => setFilters(prev => ({ ...prev, logType: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Types</option>
            {uniqueLogTypes.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button */}
        <div className="flex items-end">
          <button
            onClick={clearFilters}
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
          Showing {filteredBookings.length} of {bookings.length} bookings
        </p>
        {hasActiveFilters && (
          <p className="text-sm text-blue-600 font-medium">
            Filters Active
          </p>
        )}
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">No bookings found</p>
            <p className="text-gray-400 text-sm mt-1">
              {bookings.length === 0 
                ? "You haven't made any bookings yet." 
                : "No bookings match your current filters."
              }
            </p>
          </div>
        ) : (
          filteredBookings.map(booking => (
            <div
              key={booking.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center justify-center w-12 h-12 bg-blue-50 rounded-lg border border-blue-200">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {new Date(booking.booking_date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {booking.shift_time.slice(0, 5)}
                    </span>
                    {getLogTypeBadge(booking.log_type)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {getStatusBadge(booking.status)}
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    Booked on {new Date(booking.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BookingHistory;
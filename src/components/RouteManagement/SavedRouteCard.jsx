import React, { useState } from "react";
import { ChevronDown, ChevronUp, Trash2, MapPin, Clock, X } from "lucide-react";

const SavedRouteCard = ({
  route,
  isSelected,
  onRouteSelect,
  onDeleteBooking,
  onDeleteRoute,
  selectedBookings,
  onBookingSelect,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDeleteBooking = (e, bookingId) => {
    e.stopPropagation();
    if (
      window.confirm(
        "Are you sure you want to remove this booking from the route?"
      )
    ) {
      onDeleteBooking(route.route_id, bookingId);
    }
  };

  const handleDeleteRoute = (e) => {
    e.stopPropagation();
    if (
      window.confirm(
        "Are you sure you want to delete this entire route? This action cannot be undone."
      )
    ) {
      onDeleteRoute(route.route_id);
    }
  };

  return (
    <div
      className={`bg-white border rounded-lg transition-all ${
        isSelected
          ? "border-purple-500 shadow-md"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {/* Route Header */}
      <div className="p-3">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onRouteSelect(route.route_id);
            }}
            className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />

          {/* Route Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">
                  Route #{route.route_id}
                </span>
                <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                  {route.log_type}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                {/* Delete Route Button */}
                <button
                  onClick={handleDeleteRoute}
                  className="p-1.5 hover:bg-red-50 rounded transition-colors group"
                  title="Delete entire route"
                >
                  <Trash2 className="w-4 h-4 text-red-500 group-hover:text-red-700" />
                </button>

                {/* Expand/Collapse Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <div className="text-xs text-gray-500 mb-2">
              Shift {route.shift_id} • {route.shift_time}
            </div>

            {/* Stats */}
            {route.estimations && (
              <div className="flex items-center gap-3 text-xs mb-2">
                <span className="text-green-600 font-medium">
                  {route.estimations.total_distance_km} km
                </span>
                <span className="text-blue-600 font-medium">
                  {route.estimations.total_time_minutes} min
                </span>
                <span className="text-gray-600 font-medium">
                  {route.bookings.length} stops
                </span>
              </div>
            )}

            {/* Preview when collapsed */}
            {!isExpanded && (
              <div className="text-xs text-gray-600">
                {route.bookings.slice(0, 2).map((b, i) => (
                  <span key={b.booking_id}>
                    {b.employee_code}
                    {i < Math.min(1, route.bookings.length - 1) && ", "}
                  </span>
                ))}
                {route.bookings.length > 2 &&
                  ` +${route.bookings.length - 2} more`}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Booking List */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50 p-3">
          <div className="space-y-2">
            {route.bookings.map((booking, index) => (
              <div
                key={booking.booking_id}
                className="bg-white rounded border border-gray-200 p-2.5 hover:border-purple-300 transition-colors group"
              >
                <div className="flex items-start gap-2">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedBookings?.has(booking.booking_id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      onBookingSelect && onBookingSelect(booking.booking_id);
                    }}
                    className="mt-0.5 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />

                  {/* Number */}
                  <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center text-xs font-semibold text-gray-600 flex-shrink-0">
                    {index + 1}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-gray-900">
                        {booking.employee_code}
                      </span>
                      <button
                        onClick={(e) =>
                          handleDeleteBooking(e, booking.booking_id)
                        }
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    </div>

                    <div className="text-xs text-gray-600">
                      <div className="flex items-start gap-1 mb-1">
                        <MapPin className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-1">
                          {booking.pickup_location}
                        </span>
                      </div>
                      <div className="flex items-start gap-1">
                        <MapPin className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-1">
                          {booking.drop_location}
                        </span>
                      </div>
                    </div>

                    {route.estimations?.estimated_pickup_times && (
                      <div className="flex items-center gap-3 text-xs pt-1 border-t border-gray-100">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-blue-500" />
                          <span className="text-blue-600 font-medium">
                            {
                              route.estimations.estimated_pickup_times[
                                booking.booking_id
                              ]
                            }
                          </span>
                        </div>
                        {route.estimations?.estimated_drop_times && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-orange-500" />
                            <span className="text-orange-600 font-medium">
                              {
                                route.estimations.estimated_drop_times[
                                  booking.booking_id
                                ]
                              }
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedRouteCard;

import { ChevronDown, ChevronRight } from "lucide-react";

const RouteCard = ({
  route,
  isExpanded,
  onToggleExpand,
  isSelected,
  onToggleSelect,
  onDeleteBooking,
}) => {
  const color = getClusterColor(route.route_id);

  return (
    <div
      className={`border rounded-lg transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-50 shadow-md"
          : "border-gray-300 bg-white"
      }`}
    >
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(route.route_id)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />

            <button
              onClick={onToggleExpand}
              className="flex items-center gap-2 flex-1 text-left hover:bg-gray-50 rounded p-1"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="font-medium text-gray-800">
                  Route #{route.route_id}
                </span>
              </div>
            </button>
          </div>
        </div>

        <div className="mt-2 ml-6 flex items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{route.bookings.length} bookings</span>
          </div>
          {route.estimations && (
            <>
              <span className="flex items-center gap-1">
                <span>📏</span>
                {route.estimations.total_distance_km} km
              </span>
              <span className="flex items-center gap-1">
                <span>⏱️</span>
                {route.estimations.total_time_minutes} min
              </span>
            </>
          )}
        </div>

        {isExpanded && route.estimations && (
          <div className="mt-3 ml-6 pt-3 border-t border-gray-200">
            <div className="space-y-2">
              {route.bookings.map((booking) => (
                <div
                  key={booking.booking_id}
                  className="bg-gray-50 rounded p-2.5 text-xs border border-gray-200 relative group"
                >
                  <button
                    onClick={() => onDeleteBooking(booking.booking_id)}
                    className="absolute top-2 right-2 p-1 rounded bg-red-100 text-red-600 hover:bg-red-200 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete booking"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>

                  <div className="flex items-center justify-between mb-2 pr-8">
                    <span className="font-medium text-gray-800">
                      {booking.employee_code}
                    </span>
                    <span className="text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                      ID: {booking.booking_id}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-gray-600 mb-2">
                    <div className="bg-green-50 p-1.5 rounded">
                      <span className="text-gray-500 font-medium">Pickup:</span>{" "}
                      <span className="text-green-700 font-semibold">
                        {
                          route.estimations.estimated_pickup_times[
                            booking.booking_id
                          ]
                        }
                      </span>
                    </div>
                    <div className="bg-blue-50 p-1.5 rounded">
                      <span className="text-gray-500 font-medium">Drop:</span>{" "}
                      <span className="text-blue-700 font-semibold">
                        {
                          route.estimations.estimated_drop_times[
                            booking.booking_id
                          ]
                        }
                      </span>
                    </div>
                  </div>
                  <div className="text-gray-600 flex items-start gap-1">
                    <span className="text-gray-400">📍</span>
                    <span className="flex-1">
                      {booking.pickup_location.split(",").slice(0, 2).join(",")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteCard;

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  MapPin,
  Flag,
  Clock,
  Users,
} from "lucide-react";
import { getClusterColor } from "../../utils/routeHelpers";

const ClusterCard = ({
  cluster,
  onClusterSelect,
  onBookingSelect,
  selectedClusters,
  selectedBookings,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const color = getClusterColor(cluster.cluster_id);

  const isClusterSelected = selectedClusters.has(cluster.cluster_id);
  const clusterBookingCount = cluster.bookings.length;
  const selectedBookingCount = cluster.bookings.filter((booking) =>
    selectedBookings.has(booking.booking_id)
  ).length;

  const handleClusterCheckboxChange = () => {
    onClusterSelect(cluster.cluster_id, cluster.bookings);
  };

  const handleBookingCheckboxChange = (bookingId) => {
    onBookingSelect(bookingId, cluster.cluster_id);
  };

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
      {/* Cluster Header */}
      <div className="p-3">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <div className="mt-0.5">
            <input
              type="checkbox"
              checked={isClusterSelected}
              onChange={handleClusterCheckboxChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <button
                onClick={handleToggleExpand}
                className="flex items-center gap-2 text-left hover:bg-gray-50 rounded px-2 py-1 transition-colors flex-1"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
                )}

                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-semibold text-gray-900 text-sm">
                    Cluster {cluster.cluster_id}
                  </span>
                </div>
              </button>

              {/* Status Badges */}
              <div className="flex items-center gap-2">
                {selectedBookingCount > 0 && !isClusterSelected && (
                  <span className="bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                    {selectedBookingCount}/{clusterBookingCount}
                  </span>
                )}
                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {clusterBookingCount}
                </span>
              </div>
            </div>

            {/* Additional Cluster Info */}
            <div className="flex items-center gap-3 text-xs text-gray-600 ml-6 mt-1">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{clusterBookingCount} pickups</span>
              </div>
              {cluster.bookings[0]?.drop_location && (
                <div className="flex items-center gap-1">
                  <Flag className="w-3 h-3" />
                  <span className="truncate max-w-[100px]">
                    {cluster.bookings[0].drop_location.split(",")[0]}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bookings List - Ultra Compact */}
        {isExpanded && (
          <div className="mt-2 ml-6 space-y-1">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Bookings
            </div>

            {cluster.bookings.map((booking) => {
              const isBookingSelected =
                selectedBookings.has(booking.booking_id) || isClusterSelected;

              return (
                <div
                  key={booking.booking_id}
                  className={`flex items-center gap-2 p-1.5 rounded border transition-colors ${
                    isBookingSelected
                      ? "bg-blue-50 border-blue-200"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isBookingSelected}
                    onChange={() =>
                      handleBookingCheckboxChange(booking.booking_id)
                    }
                    disabled={isClusterSelected}
                    className={`w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0 ${
                      isClusterSelected ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  />

                  <div className="flex items-center gap-3 text-xs flex-1 min-w-0">
                    <span className="font-medium text-gray-900 w-14 truncate">
                      {booking.employee_code}
                    </span>

                    <div className="flex items-center gap-1 flex-1 min-w-0">
                      <MapPin className="w-3 h-3 text-green-600 flex-shrink-0" />
                      <span className="truncate text-gray-600">
                        {booking.pickup_location.split(",")[0]}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-gray-500 whitespace-nowrap">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">{booking.pickup_time}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClusterCard;

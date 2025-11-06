import React from "react";
import { X, MapPin, User, Navigation } from "lucide-react";

const ClusterDetailsModal = ({
  isOpen,
  onClose,
  selectedClusterDetails,
  commonDestination,
  getClusterColor,
}) => {
  if (!isOpen || !selectedClusterDetails) return null;
  console.log(
    " this is the selected cluster details selectedClusterDetails:",
    selectedClusterDetails
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md"
              style={{
                backgroundColor: getClusterColor(
                  selectedClusterDetails.cluster.cluster_id
                ),
              }}
            >
              {selectedClusterDetails.cluster.cluster_id}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                Cluster {selectedClusterDetails.cluster.cluster_id} - Bookings
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {selectedClusterDetails.cluster.bookings.length} bookings
                {commonDestination && " • Common Destination Available"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Table Container */}
        <div className="overflow-auto max-h-[60vh]">
          <table className="w-full">
            {/* Table Header */}
            <thead className="bg-gray-100 sticky top-0">
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  #
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Employee
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Pickup Coordinates
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Drop Location
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="bg-white divide-y divide-gray-200">
              {selectedClusterDetails.cluster.bookings.map((booking, index) => (
                <tr
                  key={booking.booking_id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Serial Number */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {index + 1}
                    </div>
                  </td>

                  {/* Employee */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div className="text-sm font-medium text-gray-900">
                        {booking.employee_code || "N/A"}
                      </div>
                    </div>
                  </td>

                  {/* Booking ID */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-mono">
                      {booking.booking_id}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        booking.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : booking.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : booking.status === "completed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {booking.status?.toUpperCase() || "UNKNOWN"}
                    </span>
                  </td>

                  {/* Pickup Coordinates */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <div className="text-sm">
                        {booking.pickup_latitude && booking.pickup_longitude ? (
                          <div className="font-mono text-xs">
                            <div>Lat: {booking.pickup_latitude.toFixed(6)}</div>
                            <div>
                              Lng: {booking.pickup_longitude.toFixed(6)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Drop Location */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <div className="text-sm max-w-xs">
                        {commonDestination ? (
                          <div>
                            <div className="text-xs text-green-600 font-semibold">
                              Common
                            </div>
                            <div
                              className="truncate"
                              title={commonDestination.address}
                            >
                              {commonDestination.address}
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-900">
                            {booking.drop_location || "N/A"}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Actions */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Showing {selectedClusterDetails.cluster.bookings.length} bookings
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition-colors shadow-sm"
            >
              Close
            </button>
            <button
              className="px-6 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors shadow-sm"
              onClick={() => {
                // Export or additional action
                console.log("Export cluster data");
              }}
            >
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClusterDetailsModal;

import { X, MapPin, Phone, Mail } from "lucide-react";

const BookingDetailsModal = ({ isOpen, onClose, shift, bookings }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Booking Details
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Shift: {shift?.shift_time} ({shift?.log_type}) • Total:{" "}
              {bookings?.length || 0} bookings
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Employee
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Pickup Location
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Drop Location
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings && bookings.length > 0 ? (
                bookings.map((booking, index) => (
                  <tr key={booking.id || index} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-xs font-semibold text-blue-700">
                              {booking.employee_code?.charAt(0) || "U"}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {booking.employee_code || "N/A"}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {booking.employee_id || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">
                          {booking.pickup_location || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">
                          {booking.drop_location || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            booking.is_routed
                              ? "bg-green-100 text-green-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {booking.is_routed ? "Routed" : "Pending"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-8 text-center text-gray-500 text-sm"
                  >
                    No booking details available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;

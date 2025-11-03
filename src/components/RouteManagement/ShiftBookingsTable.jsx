import React, { useState } from "react";
import {
  Clock,
  Users,
  Truck,
  UserCircle,
  Route,
  AlertCircle,
} from "lucide-react";
import BookingDetailsModal from "../modals/BookingDetailsModal";

const ShiftBookingsTable = ({ data, date, loading, selectedShiftType }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    shift: null,
    bookings: [],
  });

  console.log(" this is the data in the data table", data);

  // Filter data based on selected shift type
  const filteredData = React.useMemo(() => {
    if (!data) return [];

    if (selectedShiftType === "All") return data;

    return data.filter((shift) => {
      if (selectedShiftType === "In") return shift.log_type === "IN";
      if (selectedShiftType === "Out") return shift.log_type === "OUT";
      return true;
    });
  }, [data, selectedShiftType]);

  const formatTime = (time) => {
    if (!time) return "-";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };
  const handleUnroutedClick = (shift) => {
    // Assuming `shift` contains `id` and `date` properties
    const routeUrl = `/shift/${shift.id}/${date}/suggestions-route`;
    console.log("Unrouted button clicked for shift:", routeUrl);

    // Open in a new tab
    window.open(routeUrl, "_blank");
  };

  const handleTotalClick = (shift) => {
    console.log("Total chethan bookings clicked for shift:", shift);

    // Use actual bookings data if available, otherwise use mock data
    const bookings =
      shift.bookings && shift.bookings.length > 0
        ? shift.bookings
        : Array.from({ length: shift.stats?.total_bookings || 0 }, (_, i) => ({
            id: i + 1,
            employee_name: `Employee ${i + 1}`,
            employee_id: `EMP${1000 + i}`,
            phone: `+91-98765${43210 + i}`,
            email: `employee${i + 1}@company.com`,
            pickup_location: `Location ${String.fromCharCode(
              65 + (i % 26)
            )}, Sector ${i + 1}`,
            drop_location: `Destination ${String.fromCharCode(
              65 + ((i + 5) % 26)
            )}, Area ${i + 1}`,
            is_routed: i < (shift.stats?.routed_bookings || 0),
            route_name:
              i < (shift.stats?.routed_bookings || 0)
                ? `Route ${String.fromCharCode(65 + (i % 5))}`
                : null,
          }));

    setModalState({
      isOpen: true,
      shift: shift,
      bookings: bookings,
    });
  };

  const handleRoutedClick = (shift) => {
    // Assuming `shift` contains `id` and `date` properties
    const routeUrl = `/shift/${shift.id}/${date}/saved-routes`;
    console.log("Unrouted button clicked for shift:", routeUrl);

    // Open in a new tab
    window.open(routeUrl, "_blank");
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      shift: null,
      bookings: [],
    });
  };

  const safeData = Array.isArray(filteredData) ? filteredData : [];

  const totalBookings = safeData.reduce(
    (sum, shift) => sum + (shift.stats?.total_ || 0),
    0
  );
  const totalRouted = safeData.reduce(
    (sum, shift) => sum + (shift.stats?.routed_bookings || 0),
    0
  );
  const totalUnrouted = safeData.reduce(
    (sum, shift) => sum + (shift.stats?.unrouted_bookings || 0),
    0
  );

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500 text-sm">
        Loading shift data...
      </div>
    );
  }

  return (
    <>
      <div className="w-full">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Stats Summary */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-gray-600">Total:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {totalBookings}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-600">Routed:</span>
                  <span className="text-sm font-semibold text-green-700">
                    {totalRouted}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span className="text-sm text-gray-600">Pending:</span>
                  <span className="text-sm font-semibold text-amber-600">
                    {totalUnrouted}
                  </span>
                </div>
              </div>
              {date && (
                <div className="text-sm text-gray-500">
                  {new Date(date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Shift Time
                      </span>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Bookings
                      </span>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <Route className="w-4 h-4 text-gray-500" />
                      <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Unrouted
                      </span>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-gray-500" />
                      <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Vendor / Driver / Routes
                      </span>
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {safeData.length > 0 ? (
                  safeData.map((shift) => (
                    <tr
                      key={shift.shift_id || Math.random()}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-900">
                            {formatTime(shift.shift_time)}
                          </span>
                          <span
                            className={`text-xs font-medium mt-0.5 ${
                              shift.log_type === "IN"
                                ? "text-green-600"
                                : "text-blue-600"
                            }`}
                          >
                            {shift.log_type}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {/* Total Bookings Button */}
                          <button
                            onClick={() => handleTotalClick(shift)}
                            className="flex items-center space-x-2 hover:bg-gray-100 px-3 py-2 rounded border border-gray-200 transition-colors"
                          >
                            <span className="text-xs text-gray-500">
                              Total:
                            </span>
                            <span className="text-sm font-semibold text-gray-900">
                              {shift.stats?.total_bookings || 0}
                            </span>
                          </button>

                          {/* Routed Bookings Button */}
                          <button
                            onClick={() => handleRoutedClick(shift)}
                            className="flex items-center space-x-2 hover:bg-green-50 px-3 py-2 rounded border border-green-200 transition-colors"
                          >
                            <span className="text-xs text-gray-500">
                              Routed:
                            </span>
                            <span className="text-sm font-semibold text-green-600">
                              {shift.stats?.routed_bookings || 0}
                            </span>
                          </button>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <button
                            onClick={() => handleUnroutedClick(shift)}
                            className={`inline-flex items-center px-3 py-2 rounded-md border transition-colors ${
                              shift.stats?.unrouted_bookings > 0
                                ? "bg-amber-50 border-amber-200 hover:bg-amber-100 text-amber-700"
                                : "bg-green-50 border-green-200 hover:bg-green-100 text-green-700"
                            }`}
                          >
                            <span className="text-sm font-semibold">
                              {shift.stats?.unrouted_bookings || 0}
                            </span>
                          </button>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <Truck className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">
                              {shift.stats?.vendor_assigned || 0}
                            </span>
                          </div>
                          <div className="h-4 w-px bg-gray-200"></div>
                          <div className="flex items-center space-x-1">
                            <UserCircle className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">
                              {shift.stats?.driver_assigned || 0}
                            </span>
                          </div>
                          <div className="h-4 w-px bg-gray-200"></div>
                          <div className="flex items-center space-x-1">
                            <Route className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">
                              {shift.stats?.route_count || 0}
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="text-center text-gray-500 py-6 text-sm"
                    >
                      No shift data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
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

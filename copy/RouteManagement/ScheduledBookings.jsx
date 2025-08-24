import React, { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeft,
  CalendarDays,
} from "lucide-react";
import ScheduleBooks from "../../staticData/ScheduleBooks";
import ToolBar from "../ui/ToolBar";

const ScheduledBookings = ({ toggleRouting, setRoutingData, selectedDate }) => {
  const [selectedShiftType, setSelectedShiftType] = useState("All");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [shiftBookings, setShiftBookings] = useState([]);
  const [selectedOption, setSelectedOption] = useState("Select option");

  const [hasRoutesPermission] = useState(true);
  const [hasTripSheetsPermission] = useState(false);

  const shiftOptions = [
    "Select option",
    "Generate Route",
    "Inter Shift Copy",
    "Update Pickup Time",
    "Delete Route",
    "Download",
    "Upload Vehicle",
  ];

  // 🔹 Load shifts for the selected date
  useEffect(() => {
    const dateData = ScheduleBooks[selectedDate];
    if (dateData?.TimeShifts) {
      let shifts = dateData.TimeShifts;

      // Apply filter: In / Out
      if (selectedShiftType !== "All") {
        shifts = shifts.filter((shift) =>
          selectedShiftType === "In"
            ? shift.bookingType === "LOGIN"
            : shift.bookingType === "LOGOUT"
        );
      }

      setShiftBookings(shifts);
    } else {
      setShiftBookings([]);
    }
  }, [selectedDate, selectedShiftType]);

  const handleButtonClick = (shift) => {
    setSelectedShift(shift);
    setShowBookingModal(true);
  };

  const handleRoutingView = (shift) => {
    setRoutingData(shift?.routes || []);
    toggleRouting("routing");
  };

  const getVendorCount = (routes = []) =>
    routes.filter((r) => r.vendorId).length;
  const getVehicleCount = (routes = []) =>
    routes.filter((r) => r.vehicleId).length;

  const totalLogin = shiftBookings
    .filter((s) => s.bookingType === "LOGIN")
    .reduce((sum, s) => sum + (s.bookings?.length || 0), 0);

  const totalLogout = shiftBookings
    .filter((s) => s.bookingType === "LOGOUT")
    .reduce((sum, s) => sum + (s.bookings?.length || 0), 0);

  const handleShiftOption = (option, shift) => {
    if (!shift) return;
    switch (option) {
      case "Generate Route":
        console.log("Generating route for", shift.shift);
        break;
      case "Delete Route":
        console.log("Deleting route for", shift.shift);
        break;
      default:
        console.log(option, shift.shift);
    }
  };

  const visiblePanelsCount =
    Number(hasRoutesPermission) + Number(hasTripSheetsPermission);

  // ---------------- Toolbar ----------------
  const topToolbar = (
    <ToolBar
      className="mb-6"
      leftElements={
        <div className="flex items-center gap-4">
          {/* Back Button (go back to date selection) */}
          <button
            onClick={() => toggleRouting("date")}
            className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Scheduled Bookings heading */}
          <h1 className="text-lg font-semibold text-gray-800">Scheduled Bookings </h1>

          {/* Shift Type Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Shift Type</label>
            <select
              value={selectedShiftType}
              onChange={(e) => setSelectedShiftType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm" >
              <option value="All">All</option>
              <option value="In">LogIn</option>
              <option value="Out">LogOut</option>
            </select>
          </div>
        </div>
      }
      rightElements={
        <div className="flex items-center gap-2 text-gray-600">
          <CalendarDays className="w-5 h-5" />
          <span className="font-medium">{selectedDate || ""}</span>
        </div>
      }
    />
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto px-4 py-6">
        {/* Top Toolbar */}
        {topToolbar}

        {/* Panels */}
        {visiblePanelsCount > 0 ? (
          <div
            className={`grid ${
              visiblePanelsCount === 2 ? "lg:grid-cols-2" : "grid-cols-1"
            } gap-6`}
          >
            {hasRoutesPermission && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                {/* Actions toolbar */}
                <ToolBar
                  className="border-b"
                  leftElements={
                    <select
                      value={selectedOption}
                      onChange={(e) => setSelectedOption(e.target.value)}
                      className="text-sm border rounded px-2 py-1 w-40"
                    >
                      {shiftOptions.map((opt, idx) => (
                        <option key={idx} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  }
                  rightElements={
                    <button
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition"
                      onClick={() =>
                        handleShiftOption(selectedOption, selectedShift)
                      }
                    >
                      GO
                    </button>
                  }
                />

                {/* Shifts Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-100 text-[13px] text-black">
                      <tr>
                        {[
                          "Shift Time (Type)",
                          "Employees (Routes)",
                          "Manage Routes",
                          "Fleet Mix (Vehicle Occupancy)",
                          "Vehicles/Vendors/Routes",
                        ].map((col) => (
                          <th
                            key={col}
                            className="px-4 py-3 text-left font-medium uppercase tracking-wider"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr className="bg-gray-50 font-semibold">
                        <td className="px-4 py-3">
                          Total - Login: {totalLogin}, Logout: {totalLogout}
                        </td>
                        <td className="px-4 py-3">
                          {shiftBookings.reduce(
                            (sum, s) => sum + (s.bookings?.length || 0),
                            0
                          )}
                        </td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3">Generated</td>
                        <td className="px-4 py-3">
                          {`${shiftBookings.reduce(
                            (sum, s) => sum + getVendorCount(s.routes),
                            0
                          )}/${shiftBookings.reduce(
                            (sum, s) => sum + getVehicleCount(s.routes),
                            0
                          )}/${shiftBookings.reduce(
                            (sum, s) => sum + (s.routes?.length || 0),
                            0
                          )}`}
                        </td>
                      </tr>

                      {shiftBookings.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="text-center py-4 text-gray-500"
                          >
                            No shifts available
                          </td>
                        </tr>
                      ) : (
                        shiftBookings.map((shift, idx) => (
                          <tr
                            key={idx}
                            className={
                              idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }
                          >
                            <td className="px-4 py-3 flex items-center">
                              {shift.bookingType === "LOGIN" ? (
                                <ArrowUpRight className="w-4 h-4 text-green-600 mr-2" />
                              ) : (
                                <ArrowDownRight className="w-4 h-4 text-red-600 mr-2" />
                              )}
                              {shift.shift} ({shift.bookingType})
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleButtonClick(shift)}
                                className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition"
                              >
                                {shift.routes?.length === 0
                                  ? "Schedule"
                                  : "Routed"}{" "}
                                {shift.bookings?.length || 0}
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <input type="checkbox" className="h-4 w-4" />
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {shift.routes
                                ?.map(
                                  (r) =>
                                    `${r.vehicleType || "SEDAN"}:${
                                      r.vehicleCount || 0
                                    } (${r.occupancy || 0}%)`
                                )
                                .join(", ")}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              <button
                                onClick={() => handleRoutingView(shift)}
                                className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition"
                              >
                                {`${getVendorCount(shift.routes)}/${getVehicleCount(
                                  shift.routes
                                )}/${shift.routes?.length || 0}`}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-700">
              No Panels Available
            </h2>
            <p className="text-gray-500 mt-2">
              You don’t have permission to view any panels.
            </p>
          </div>
        )}

        {/* Booking Modal */}
        {showBookingModal && selectedShift && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 overflow-hidden">
              {/* Modal Header */}
              <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800">
                  Booking Details - {selectedShift.shift} (
                  {selectedShift.bookingType})
                </h3>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 max-h-[70vh] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200 table-fixed">
                  <thead className="bg-gray-100">
                    <tr>
                      {[
                        "ID",
                        "Name",
                        "Phone",
                        "Gender",
                        "Actual Office",
                        "Pickup Location",
                        "Drop Location",
                      ].map((col) => (
                        <th
                          key={col}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedShift.bookings.length === 0 ? (
                      <tr>
                        <td colSpan={7}
                          className="text-center py-4 text-gray-500" >
                          No bookings available
                        </td>
                      </tr>
                    ) : (
                      selectedShift.bookings.map((booking) => (
                        <tr key={booking.id}
                          className="hover:bg-gray-50 transition">
                          <td className="px-4 py-3 text-sm">{booking.id}</td>
                          <td className="px-4 py-3 text-sm">{booking.customer?.name}</td>
                          <td className="px-4 py-3 text-sm">{booking.customer?.phoneNo} </td>
                          <td className="px-4 py-3 text-sm">{booking.customer?.gender} </td>
                          <td className="px-4 py-3 text-sm break-words max-w-xs">{booking.customer?.address}</td>
                          <td className="px-4 py-3 text-sm break-words max-w-xs">{booking.pickupAddress}</td>
                          <td className="px-4 py-3 text-sm break-words max-w-xs"> {booking.dropAddress}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduledBookings;

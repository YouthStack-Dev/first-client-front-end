import React, { useState, useEffect, useRef } from "react";
import ToolBar from "../ui/ToolBar";
import ScheduleList from "./ScheduleList";
import { API_CLIENT } from "../../Api/API_Client";

const RouteScheduledBookings = ({
  toggleRouting,
  setRoutingData,
  selectedDate: initialSelectedDate,
}) => {
  const [selectedDate, setSelectedDate] = useState(
    initialSelectedDate || new Date().toISOString().split("T")[0]
  );
  const [selectedShiftType, setSelectedShiftType] = useState("All");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [allShiftBookings, setAllShiftBookings] = useState([]); // Store original data
  const [filteredShiftBookings, setFilteredShiftBookings] = useState([]); // Store filtered data
  const [selectedOption, setSelectedOption] = useState("Select option");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [hasRoutesPermission] = useState(true);
  const [hasTripSheetsPermission] = useState(false);

  // Prevent double calls in strict mode
  const hasFetchedRef = useRef(false);

  const shiftOptions = [
    "Select option",
    "Generate Route",
    "Inter Shift Copy",
    "Update Pickup Time",
    "Delete Route",
    "Download",
    "Upload Vehicle",
  ];

  // 🔹 Fetch shifts data from API
  const fetchShiftsData = async (date) => {
    setLoading(true);
    setError(null);

    try {
      const tenantId = "1";
      const response = await API_CLIENT.get(
        `/v1/bookings/tenant/${tenantId}/shifts/bookings?booking_date=${date}`
      );

      if (response.data.success) {
        // Use backend data directly without transformation
        const apiData = response.data.data?.shifts || [];
        setAllShiftBookings(apiData); // Store original data
        setFilteredShiftBookings(apiData); // Initialize filtered data
      } else {
        setError(response.data.message || "Failed to fetch shifts data");
        setAllShiftBookings([]);
        setFilteredShiftBookings([]);
      }
    } catch (err) {
      console.error("Error fetching shifts data:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load shifts data from server"
      );
      setAllShiftBookings([]);
      setFilteredShiftBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Load shifts from API when selected date changes - FIXED: Prevent double calls
  useEffect(() => {
    // Reset ref when date changes
    hasFetchedRef.current = false;

    // Prevent duplicate calls in strict mode
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchShiftsData(selectedDate);
    }
  }, [selectedDate]);

  // 🔹 Apply filter: In / Out - FIXED: No longer mutates state
  useEffect(() => {
    if (allShiftBookings.length === 0) {
      setFilteredShiftBookings([]);
      return;
    }

    if (selectedShiftType === "All") {
      setFilteredShiftBookings(allShiftBookings);
    } else {
      const filtered = allShiftBookings.filter((shift) =>
        selectedShiftType === "In"
          ? shift.log_type === "IN"
          : shift.log_type === "OUT"
      );
      setFilteredShiftBookings(filtered);
    }
  }, [selectedShiftType, allShiftBookings]);

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

  const totalLogin = filteredShiftBookings
    .filter((s) => s.log_type === "IN")
    .reduce((sum, s) => sum + (s.bookings?.length || 0), 0);

  const totalLogout = filteredShiftBookings
    .filter((s) => s.log_type === "OUT")
    .reduce((sum, s) => sum + (s.bookings?.length || 0), 0);

  const handleShiftOption = (option, shift) => {
    if (!shift) return;
    switch (option) {
      case "Generate Route":
        console.log("Generating route for", shift.shift_code);
        alert(`Generating route for ${shift.shift_code} shift`);
        break;
      case "Delete Route":
        console.log("Deleting route for", shift.shift_code);
        alert(`Deleting route for ${shift.shift_code} shift`);
        break;
      default:
        console.log(option, shift.shift_code);
        alert(`${option} for ${shift.shift_code} shift`);
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
          {/* Date Input */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            />
          </div>

          {/* Shift Type Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Shift Type</label>
            <select
              value={selectedShiftType}
              onChange={(e) => setSelectedShiftType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="All">All</option>
              <option value="In">LogIn</option>
              <option value="Out">LogOut</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => {
              hasFetchedRef.current = false;
              fetchShiftsData(selectedDate);
            }}
            disabled={loading}
            className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 disabled:bg-blue-300"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      }
    />
  );

  return (
    <div className="bg-gray-50">
      <div className="mx-auto px-2 py-1">
        {/* Top Toolbar */}
        {topToolbar}

        {/* Loading and Error States */}
        {loading && (
          <div className="text-center py-4">
            <div className="inline-flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
              <p>Loading shifts data...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            <p>Note: {error}</p>
          </div>
        )}

        {/* Panels */}
        {visiblePanelsCount > 0 ? (
          <div
            className={`grid ${
              visiblePanelsCount === 2 ? "lg:grid-cols-2" : "grid-cols-1"
            } gap-6`}
          >
            {hasRoutesPermission && (
              <ScheduleList
                selectedDate={selectedDate}
                shiftBookings={filteredShiftBookings}
                totalLogin={totalLogin}
                totalLogout={totalLogout}
                hasRoutesPermission={hasRoutesPermission}
                selectedOption={selectedOption}
                setSelectedOption={setSelectedOption}
                shiftOptions={shiftOptions}
                handleShiftOption={handleShiftOption}
                handleButtonClick={handleButtonClick}
                handleRoutingView={handleRoutingView}
                getVendorCount={getVendorCount}
                getVehicleCount={getVehicleCount}
                selectedShift={selectedShift}
              />
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-700">
              No Panels Available
            </h2>
            <p className="text-gray-500 mt-2">
              You don't have permission to view any panels.
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
                  Booking Details - {selectedShift.shift_code} (
                  {selectedShift.log_type})
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
                        "Employee Code",
                        "Employee ID",
                        "Status",
                        "Pickup Location",
                        "Drop Location",
                        "Coordinates",
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
                    {selectedShift.bookings?.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="text-center py-4 text-gray-500"
                        >
                          No bookings available
                        </td>
                      </tr>
                    ) : (
                      selectedShift.bookings?.map((booking) => (
                        <tr
                          key={booking.booking_id}
                          className="hover:bg-gray-50 transition"
                        >
                          <td className="px-4 py-3 text-sm">
                            {booking.booking_id}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {booking.employee_code}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {booking.employee_id}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                booking.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm break-words max-w-xs">
                            {booking.pickup_location ||
                              "Location not specified"}
                          </td>
                          <td className="px-4 py-3 text-sm break-words max-w-xs">
                            {booking.drop_location || "Location not specified"}
                          </td>
                          <td className="px-4 py-3 text-sm break-words max-w-xs text-xs">
                            Pickup: {booking.pickup_latitude?.toFixed(4)},{" "}
                            {booking.pickup_longitude?.toFixed(4)}
                            <br />
                            Drop: {booking.drop_latitude?.toFixed(4)},{" "}
                            {booking.drop_longitude?.toFixed(4)}
                          </td>
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

export default RouteScheduledBookings;

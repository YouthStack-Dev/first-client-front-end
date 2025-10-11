import React, { useEffect, useState } from "react";
import ScheduleBooks from "../../staticData/ScheduleBooks";
import ToolBar from "../ui/ToolBar";
import ScheduleList from "./ScheduleList";
import { API_CLIENT } from "../../Api/API_Client";

const ScheduledBookings = ({ toggleRouting, setRoutingData, selectedDate: initialSelectedDate }) => {
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate || new Date().toISOString().split('T')[0]);
  const [selectedShiftType, setSelectedShiftType] = useState("All");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [shiftBookings, setShiftBookings] = useState([]);
  const [selectedOption, setSelectedOption] = useState("Select option");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  // 🔹 Fetch shifts data from backend API
  const fetchShiftsData = async (date) => {
    setLoading(true);
    setError(null);
    
    try {
      // Replace with your actual API endpoint
      const response = await API_CLIENT.get(`/admin/shift-bookings/?date=${date}`);
      
     
      
      const {data} = await response.data

      if (response.status === 200) {
        // Transform the API response to match the expected format
        
        setShiftBookings(data.shifts || []);
      } else {
        throw new Error(data.message || "Failed to fetch shifts data");
      }
    } catch (err) {
      console.error("Error fetching shifts data:", err);
      setError(err.message);
      // Fallback to static data if API fails
      if (ScheduleBooks[selectedDate]?.TimeShifts) {
        setShiftBookings(ScheduleBooks[selectedDate].TimeShifts);
      } else {
        setShiftBookings([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Load shifts when selected date changes
  useEffect(() => {
    fetchShiftsData(selectedDate);
  }, [selectedDate]);

  // 🔹 Apply filter: In / Out
  useEffect(() => {
    if (ScheduleBooks[selectedDate]?.TimeShifts) {
      let shifts = ScheduleBooks[selectedDate].TimeShifts;

      if (selectedShiftType !== "All") {
        shifts = shifts.filter((shift) =>
          selectedShiftType === "In"
            ? shift.bookingType === "LOGIN"
            : shift.bookingType === "LOGOUT"
        );
      }

      setShiftBookings(shifts);
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
            <p>Loading shifts data...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            <p>Error: {error}. Using fallback data.</p>
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
                shiftBookings={shiftBookings}
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
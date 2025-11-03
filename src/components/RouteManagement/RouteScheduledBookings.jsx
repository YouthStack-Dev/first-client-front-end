import React, { useState, useEffect, useRef } from "react";
import ToolBar from "../ui/ToolBar";
import { useSelector, useDispatch } from "react-redux";

import ShiftBookingsTable from "./ShiftBookingsTable.jsx";
import { API_CLIENT } from "../../Api/API_Client.js";
import {
  selectRouteLoading,
  selectShiftsData, // Add this selector
  setLoading,
  setError,
  addShiftsFromAPI,
  clearAllRouteData,
} from "@features/routes/roureSlice.js";

// Main RouteScheduledBookings Component
const RouteScheduledBookings = () => {
  const [selectedShiftType, setSelectedShiftType] = useState("All");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const hasFetchedRef = useRef(false);

  const loading = useSelector(selectRouteLoading);
  const shiftsData = useSelector(selectShiftsData); // Get data from Redux
  const dispatch = useDispatch();

  // Real API call function
  const fetchShiftsData = async (date) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await API_CLIENT.get(
        `/v1/bookings/tenant/SAM001/shifts/bookings?booking_date=${date}`
      );

      if (response.data.success) {
        // Transform API response to match your Redux structure
        const transformedData = {
          date: response.data.data.date,
          shifts: response.data.data.shifts.map((shift) => ({
            shift_id: shift.shift_id,
            shift_code: shift.shift_code,
            shift_time: shift.shift_time,
            log_type: shift.log_type,
            stats: shift.stats || {
              route_count: shift.route_count || 0,
              total_bookings: shift.total_bookings || 0,
              routed_bookings: shift.routed_bookings || 0,
              unrouted_bookings: shift.unrouted_bookings || 0,
              vendor_assigned: shift.vendor_assigned || 0,
              driver_assigned: shift.driver_assigned || 0,
            },
            bookings: shift.bookings || [],
          })),
        };

        console.log(" this is the transformed data ", transformedData);

        // Dispatch to Redux store
        dispatch(addShiftsFromAPI(transformedData));
      } else {
        throw new Error(response.data.message || "Failed to fetch shifts data");
      }
    } catch (error) {
      console.error("Error fetching shifts data:", error);
      dispatch(
        setError(
          error.response?.data?.message ||
            error.message ||
            "Failed to fetch shifts data"
        )
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    if (!hasFetchedRef.current) {
      fetchShiftsData(selectedDate);
      hasFetchedRef.current = true;
    }
  }, [selectedDate]);

  // Handle date change
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    hasFetchedRef.current = false;
  };

  // Handle refresh
  const handleRefresh = () => {
    hasFetchedRef.current = false;
    fetchShiftsData(selectedDate);
  };

  // Handle clear data
  const handleClearAllRouteData = () => {
    dispatch(clearAllRouteData());
  };

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
              onChange={(e) => handleDateChange(e.target.value)}
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
            onClick={handleRefresh}
            disabled={loading}
            className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 disabled:bg-blue-300 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Refreshing...
              </>
            ) : (
              "Refresh"
            )}
          </button>

          {/* Clear Data Button */}
          <button
            onClick={handleClearAllRouteData}
            className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600"
            title="Clear all route data"
          >
            Clear Data
          </button>
        </div>
      }
    />
  );

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      {topToolbar}

      <div className="mx-auto">
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center text-gray-500">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-3"></div>
              <p className="text-sm">Loading shift data...</p>
            </div>
          </div>
        ) : (
          <ShiftBookingsTable
            data={shiftsData.shifts} // Pass shifts data
            date={shiftsData.date} // Pass date
            selectedShiftType={selectedShiftType}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default RouteScheduledBookings;

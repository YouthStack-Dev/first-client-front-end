import { createSlice } from "@reduxjs/toolkit";

const routeSlice = createSlice({
  name: "route",
  initialState: {
    // Shifts data
    shiftsData: {
      date: null,
      shifts: [],
    },
    loading: false,
    error: null,
  },
  reducers: {
    // Set loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    // Set error state
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Add shifts from API response
    addShiftsFromAPI: (state, action) => {
      const { date, shifts } = action.payload;

      state.shiftsData = {
        date,
        shifts: shifts.map((shift) => ({
          id: shift.shift_id,
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

      state.loading = false;
    },

    // Clear all route data
    clearAllRouteData: (state) => {
      state.shiftsData = {
        date: null,
        shifts: [],
      };
      state.error = null;
      state.loading = false;
    },
  },
});

// Selectors
export const selectShiftsData = (state) => state.route.shiftsData;
export const selectRouteLoading = (state) => state.route.loading;
export const selectRouteError = (state) => state.route.error;

// Get all shifts
export const selectAllShifts = (state) => state.route.shiftsData.shifts;

// Get shift by ID
export const selectShiftById = (shiftId) => (state) => {
  return state.route.shiftsData.shifts.find(
    (shift) => shift.shift_id === shiftId
  );
};

export const {
  setLoading,
  setError,
  clearError,
  addShiftsFromAPI,
  clearAllRouteData,
} = routeSlice.actions;

export default routeSlice.reducer;

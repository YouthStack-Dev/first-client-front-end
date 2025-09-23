import { createSlice } from "@reduxjs/toolkit";
import { fetchshiftTrunk } from "./shiftTrunk";



// Slice definition
const shiftSlice = createSlice({
  name: "shift",
  initialState: {
    shifts: [],
    selectedShifts: [],
    loading: false,
    error: null,
  },
  reducers: {
    // Add or remove selected shifts
    addSelectedShift: (state, action) => {
      if (!state.selectedShifts.includes(action.payload)) {
        state.selectedShifts.push(action.payload);
      }
    },
    removeSelectedShift: (state, action) => {
      state.selectedShifts = state.selectedShifts.filter(
        (id) => id !== action.payload
      );
    },
    clearSelectedShifts: (state) => {
      state.selectedShifts = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchshiftTrunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchshiftTrunk.fulfilled, (state, action) => {
        state.loading = false;
        state.shifts = action.payload;
      })
      .addCase(fetchshiftTrunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

// Export actions and reducer
export const {
  addSelectedShift,
  removeSelectedShift,
  clearSelectedShifts,
} = shiftSlice.actions;

export default shiftSlice.reducer;

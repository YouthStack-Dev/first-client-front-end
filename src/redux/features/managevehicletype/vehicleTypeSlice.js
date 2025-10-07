import { createSlice } from "@reduxjs/toolkit";
import { fetchVehicleTypes } from "./vehicleTypeThunks";

const initialState = {
  vehicleTypes: [],
  loading: false,
  error: null,
};

const vehicleTypeSlice = createSlice({
  name: "vehicleType",
  initialState,
  reducers: {
    resetVehicleTypes: (state) => {
      state.vehicleTypes = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVehicleTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicleTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicleTypes = action.payload;
      })
      .addCase(fetchVehicleTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch vehicle types";
      });
  },
});

export const { resetVehicleTypes } = vehicleTypeSlice.actions;
export default vehicleTypeSlice.reducer;

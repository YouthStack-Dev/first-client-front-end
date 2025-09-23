import { createSlice } from "@reduxjs/toolkit";
import { fetchVehicles } from "./vehicleThunk";

const vehicleSlice = createSlice({
  name: "vehicle",
  initialState: {
    vehicles: {
      byIds: {},   // store vehicles by id
      allIds: [],  // keep track of ids in order
      loading: false,
      error: null,
      total: 0,
    },
    vehicleTypes: {
      byIds: {},
      allIds: []
    }
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Pending
      .addCase(fetchVehicles.pending, (state) => {
        state.vehicles.loading = true;
        state.vehicles.error = null;
      })
      // Fulfilled
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.vehicles.loading = false;
        state.vehicles.error = null;

        const { data, total } = action.payload;

        // Normalize data
        const byIds = {};
        const allIds = [];

        data.forEach((vehicle) => {
          byIds[vehicle.vehicle_id] = vehicle;
          allIds.push(vehicle.vehicle_id);
        });

        state.vehicles.byIds = byIds;
        state.vehicles.allIds = allIds;
        state.vehicles.total = total;
      })
      // Rejected
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.vehicles.loading = false;
        state.vehicles.error = action.payload || "Failed to fetch vehicles";
      });
  }
});

export default vehicleSlice.reducer;

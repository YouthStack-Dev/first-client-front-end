import { createSlice } from "@reduxjs/toolkit";
import {
  fetchVehicles,
  createVehicleThunk,
  updateVehicleThunk,
  deleteVehicleThunk,
} from "./vehicleThunk";

const initialState = {
  vehicles: [],
  total: 0,
  status: "idle",         // For fetching vehicles
  error: null,

  createStatus: "idle",   // For creating vehicle
  createError: null,

  updateStatus: "idle",   // For updating vehicle
  updateError: null,

  deleteStatus: "idle",   // For deleting vehicle
  deleteError: null,
};

const vehicleSlice = createSlice({
  name: "vehicle",
  initialState,
  reducers: {
    clearCreateStatus: (state) => {
      state.createStatus = "idle";
      state.createError = null;
    },
    clearUpdateStatus: (state) => {
      state.updateStatus = "idle";
      state.updateError = null;
    },
    clearDeleteStatus: (state) => {
      state.deleteStatus = "idle";
      state.deleteError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ✅ Fetch Vehicles
      .addCase(fetchVehicles.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.vehicles = action.payload.data || [];
        state.total = action.payload.total || 0;
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })

      // ✅ Create Vehicle
      .addCase(createVehicleThunk.pending, (state) => {
        state.createStatus = "loading";
        state.createError = null;
      })
      .addCase(createVehicleThunk.fulfilled, (state, action) => {
        state.createStatus = "succeeded";
        const newVehicle = action.payload;
        // Prevent duplicate entry
        if (!state.vehicles.some(v => v.id === newVehicle.id)) {
          state.vehicles.unshift(newVehicle);
        }
      })
      .addCase(createVehicleThunk.rejected, (state, action) => {
        state.createStatus = "failed";
        state.createError = action.payload || action.error.message;
      })

      // ✅ Update Vehicle
      .addCase(updateVehicleThunk.pending, (state) => {
        state.updateStatus = "loading";
        state.updateError = null;
      })
      .addCase(updateVehicleThunk.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        const updated = action.payload;
        const index = state.vehicles.findIndex(v => v.vehicle_id === updated.vehicle_id);
        if (index !== -1) {
          state.vehicles[index] = updated;
        }
      })
      .addCase(updateVehicleThunk.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.updateError = action.payload || action.error.message;
      })

      // ✅ Delete Vehicle
      .addCase(deleteVehicleThunk.pending, (state) => {
        state.deleteStatus = "loading";
        state.deleteError = null;
      })
      .addCase(deleteVehicleThunk.fulfilled, (state, action) => {
        state.deleteStatus = "succeeded";
        const deletedId = action.payload.id;
        state.vehicles = state.vehicles.filter(v => v.id !== deletedId);
        state.total -= 1;
      })
      .addCase(deleteVehicleThunk.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.deleteError = action.payload || action.error.message;
      });
  },
});

export const {
  clearCreateStatus,
  clearUpdateStatus,
  clearDeleteStatus,
} = vehicleSlice.actions;

export default vehicleSlice.reducer;

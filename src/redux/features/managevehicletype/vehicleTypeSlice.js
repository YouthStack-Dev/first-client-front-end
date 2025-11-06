import { createSlice } from "@reduxjs/toolkit";
import { fetchVehicleTypes, createVehicleType, updateVehicleType,toggleVehicleTypeStatus  } from "./vehicleTypeThunks";

const initialState = {
  byId: {},        // normalized data: id -> vehicleType
  allIds: [],      // list of ids for ordering
  loading: false,
  error: null,
   fetched: false,
};

const vehicleTypeSlice = createSlice({
  name: "vehicleType",
  initialState,
  reducers: {
    resetVehicleTypes: (state) => {
      state.byId = {};
      state.allIds = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ===== FETCH =====
      .addCase(fetchVehicleTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicleTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.fetched = true; 

        const byId = {};
        const allIds = [];

        (action.payload || []).forEach((type, index) => {
          // Use `vehicle_type_id` if available, else fallback to `id` or generate a unique key
          const id = type.id || type.vehicle_type_id || `${type.name}-${index}`;
          byId[id] = { ...type, id };
          allIds.push(id);
        });

        state.byId = byId;
        state.allIds = allIds;
      })
      .addCase(fetchVehicleTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch vehicle types";
      })

      // ===== CREATE =====
      .addCase(createVehicleType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createVehicleType.fulfilled, (state, action) => {
        state.loading = false;

        const newType = action.payload;
        if (newType) {
          // Ensure new type has a unique id
          const id = newType.id || newType.vehicle_type_id || `${newType.name}-${Date.now()}`;
          state.byId[id] = { ...newType, id };
          if (!state.allIds.includes(id)) {
            state.allIds.push(id);
          }
        }
      })
      .addCase(createVehicleType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create vehicle type";
      })

      // ===== UPDATE =====
      .addCase(updateVehicleType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVehicleType.fulfilled, (state, action) => {
        state.loading = false;

        const updatedType = action.payload;
        if (updatedType) {
          // Use the ID from the updated type to find and update the existing one
          const id = updatedType.id || updatedType.vehicle_type_id;
          if (id && state.byId[id]) {
            state.byId[id] = { ...state.byId[id], ...updatedType };
          }
        }
      })
      .addCase(updateVehicleType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update vehicle type";
      }) 

       // ===== TOGGLE STATUS =====
      .addCase(toggleVehicleTypeStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleVehicleTypeStatus.fulfilled, (state, action) => {
        state.loading = false;

        const updatedType = action.payload;
        if (updatedType) {
          // Use the ID from the updated type to find and update the existing one
          const id = updatedType.id || updatedType.vehicle_type_id;
          if (id && state.byId[id]) {
            state.byId[id] = { ...state.byId[id], ...updatedType };
          }
        }
      })
      .addCase(toggleVehicleTypeStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to toggle vehicle type status";
      });
  },
});

export const { resetVehicleTypes } = vehicleTypeSlice.actions;
export default vehicleTypeSlice.reducer;
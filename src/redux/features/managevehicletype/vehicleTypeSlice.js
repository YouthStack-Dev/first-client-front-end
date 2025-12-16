import {
  createSlice,
  createEntityAdapter,
} from "@reduxjs/toolkit";

import {
  fetchVehicleTypesThunk,
  createVehicleType,
  updateVehicleType,
  toggleVehicleTypeStatus,
} from "./vehicleTypeThunks";

/* ------------------------------------------------------
   ENTITY ADAPTER
------------------------------------------------------ */
const vehicleTypeAdapter = createEntityAdapter({
  selectId: (item) => item.vehicle_type_id,
  sortComparer: (a, b) => a.vehicle_type_id - b.vehicle_type_id,
});

/* ------------------------------------------------------
   INITIAL STATE
------------------------------------------------------ */
const initialState = vehicleTypeAdapter.getInitialState({
  loading: false,
  loaded: false,
  error: null,
  total: 0,
  lastFetchParams: null,
});

/* ------------------------------------------------------
   SLICE
------------------------------------------------------ */
const vehicleTypeSlice = createSlice({
  name: "vehicleType",
  initialState,

  reducers: {
    clearVehicleTypes: (state) => {
      vehicleTypeAdapter.removeAll(state);
      state.loading = false;
      state.loaded = false;
      state.error = null;
      state.total = 0;
      state.lastFetchParams = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* ================= FETCH ================= */
      .addCase(fetchVehicleTypesThunk.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.lastFetchParams = action.meta.arg || null;
      })

      .addCase(fetchVehicleTypesThunk.fulfilled, (state, action) => {
        const { items = [] } = action.payload;
        // console.log("📥 API Response - Items count:", items.length, "Data:", items);  // DEBUG: What API sent
        vehicleTypeAdapter.setAll(state, items);

        state.loading = false;
        state.loaded = true;
        state.total = items.length;
      })

      .addCase(fetchVehicleTypesThunk.rejected, (state, action) => {
        state.loading = false;
        state.loaded = false;
        state.error =
          action.payload || "Failed to load vehicle types";

        vehicleTypeAdapter.removeAll(state);
        state.total = 0;
      })

      /* ================= CREATE ================= */
      .addCase(createVehicleType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(createVehicleType.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload?.vehicle_type_id) {
          vehicleTypeAdapter.addOne(state, action.payload);
          state.total += 1;
        }
      })

      .addCase(createVehicleType.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to create vehicle type";
      })

      /* ================= UPDATE ================= */
      .addCase(updateVehicleType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(updateVehicleType.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload?.vehicle_type_id) {
          vehicleTypeAdapter.upsertOne(state, action.payload);
        }
      })

      .addCase(updateVehicleType.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to update vehicle type";
      })

      /* ================= TOGGLE STATUS ================= */
      .addCase(toggleVehicleTypeStatus.pending, (state) => {
        // ❗ DO NOT block UI with full loading spinner
        state.error = null;
      })

      .addCase(toggleVehicleTypeStatus.fulfilled, (state, action) => {
        if (action.payload?.vehicle_type_id) {
          vehicleTypeAdapter.upsertOne(state, action.payload);
        }
      })

      .addCase(toggleVehicleTypeStatus.rejected, (state, action) => {
        state.error =
          action.payload || "Failed to toggle vehicle type status";
      });
  },
});

/* ------------------------------------------------------
   EXPORTS
------------------------------------------------------ */
export const { clearVehicleTypes } = vehicleTypeSlice.actions;

export default vehicleTypeSlice.reducer;

/* ------------------------------------------------------
   SELECTORS
------------------------------------------------------ */
export const vehicleTypeSelectors =
  vehicleTypeAdapter.getSelectors(
    (state) => state.vehicleType
  );

export const selectVehicleTypesLoading = (state) =>
  state.vehicleType.loading;

export const selectVehicleTypesLoaded = (state) =>
  state.vehicleType.loaded;

export const selectVehicleTypesError = (state) =>
  state.vehicleType.error;

export const selectVehicleTypesTotal = (state) =>
  state.vehicleType.total;

export const selectVehicleTypesLastFetchParams = (state) =>
  state.vehicleType.lastFetchParams;

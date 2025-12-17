import {
  createSlice,
  createEntityAdapter,
} from "@reduxjs/toolkit";

import {
  fetchVehiclesThunk,
  createVehicleThunk,
  updateVehicleThunk,
  toggleVehicleStatus,
} from "./vehicleThunk";

/* ======================================================
   ENTITY ADAPTER
====================================================== */
const vehiclesAdapter = createEntityAdapter({
  selectId: (vehicle) => vehicle.vehicle_id,
});

/* ======================================================
   INITIAL STATE (MATCH DRIVER SLICE)
====================================================== */
const initialState = vehiclesAdapter.getInitialState({
  loading: false,
  loaded: false,
  error: null,
  total: 0,
  lastFetchParams: null,
});

/* ======================================================
   SLICE
====================================================== */
const vehicleSlice = createSlice({
  name: "vehicle",
  initialState,

  reducers: {
    /* -------- CLEAR ALL -------- */
    clearVehicles: (state) => {
      vehiclesAdapter.removeAll(state);
      state.total = 0;
      state.loaded = false;
      state.lastFetchParams = null;
    },

    /* -------- REMOVE ONE -------- */
    removeVehicle: (state, action) => {
      vehiclesAdapter.removeOne(state, action.payload);
      state.total = Math.max(0, state.total - 1);
    },

    /* -------- RESET LOADING -------- */
    resetVehicleLoading: (state) => {
      state.loading = false;
    },
  },

  extraReducers: (builder) => {
    builder
      /* ======================================================
         FETCH VEHICLES
      ====================================================== */
      .addCase(fetchVehiclesThunk.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.lastFetchParams = action.meta.arg || null;
      })

      .addCase(fetchVehiclesThunk.fulfilled, (state, action) => {
        const { items = [], total = 0, append } = action.payload;

        if (append) {
          vehiclesAdapter.upsertMany(state, items);
        } else {
          vehiclesAdapter.setAll(state, items);
        }

        state.total = total;
        state.loaded = true;
        state.loading = false;
        state.error = null;
      })

      .addCase(fetchVehiclesThunk.rejected, (state, action) => {
        state.loading = false;
        state.loaded = false;
        state.error = action.payload || "Failed to load vehicles";

        vehiclesAdapter.removeAll(state);
        state.total = 0;
      })

      /* ======================================================
         CREATE VEHICLE
      ====================================================== */
      .addCase(createVehicleThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(createVehicleThunk.fulfilled, (state, action) => {
        state.loading = false;
        const vehicle = action.payload;

        if (vehicle?.vehicle_id) {
          vehiclesAdapter.addOne(state, vehicle);
          state.total += 1;
        }
      })

      .addCase(createVehicleThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create vehicle";
      })

      /* ======================================================
         UPDATE VEHICLE
      ====================================================== */
      .addCase(updateVehicleThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(updateVehicleThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updatedVehicle = action.payload;

        if (updatedVehicle?.vehicle_id) {
          vehiclesAdapter.upsertOne(state, updatedVehicle);
        }
      })

      .addCase(updateVehicleThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update vehicle";
      })

      /* ======================================================
         TOGGLE VEHICLE STATUS
      ====================================================== */
      .addCase(toggleVehicleStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(toggleVehicleStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedVehicle = action.payload?.vehicle;

        if (updatedVehicle?.vehicle_id) {
          vehiclesAdapter.upsertOne(state, updatedVehicle);
        }
      })

      .addCase(toggleVehicleStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to toggle vehicle status";
      });
  },
});

/* ======================================================
   EXPORT ACTIONS
====================================================== */
export const {
  clearVehicles,
  removeVehicle,
  resetVehicleLoading,
} = vehicleSlice.actions;

/* ======================================================
   REDUCER
====================================================== */
export default vehicleSlice.reducer;

/* ======================================================
   SELECTORS (EXACT DRIVER STYLE)
====================================================== */
export const vehicleSelectors = vehiclesAdapter.getSelectors(
  (state) => state.vehicle
);

export const selectVehiclesLoading = (state) => state.vehicle.loading;
export const selectVehiclesLoaded = (state) => state.vehicle.loaded;
export const selectVehiclesError = (state) => state.vehicle.error;
export const selectVehiclesTotal = (state) => state.vehicle.total;
export const selectLastFetchParams = (state) =>
  state.vehicle.lastFetchParams;

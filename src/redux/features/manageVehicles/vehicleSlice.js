import { createSlice } from "@reduxjs/toolkit";
import { fetchVehiclesThunk } from "./vehicleThunks";

const initialState = {
  entities: {},      // vehicle_id -> vehicle object
  ids: [],           // all vehicle IDs
  loading: false,
  error: null,
  hasFetched: false,
  filters: {
    rc_number: "",
    vehicle_type_id: "",
    driver_id: "",
    is_active: "",
    vendor_id: "",
  },
  pagination: {
    skip: 0,
    limit: 10,
  },
};

const vehicleSlice = createSlice({
  name: "vehicles",
  initialState,
  reducers: {
    // --- Filter actions ---
    setRcNumberFilter: (state, action) => {
      state.filters.rc_number = action.payload || "";
      state.pagination.skip = 0;
    },
    setVehicleTypeFilter: (state, action) => {
      state.filters.vehicle_type_id = action.payload || "";
      state.pagination.skip = 0;
    },
    setDriverFilter: (state, action) => {
      state.filters.driver_id = action.payload || "";
      state.pagination.skip = 0;
    },
    setStatusFilter: (state, action) => {
      state.filters.is_active = action.payload || "";
      state.pagination.skip = 0;
    },
    setVendorFilter: (state, action) => {
      state.filters.vendor_id = action.payload || "";
      state.pagination.skip = 0;
    },
    resetFilters: (state) => {
      state.filters = { ...initialState.filters };
      state.pagination.skip = 0;
    },

    // --- Pagination ---
    setPage: (state, action) => {
      const page = action.payload || 1;
      state.pagination.skip = (page - 1) * state.pagination.limit;
    },

    // --- Data actions ---
    addVehicle: (state, action) => {
      const vehicle = action.payload;
      if (vehicle && vehicle.id) {
        state.entities[vehicle.id] = vehicle;
        if (!state.ids.includes(vehicle.id)) state.ids.push(vehicle.id);
      }
    },
    updateVehicle: (state, action) => {
      const vehicle = action.payload;
      if (vehicle && vehicle.id) {
        state.entities[vehicle.id] = {
          ...state.entities[vehicle.id],
          ...vehicle,
        };
        if (!state.ids.includes(vehicle.id)) state.ids.push(vehicle.id);
      }
    },
    removeVehicle: (state, action) => {
      const id = action.payload;
      if (id && state.entities[id]) {
        delete state.entities[id];
        state.ids = state.ids.filter(i => i !== id);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVehiclesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehiclesThunk.fulfilled, (state, action) => {
        const vehicles = action.payload || [];

        // Merge instead of replace (for incremental fetch)
        vehicles.forEach(v => {
          if (v.id) state.entities[v.id] = v;
          if (!state.ids.includes(v.id) && v.id) state.ids.push(v.id);
        });

        state.loading = false;
        state.hasFetched = true;
      })
      .addCase(fetchVehiclesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch vehicles";
      });
  },
});

export const {
  setRcNumberFilter,
  setVehicleTypeFilter,
  setDriverFilter,
  setStatusFilter,
  setVendorFilter,
  resetFilters,
  setPage,
  addVehicle,
  updateVehicle,
  removeVehicle,
} = vehicleSlice.actions;

export default vehicleSlice.reducer;

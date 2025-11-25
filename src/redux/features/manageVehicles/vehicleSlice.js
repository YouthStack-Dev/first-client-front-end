// src/redux/features/manageVehicles/vehicleSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { fetchVehiclesThunk, updateVehicleThunk, createVehicleThunk, toggleVehicleStatus } from './vehicleThunk'; // ✅ include create thunk

export const initialState = {
  entities: {},      // vehicle_id -> vehicle object
  ids: [],           // all vehicle IDs
  drivers: {},       // driver_id -> driver object
  vendors: {},       // vendor_id -> vendor object
  vehicleTypes: {},  // vehicle_type_id -> vehicle type object
  loading: false,
  error: null,
  hasFetched: false,
  dataLoadedForVendor: null,
  vehiclesByVendor: {},
  allVehicles: [],
  filters: {
    rc_number: '',
    vehicle_type_id: 'all',
    driver_id: 'all',
    is_active: 'all',
    vendor_id: 'all',
  },
  pagination: {
    skip: 0,
    limit: 10,
  },
};

const vehicleSlice = createSlice({
  name: 'vehicles',
  initialState,
  reducers: {
    // --- Filter actions ---
    setRcNumberFilter: (state, action) => {
      state.filters.rc_number = action.payload || '';
      state.pagination.skip = 0;
    },
    setVehicleTypeFilter: (state, action) => {
      state.filters.vehicle_type_id = action.payload || 'all';
      state.pagination.skip = 0;
    },
    setDriverFilter: (state, action) => {
      state.filters.driver_id = action.payload || 'all';
      state.pagination.skip = 0;
    },
    setStatusFilter: (state, action) => {
      state.filters.is_active = action.payload || 'all';
      state.pagination.skip = 0;
    },
    setVendorFilter: (state, action) => {
      state.filters.vendor_id = action.payload || 'all';
      state.pagination.skip = 0;
    },
    resetFilters: (state) => {
      state.filters = { ...initialState.filters };
      state.pagination.skip = 0;
    },

    // --- Pagination ---
    setPage: (state, action) => {
      state.pagination.skip = (action.payload - 1) * state.pagination.limit;
    },

    // --- Data management ---
    addVehicle: (state, action) => {
      const vehicle = action.payload;
      if (vehicle?.vehicle_id) {
        state.entities[vehicle.vehicle_id] = vehicle;
        if (!state.ids.includes(vehicle.vehicle_id)) state.ids.push(vehicle.vehicle_id);
      }
    },
    updateVehicle: (state, action) => {
      const vehicle = action.payload;
      if (vehicle?.vehicle_id) {
        state.entities[vehicle.vehicle_id] = {
          ...state.entities[vehicle.vehicle_id],
          ...vehicle,
        };
        if (!state.ids.includes(vehicle.vehicle_id)) state.ids.push(vehicle.vehicle_id);
      }
    },
    removeVehicle: (state, action) => {
      const id = action.payload;
      if (id && state.entities[id]) {
        delete state.entities[id];
        state.ids = state.ids.filter(i => i !== id);
      }
    },
    setActiveVendor: (state, action) => {
      const vendorId = action.payload;
      const cached = state.byVendor?.[vendorId];
      if (cached) {
        // Replace visible table data with cached vendor data
        state.entities = cached.entities;
        state.ids = cached.ids;
        console.log(`🚀 Switched to cached vendor: ${vendorId}`);
      }
    },
  },

  extraReducers: (builder) => {
    builder
      // --- Fetch vehicles ---
      .addCase(fetchVehiclesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
     .addCase(fetchVehiclesThunk.fulfilled, (state, action) => {
        const { vendor_id, items = [] } = action.payload || {};
        const vehicleTypes = {};
        const drivers = {};
        const vendors = {};

        if (!state.byVendor) state.byVendor = {};
        if (!state.entities) state.entities = {};
        if (!state.ids) state.ids = [];

        const newEntities = {};
        const newIds = [];

        items.forEach((v) => {
          const id = v.vehicle_id;
          if (!id) return;

          newEntities[id] = v;
          newIds.push(id);

          if (v.driver_id && v.driver_name)
            drivers[v.driver_id] = {
              driver_id: v.driver_id,
              driver_name: v.driver_name,
            };
          if (v.vendor_id && v.vendor_name)
            vendors[v.vendor_id] = {
              vendor_id: v.vendor_id,
              vendor_name: v.vendor_name,
            };
          if (v.vehicle_type_id && v.vehicle_type_name)
            vehicleTypes[v.vehicle_type_id] = {
              vehicle_type_id: v.vehicle_type_id,
              vehicle_type_name: v.vehicle_type_name,
            };
        });

        // ✅ FIXED: Always update visible state for current vendor fetch
        if (vendor_id) {
          state.byVendor[vendor_id] = {
            entities: newEntities,
            ids: newIds,
            count: newIds.length,
            lastFetched: Date.now(),
          };

          // ✅ show this vendor’s data in the current table
          state.entities = newEntities;
          state.ids = newIds;
        } else {
          // fallback: all vehicles (tenant-wide)
          state.entities = newEntities;
          state.ids = newIds;
        }

        state.drivers = { ...state.drivers, ...drivers };
        state.vendors = { ...state.vendors, ...vendors };
        state.vehicleTypes = { ...state.vehicleTypes, ...vehicleTypes };

        state.loading = false;
        state.hasFetched = true;
        console.log(`✅ Cached ${newIds.length} vehicles for vendor ${vendor_id || "ALL"}`);

      })

      .addCase(fetchVehiclesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch vehicles';
      })

      // --- Create vehicle ---
      .addCase(createVehicleThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createVehicleThunk.fulfilled, (state, action) => {
        state.loading = false;
        const newVehicle = action.payload;

        if (newVehicle?.vehicle_id) {
          state.entities[newVehicle.vehicle_id] = newVehicle;
          if (!state.ids.includes(newVehicle.vehicle_id)) state.ids.push(newVehicle.vehicle_id);
          console.log("✅ Vehicle created in state:", newVehicle.vehicle_id);
        }
      })
      .addCase(createVehicleThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create vehicle";
      })

      // --- Update vehicle ---
      .addCase(updateVehicleThunk.pending, (state) => {
        state.loading = true;
        state.error = null; // reset previous errors
      })
      .addCase(updateVehicleThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updatedVehicle = action.payload;

        if (updatedVehicle?.vehicle_id) {
          // ensure entities object exists
          if (!state.entities) state.entities = {};
          state.entities[updatedVehicle.vehicle_id] = updatedVehicle;

          // ensure ids array exists
          if (!state.ids) state.ids = [];
          if (!state.ids.includes(updatedVehicle.vehicle_id)) {
            state.ids.push(updatedVehicle.vehicle_id);
          }

          console.log("✅ Vehicle updated in state:", updatedVehicle.vehicle_id);
        }
      })
      .addCase(updateVehicleThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update vehicle";
      })
      // --- Toggle Vehicle Status ---
      .addCase(toggleVehicleStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleVehicleStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedVehicle = action.payload.vehicle;

        if (updatedVehicle?.vehicle_id) {
          state.entities[updatedVehicle.vehicle_id] = updatedVehicle;

          // ensure IDs array includes this vehicle
          if (!state.ids.includes(updatedVehicle.vehicle_id)) {
            state.ids.push(updatedVehicle.vehicle_id);
          }
        }
      })
      .addCase(toggleVehicleStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to toggle vehicle status";
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
  setActiveVendor,
} = vehicleSlice.actions;

export default vehicleSlice.reducer;

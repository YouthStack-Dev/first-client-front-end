// src/redux/features/manageDrivers/driverSlice.js
import { createSlice, createSelector } from "@reduxjs/toolkit";
import {
  fetchDriversThunk,
  createDriverThunk,
  updateDriverThunk,
  fetchDriversByVendorThunk,
} from "./driverThunks";

const initialState = {
  entities: {},
  ids: [],
  loading: false,
  error: null,
  hasFetched: false,
  selectedVendor: "all",
  byVendor: {},
  filters: {
    searchTerm: "",
    statusFilter: "all",
    verificationFilter: "all",
  },
  pagination: {
    skip: 0,
    limit: 10,
  },
};

const driversSlice = createSlice({
  name: "drivers",
  initialState,
  reducers: {
    // Filter actions
    setSearchTerm: (state, action) => {
      state.filters.searchTerm = action.payload;
      state.pagination.skip = 0;
    },
    setStatusFilter: (state, action) => {
      state.filters.statusFilter = action.payload;
      state.pagination.skip = 0;
    },
    setVerificationFilter: (state, action) => {
      state.filters.verificationFilter = action.payload;
      state.pagination.skip = 0;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.skip = 0;
    },
    setPage: (state, action) => {
      state.pagination.skip =
        (action.payload - 1) * state.pagination.limit;
    },
    setSelectedDriverVendor: (state, action) => {
      // Normalize to a primitive vendor id or the string 'all'
      const payload = action.payload;
      let vendorId = payload;

      if (payload && typeof payload === "object") {
        // support shapes like { vendor_id } or { id }
        vendorId = payload.vendor_id ?? payload.id ?? vendorId;
      }

      if (vendorId === null || vendorId === undefined) {
        vendorId = "all";
      }

      state.selectedVendor = vendorId;
    },
    // Data management actions
    setDriversLoading: (state, action) => {
      state.loading = action.payload;
    },
    setDriversError: (state, action) => {
      state.error = action.payload;
    },
    setDriversData: (state, action) => {
      state.loading = false;
      state.hasFetched = true;
      state.error = null;

      const normalized = {
        entities: {},
        ids: [],
      };

      action.payload.forEach((driver) => {
        normalized.entities[driver.driver_id] = driver;
        normalized.ids.push(driver.driver_id);
      });

      state.entities = normalized.entities;
      state.ids = normalized.ids;
    },
    updateDriverStatus: (state, action) => {
      const { driverId, isActive } = action.payload;
      if (state.entities[driverId]) {
        state.entities[driverId].is_active = isActive;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all drivers
      .addCase(fetchDriversThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDriversThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.hasFetched = true;
        state.error = null;

        const entities = {};
        const ids = [];

        action.payload.forEach((driver) => {
          entities[driver.driver_id] = driver;
          ids.push(driver.driver_id);
        });

        state.entities = entities;
        state.ids = ids;
      })
      .addCase(fetchDriversThunk.rejected, (state, action) => {
        state.loading = false;
        // if thunk returned a string (e.g., "Please select a vendor...")
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : action.payload || "Failed to fetch drivers";
      })

      // Create driver
      .addCase(createDriverThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDriverThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const driver = action.payload;
        if (!driver) return;

        state.entities[driver.driver_id] = driver;
        if (!state.ids.includes(driver.driver_id)) {
          state.ids.push(driver.driver_id);
        }
      })
      .addCase(createDriverThunk.rejected, (state, action) => {
        state.loading = false;
        // don’t force hasFetched here; only fetching should control that
        state.error =
          action.payload?.message || "Failed to create driver";
      })

      // Update driver
      .addCase(updateDriverThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDriverThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const updatedDriver = action.payload;

        if (updatedDriver) {
          state.entities[updatedDriver.driver_id] = updatedDriver;

          if (!state.ids.includes(updatedDriver.driver_id)) {
            state.ids.push(updatedDriver.driver_id);
          }
        }
      })
      .addCase(updateDriverThunk.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to update driver";
      })

      // Fetch drivers by vendor
      .addCase(fetchDriversByVendorThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDriversByVendorThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        const { vendorId, items } = action.payload;

        const entities = {};
        const ids = [];

        items.forEach((driver) => {
          entities[driver.driver_id] = driver;
          ids.push(driver.driver_id);
        });

        // Cache vendor data
        state.byVendor[vendorId] = { entities, ids };

        // Also set active listing
        state.entities = entities;
        state.ids = ids;
      })
      .addCase(fetchDriversByVendorThunk.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to fetch vendor-specific drivers";
      });
  },
});

// Selectors
const selectDriverState = (state) => state.drivers;

export const selectAllDrivers = createSelector(
  [selectDriverState],
  (drivers) => drivers.ids.map((id) => drivers.entities[id])
);

export const selectLoading = (state) => state.drivers.loading;
export const selectError = (state) => state.drivers.error;
export const selectHasFetched = (state) => state.drivers.hasFetched;
export const selectFilters = (state) => state.drivers.filters;
export const selectPagination = (state) => state.drivers.pagination;

export const selectStatusOptions = createSelector(
  (state) => state.drivers,
  () => [
    { value: "all", label: "ALL" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ]
);

export const selectFilteredDrivers = createSelector(
  [selectAllDrivers, selectFilters],
  (drivers, filters) =>
    drivers.filter((driver) => {
      const matchesSearch =
        filters.searchTerm === "" ||
        [
          driver.name,
          driver.email,
          driver.phone,           // ✅ changed from mobile_number → phone
          driver.license_number,
        ].some(
          (field) =>
            field &&
            field
              .toString()
              .toLowerCase()
              .includes(filters.searchTerm.toLowerCase())
        );

      const matchesStatus =
        filters.statusFilter === "all" ||
        (filters.statusFilter === "active" && driver.is_active) ||
        (filters.statusFilter === "inactive" && !driver.is_active);

      const matchesVerification =
        filters.verificationFilter === "all" ||
        [
          "bgv_status",
          "police_verification_status",
          "medical_verification_status",
          "training_verification_status",
          "eye_test_verification_status",
        ].some(
          (field) => driver[field] === filters.verificationFilter
        );

      return matchesSearch && matchesStatus && matchesVerification;
    })
);

export const selectPaginatedDrivers = createSelector(
  [selectFilteredDrivers, selectPagination],
  (filteredDrivers, pagination) =>
    filteredDrivers.slice(
      pagination.skip,
      pagination.skip + pagination.limit
    )
);

export const selectCounts = createSelector(
  [selectAllDrivers],
  (drivers) => {
    const now = new Date();
    return {
      total: drivers.length,
      active: drivers.filter((d) => d.is_active).length,

      pendingVerifications: drivers.filter((driver) =>
        [
          "bg_verify_status",
          "police_verify_status",
          "medical_verify_status",
          "training_verify_status",
          "eye_verify_status",
        ].some(
          (field) =>
            driver[field]?.toLowerCase() === "pending"
        )
      ).length,

      expiredDocuments: drivers.filter(
        (driver) =>
          (driver.license_expiry_date &&
            new Date(driver.license_expiry_date) < now) ||
          (driver.badge_expiry_date &&
            new Date(driver.badge_expiry_date) < now)
      ).length,

      rejectedDocuments: drivers.filter((driver) =>
        [
          "bg_verify_status",
          "police_verify_status",
          "medical_verify_status",
          "training_verify_status",
          "eye_verify_status",
        ].some(
          (field) =>
            driver[field]?.toLowerCase() === "rejected"
        )
      ).length,
    };
  }
);

export const selectActiveFilters = createSelector(
  [selectFilters],
  (filters) => {
    const activeFilters = [];
    if (filters.searchTerm)
      activeFilters.push(`Search: "${filters.searchTerm}"`);
    if (filters.statusFilter !== "all") {
      activeFilters.push(`Status: ${filters.statusFilter}`);
    }
    if (filters.verificationFilter !== "all") {
      activeFilters.push(`Verification: ${filters.verificationFilter}`);
    }
    return activeFilters;
  }
);

export const {
  setSearchTerm,
  setStatusFilter,
  setVerificationFilter,
  resetFilters,
  setPage,
  setDriversLoading,
  setDriversError,
  setDriversData,
  updateDriverStatus,
  setSelectedDriverVendor,
} = driversSlice.actions;

export default driversSlice.reducer;

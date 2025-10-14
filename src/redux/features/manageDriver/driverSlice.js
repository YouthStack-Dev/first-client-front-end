import { createSlice, createSelector } from '@reduxjs/toolkit';
import { fetchDriversByVendorThunk  } from "./driverThunks";

const initialState = {
  entities: {},
  ids: [],
  vendors: {},
  loading: false,
  error: null,
  hasFetched: false,
  filters: {
    searchTerm: '',
    vendorFilter: 'all',
    statusFilter: 'all',
    verificationFilter: 'all'
  },
  pagination: {
    skip: 0,
    limit: 10
  }
};

const driversSlice = createSlice({
  name: 'drivers',
  initialState,
  reducers: {
    // Filter actions
    setSearchTerm: (state, action) => {
      state.filters.searchTerm = action.payload;
      state.pagination.skip = 0;
    },
    setVendorFilter: (state, action) => {
      state.filters.vendorFilter = action.payload;
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
      state.pagination.skip = (action.payload - 1) * state.pagination.limit;
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
        vendors: {}
      };
      
      action.payload.forEach(driver => {
        normalized.entities[driver.driver_id] = driver;
        normalized.ids.push(driver.driver_id);
        if (driver.vendor) {
          normalized.vendors[driver.vendor.vendor_id] = driver.vendor;
        }
      });
      
      state.entities = normalized.entities;
      state.ids = normalized.ids;
      state.vendors = normalized.vendors;
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
      .addCase(fetchDriversByVendorThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDriversByVendorThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.hasFetched = true;
        state.error = null;

          const entities = {};
          const ids = [];
          const vendors = {};

          action.payload.forEach(driver => {
            entities[driver.driver_id] = driver;
            ids.push(driver.driver_id);

            if (driver.vendor) {
              vendors[driver.vendor.vendor_id] = driver.vendor;
            }
          });

          state.entities = entities;  
          state.ids = ids;            
          state.vendors = vendors;    
        })
      .addCase(fetchDriversByVendorThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch drivers";
      });
  }
});

// Selectors (same as before)
const selectDriverState = state => state.drivers;

export const selectAllDrivers = createSelector(
  [selectDriverState],
  (drivers) => drivers.ids.map(id => drivers.entities[id])
);

export const selectLoading = state => state.drivers.loading;
export const selectError = state => state.drivers.error;
export const selectHasFetched = state => state.drivers.hasFetched;
export const selectFilters = state => state.drivers.filters;
export const selectPagination = state => state.drivers.pagination;



export const selectStatusOptions = createSelector(
  (state) => state.drivers, // input selector
  (driversState) => [
    { value: 'ALL', label: 'ALL ' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' }
  ]
);

// Example for verification options
export const selectVerificationOptions = createSelector(
  (state) => state.drivers,
  (driversState) => [
    { value: 'ALL', label: 'ALL' },
    { value: 'VERIFIED', label: 'Verified' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'REJECTED', label: 'Rejected' }
  ]
);

export const selectFilteredDrivers = createSelector(
  [selectAllDrivers, selectFilters],
  (drivers, filters) => drivers.filter(driver => {
    const matchesSearch = filters.searchTerm === '' || 
      [driver.name, driver.email, driver.mobile_number, driver.license_number]
        .some(field => field && field.toString().toLowerCase().includes(filters.searchTerm.toLowerCase()));

    const matchesVendor = filters.vendorFilter === 'all' || 
      (driver.vendor && driver.vendor.vendor_id.toString() === filters.vendorFilter);
    
    const matchesStatus = filters.statusFilter === 'all' || 
      (filters.statusFilter === 'active' && driver.is_active) || 
      (filters.statusFilter === 'inactive' && !driver.is_active);

    const matchesVerification = filters.verificationFilter === 'all' || 
      ['bgv_status', 'police_verification_status', 'medical_verification_status', 
       'training_verification_status', 'eye_test_verification_status']
        .some(field => driver[field] === filters.verificationFilter);

    return matchesSearch && matchesVendor && matchesStatus && matchesVerification;
  })
);

export const selectPaginatedDrivers = createSelector(
  [selectFilteredDrivers, selectPagination],
  (filteredDrivers, pagination) => 
    filteredDrivers.slice(pagination.skip, pagination.skip + pagination.limit)
);

export const selectCounts = createSelector(
  [selectAllDrivers],
  (drivers) => {
    const now = new Date();
    return {
      total: drivers.length,
      active: drivers.filter(d => d.is_active).length,
      pendingVerifications: drivers.filter(driver => 
        ['bgv_status', 'police_verification_status', 'medical_verification_status', 
         'training_verification_status', 'eye_test_verification_status']
          .some(field => driver[field] === 'Pending')).length,
      expiredDocuments: drivers.filter(driver => 
        (driver.license_expiry_date && new Date(driver.license_expiry_date) < now) ||
        (driver.badge_expiry_date && new Date(driver.badge_expiry_date) < now)).length,
      rejectedDocuments: drivers.filter(driver => 
        ['bgv_status', 'police_verification_status', 'medical_verification_status', 
         'training_verification_status', 'eye_test_verification_status']
          .some(field => driver[field] === 'Rejected')).length
    };
  }
);

export const selectActiveFilters = createSelector(
  [selectFilters],
  (filters) => {
    const activeFilters = [];
    if (filters.searchTerm) activeFilters.push(`Search: "${filters.searchTerm}"`);
    if (filters.statusFilter !== 'all') {
      activeFilters.push(`Status: ${filters.statusFilter}`);
    }
    if (filters.verificationFilter !== 'all') {
      activeFilters.push(`Verification: ${filters.verificationFilter}`);
    }
    return activeFilters;
  }
);

export const { 
  setSearchTerm, 
  setVendorFilter, 
  setStatusFilter, 
  setVerificationFilter, 
  resetFilters,
  setPage,
  setDriversLoading,
  setDriversError,
  setDriversData,
  updateDriverStatus
} = driversSlice.actions;

export default driversSlice.reducer;
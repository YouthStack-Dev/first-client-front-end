import { createSelector } from '@reduxjs/toolkit';

// Basic entity selectors - matching your normalized state structure
export const selectDriverEntities = (state) => state.drivers.entities.byId || {};
export const selectDriverIds = (state) => state.drivers.entities.allIds || [];
export const selectVendorEntities = (state) => state.drivers.entities.vendors || {};
export const selectSelectedDrivers = (state) => state.drivers.selectedDrivers || [];
export const selectEditingDriver = (state) => state.drivers.editingDriver || null;
export const selectShowModal = (state) => state.drivers.showModal || false;

// Filter and pagination selectors
export const selectFilters = (state) => state.drivers.filters || {
  searchTerm: '',
  vendorFilter: 'all',
  statusFilter: 'all',
  verificationFilter: 'all'
};
export const selectPagination = (state) => state.drivers.pagination || {
  skip: 0,
  limit: 100,
  total: 0
};

// API status selectors
export const selectApiStatus = (state) => state.drivers.apiStatus || {
  fetchDrivers: { status: 'idle', error: null },
  createDriver: { status: 'idle', error: null },
  updateDriver: { status: 'idle', error: null },
  patchDriverStatus: { status: 'idle', error: null }
};

// Memoized derived selectors with proper fallbacks
export const selectAllDrivers = createSelector(
  [selectDriverEntities, selectDriverIds],
  (drivers, ids) => ids.map(id => drivers[id]).filter(Boolean)
);

export const selectAllVendors = createSelector(
  selectVendorEntities,
  (vendors) => Object.values(vendors).filter(Boolean)
);

export const selectDriverById = createSelector(
  [selectDriverEntities, (_, driverId) => driverId],
  (drivers, driverId) => drivers[driverId] || null
);

// Enhanced filter selector with all available filters
export const selectFilteredDrivers = createSelector(
  [selectAllDrivers, selectFilters],
  (drivers, filters) => {
    const { 
      searchTerm = '', 
      vendorFilter = 'all', 
      statusFilter = 'all',
      verificationFilter = 'all'
    } = filters;
    
    const lowerSearch = searchTerm.toLowerCase();

    return drivers.filter(driver => {
      if (!driver) return false;
      
      // Search filter (name, email, license, phone, etc.)
      const matchesSearch = !searchTerm || 
        (driver.name?.toLowerCase().includes(lowerSearch)) ||
        (driver.email?.toLowerCase().includes(lowerSearch)) ||
        (driver.license_number?.toLowerCase().includes(lowerSearch)) ||
        (driver.mobile_number?.includes(searchTerm)) ||
        (driver.driver_code?.toLowerCase().includes(lowerSearch));

      // Vendor filter
      const matchesVendor = vendorFilter === 'all' || 
        (driver.vendor?.vendor_id?.toString() === vendorFilter);

      // Status filter
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && driver.is_active) ||
        (statusFilter === 'inactive' && !driver.is_active);

      // Verification status filter (can be expanded for other verification types)
      const matchesVerification = verificationFilter === 'all' ||
        (driver.bgv_status?.toLowerCase() === verificationFilter.toLowerCase()) ||
        (driver.police_verification_status?.toLowerCase() === verificationFilter.toLowerCase()) ||
        (driver.medical_verification_status?.toLowerCase() === verificationFilter.toLowerCase());

      return matchesSearch && matchesVendor && matchesStatus && matchesVerification;
    });
  }
);

// Comprehensive status counts selector
export const selectDriverCounts = createSelector(
  selectAllDrivers,
  (drivers) => ({
    total: drivers.length,
    active: drivers.filter(d => d?.is_active).length,
    inactive: drivers.filter(d => d && !d.is_active).length,
    // Verification status counts
    bgvPending: drivers.filter(d => d?.bgv_status === 'Pending').length,
    bgvCompleted: drivers.filter(d => d?.bgv_status === 'Completed').length,
    policePending: drivers.filter(d => d?.police_verification_status === 'Pending').length,
    policeCompleted: drivers.filter(d => d?.police_verification_status === 'Completed').length,
  })
);

// Enhanced vendor options for dropdown with counts
export const selectVendorOptions = createSelector(
  [selectAllVendors, selectAllDrivers],
  (vendors, drivers) => {
    const vendorCounts = drivers.reduce((acc, driver) => {
      const vendorId = driver.vendor?.vendor_id;
      if (vendorId) {
        acc[vendorId] = (acc[vendorId] || 0) + 1;
      }
      return acc;
    }, {});

    return [
      { value: 'all', label: 'All Vendors' },
      ...vendors.map(v => ({
        value: v?.vendor_id?.toString() || '',
        label: `${v?.vendor_name || 'Unknown Vendor'} (${vendorCounts[v.vendor_id] || 0})`
      })).filter(v => v.value)
    ];
  }
);

// Enhanced status options for dropdown
export const selectStatusOptions = createSelector(
  selectDriverCounts,
  (counts) => [
    { value: 'all', label: `All Drivers (${counts.total})` },
    { value: 'active', label: `Active (${counts.active})` },
    { value: 'inactive', label: `Inactive (${counts.inactive})` }
  ]
);

// Verification status options
export const selectVerificationOptions = createSelector(
  selectDriverCounts,
  (counts) => [
    { value: 'all', label: 'All Verification Statuses' },
    { value: 'pending', label: `Pending BGV (${counts.bgvPending})` },
    { value: 'completed', label: `Completed BGV (${counts.bgvCompleted})` },
    { value: 'pending', label: `Pending Police (${counts.policePending})` },
    { value: 'completed', label: `Completed Police (${counts.policeCompleted})` },
  ]
);

// Selector for selected drivers data
export const selectSelectedDriversData = createSelector(
  [selectDriverEntities, selectSelectedDrivers],
  (drivers, selectedIds) => selectedIds.map(id => drivers[id]).filter(Boolean)
);

// Selector for current page drivers (for pagination)
export const selectPaginatedDrivers = createSelector(
  [selectFilteredDrivers, selectPagination],
  (drivers, pagination) => {
    const { skip = 0, limit = 100 } = pagination;
    return drivers.slice(skip, skip + limit);
  }
);

// Selector for driver documents status summary
export const selectDriverDocumentsSummary = createSelector(
  selectAllDrivers,
  (drivers) => {
    return drivers.reduce((acc, driver) => {
      if (!driver) return acc;
      
      acc.totalDrivers++;
      if (driver.is_active) acc.activeDrivers++;
      
      // License
      if (driver.license_number) acc.withLicense++;
      if (driver.license_expiry_date && new Date(driver.license_expiry_date) > new Date()) acc.validLicense++;
      
      // Documents
      if (driver.license_doc_url) acc.withLicenseDoc++;
      if (driver.bgv_doc_url) acc.withBgvDoc++;
      if (driver.police_verification_doc_url) acc.withPoliceDoc++;
      if (driver.medical_verification_doc_url) acc.withMedicalDoc++;
      
      return acc;
    }, {
      totalDrivers: 0,
      activeDrivers: 0,
      withLicense: 0,
      validLicense: 0,
      withLicenseDoc: 0,
      withBgvDoc: 0,
      withPoliceDoc: 0,
      withMedicalDoc: 0
    });
  }
);
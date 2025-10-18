import { createSelector } from '@reduxjs/toolkit';

// --- Basic entity selectors ---
export const selectDriverEntities = (state) => state.drivers.entities.byId || {};
export const selectDriverIds = (state) => state.drivers.entities.allIds || [];
export const selectSelectedDrivers = (state) => state.drivers.selectedDrivers || [];
export const selectEditingDriver = (state) => state.drivers.editingDriver || null;
export const selectShowModal = (state) => state.drivers.showModal || false;

// Filters & pagination
export const selectFilters = (state) => state.drivers.filters || {
  searchTerm: '',
  statusFilter: 'all',
  verificationFilter: 'all'
};
export const selectPagination = (state) => state.drivers.pagination || {
  skip: 0,
  limit: 100,
  total: 0
};

// API status
export const selectApiStatus = (state) => state.drivers.apiStatus || {
  fetchDrivers: { status: 'idle', error: null },
  createDriver: { status: 'idle', error: null },
  updateDriver: { status: 'idle', error: null },
  patchDriverStatus: { status: 'idle', error: null }
};

// --- Memoized derived selectors ---
export const selectAllDrivers = createSelector(
  [selectDriverEntities, selectDriverIds],
  (drivers, ids) => ids.map(id => drivers[id]).filter(Boolean)
);



export const selectDriverById = createSelector(
  [selectDriverEntities, (_, driverId) => driverId],
  (drivers, driverId) => drivers[driverId] || null
);

// --- Filters ---
const verificationFields = [
  'bgv_status',
  'police_verify_status',
  'medical_verify_status',
  'training_verify_status',
  'eye_verify_status'
];


export const selectFilteredDrivers = createSelector(
  [selectAllDrivers, selectFilters],
  (drivers, filters) => {
    const { searchTerm = '',  statusFilter = 'all', verificationFilter = 'all' } = filters;
    const lowerSearch = searchTerm.toLowerCase();

    return drivers.filter(driver => {
      if (!driver) return false;

      // Search
      const matchesSearch = !searchTerm ||
        [driver.name, driver.email, driver.license_number, driver.mobile_number, driver.driver_code]
          .some(f => f?.toString().toLowerCase().includes(lowerSearch));


      // Status
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && driver.is_active) ||
        (statusFilter === 'inactive' && !driver.is_active);

      // Verification
      const matchesVerification = verificationFilter === 'all' ||
        verificationFields.some(f => driver[f]?.toLowerCase() === verificationFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesVerification;
    });
  }
);

// --- Pagination ---
export const selectPaginatedDrivers = createSelector(
  [selectFilteredDrivers, selectPagination],
  (drivers, pagination) => {
    const { skip = 0, limit = 100 } = pagination;
    return drivers.slice(skip, skip + limit);
  }
);

// --- Counts ---
export const selectDriverCounts = createSelector(
  selectAllDrivers,
  (drivers) => {
    const counts = { total: 0, active: 0, inactive: 0 };
    const verifications = {};

    drivers.forEach(driver => {
      counts.total += 1;
      counts.active += driver.is_active ? 1 : 0;
      counts.inactive += !driver.is_active ? 1 : 0;

      verificationFields.forEach(f => {
        const val = driver[f];
        if (val) {
          verifications[f] = verifications[f] || {};
          verifications[f][val] = (verifications[f][val] || 0) + 1;
        }
      });
    });

    return { ...counts, verifications };
  }
);


// --- Status options ---
export const selectStatusOptions = createSelector(
  selectDriverCounts,
  counts => [
    { value: 'all', label: `All Drivers (${counts.total})` },
    { value: 'active', label: `Active (${counts.active})` },
    { value: 'inactive', label: `Inactive (${counts.inactive})` }
  ]
);

// --- Verification options ---
// export const selectVerificationOptions = createSelector(
//   selectDriverCounts,
//   counts => {
//     const options = [{ value: 'all', label: 'All Verification Statuses' }];

//     verificationFields.forEach(f => {
//       const fieldCounts = counts.verifications[f] || {};
//       Object.entries(fieldCounts).forEach(([status, cnt]) => {
//         options.push({ value: status.toLowerCase(), label: `${status} (${cnt})` });
//       });
//     });

//     return options;
//   }
// );

// --- Selected drivers ---
export const selectSelectedDriversData = createSelector(
  [selectDriverEntities, selectSelectedDrivers],
  (drivers, selectedIds) => selectedIds.map(id => drivers[id]).filter(Boolean)
);

// --- Driver documents summary ---
export const selectDriverDocumentsSummary = createSelector(
  selectAllDrivers,
  (drivers) => {
    const summary = {
      totalDrivers: 0,
      activeDrivers: 0,
      withLicense: 0,
      validLicense: 0,
      withLicenseDoc: 0,
      withBgvDoc: 0,
      withPoliceDoc: 0,
      withMedicalDoc: 0
    };

    const now = new Date();

    drivers.forEach(driver => {
      if (!driver) return;
      summary.totalDrivers++;
      if (driver.is_active) summary.activeDrivers++;
      if (driver.license_number) summary.withLicense++;
      if (driver.license_expiry_date && new Date(driver.license_expiry_date) > now) summary.validLicense++;
      if (driver.license_doc_url) summary.withLicenseDoc++;
      if (driver.bgv_doc_url) summary.withBgvDoc++;
      if (driver.police_verification_doc_url) summary.withPoliceDoc++;
      if (driver.medical_verification_doc_url) summary.withMedicalDoc++;
    });

    return summary;
  }
);

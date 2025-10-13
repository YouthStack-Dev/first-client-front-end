import { createSelector } from '@reduxjs/toolkit';

// --- Basic entity selectors ---
export const selectVehicleEntities = (state) => state.vehicles.entities || {};
export const selectVehicleIds = (state) => state.vehicles.ids || [];
export const selectFilters = (state) => state.vehicles.filters || {
  rc_number: '',
  vehicle_type_id: '',
  driver_id: '',
  is_active: '',
  vendor_id: ''
};
export const selectPagination = (state) => state.vehicles.pagination || { skip: 0, limit: 10 };
export const selectLoading = (state) => state.vehicles.loading;
export const selectError = (state) => state.vehicles.error;
export const selectHasFetched = (state) => state.vehicles.hasFetched;

// --- All vehicles ---
export const selectAllVehicles = createSelector(
  [selectVehicleEntities, selectVehicleIds],
  (entities, ids) => ids.map(id => entities[id]).filter(Boolean)
);

// --- Filtered vehicles ---
export const selectFilteredVehicles = createSelector(
  [selectAllVehicles, selectFilters],
  (vehicles, filters) => {
    const { rc_number, vehicle_type_id, driver_id, is_active, vendor_id } = filters;

    return vehicles.filter(vehicle => {
      const matchesRc = !rc_number || vehicle.rc_number?.toString().includes(rc_number);
      const matchesType = !vehicle_type_id || vehicle.vehicle_type_id?.toString() === vehicle_type_id;
      const matchesDriver = !driver_id || vehicle.driver_id?.toString() === driver_id;
      const matchesStatus = !is_active || vehicle.is_active === (is_active === 'true');
      const matchesVendor = !vendor_id || vehicle.vendor_id?.toString() === vendor_id;

      return matchesRc && matchesType && matchesDriver && matchesStatus && matchesVendor;
    });
  }
);

// --- Paginated vehicles ---
export const selectPaginatedVehicles = createSelector(
  [selectFilteredVehicles, selectPagination],
  (filtered, pagination) => {
    const { skip = 0, limit = 10 } = pagination;
    return filtered.slice(skip, skip + limit);
  }
);

// --- Vehicle counts ---
export const selectVehicleCounts = createSelector([selectAllVehicles], (vehicles) => {
  const total = vehicles.length;
  const active = vehicles.filter(v => v.is_active).length;
  const inactive = total - active;
  return { total, active, inactive };
});

// --- Status dropdown options ---
export const selectStatusOptions = createSelector([selectVehicleCounts], (counts) => [
  { value: 'all', label: `All (${counts.total})` },
  { value: 'true', label: `Active (${counts.active})` },
  { value: 'false', label: `Inactive (${counts.inactive})` }
]);

// --- Vehicle type dropdown options ---
export const selectVehicleTypeOptions = createSelector([selectAllVehicles], (vehicles) => {
  const types = {};
  vehicles.forEach(v => {
    if (v.vehicle_type_id && v.vehicle_type_name) types[v.vehicle_type_id] = v.vehicle_type_name;
  });
  return [{ value: 'all', label: 'All Types' }, 
    ...Object.entries(types)
      .sort((a,b) => a[1].localeCompare(b[1]))
      .map(([id, name]) => ({ value: id, label: name }))
  ];
});

// --- Driver dropdown options ---
export const selectDriverOptions = createSelector([selectAllVehicles], (vehicles) => {
  const drivers = {};
  vehicles.forEach(v => {
    if (v.driver_id && v.driver_name) drivers[v.driver_id] = v.driver_name;
  });
  return [{ value: 'all', label: 'All Drivers' },
    ...Object.entries(drivers)
      .sort((a,b) => a[1].localeCompare(b[1]))
      .map(([id, name]) => ({ value: id, label: name }))
  ];
});

// --- Vendor dropdown options ---
export const selectVendorOptions = createSelector([selectAllVehicles], (vehicles) => {
  const vendors = {};
  vehicles.forEach(v => {
    if (v.vendor_id && v.vendor_name) vendors[v.vendor_id] = v.vendor_name;
  });
  return [{ value: 'all', label: 'All Vendors' },
    ...Object.entries(vendors)
      .sort((a,b) => a[1].localeCompare(b[1]))
      .map(([id, name]) => ({ value: id, label: name }))
  ];
});

// --- Active filters for UI badges (show names instead of IDs) ---
export const selectActiveFilters = createSelector(
  [selectFilters, selectVehicleEntities],
  (filters, entities) => {
    const active = [];
    if (filters.rc_number) active.push({ key: 'RC Number', value: filters.rc_number });
    if (filters.vehicle_type_id && filters.vehicle_type_id !== 'all') 
        active.push({ key: 'Vehicle Type', value: entities[filters.vehicle_type_id]?.vehicle_type_name || filters.vehicle_type_id });
    if (filters.driver_id && filters.driver_id !== 'all') 
        active.push({ key: 'Driver', value: entities[filters.driver_id]?.driver_name || filters.driver_id });
    if (filters.is_active && filters.is_active !== 'all') 
        active.push({ key: 'Status', value: filters.is_active === 'true' ? 'Active' : 'Inactive' });
    if (filters.vendor_id && filters.vendor_id !== 'all') 
        active.push({ key: 'Vendor', value: entities[filters.vendor_id]?.vendor_name || filters.vendor_id });
    return active;
  }
);

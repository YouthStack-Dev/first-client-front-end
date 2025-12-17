import { createSelector } from "@reduxjs/toolkit";
// import { initialState } from "./vehicleSlice";

// --- Base selector ---
export const selectVehicleState = (state) =>
  state.vehicles ;

// --- Basic selectors ---
export const selectVehicleEntities = createSelector(
  [selectVehicleState],
  (state) => state.entities || {}
);

export const selectVehicleIds = createSelector(
  [selectVehicleState],
  (state) => state.ids || []
);

export const selectFilters = createSelector(
  [selectVehicleState],
  (state) => state.filters || { ...initialState.filters }
);

export const selectPagination = createSelector(
  [selectVehicleState],
  (state) => state.pagination || { ...initialState.pagination }
);

// --- Loading & error ---
export const selectLoading = createSelector(
  [selectVehicleState],
  (state) => state.loading
);

// ✅ Aliases for NEW Driver-style Vehicle pages
export const selectVehiclesLoading = selectLoading;

// --- Error & fetch flag ---
export const selectError = createSelector(
  [selectVehicleState],
  (state) => state.error
);

export const selectHasFetched = createSelector(
  [selectVehicleState],
  (state) => state.hasFetched
);

// --- All vehicles ---
export const selectAllVehicles = createSelector(
  [selectVehicleEntities, selectVehicleIds],
  (entities, ids) => ids.map((id) => entities[id]).filter(Boolean)
);

// ✅ Alias for NEW pages
export const selectVehicles = selectAllVehicles;

// --- Filtered vehicles (OLD pages) ---
export const selectFilteredVehicles = createSelector(
  [selectAllVehicles, selectFilters],
  (vehicles, filters) => {
    const {
      rc_number,
      vehicle_type_id,
      driver_id,
      is_active,
      vendor_id,
    } = filters;

    const rcFilter = rc_number?.toLowerCase().trim();

    return vehicles.filter((vehicle) => {
      if (!vehicle) return false;

      const vehicleRc = vehicle.rc_number?.toLowerCase() || "";

      const matchesRc = !rcFilter || vehicleRc.includes(rcFilter);
      const matchesType =
        vehicle_type_id === "all" ||
        vehicle.vehicle_type_id?.toString() === vehicle_type_id;
      const matchesDriver =
        driver_id === "all" ||
        vehicle.driver_id?.toString() === driver_id;
      const matchesStatus =
        is_active === "all" ||
        vehicle.is_active === (is_active === "true");
      const matchesVendor =
        vendor_id === "all" ||
        vehicle.vendor_id?.toString() === vendor_id;

      return (
        matchesRc &&
        matchesType &&
        matchesDriver &&
        matchesStatus &&
        matchesVendor
      );
    });
  }
);

// --- Paginated vehicles (OLD pages) ---
export const selectPaginatedVehicles = createSelector(
  [selectFilteredVehicles, selectPagination],
  (vehicles, pagination) => {
    const { skip = 0, limit = 10 } = pagination;
    return vehicles.slice(skip, skip + limit);
  }
);

// --- Counts ---
export const selectVehicleCounts = createSelector(
  [selectAllVehicles],
  (vehicles) => {
    const total = vehicles.length;
    const active = vehicles.filter((v) => v.is_active).length;
    const inactive = total - active;
    return { total, active, inactive };
  }
);

// ✅ Alias for NEW pages (THIS FIXES YOUR ERROR)
export const selectVehiclesTotal = createSelector(
  [selectVehicleCounts],
  (counts) => counts.total
);

// --- Status dropdown options ---
export const selectStatusOptions = createSelector(
  [selectVehicleCounts],
  (counts) => [
    { value: "all", label: `All (${counts.total})` },
    { value: "true", label: `Active (${counts.active})` },
    { value: "false", label: `Inactive (${counts.inactive})` },
  ]
);

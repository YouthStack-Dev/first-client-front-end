// vehicleTypeSelectors.js

// Select the entire vehicleType slice
export const selectVehicleTypeState = (state) => state.vehicleType || {};

// Select loading state
export const selectVehicleTypeLoading = (state) =>
  state.vehicleType?.loading || false;

// Select vendor loading state
export const selectVendorVehicleTypeLoading = (state) =>
  state.vehicleType?.vendorLoading || false;

// Select error state
export const selectVehicleTypeError = (state) =>
  state.vehicleType?.error || null;

// Select vendor error state
export const selectVendorVehicleTypeError = (state) =>
  state.vehicleType?.vendorError || null;

// Select all vehicle types (from byId normalized structure)
export const selectAllVehicleTypes = (state) => {
  const { byId = {}, allIds = [] } = state.vehicleType || {};
  return allIds.map((id) => byId[id]).filter(Boolean);
};

// Select vehicle type by ID
export const selectVehicleTypeById = (state, id) => {
  const { byId = {} } = state.vehicleType || {};
  return byId[id] || null;
};

// Select vehicle types by vendor ID
export const selectVehicleTypesByVendorId = (state, vendorId) => {
  const { vendorById = {} } = state.vehicleType || {};
  return vendorById[vendorId] || [];
};

// Select whether vehicle types are fetched
export const selectAreVehicleTypesFetched = (state) =>
  state.vehicleType?.fetched || false;

// Select whether vendor vehicle types are fetched
export const selectAreVendorVehicleTypesFetched = (state, vendorId) => {
  const { vendorById = {} } = state.vehicleType || {};
  return vendorId in vendorById;
};

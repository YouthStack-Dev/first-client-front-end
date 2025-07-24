import { API_CLIENT } from '../../../Api/API_Client';

// Get all drivers for a vendor
export const getDrivers = (vendor_id) =>
  API_CLIENT.get(`/vendors/${vendor_id}/drivers/?skip=0&limit=100`);

// Get drivers with driver_code and bgv_status
export const getFilteredDrivers = (vendor_id, driver_code, bgv_status) =>
  API_CLIENT.get(`/vendors/${vendor_id}/drivers/?driver_code=${driver_code}&bgv_status=${bgv_status}`);

// Create new driver
export const createDriverAPI = (vendor_id, payload) =>
  API_CLIENT.post(`/vendors/${vendor_id}/drivers/`, payload);

// Update full driver info
export const updateDriverAPI = (vendor_id, driver_id, payload) =>
  API_CLIENT.put(`/vendors/${vendor_id}/drivers/${driver_id}`, payload);

// Update driver status (PATCH)
export const patchDriverStatusAPI = (vendor_id, driver_id, payload) =>
  API_CLIENT.patch(`/vendors/${vendor_id}/drivers/${driver_id}/status`, payload);

// Update driver status (PUT)
export const putDriverStatusAPI = (vendor_id, driver_id, payload) =>
  API_CLIENT.put(`/vendors/${vendor_id}/drivers/${driver_id}/status`, payload);

// Get tenant-level drivers
export const getTenantDriversAPI = () =>
  API_CLIENT.get(`/vendors/tenants/drivers/?skip=0&limit=100`);

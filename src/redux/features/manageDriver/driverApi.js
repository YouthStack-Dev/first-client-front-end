import { API_CLIENT } from '../../../Api/API_Client';

/**
 * Fetch filtered drivers for a specific vendor
 * @param {string} vendor_id
 * @param {string} driver_code
 * @param {string} bgv_status
 */
export const getFilteredDrivers = (vendor_id, driver_code, bgv_status) => {
  const params = new URLSearchParams();
  if (driver_code) params.append('driver_code', driver_code);
  if (bgv_status) params.append('bgv_status', bgv_status);
  return API_CLIENT.get(`/vendors/${vendor_id}/drivers/?${params.toString()}`);
};

/**
 * Fetch all drivers for a specific vendor
 * @param {string} vendor_id
 */
export const getDrivers = (vendor_id) => {
  return API_CLIENT.get(`/vendors/${vendor_id}/drivers/?skip=0&limit=100`);
};

/**
 * Fetch all tenant-level drivers
 */
export const getTenantDriversAPI = async () => {
  try {
    const response = await API_CLIENT.get(`/vendors/tenants/drivers/?skip=0&limit=100`);
    return response;
  } catch (error) {
    console.error('❌ Error fetching tenant drivers:', error);
    throw error;
  }
};

/**
 * Create a new driver
 * @param {string} vendor_id
 * @param {object} payload
 */
export const createDriverAPI = (vendor_id, payload) => {
  return API_CLIENT.post(`/vendors/${vendor_id}/drivers/`, payload);
};

/**
 * Update full driver info
 * @param {string} vendor_id
 * @param {string} driver_id
 * @param {object} payload
 */
export const updateDriverAPI = (vendor_id, driver_id, payload) => {
  return API_CLIENT.put(`/vendors/${vendor_id}/drivers/${driver_id}`, payload);
};

/**
 * Patch driver status (partial update)
 * @param {string} vendor_id
 * @param {string} driver_id
 * @param {object} payload
 */
export const patchDriverStatusAPI = (vendor_id, driver_id, payload) => {
  return API_CLIENT.patch(`/vendors/${vendor_id}/drivers/${driver_id}/status`, payload);
};

/**
 * Fully update driver status
 * @param {string} vendor_id
 * @param {string} driver_id
 * @param {object} payload
 */
export const putDriverStatusAPI = (vendor_id, driver_id, payload) => {
  return API_CLIENT.put(`/vendors/${vendor_id}/drivers/${driver_id}/status`, payload);
};

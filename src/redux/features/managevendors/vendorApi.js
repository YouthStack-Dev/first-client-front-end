import { API_CLIENT } from '../../../Api/API_Client';

// Create Vendor
export const createVendor = async (data) => {
  const response = await API_CLIENT.post(`/vendors/`, data);
  return response.data;
};

// Get All Vendors with Pagination
export const getAllVendors = async ({ skip=0, limit =100, tenant_id }) => {
  const response = await API_CLIENT.get(`/vendors/?skip=${skip}&limit=${limit}&tenant_id=${tenant_id}`);
  return response;
};

// Get Single Vendor by ID
export const getVendorById = async (id) => {
  const response = await API_CLIENT.get(`/vendors/${id}/`);
  return response.data;
};

// Update Vendor by ID
export const updateVendor = async (id, data) => {
  const response = await API_CLIENT.put(`/vendors/${id}`, data);
  return response.data;
};

// Delete Vendor by ID
export const deleteVendor = async (id) => {
  const response = await API_CLIENT.delete(`/vendors/${id}`);
  return response.data;
};

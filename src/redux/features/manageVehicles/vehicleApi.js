import { API_CLIENT } from '../../../Api/API_Client';

export const getVehicles = (vendorId, status = "active", offset = 0, limit = 10) =>
  API_CLIENT.get(`/vendors/vehicles/?vendor_id=${vendorId}&status=${status}&limit=${limit}&offset=${offset}`);

export const createVehicle = async (vendorId, formData) => {
  return API_CLIENT.post(`/vendors/${vendorId}/vehicles/`, formData);};


export const updateVehicleApi = ({ vendor_id, vehicle_id, payload }) => {
  return API_CLIENT.put(`/vendors/${vendor_id}/vehicles/${vehicle_id}/`, payload);};

  export const deleteVehicle = (vendorId, vehicleId) => {
  return API_CLIENT.delete(`/vendors/${vendorId}/vehicles/${vehicleId}/`);};
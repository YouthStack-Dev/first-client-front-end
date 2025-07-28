

import { API_CLIENT } from "../../../Api/API_Client";

// ✅ Fetch all vehicle types for a vendor
export const getVehicleTypes = (vendorId) => {
  return API_CLIENT.get(`/vehicle_types/?vendor_id=${vendorId}`);
};

// ✅ Fetch single vehicle type by ID
export const getVehicleTypeById = (id) => {
  return API_CLIENT.get(`/vehicle_types/${id}`);
};

// ✅ Create a new vehicle type
export const postVehicleType = (payload) => {
  return API_CLIENT.post(`/vehicle_types/`, payload);
};

// ✅ Update vehicle type by ID
export const putVehicleType = (id, payload) => {
  return API_CLIENT.put(`/vehicle_types/${id}`, payload);
};

// ✅ Delete vehicle type by ID
export const deleteVehicleType = (id) => {
  return API_CLIENT.delete(`/vehicle_types/${id}`);
};



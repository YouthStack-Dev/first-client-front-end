// import { API_CLIENT } from '../../../Api/API_Client';

// // ✅ Get all vehicle types for a specific vendor
// export const getVehicleTypes = (vendorId = 1) =>
//   API_CLIENT.get(`/vehicle_types/?vendor_id=${vendorId}`);

// // ✅ Get a single vehicle type by ID
// export const getVehicleTypeById = (id) =>
//   API_CLIENT.get(`/vehicle_types/${id}`);

// // ✅ Create a new vehicle type
// export const postVehicleType = (payload) =>
//   API_CLIENT.post(`/vehicle_types/`, payload);

// // ✅ Update an existing vehicle type
// export const putVehicleType = (id, payload) =>
//   API_CLIENT.put(`/vehicle_types/${id}`, payload);

// // ✅ Delete a vehicle type
// export const deleteVehicleTypeById = (id) =>
//   API_CLIENT.delete(`/vehicle_types/${id}`);


import { API_CLIENT } from "../../../Api/API_Client";

export const getVehicleTypes = (vendorId) =>
  API_CLIENT.get(`/vehicle_types/?vendor_id=${vendorId}`);

export const postVehicleType = (payload) =>
  API_CLIENT.post(`/vehicle_types/`, payload);

export const putVehicleType = (id, payload) =>
  API_CLIENT.put(`/vehicle_types/${id}`, payload);

export const deleteVehicleType = (id) =>
  API_CLIENT.delete(`/vehicle_types/${id}`);

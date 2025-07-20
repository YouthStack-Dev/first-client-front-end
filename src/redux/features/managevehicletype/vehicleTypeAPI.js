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



// src/redux/features/managevehicletype/vehicleTypeApi.js


import { API_CLIENT } from "../../../Api/API_Client";

// ✅ Fetch all vehicle types for a vendor
export const getVehicleTypes = (vendorId) => {
  // console.log(`📡 Fetching vehicle types for vendor_id=${vendorId}`);
  return API_CLIENT.get(`/vehicle_types/?vendor_id=${vendorId}`);
};

// ✅ Fetch single vehicle type by ID
export const getVehicleTypeById = (id) => {
  // console.log(`📡 Fetching vehicle type by ID=${id}`);
  return API_CLIENT.get(`/vehicle_types/${id}`);
};

// ✅ Create a new vehicle type
export const postVehicleType = (payload) => {
  // console.log("📤 Creating vehicle type with payload:", payload);
  return API_CLIENT.post(`/vehicle_types/`, payload);
};

// ✅ Update vehicle type by ID
export const putVehicleType = (id, payload) => {
  // console.log(`✏️ Updating vehicle type ID=${id} with data:`, payload);
  return API_CLIENT.put(`/vehicle_types/${id}`, payload);
};

// ✅ Delete vehicle type by ID
export const deleteVehicleType = (id) => {
  // console.log(`🗑️ Deleting vehicle type ID=${id}`);
  return API_CLIENT.delete(`/vehicle_types/${id}`);
};



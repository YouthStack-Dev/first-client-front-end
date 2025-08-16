import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  getVehicles, createVehicle ,updateVehicleApi ,deleteVehicle
} from './vehicleApi';



export const fetchVehicles = createAsyncThunk(
  "vehicle/fetchVehicles",
  async ({ vendorId, status = "active", offset = 0, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await getVehicles(vendorId, status, offset, limit);
      return {
        data: response.data,           
        total: response.data.length,  
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);



// ✅ Create Vehicle
export const createVehicleThunk = createAsyncThunk(
  "vehicle/createVehicle",
  async ({ vendorId, formData }, { rejectWithValue }) => {
    try {
      const response = await createVehicle(vendorId, formData);
      return response.data; // API returns created vehicle object
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Thunk to update vehicle
export const updateVehicleThunk = createAsyncThunk(
  "vehicles/update",
  async ({ vendor_id, vehicle_id, payload }, { rejectWithValue }) => {
    try {
      console.log("🚀 Sending update payload:", payload);
      const response = await updateVehicleApi({ vendor_id, vehicle_id, payload });
      console.log("✅ Vehicle updated:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Vehicle update failed:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data || "Update failed");
    }
  }
);

// DELETE Thunk
export const deleteVehicleThunk = createAsyncThunk(
  "vehicles/delete",
  async ({ vendor_id, vehicle_id }, { rejectWithValue }) => {
    try {
      console.log("🚨 Deleting vehicle", { vendor_id, vehicle_id });
      
      // 🔥 FIXED: correctly pass vendor_id and vehicle_id as separate args
      const response = await deleteVehicle(vendor_id, vehicle_id);
      
      console.log("✅ Vehicle deleted:", response.data);
      return { id: vehicle_id };
    } catch (error) {
      console.error("❌ Delete vehicle error:", error);
      return rejectWithValue(error.response?.data || "Delete failed");
    }
  }
);
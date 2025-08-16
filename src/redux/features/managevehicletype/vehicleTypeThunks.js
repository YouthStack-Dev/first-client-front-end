

import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  getVehicleTypes,
  getVehicleTypeById,
  postVehicleType,
  putVehicleType,
  deleteVehicleType as apiDeleteVehicleType,
} from './vehicleTypeAPI';

export const fetchVehicleTypes = createAsyncThunk(
  'vehicleType/fetchAll',
  async (tenantId, { rejectWithValue }) => {
    if (!tenantId) {
      return rejectWithValue('tenantId is required');
    }
    try {
      const res = await getVehicleTypes(tenantId);
      // console.log('✅ fetched vehicle types:', res.data);
      return res.data;
    } catch (error) {
      console.error('⛔ fetch error:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchVehicleTypeById = createAsyncThunk(
  'vehicleType/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      // console.log("📡 Fetching vehicle type by ID:", id);
      const res = await getVehicleTypeById(id);
      // console.log("✅ Fetched vehicle type:", res.data);
      return res.data;
    } catch (error) {
      console.error("❌ Error fetching vehicle type by ID:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createVehicleType = createAsyncThunk(
  "vehicleType/createVehicleType",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await postVehicleType(payload);
      // console.log('✅ created vehicle type:', res.data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create vehicle type");
    }
  }
);

export const updateVehicleType = createAsyncThunk(
  "vehicleType/updateVehicleType",
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const res = await putVehicleType(id, payload);  
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update vehicle type");
    }
  }
);


export const deleteVehicleType = createAsyncThunk(
  "vehicleType/deleteVehicleType",
  async (id, { rejectWithValue }) => {
    try {
      await apiDeleteVehicleType(id);
      // console.log('✅ deleted vehicle type id:', id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

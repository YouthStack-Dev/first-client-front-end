// import { createAsyncThunk } from '@reduxjs/toolkit';
// import {
//   getVehicleTypes,
//   getVehicleTypeById,
//   postVehicleType,
//   putVehicleType,
//   deleteVehicleType as apiDeleteVehicleType, // ✅ Renamed to avoid conflict
// } from './vehicleTypeAPI';

// // 🔽 Fetch all vehicle types for a vendor
// export const fetchVehicleTypes = createAsyncThunk(
//   'vehicleType/fetchAll',
//   async (vendorId = 2, { rejectWithValue }) => {
//     try {
//       const res = await getVehicleTypes(vendorId);
//       return res.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || error.message);
//     }
//   }
// );

// // 📌 Fetch single vehicle type by ID
// export const fetchVehicleTypeById = createAsyncThunk(
//   'vehicleType/fetchById',
//   async (id, { rejectWithValue }) => {
//     try {
//       const res = await getVehicleTypeById(id);
//       return res.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || error.message);
//     }
//   }
// );

// // ✅ Create new vehicle type
// export const createVehicleType = createAsyncThunk(
//   'vehicleType/create',
//   async (payload, { rejectWithValue }) => {
//     try {
//       const res = await postVehicleType(payload);
//       return res.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || error.message);
//     }
//   }
// );

// // 🔁 Update vehicle type
// export const updateVehicleType = createAsyncThunk(
//   'vehicleType/update',
//   async ({ id, ...data }, { rejectWithValue }) => {
//     try {
//       const res = await putVehicleType(id, data);
//       return res.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || error.message);
//     }
//   }
// );

// // ❌ Delete vehicle type
// export const deleteVehicleType = createAsyncThunk(
//   'vehicleType/delete',
//   async (id, { rejectWithValue }) => {
//     try {
//       await apiDeleteVehicleType(id); // ✅ Calling the renamed API function
//       return id;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || error.message);
//     }
//   }
// );

// ✅ Thunks: src/redux/features/managevehicletype/vehicleTypeThunks.js

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
  async (vendorId = 2, { rejectWithValue }) => {
    try {
      const res = await getVehicleTypes(vendorId);
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
  'vehicleType/create',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await postVehicleType(payload);
      // console.log('✅ created vehicle type:', res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateVehicleType = createAsyncThunk(
  'vehicleType/update',
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const res = await putVehicleType(id, data);
      // console.log('✅ updated vehicle type:', res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteVehicleType = createAsyncThunk(
  'vehicleType/delete',
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
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


import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getVehicleTypes,
  postVehicleType,
  putVehicleType,
 deleteVehicleType as apiDeleteVehicleType, 
} from "./vehicleTypeApi";

export const fetchVehicleTypes = createAsyncThunk(
  "vehicleType/fetchVehicleTypes",
  async (vendorId, { rejectWithValue }) => {
    try {
      const res = await getVehicleTypes(vendorId);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch vehicle types");
    }
  }
);

export const createVehicleType = createAsyncThunk(
  "vehicleType/createVehicleType",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await postVehicleType(payload);
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
      const res = await apiDeleteVehicleType(id);  // ✅ FIX HERE
      return { id, message: res.data.message };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete vehicle type");
    }
  }
);


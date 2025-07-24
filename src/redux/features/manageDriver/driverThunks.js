// src/redux/features/manageDriver/driverThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  getDrivers,
  getFilteredDrivers,
  createDriverAPI,
  updateDriverAPI,
  patchDriverStatusAPI,
  putDriverStatusAPI,
  getTenantDriversAPI,
} from './driverAPI';

// ✅ Fetch Drivers
export const fetchDriversThunk = createAsyncThunk(
  'drivers/fetchDrivers',
  async ({ vendor_id, skip = 0, limit = 100 }, { rejectWithValue }) => {
    try {
      const response = await getDrivers(vendor_id); // only vendor_id is used in your API
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch drivers');
    }
  }
);

// ✅ Create Driver
export const createDriverThunk = createAsyncThunk(
  'drivers/createDriver',
  async ({ vendor_id, formData }, { rejectWithValue }) => {
    try {
      const response = await createDriverAPI(vendor_id, formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message || 'Failed to create driver');
    }
  }
);

// ✅ Update Driver
export const updateDriverThunk = createAsyncThunk(
  'drivers/updateDriver',
  async ({ vendor_id, driver_id, formData }, { rejectWithValue }) => {
    try {
      const response = await updateDriverAPI(vendor_id, driver_id, formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message || 'Failed to update driver');
    }
  }
);

// ✅ Patch Driver Status
export const patchDriverStatusThunk = createAsyncThunk(
  'drivers/patchDriverStatus',
  async ({ vendor_id, driver_id, status }, { rejectWithValue }) => {
    try {
      const response = await patchDriverStatusAPI(vendor_id, driver_id, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message || 'Failed to patch status');
    }
  }
);

// Optional if you want PUT status separately
export const putDriverStatusThunk = createAsyncThunk(
  'drivers/putDriverStatus',
  async ({ vendor_id, driver_id, status }, { rejectWithValue }) => {
    try {
      const response = await putDriverStatusAPI(vendor_id, driver_id, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message || 'Failed to update status');
    }
  }
);

// src/redux/features/manageDrivers/driverThunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";

// Fetch all drivers for the logged-in vendor (vendor_id taken from session/token in backend)
export const fetchDriversThunk = createAsyncThunk(
  "drivers/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.get("/v1/drivers/vendor");

      if (response?.data?.success) {
        return response.data.data.items; 
      } else {
        return rejectWithValue(response.data.message || "Failed to fetch drivers");
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);



  export const createDriverThunk = createAsyncThunk(
  'drivers/createDriver',
  async ({ vendor_id, formData }, { rejectWithValue }) => {
    try {
      const response = await createDriverAPI(vendor_id, formData);
      return response.data;
    } catch (error) {
      const errorData = error.response?.data;
      console.error('[Thunk] Failed to create driver:', error);
      return rejectWithValue(errorData || error.message || 'Failed to create driver');
    }
  }
);


/**
 * Update an existing driver
 */
export const updateDriverThunk = createAsyncThunk(
  'drivers/updateDriver',
  async ({ vendor_id, driver_id, formData }, { rejectWithValue }) => {
    try {
      const response = await updateDriverAPI(vendor_id, driver_id, formData);
      return response.data;
    } catch (error) {
      console.error('[Thunk] Failed to update driver:', error);
      return rejectWithValue(error.response?.data || error.message || 'Failed to update driver');
    }
  }
);

/**
 * Patch driver status (e.g., active/inactive)
 */
export const patchDriverStatusThunk = createAsyncThunk(
  'drivers/patchDriverStatus',
  async ({ vendor_id, driver_id, status }, { rejectWithValue }) => {
    try {
      const response = await patchDriverStatusAPI(vendor_id, driver_id, { status });
      return response.data;
    } catch (error) {
      console.error('[Thunk] Failed to patch driver status:', error);
      return rejectWithValue(error.response?.data || error.message || 'Failed to patch status');
    }
  }
);

/**
 * Put driver status (full update)
 */
export const putDriverStatusThunk = createAsyncThunk(
  'drivers/putDriverStatus',
  async ({ vendor_id, driver_id, status }, { rejectWithValue }) => {
    try {
      const response = await putDriverStatusAPI(vendor_id, driver_id, { status });
      return response.data;
    } catch (error) {
      console.error('[Thunk] Failed to update driver status (PUT):', error);
      return rejectWithValue(error.response?.data || error.message || 'Failed to update status');
    }
  }
);

/**
 * Get drivers based on filters (vendor, driver_code, bgv_status)
 */
export const getFilteredDriversThunk = createAsyncThunk(
  'drivers/getFilteredDrivers',
  async ({ vendor_id, driver_code = '', bgv_status = '' }, { rejectWithValue }) => {
    try {
      let response;

      if (vendor_id === 'all') {
        response = await getTenantDriversAPI();
      } else {
        const params = new URLSearchParams({ skip: 0, limit: 100 });
        if (driver_code) params.append('driver_code', driver_code);
        if (bgv_status) params.append('bgv_status', bgv_status);

        response = await API_CLIENT.get(`/vendors/${vendor_id}/drivers/?${params.toString()}`);
      }
      return response.data?.data || [];
    } catch (error) {
      console.error('[Thunk] Failed to fetch filtered drivers:', error);
      return rejectWithValue(error.response?.data || 'Failed to fetch drivers');
    }
  }
);

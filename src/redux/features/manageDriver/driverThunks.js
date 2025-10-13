// src/redux/features/manageDriver/driverThunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";

// Fetch drivers for the logged-in vendor
export const fetchDriversByVendorThunk = createAsyncThunk(
  "drivers/fetchDrivers",
  async (
    { vendor_id, active_only, license_number, search } = {},
    { rejectWithValue }
  ) => {
    try {
      if (!vendor_id) throw new Error("Vendor ID is required");

      // Build query params
      const params = new URLSearchParams();
      params.append("vendor_id", vendor_id); // always first
      if (active_only !== undefined) params.append("active_only", active_only);
      if (license_number) params.append("license_number", license_number);
      if (search) params.append("search", search);

      const response = await API_CLIENT.get(
        `/v1/drivers/vendor?${params.toString()}`
      );

      if (response.status === 200 && response.data?.success) {
        return response.data.data.items; // ✅ array of drivers
      }

      return rejectWithValue(response.data?.message || "Failed to fetch drivers");
    } catch (error) {
      return rejectWithValue(error.message || "Unexpected error occurred");
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

import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchVendorsApi, createVendorApi, updateVendorApi } from "./vendorApi";

/**
 * Fetch all vendors
 */
export const fetchVendorsThunk = createAsyncThunk(
  "vendor/fetchVendors",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchVendorsApi();
      // If API returns { success: true, data: [...] }
      return response.data || []; 
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch vendors");
    }
  }
);

/**
 * Create a new vendor
 */
export const createVendorThunk = createAsyncThunk(
  "vendor/createVendor",
  async (formData, { rejectWithValue, dispatch }) => {
    try {
      const response = await createVendorApi(formData);
      console.log("Created vendor:", response.data);

      // Refresh vendor list
      dispatch(fetchVendorsThunk());

      return response.data; // newly created vendor
    } catch (error) {
      console.error("[Thunk] Failed to create vendor:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to create vendor"
      );
    }
  }
);

/**
 * Update an existing vendor
 */
export const updateVendorThunk = createAsyncThunk(
  "vendor/updateVendor",
  async ({ vendorId, formData }, { rejectWithValue }) => {
    try {
      const response = await updateVendorApi(vendorId, formData);
      console.log("Updated vendor:", response.data);
      return response.data; // updated vendor object
    } catch (error) {
      console.error("[Thunk] Failed to update vendor:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to update vendor"
      );
    }
  }
);

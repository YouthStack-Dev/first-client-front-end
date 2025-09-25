import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";

/**
 * Fetch all vendors
 */
export const fetchVendorsThunk = createAsyncThunk(
  "vendor/fetchVendors",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { skip = 0, limit = 100, name = "", code = "" } = params;

      const response = await API_CLIENT.get("/v1/vendors/", {
        params: { skip, limit, name, code },
      });

      // Extract items array
      const vendors = response.data?.data?.items || [];

      return vendors;
    } catch (error) {
      console.error("[Thunk] Failed to fetch vendors:", error);
      const message =
        error.response?.data?.message || error.message || "Failed to fetch vendors";
      return rejectWithValue(message);
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

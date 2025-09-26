import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";

/**
 * Fetch all vendors
 */
export const fetchVendorsThunk = createAsyncThunk(
  "vendor/fetchVendors",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { skip = 0, limit = 100, name = "", code = "", tenant_id="" } = params;

      const response = await API_CLIENT.get("/v1/vendors/", {
        params: { skip, limit, name, code, tenant_id  },
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
      // Call API to create vendor
      const response = await API_CLIENT.post("/v1/vendors/", formData);
      console.log("[Thunk] Created vendor:", response.data);

      // Refresh vendor list after creation
      dispatch(fetchVendorsThunk());

      return response.data; // newly created vendor object
    } catch (error) {
      console.error("[Thunk] Failed to create vendor:", error);
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to create vendor"
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

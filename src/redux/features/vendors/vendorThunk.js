import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";

/**
 * Fetch all vendors
 */
export const fetchVendorsThunk = createAsyncThunk(
  "vendor/fetchVendors",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { skip = 0, limit = 100, name = "", code = "", tenant_id = "" } = params;

      // Build query params, filtering empty values
      const queryParams = Object.fromEntries(
        Object.entries({ skip, limit, name, code, tenant_id })
          .filter(([_, v]) => v !== "" && v != null)
      );

      const response = await API_CLIENT.get("/vendors/", { params: queryParams });

      // Validate response structure
      if (!response.data?.data) {
        throw new Error("Invalid response format");
      }

      // Return both items and metadata
      return {
        items: response.data.data.items || [],
        total: response.data.data.total || 0,
        skip,
        limit,
      };
    } catch (error) {
      console.error("[Thunk] Failed to fetch vendors:", error);
      
      const message = 
        error.response?.data?.message || 
        error.message || 
        "Failed to fetch vendors";
        
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
      const response = await API_CLIENT.post("/vendors/", formData);
      console.log("[Thunk] Created vendor:", response.data);

      // Refresh vendor list after creation
      dispatch(fetchVendorsThunk());

      return response.data; // newly created vendor object
    } catch (error) {
      console.error("[Thunk] Failed to create vendor:", error);
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to create vendor"
      );
    }
  }
);

/**
 * Update an existing vendor
 */
export const updateVendorThunk = createAsyncThunk(
  "vendor/updateVendor",
  async ({ vendorId, formData }, { rejectWithValue, dispatch }) => {
    try {
      const response = await API_CLIENT.put(`/vendors/${vendorId}`, formData);

      // Refresh vendor list after update
      dispatch(fetchVendorsThunk({ tenant_id: formData.tenant_id }));

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error);
    }
  }
);

/**
 * Toggle vendor status
 * API: /vendors/:vendor_id/toggle-status?tenant_id=TST001
 */
export const toggleVendorStatusThunk = createAsyncThunk(
  "vendor/toggleVendorStatus",
  async ({ vendorId, tenant_id }, { rejectWithValue, dispatch }) => {
    try {
      const response = await API_CLIENT.patch(
        `/vendors/${vendorId}/toggle-status`,
        null,
        { params: { tenant_id } }
      );
      // await dispatch(fetchVendorsThunk({ tenant_id }));
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to toggle vendor status"
      );
    }
  }
);

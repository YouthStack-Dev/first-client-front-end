import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";

/**
 * Fetch all companies
 */

export const fetchCompaniesThunk = createAsyncThunk(
  "company/fetchCompanies",
  async (_, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.get("/tenants/");
      const tenants = response.data?.data?.items || [];
      return tenants; 
    } catch (error) {
      console.error("[Thunk] Failed to fetch companies:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch companies";
      return rejectWithValue(message);
    }
  }
);

export const createCompanyThunk = createAsyncThunk(
  "company/createCompany",
  async (formData, { rejectWithValue, dispatch }) => {
    try {
      const payload = { ...formData };
      const response = await API_CLIENT.post("/tenants/", payload);

      dispatch(fetchCompaniesThunk());
      return response.data; // Let caller handle extraction
    } catch (error) {
      console.error("[Thunk] Failed to create company:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to create company";
      return rejectWithValue(message);
    }
  }
);


export const fetchCompanyByIdThunk = createAsyncThunk(
  "company/fetchCompanyById",
  async (tenantId, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.get(`/tenants/${tenantId}`);
      // Return the tenant + admin_policy
      return response.data?.data;
    } catch (error) {
      console.error("[Thunk] Failed to fetch company by ID:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch company details"
      );
    }
  }
);

export const updateTenantThunk = createAsyncThunk(
  "tenants/update",
  async ({ tenantId, data }, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.put(`/tenants/${tenantId}`, data);

      if (response?.data?.success) {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data.message || "Failed to update tenant"
        );
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const toggleCompanyStatusThunk = createAsyncThunk(
  "company/toggleStatus",
  async (payload, { rejectWithValue }) => {
    console.log("Payload received in thunk:", payload);
    const { tenant_id } = payload;
    try {
      const response = await API_CLIENT.patch(
        `/tenants/${tenant_id}/toggle-status`
      );
      return { tenant_id, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

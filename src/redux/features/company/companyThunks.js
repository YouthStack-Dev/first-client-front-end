import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";

/**
 * Fetch all companies
 */

export const fetchCompaniesThunk = createAsyncThunk(
  "company/fetchCompanies",
  async (_, { rejectWithValue }) => {
    try {
      // Make the request to fetch tenants
      const response = await API_CLIENT.get("/v1/tenants/");
      // Log the full response for debugging
      // console.log("Full response:", response.data);
      // Extract tenants from response
      const tenants = response.data?.data?.items || [];
      // console.log("Fetched companies (tenants):", tenants);
      return tenants; // return only the array of tenants
    } catch (error) {
      console.error("[Thunk] Failed to fetch companies:", error);
      // Return meaningful error message
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
      // console.group("[Thunk] Create Company");
      // console.log("Payload sent to API:", payload);
      // console.groupEnd();
      const response = await API_CLIENT.post("/v1/tenants/", payload);

      // console.log("[Thunk] API Response:", response.data);
      // Refresh companies list
      dispatch(fetchCompaniesThunk());
      return response.data; // Let caller handle extraction
    } catch (error) {
      console.error("[Thunk] Failed to create company:", error);
      const message = error.response?.data?.message || error.message ||"Failed to create company";
      return rejectWithValue(message);
    }
  }
);


export const fetchCompanyByIdThunk = createAsyncThunk(
  "company/fetchCompanyById",
  async (tenantId, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.get(`/v1/tenants/${tenantId}`);
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


export const updateCompanyThunk = createAsyncThunk(
  "company/updateCompany",
  async ({ companyId, formData }, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.put(`/tenants/${companyId}`, formData);
      console.log("Updated company:", response.data);
      return response.data; // ✅ return only the updated company object
    } catch (error) {
      console.error("[Thunk] Failed to update company:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to update company"
      );
    }
  }
);
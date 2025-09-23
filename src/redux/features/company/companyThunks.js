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
      console.log("Full response:", response.data);

      // Extract tenants from response
      const tenants = response.data?.data?.items || [];

      console.log("Fetched companies (tenants):", tenants);

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


/**
 * Create a new company
 */
export const createCompanyThunk = createAsyncThunk(
  "company/createCompany",
  async (formData, { rejectWithValue, dispatch }) => {
    try {
      const response = await API_CLIENT.post('/tenants', formData);
      dispatch(fetchCompaniesThunk());
      return response.data; // newly created company
    } catch (error) {
      console.error("[Thunk] Failed to create company:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to create company"
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
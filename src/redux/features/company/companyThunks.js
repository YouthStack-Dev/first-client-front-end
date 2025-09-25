import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";

/**
 * Fetch all companies
 */
export const fetchCompaniesThunk = createAsyncThunk(
  "company/fetchCompanies",
  async (_, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.get("/v1/tenants/");
      // Ensure we always return an array
      const tenants = Array.isArray(response.data?.data?.items)
        ? response.data.data.items
        : [];
      return tenants;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Failed to fetch companies";
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
      const response = await API_CLIENT.post("/v1/tenants/", formData);
      const newCompany = response.data;

      // Optionally refresh list if needed
      dispatch(fetchCompaniesThunk());

      return newCompany;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Failed to create company";
      return rejectWithValue(message);
    }
  }
);

/**
 * Update an existing company
 */
export const updateCompanyThunk = createAsyncThunk(
  "company/updateCompany",
  async ({ companyId, formData }, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.put(`/v1/tenants/${companyId}`, formData);
      const updatedCompany = response.data;

      return updatedCompany;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Failed to update company";
      return rejectWithValue(message);
    }
  }
);

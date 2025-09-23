import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchCompaniesApi, createCompanyApi,updateCompanyApi  } from "./companyApi";

/**
 * Fetch all companies
 */
export const fetchCompaniesThunk = createAsyncThunk(
  "company/fetchCompanies",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchCompaniesApi();
      console.log("Fetched companies:", response); // response.data only
      return response; // <-- make sure this is the array of companies
    } catch (error) {
      console.error("[Thunk] Failed to fetch companies:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch companies"
      );
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
      const response = await createCompanyApi(formData);
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
      const response = await updateCompanyApi(companyId, formData);
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

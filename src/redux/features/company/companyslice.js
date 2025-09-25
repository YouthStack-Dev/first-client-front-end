// src/redux/features/companies/companySlice.js
import { createSlice } from "@reduxjs/toolkit";
import {
  fetchCompaniesThunk,
  createCompanyThunk,
  updateCompanyThunk,
} from "./companyThunks";

const initialState = {
  entities: {},        // normalized companies by id
  ids: [],             // ordered list of company ids
  loading: false,      // fetching companies
  creating: false,     // creating a company
  updating: false,     // updating a company
  error: null,         // last error message
};

const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetCompanies: (state) => {
      state.entities = {};
      state.ids = [];
      state.loading = false;
      state.creating = false;
      state.updating = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // FETCH COMPANIES
    builder
      .addCase(fetchCompaniesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompaniesThunk.fulfilled, (state, action) => {
        state.loading = false;
        const companies = action.payload || [];
        state.entities = {};
        state.ids = [];
        companies.forEach((company) => {
          state.entities[company.id] = company;
          state.ids.push(company.id);
        });
      })
      .addCase(fetchCompaniesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || "Failed to fetch companies";
      });

    // CREATE COMPANY
    builder
      .addCase(createCompanyThunk.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createCompanyThunk.fulfilled, (state, action) => {
        state.creating = false;
        if (!action.payload?.id) return;
        const company = action.payload;
        state.entities[company.id] = company;
        state.ids.push(company.id);
      })
      .addCase(createCompanyThunk.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload || action.error?.message || "Failed to create company";
      });

    // UPDATE COMPANY
    builder
      .addCase(updateCompanyThunk.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateCompanyThunk.fulfilled, (state, action) => {
        state.updating = false;
        const company = action.payload;
        if (company?.id && state.entities[company.id]) {
          state.entities[company.id] = company;
        }
      })
      .addCase(updateCompanyThunk.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload || action.error?.message || "Failed to update company";
      });
  },
});

export const { clearError, resetCompanies } = companySlice.actions;
export default companySlice.reducer;

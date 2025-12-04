// src/redux/features/companies/companySlice.js
import { createSlice } from "@reduxjs/toolkit";
import {
  fetchCompaniesThunk,
  createCompanyThunk,
  updateTenantThunk,
  fetchCompanyByIdThunk,
  toggleCompanyStatusThunk,
} from "./companyThunks";

const initialState = {
  data: [],
  loading: false,
  creating: false,
  updating: false,
  error: null,
  selectedCompany: null,
  fetchingSingle: false,
  toggling: false,
  fetched: false, // 🟢 New status to track if companies have been fetched
};

const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    clearSelectedCompany: (state) => {
      state.selectedCompany = null;
    },
    resetFetchedStatus: (state) => {
      state.fetched = false; // 🟢 Reset fetched status if needed
    },
  },
  extraReducers: (builder) => {
    // Fetch companies
    builder
      .addCase(fetchCompaniesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.fetched = false; // 🟢 Reset to false when starting new fetch
      })
      .addCase(fetchCompaniesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.fetched = true; // 🟢 Set to true when successfully fetched
      })
      .addCase(fetchCompaniesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.fetched = false; // 🟢 Remain false on error
      });

    // Create company
    builder
      .addCase(createCompanyThunk.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createCompanyThunk.fulfilled, (state, action) => {
        state.creating = false;
        if (action.payload) state.data.push(action.payload);
        // 🟢 Don't modify fetched status here as we're just adding to existing data
      })
      .addCase(createCompanyThunk.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      });

    // Update company
    builder
      .addCase(updateTenantThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTenantThunk.fulfilled, (state, action) => {
        state.loading = false;

        const tenant = action.payload;
        const tenantId =
          tenant?.tenant_id || tenant?.id || action.meta?.arg?.tenantId;
        // 🟢 Ensure state.entities exists
        if (!state.entities) {
          state.entities = {};
        }
        state.error = null;
      })
      .addCase(updateTenantThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update tenant";
      });

    // ✅ Toggle company active/inactive status
    builder
      .addCase(toggleCompanyStatusThunk.pending, (state) => {
        state.toggling = true;
        state.error = null;
      })
      .addCase(toggleCompanyStatusThunk.fulfilled, (state, action) => {
        state.toggling = false;

        const { tenant_id } = action.payload;
        const index = state.data.findIndex((c) => c.tenant_id === tenant_id);

        if (index !== -1) {
          // Toggle status locally
          state.data[index].is_active = !state.data[index].is_active;
        }
      })
      .addCase(toggleCompanyStatusThunk.rejected, (state, action) => {
        state.toggling = false;
        state.error = action.payload || "Failed to toggle company status";
      });

    // Fetch single company
    builder
      .addCase(fetchCompanyByIdThunk.pending, (state) => {
        state.fetchingSingle = true;
        state.error = null;
      })
      .addCase(fetchCompanyByIdThunk.fulfilled, (state, action) => {
        state.fetchingSingle = false;
        state.selectedCompany = action.payload; // includes tenant + admin_policy
      })
      .addCase(fetchCompanyByIdThunk.rejected, (state, action) => {
        state.fetchingSingle = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelectedCompany, resetFetchedStatus } =
  companySlice.actions;
export const selectCompaniesFromRedux = (state) => state.company.data;
export const selectCompaniesFetched = (state) => state.company.fetched; // 🟢 Selector for fetched status
export default companySlice.reducer;

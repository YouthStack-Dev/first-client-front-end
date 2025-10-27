// src/redux/features/companies/companySlice.js
import { createSlice } from "@reduxjs/toolkit";
import { 
  fetchCompaniesThunk, 
  createCompanyThunk, 
  updateTenantThunk,
  fetchCompanyByIdThunk,
  toggleCompanyStatusThunk
} from "./companyThunks";

const initialState = {
  data: [],              // list of companies
  loading: false,        // fetching all companies
  creating: false,       // creating a company
  updating: false,       // updating a company
  error: null,
  selectedCompany: null, // for edit modal
  fetchingSingle: false, // fetching single company
   toggling: false,  
};

const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    clearSelectedCompany: (state) => {
      state.selectedCompany = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch companies
    builder
      .addCase(fetchCompaniesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompaniesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchCompaniesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
        const tenantId = tenant?.tenant_id || tenant?.id || action.meta?.arg?.tenantId;
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

export const { clearSelectedCompany } = companySlice.actions;

export default companySlice.reducer;

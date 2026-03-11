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
  fetched: false,
};

const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    clearSelectedCompany: (state) => {
      state.selectedCompany = null;
    },
    resetFetchedStatus: (state) => {
      // Use this intentionally when you want to force a re-fetch
      // e.g. after a bulk delete, or when switching tenant context
      state.fetched = false;
    },
  },
  extraReducers: (builder) => {

    // ── Fetch all companies ──────────────────────────────────────────────────
    builder
      .addCase(fetchCompaniesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        // ✅ Do NOT reset fetched here.
        //
        // WHY: If fetched were reset to false on every pending, a re-render
        // mid-request (e.g. triggered by another Redux update) would see
        // fetched=false and dispatch a second fetch, creating a race condition.
        // fetched should only ever transition:
        //   false → true  (on fulfilled)
        //   true  → false (only via resetFetchedStatus action, intentionally)
      })
      .addCase(fetchCompaniesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.data    = action.payload;
        state.error   = null;
        state.fetched = true; // persists across component unmount/remount
      })
      .addCase(fetchCompaniesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
        // ✅ Leave fetched as-is on failure.
        //
        // WHY: If we had data from a previous successful fetch, we don't want
        // a background re-fetch failure to reset fetched=false and trigger
        // yet another fetch loop. The Sync button is the recovery path.
        // On first-ever load failure, fetched stays false — which is correct
        // because we have no data and the user should be able to retry.
      });

    // ── Create company ───────────────────────────────────────────────────────
    builder
      .addCase(createCompanyThunk.pending, (state) => {
        state.creating = true;
        state.error    = null;
      })
      .addCase(createCompanyThunk.fulfilled, (state, action) => {
        state.creating = false;
        // Optimistically append to local list so the UI updates immediately
        // without needing a full re-fetch
        if (action.payload) state.data.push(action.payload);
      })
      .addCase(createCompanyThunk.rejected, (state, action) => {
        state.creating = false;
        state.error    = action.payload;
      });

    // ── Update company (tenant) ──────────────────────────────────────────────
    builder
      .addCase(updateTenantThunk.pending, (state) => {
        state.updating = true; // ✅ use state.updating, not state.loading
        state.error    = null;
      })
      .addCase(updateTenantThunk.fulfilled, (state, action) => {
        state.updating = false;
        state.error    = null;

        const updatedTenant = action.payload;

        // Resolve the tenant ID — try payload first, then fall back to the
        // original arg passed into the thunk (tenantId from updateTenantThunk)
        const tenantId =
          updatedTenant?.tenant_id ||
          updatedTenant?.id        ||
          action.meta?.arg?.tenantId;

        if (!tenantId) return;

        // ✅ FIXED: was incorrectly referencing state.tenants which doesn't exist.
        // This slice stores companies in state.data (a flat array).
        const index = state.data.findIndex(
          (c) => c.tenant_id === tenantId || c.id === tenantId
        );

        if (index !== -1) {
          // Merge so no existing fields (e.g. is_active, employee info) are lost
          state.data[index] = {
            ...state.data[index],
            ...updatedTenant,
          };
        }
      })
      .addCase(updateTenantThunk.rejected, (state, action) => {
        state.updating = false;
        state.error    = action.payload || "Failed to update tenant";
      });

    // ── Toggle active / inactive ─────────────────────────────────────────────
    builder
      .addCase(toggleCompanyStatusThunk.pending, (state) => {
        state.toggling = true;
        state.error    = null;
      })
      .addCase(toggleCompanyStatusThunk.fulfilled, (state, action) => {
        state.toggling = false;

        const { tenant_id } = action.payload;
        const index = state.data.findIndex((c) => c.tenant_id === tenant_id);

        if (index !== -1) {
          state.data[index].is_active = !state.data[index].is_active;
        }
      })
      .addCase(toggleCompanyStatusThunk.rejected, (state, action) => {
        state.toggling = false;
        state.error    = action.payload || "Failed to toggle company status";
      });

    // ── Fetch single company ─────────────────────────────────────────────────
    builder
      .addCase(fetchCompanyByIdThunk.pending, (state) => {
        state.fetchingSingle = true;
        state.error          = null;
      })
      .addCase(fetchCompanyByIdThunk.fulfilled, (state, action) => {
        state.fetchingSingle = false;
        state.selectedCompany = action.payload; // includes tenant + admin_policy
      })
      .addCase(fetchCompanyByIdThunk.rejected, (state, action) => {
        state.fetchingSingle = false;
        state.error          = action.payload;
      });
  },
});

export const { clearSelectedCompany, resetFetchedStatus } = companySlice.actions;

// ── Selectors ────────────────────────────────────────────────────────────────
export const selectCompanies      = (state) => state.company.data;
export const selectCompaniesFetched = (state) => state.company.fetched;
export const selectCompaniesLoading = (state) => state.company.loading;
export const selectCompaniesError   = (state) => state.company.error;

export default companySlice.reducer;
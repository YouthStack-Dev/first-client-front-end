import { createSlice } from "@reduxjs/toolkit";
import {
  fetchVendorsThunk,
  createVendorThunk,
  updateVendorThunk,
  toggleVendorStatusThunk,
} from "./vendorThunk";

const initialState = {
  data: [],
  vendorsByTenant: {},
  loading: false,
  creating: false,
  updating: false,
  fetched: false,
  toggling: false,
  selectedVendor: null,
  error: null,
};

const vendorSlice = createSlice({
  name: "vendor",
  initialState,
  reducers: {
    setSelectedVendor(state, action) {
      state.selectedVendor = action.payload;
    },
    clearSelectedVendor(state) {
      state.selectedVendor = null;
    },
    resetVendorFetched(state) {
      state.fetched = false;
    },
  },
  extraReducers: (builder) => {

    // ── Fetch vendors ────────────────────────────────────────────────────────
    builder
      .addCase(fetchVendorsThunk.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchVendorsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.fetched = true;

        const vendors  = action.payload.items || [];
        state.data     = vendors;
        state.total    = action.payload.total || 0;

        // Build tenant map for O(1) lookup by tenant_id
        state.vendorsByTenant = vendors.reduce((acc, v) => {
          if (!acc[v.tenant_id]) acc[v.tenant_id] = [];
          acc[v.tenant_id].push(v);
          return acc;
        }, {});
      })
      .addCase(fetchVendorsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });

    // ── Create vendor ────────────────────────────────────────────────────────
    builder
      .addCase(createVendorThunk.pending, (state) => {
        state.creating = true;
        state.error    = null;
      })
      .addCase(createVendorThunk.fulfilled, (state, action) => {
        state.creating = false;
        const newVendor = action.payload?.data?.vendor || action.payload;
        if (newVendor) {
          state.data.push(newVendor);
          const tenantList = state.vendorsByTenant[newVendor.tenant_id] || [];
          tenantList.push(newVendor);
          state.vendorsByTenant[newVendor.tenant_id] = tenantList;
        }
      })
      .addCase(createVendorThunk.rejected, (state, action) => {
        state.creating = false;
        state.error    = action.payload;
      });

    // ── Update vendor ────────────────────────────────────────────────────────
    builder
      .addCase(updateVendorThunk.pending, (state) => {
        state.updating = true;
        state.error    = null;
      })
      .addCase(updateVendorThunk.fulfilled, (state, action) => {
        state.updating = false;
        const updatedVendor = action.payload?.data?.vendor || action.payload;
        if (!updatedVendor) return;

        const index = state.data.findIndex(
          (v) => v.vendor_id === updatedVendor.vendor_id
        );
        if (index !== -1) state.data[index] = updatedVendor;

        const tenantList = state.vendorsByTenant[updatedVendor.tenant_id] || [];
        const tenantIndex = tenantList.findIndex(
          (v) => v.vendor_id === updatedVendor.vendor_id
        );
        if (tenantIndex !== -1) tenantList[tenantIndex] = updatedVendor;
        else tenantList.push(updatedVendor);
        state.vendorsByTenant[updatedVendor.tenant_id] = tenantList;

        if (state.selectedVendor?.vendor_id === updatedVendor.vendor_id) {
          state.selectedVendor = updatedVendor;
        }
      })
      .addCase(updateVendorThunk.rejected, (state, action) => {
        state.updating = false;
        state.error    = action.payload;
      });

    // ── Toggle vendor status ─────────────────────────────────────────────────
    builder
      .addCase(toggleVendorStatusThunk.pending, (state) => {
        state.toggling = true;
        state.error    = null;
      })
      .addCase(toggleVendorStatusThunk.fulfilled, (state, action) => {
        state.toggling = false;
        const toggledVendor = action.payload?.data || {};

        if (toggledVendor.vendor_id) {
          const index = state.data.findIndex(
            (v) => v.vendor_id === toggledVendor.vendor_id
          );
          if (index !== -1) state.data[index] = toggledVendor;

          const tenantList =
            state.vendorsByTenant[toggledVendor.tenant_id] || [];
          const tenantIndex = tenantList.findIndex(
            (v) => v.vendor_id === toggledVendor.vendor_id
          );
          if (tenantIndex !== -1) tenantList[tenantIndex] = toggledVendor;
          else tenantList.push(toggledVendor);
          state.vendorsByTenant[toggledVendor.tenant_id] = tenantList;

          if (state.selectedVendor?.vendor_id === toggledVendor.vendor_id) {
            state.selectedVendor = toggledVendor;
          }
        }
      })
      .addCase(toggleVendorStatusThunk.rejected, (state, action) => {
        state.toggling = false;
        state.error    = action.payload;
      });
  },
});

export const { setSelectedVendor, clearSelectedVendor, resetVendorFetched } =
  vendorSlice.actions;

// ── Selectors ────────────────────────────────────────────────────────────────
// Split selectors — each returns a primitive or the stable Redux reference.
// Never return a new object/array literal here (that's the anti-pattern that
// caused the "Selector returned a different result" warning in EntityModal).
export const selectVendors          = (state) => state.vendor.data;
export const selectVendorsFetched   = (state) => state.vendor.fetched;
export const selectVendorsLoading   = (state) => state.vendor.loading;
export const selectVendorsError     = (state) => state.vendor.error;
export const selectVendorsByTenant  = (state) => state.vendor.vendorsByTenant;
export const selectSelectedVendor   = (state) => state.vendor.selectedVendor;

export default vendorSlice.reducer;
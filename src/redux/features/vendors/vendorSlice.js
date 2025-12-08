// src/redux/features/vendors/vendorSlice.js
import { createSlice } from "@reduxjs/toolkit";
import {
  fetchVendorsThunk,
  createVendorThunk,
  updateVendorThunk,
  toggleVendorStatusThunk,
} from "./vendorThunk";

const initialState = {
  data: [], // all vendors
  vendorsByTenant: {}, // map tenant_id => vendor list
  loading: false,
  creating: false,
  updating: false,
  toggling: false, // for toggle status
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
  },
  extraReducers: (builder) => {
    // 🔹 Fetch vendors
    builder
      .addCase(fetchVendorsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendorsThunk.fulfilled, (state, action) => {
        state.loading = false;
        const vendors = action.payload || [];
        state.data = vendors;

        // Build map
        state.vendorsByTenant = vendors.reduce((acc, v) => {
          if (!acc[v.tenant_id]) acc[v.tenant_id] = [];
          acc[v.tenant_id].push(v);
          return acc;
        }, {});
      })
      .addCase(fetchVendorsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // 🔹 Create vendor
    builder
      .addCase(createVendorThunk.pending, (state) => {
        state.creating = true;
        state.error = null;
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
        state.error = action.payload;
      });

    // 🔹 Update vendor
    builder
      .addCase(updateVendorThunk.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateVendorThunk.fulfilled, (state, action) => {
        state.updating = false;
        const updatedVendor = action.payload?.data?.vendor || action.payload;
        if (!updatedVendor) return;

        // Flat list update
        const index = state.data.findIndex(
          (v) => v.vendor_id === updatedVendor.vendor_id
        );
        if (index !== -1) state.data[index] = updatedVendor;

        // Tenant map update
        const tenantList = state.vendorsByTenant[updatedVendor.tenant_id] || [];
        const tenantIndex = tenantList.findIndex(
          (v) => v.vendor_id === updatedVendor.vendor_id
        );
        if (tenantIndex !== -1) tenantList[tenantIndex] = updatedVendor;
        else tenantList.push(updatedVendor);
        state.vendorsByTenant[updatedVendor.tenant_id] = tenantList;

        // Selected vendor update
        if (state.selectedVendor?.vendor_id === updatedVendor.vendor_id) {
          state.selectedVendor = updatedVendor;
        }
      })
      .addCase(updateVendorThunk.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      });

    // 🔹 Toggle vendor status
    builder
      .addCase(toggleVendorStatusThunk.pending, (state) => {
        state.toggling = true;
        state.error = null;
      })
      .addCase(toggleVendorStatusThunk.fulfilled, (state, action) => {
        state.toggling = false;

        // ✅ The toggle API returns updated vendor directly (no nested .data)
        const toggledVendor = action.payload || {};

        if (toggledVendor.vendor_id) {
          // Flat list update
          const index = state.data.findIndex(
            (v) => v.vendor_id === toggledVendor.vendor_id
          );
          if (index !== -1) state.data[index] = toggledVendor;

          // Tenant map update
          const tenantList =
            state.vendorsByTenant[toggledVendor.tenant_id] || [];
          const tenantIndex = tenantList.findIndex(
            (v) => v.vendor_id === toggledVendor.vendor_id
          );
          if (tenantIndex !== -1) tenantList[tenantIndex] = toggledVendor;
          else tenantList.push(toggledVendor);
          state.vendorsByTenant[toggledVendor.tenant_id] = tenantList;

          // Selected vendor update
          if (state.selectedVendor?.vendor_id === toggledVendor.vendor_id) {
            state.selectedVendor = toggledVendor;
          }
        }
      })
      .addCase(toggleVendorStatusThunk.rejected, (state, action) => {
        state.toggling = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedVendor, clearSelectedVendor } = vendorSlice.actions;
export default vendorSlice.reducer;

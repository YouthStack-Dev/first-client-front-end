import { createSlice } from '@reduxjs/toolkit';
import {
  fetchVendors,
  addVendor,
  editVendor,
  removeVendor,
  fetchVendorById,
} from './vendorThunks';

const vendorSlice = createSlice({
  name: 'vendor',
  initialState: {
    vendors: [],
    total: 0,
    loading: false,
    error: null,
    isModalOpen: false,
    selectedVendor: null,
  },
  reducers: {
    openModal: (state, action) => {
      state.isModalOpen = true;
      state.selectedVendor = action.payload || null;
    },
    closeModal: (state) => {
      state.isModalOpen = false;
      state.selectedVendor = null;
    },
    // ✅ New reducer to instantly update active/inactive in state
    updateVendorStatusLocally: (state, action) => {
      const { id, is_active } = action.payload;
      const vendorIndex = state.vendors.findIndex((v) => v.vendor_id === id);
      if (vendorIndex !== -1) {
        state.vendors[vendorIndex].is_active = is_active;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Vendors
      .addCase(fetchVendors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.loading = false;
        state.vendors = action.payload || [];
        state.total = action.payload?.length || 0;
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Single Vendor
      .addCase(fetchVendorById.fulfilled, (state, action) => {
        const updatedVendor = action.payload;
        const index = state.vendors.findIndex(
          (v) => v.vendor_id === updatedVendor.vendor_id
        );
        if (index !== -1) {
          state.vendors[index] = updatedVendor;
        } else {
          state.vendors.unshift(updatedVendor);
        }
      })

      // Add Vendor
      .addCase(addVendor.fulfilled, (state, action) => {
        state.vendors.unshift(action.payload);
        state.isModalOpen = false;
      })

      // Edit Vendor
      .addCase(editVendor.fulfilled, (state, action) => {
        state.vendors = state.vendors.map((vendor) =>
          vendor.vendor_id === action.payload.vendor_id
            ? action.payload
            : vendor
        );
        state.isModalOpen = false;
      })

      // Remove Vendor
      .addCase(removeVendor.fulfilled, (state, action) => {
        state.vendors = state.vendors.filter(
          (vendor) => vendor.vendor_id !== action.payload
        );
      });
  },
});

export const { openModal, closeModal, updateVendorStatusLocally } = vendorSlice.actions;
export default vendorSlice.reducer;

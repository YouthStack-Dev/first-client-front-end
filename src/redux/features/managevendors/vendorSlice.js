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
    // Optimistic update: toggle status, edit, add, or remove vendor
    updateVendorStatusLocally: (state, action) => {
      const { id, is_active, data, remove } = action.payload;

      if (remove) {
        // Delete vendor
        state.vendors = state.vendors.filter((v) => v.vendor_id !== id);
      } else if (data) {
        if (id === 'new') {
          // Add new vendor locally
          state.vendors.unshift(data);
        } else {
          // Update existing vendor locally (edit)
          const index = state.vendors.findIndex((v) => v.vendor_id === id);
          if (index !== -1) state.vendors[index] = { ...state.vendors[index], ...data };
        }
      } else if (id && typeof is_active === 'boolean') {
        // Toggle active/inactive
        const index = state.vendors.findIndex((v) => v.vendor_id === id);
        if (index !== -1) state.vendors[index].is_active = is_active;
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
        state.vendors = action.payload?.vendors || action.payload || [];
        // Use total if provided for pagination
        state.total = action.payload?.total ?? state.vendors.length;
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
      .addCase(addVendor.rejected, (state, action) => {
        state.error = action.payload;
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
      .addCase(editVendor.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Remove Vendor
      .addCase(removeVendor.fulfilled, (state, action) => {
        state.vendors = state.vendors.filter(
          (vendor) => vendor.vendor_id !== action.payload
        );
      })
      .addCase(removeVendor.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

// Selectors for encapsulated state access
export const selectVendors = (state) => state.vendor.vendors;
export const selectVendorById = (state, id) =>state.vendor.vendors.find((v) => v.vendor_id === id);
export const selectIsModalOpen = (state) => state.vendor.isModalOpen;
export const selectSelectedVendor = (state) => state.vendor.selectedVendor;
export const selectLoading = (state) => state.vendor.loading;
export const selectError = (state) => state.vendor.error;

export const { openModal, closeModal, updateVendorStatusLocally } = vendorSlice.actions;
export default vendorSlice.reducer;


import { createSlice } from '@reduxjs/toolkit';
import { fetchVendors, addVendor, editVendor, removeVendor, fetchVendorById } from '@features/manageVendors/vendorThunks';

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
      .addCase(addVendor.fulfilled, (state) => {
        state.isModalOpen = false; // vendors already re-fetched in thunk
      })
      .addCase(addVendor.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Edit Vendor
      .addCase(editVendor.fulfilled, (state) => {
        state.isModalOpen = false; // vendors already re-fetched in thunk
      })
      .addCase(editVendor.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Remove Vendor
      .addCase(removeVendor.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

// Selectors
export const selectVendors = (state) => state.vendor.vendors;
export const selectVendorById = (state, id) =>
  state.vendor.vendors.find((v) => v.vendor_id === id);
export const selectIsModalOpen = (state) => state.vendor.isModalOpen;
export const selectSelectedVendor = (state) => state.vendor.selectedVendor;
export const selectLoading = (state) => state.vendor.loading;
export const selectError = (state) => state.vendor.error;

export const { openModal, closeModal } = vendorSlice.actions;
export default vendorSlice.reducer;

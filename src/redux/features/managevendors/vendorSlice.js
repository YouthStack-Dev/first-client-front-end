import { createSlice } from '@reduxjs/toolkit';
import {
  fetchVendors,
  addVendor,
  editVendor,
  removeVendor,
} from './vendorThunks';

const vendorSlice = createSlice({
  name: 'vendors',
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


      

      // Add Vendor
      .addCase(addVendor.fulfilled, (state, action) => {
        state.vendors.unshift(action.payload);
        state.isModalOpen = false;
      })

      // Edit Vendor
      .addCase(editVendor.fulfilled, (state, action) => {
        state.vendors = state.vendors.map((vendor) =>
          vendor.vendor_id === action.payload.vendor_id ? action.payload : vendor
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

export const { openModal, closeModal } = vendorSlice.actions;
export default vendorSlice.reducer;

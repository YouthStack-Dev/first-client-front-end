import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  createVendor,
  getAllVendors,
  updateVendor,
  deleteVendor,
  getVendorById,
} from './vendorApi';

// 🟢 Fetch Vendors (List)
export const fetchVendors = createAsyncThunk(
  'vendors/fetchVendors',
  async ({ skip = 0, limit = 25 } = {}, { rejectWithValue }) => {
    try {
      const response = await getAllVendors({ skip, limit });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch vendors');
    }
  }
);

// 🟢 Fetch Vendor by ID
export const fetchVendorById = createAsyncThunk(
  "vendors/fetchVendorById",
  async (vendorId, { rejectWithValue }) => {
    try {
      const data = await getVendorById(vendorId);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error fetching vendor");
    }
  }
);

// 🟢 Add Vendor → then re-fetch vendors
export const addVendor = createAsyncThunk(
  'vendors/addVendor',
  async (vendorData, { rejectWithValue, dispatch }) => {
    try {
      await createVendor(vendorData);
      // ✅ Re-fetch full list after adding
      const updated = await dispatch(fetchVendors({ skip: 0, limit: 25 }));
      return updated;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to add vendor');
    }
  }
);

// 🟢 Edit Vendor → then re-fetch vendors
export const editVendor = createAsyncThunk(
  'vendors/editVendor',
  async ({ id, vendorData }, { rejectWithValue, dispatch }) => {
    try {
      await updateVendor(id, vendorData);
      // ✅ Re-fetch full list after editing
      const updated = await dispatch(fetchVendors({ skip: 0, limit: 25 }));
      return updated;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to update vendor');
    }
  }
);

// 🟢 Delete Vendor → then re-fetch vendors
export const removeVendor = createAsyncThunk(
  'vendors/removeVendor',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await deleteVendor(id);
      // ✅ Re-fetch full list after deleting
      const updated = await dispatch(fetchVendors({ skip: 0, limit: 25 }));
      return updated;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to delete vendor');
    }
  }
);

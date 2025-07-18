// src/redux/features/manageVendors/vendorThunks.js

import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  createVendor,
  getAllVendors,
  updateVendor,
  deleteVendor,
} from './vendorApi';

// 🟢 Fetch Vendors (List)
export const fetchVendors = createAsyncThunk(
  'vendors/fetchVendors',
  async ({ skip = 0, limit = 100, tenant_id }, { rejectWithValue }) => {
    try {
      const response = await getAllVendors({ skip, limit, tenant_id });
      return response.data; // Array of vendors
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch vendors');
    }
  }
);

// 🟢 Add Vendor
export const addVendor = createAsyncThunk(
  'vendors/addVendor',
  async (vendorData, { rejectWithValue }) => {
    try {
      const response = await createVendor(vendorData);
      // Backend returns full list after POST
      return response;  // response is expected to be an array
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to add vendor');
    }
  }
);

// 🟢 Edit Vendor
export const editVendor = createAsyncThunk(
  'vendors/editVendor',
  async ({ id, vendorData }, { rejectWithValue }) => {
    try {
      const response = await updateVendor(id, vendorData);
      return response; // single updated vendor
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to update vendor');
    }
  }
);

// 🟢 Delete Vendor
export const removeVendor = createAsyncThunk(
  'vendors/removeVendor',
  async (id, { rejectWithValue }) => {
    try {
      await deleteVendor(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to delete vendor');
    }
  }
);

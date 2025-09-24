// src/redux/features/vendors/vendorSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { 
  fetchVendorsThunk, 
  createVendorThunk, 
  updateVendorThunk 
} from "./vendorThunk";

const initialState = {
  data: [],          // list of vendors
  loading: false,    // for fetching vendors
  creating: false,   // for creating a vendor
  updating: false,   // for updating a vendor
  error: null,
};

const vendorSlice = createSlice({
  name: "vendor",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch vendors
    builder
      .addCase(fetchVendorsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendorsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchVendorsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create vendor
    builder
      .addCase(createVendorThunk.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createVendorThunk.fulfilled, (state, action) => {
        state.creating = false;
        if (action.payload) state.data.push(action.payload);
      })
      .addCase(createVendorThunk.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      });

    // Update vendor
    builder
      .addCase(updateVendorThunk.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateVendorThunk.fulfilled, (state, action) => {
        state.updating = false;
        const index = state.data.findIndex(v => v.id === action.payload.id);
        if (index !== -1) state.data[index] = action.payload;
      })
      .addCase(updateVendorThunk.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      });
  },
});

export default vendorSlice.reducer;

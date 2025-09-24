import { createSlice } from "@reduxjs/toolkit";
import { fetchPermissionsThunk } from "./permissionsThunk";

const permissionsSlice = createSlice({
  name: "permissions",
  initialState: {
    permissions: [],
    loading: false,
    error: null,
    fetched: false, 
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPermissionsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPermissionsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.permissions = action.payload;
        state.fetched = true; // set fetched true
      })
      .addCase(fetchPermissionsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});


export const { resetPermissions } = permissionsSlice.actions; 
export default permissionsSlice.reducer;

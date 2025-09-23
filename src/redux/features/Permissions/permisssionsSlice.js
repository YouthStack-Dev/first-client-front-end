// src/redux/features/modules/moduleSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { fetchModulesThunk } from "../Permissions/permissionsThunk";

const moduleSlice = createSlice({
  name: "modules",
  initialState: {
    modules: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchModulesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchModulesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.modules = action.payload;
      })
      .addCase(fetchModulesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

  },
});

export default moduleSlice.reducer;

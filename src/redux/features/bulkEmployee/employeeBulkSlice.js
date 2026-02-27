import { createSlice } from "@reduxjs/toolkit";
import { bulkUploadEmployees } from "./employeeBulkthunk";

/* =========================================================
   INITIAL STATE
========================================================= */
const initialState = {
  bulkUpload: {
    loading: false,
    result: null,   // success response from backend
    error: null,    // validation / server errors
    uploadedCount: 0, // Track number of employees uploaded (optional)
  },
};

/* =========================================================
   SLICE
========================================================= */
const employeeBulkSlice = createSlice({
  name: "employee",
  initialState,
  reducers: {
    resetBulkUploadState: (state) => {
      state.bulkUpload = initialState.bulkUpload; // ✨ Reference initial state
    },
    
    // Optional: Clear only error (useful for dismissing error messages)
    clearBulkUploadError: (state) => {
      state.bulkUpload.error = null;
    },
  },

  extraReducers: (builder) => {
    /* =====================================================
       BULK UPLOAD EMPLOYEES
    ====================================================== */
    builder
      .addCase(bulkUploadEmployees.pending, (state) => {
        state.bulkUpload.loading = true;
        state.bulkUpload.result = null;
        state.bulkUpload.error = null;
      })

      .addCase(bulkUploadEmployees.fulfilled, (state, action) => {
        state.bulkUpload.loading = false;
        state.bulkUpload.result = action.payload;
        state.bulkUpload.error = null;
        
        // Optional: Track count if backend returns it
        state.bulkUpload.uploadedCount = action.payload?.count || 0;
      })

      .addCase(bulkUploadEmployees.rejected, (state, action) => {
        state.bulkUpload.loading = false;
        state.bulkUpload.result = null;
        state.bulkUpload.error = action.payload || "Upload failed"; // ✨ Fallback error
      });
  },
});

/* =========================================================
   EXPORTS
========================================================= */
export const {
  resetBulkUploadState,
  clearBulkUploadError, // Optional
} = employeeBulkSlice.actions;

export default employeeBulkSlice.reducer;
import { createSlice } from "@reduxjs/toolkit";

// ✅ CORRECT
import { bulkUploadEmployees } from "./employeeBulkthunk";


/* =========================================================
   INITIAL STATE
========================================================= */
const initialState = {
  // Bulk upload state
  bulkUpload: {
    loading: false,
    result: null,   // success response from backend
    error: null,    // validation / server errors
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
      state.bulkUpload = {
        loading: false,
        result: null,
        error: null,
      };
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
      })

      .addCase(bulkUploadEmployees.rejected, (state, action) => {
        state.bulkUpload.loading = false;
        state.bulkUpload.result = null;
        state.bulkUpload.error = action.payload;
      });
  },
});

/* =========================================================
   EXPORTS
========================================================= */
export const {
  resetBulkUploadState,
} = employeeBulkSlice.actions;

export default employeeBulkSlice.reducer;

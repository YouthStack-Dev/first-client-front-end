import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";

export const bulkUploadEmployees = createAsyncThunk(
  "employee/bulkUpload",
  async (file, { rejectWithValue }) => {
    try {
      // Edge case: No file provided
      if (!file) {
        return rejectWithValue({ message: "No file selected" });
      }

      const formData = new FormData();
      formData.append("file", file);

      const res = await API_CLIENT.post(
        "/employees/bulk-upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 60000, // 60 second timeout for large files
        }
      );

      return res.data;
    } catch (err) {
      // Handle timeout
      if (err.code === "ECONNABORTED") {
        return rejectWithValue({
          message: "Upload timeout. Please try again or use a smaller file.",
        });
      }

      // Handle network error
      if (err.code === "ERR_NETWORK") {
        return rejectWithValue({
          message: "Network error. Please check your connection.",
        });
      }

      // Backend errors
      if (err.response) {
        const { status, data } = err.response;

        switch (status) {
          case 400:
            return rejectWithValue(
              data || { message: "Invalid file format or data" }
            );
          case 413:
            return rejectWithValue({
              message: "File is too large",
            });
          case 422:
            // Validation errors with row details
            return rejectWithValue(
              data || { message: "Validation failed" }
            );
          case 500:
            return rejectWithValue({
              message: "Server error. Please try again later.",
            });
          default:
            return rejectWithValue(
              data || { message: "Upload failed. Please try again." }
            );
        }
      }

      // Unknown error
      return rejectWithValue({
        message: err.message || "An unexpected error occurred",
      });
    }
  }
);
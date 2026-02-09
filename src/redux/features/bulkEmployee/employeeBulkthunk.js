import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";

export const bulkUploadEmployees = createAsyncThunk(
  "employee/bulkUpload",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await API_CLIENT.post(
        "/employees/bulk-upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Bulk upload failed"
      );
    }
  }
);

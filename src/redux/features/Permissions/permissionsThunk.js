import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchModulesApi } from "../Permissions/permissionsApi";

export const fetchModulesThunk = createAsyncThunk(
  "permissions/fetchModules",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchModulesApi();
      console.log("Fetched modules:", response);
      return response.modules || []; // ensure an array is returned
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch modules"
      );
    }
  }
);

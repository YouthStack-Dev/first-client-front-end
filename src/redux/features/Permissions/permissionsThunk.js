import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchPermissionsApi } from "../Permissions/permissionsApi"; 


export const fetchPermissionsThunk = createAsyncThunk(
  "permissions/fetchPermissions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchPermissionsApi();
      return response.data.items; // ✅ API returns { data: { items: [] } }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

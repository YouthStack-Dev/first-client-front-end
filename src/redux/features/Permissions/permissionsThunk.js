import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchPermissionsApi } from "../Permissions/permissionsApi";
import { API_CLIENT } from "../../../Api/API_Client";

// Permissions
export const fetchPermissionsThunk = createAsyncThunk(
  "permissions/fetchPermissions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchPermissionsApi();
      return response.data.items;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Policies
export const fetchPoliciesThunk = createAsyncThunk(
  "permissions/fetchPolicies",
  async (params, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.get("/v1/iam/policies/", { params });
      return response.data.items;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Roles
export const fetchRolesThunk = createAsyncThunk(
  "permissions/fetchRoles",
  async (params, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.get("/v1/iam/roles/", { params });
      return response.data.items;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

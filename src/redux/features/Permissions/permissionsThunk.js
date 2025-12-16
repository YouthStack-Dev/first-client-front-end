import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchPermissionsApi } from "../Permissions/permissionsApi";
import { API_CLIENT } from "../../../Api/API_Client";
import { logDebug } from "../../../utils/logger";

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

export const createPolicy = createAsyncThunk(
  "policy/createPolicy",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.post("/v1/iam/policies", payload);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to create policy");
    }
  }
);

export const updatePolicy = createAsyncThunk(
  "policy/updatePolicy",
  async ({ policyId, payload }, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.put(
        `/v1/iam/policies/${policyId}`,
        payload
      );

      return response.data;
    } catch (error) {
      logDebug(" this is the update ");
      return rejectWithValue(error.response?.data || "Failed to update policy");
    }
  }
);

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
      return response.data?.data?.items;
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

export const createRole = createAsyncThunk(
  "role/createRole",
  async (payload, { rejectWithValue }) => {
    try {
      logDebug("Creating role with payload:", payload);

      const response = await API_CLIENT.post("/v1/iam/roles/", payload);

      logDebug("Role creation successful:", response.data);
      return response.data;
    } catch (error) {
      logDebug("Role creation failed:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data || {
          message: "Failed to create role",
          details: error.message,
        }
      );
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

export const updateRole = createAsyncThunk(
  "role/updateRole",
  async ({ roleId, payload }, { rejectWithValue }) => {
    try {
      logDebug("Updating role with ID:", roleId, "Payload:", payload);

      const response = await API_CLIENT.put(`/v1/iam/roles/${roleId}`, payload);

      logDebug("Role update successful:", response.data);
      return response.data;
    } catch (error) {
      logDebug("Role update failed:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data || {
          message: "Failed to update role",
          details: error.message,
        }
      );
    }
  }
);

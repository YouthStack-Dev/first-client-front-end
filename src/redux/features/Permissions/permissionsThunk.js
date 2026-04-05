import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchPermissionsApi } from "../Permissions/permissionsApi";
import { API_CLIENT } from "../../../Api/API_Client";
import { logDebug } from "../../../utils/logger";

// ── Permissions ────────────────────────────────────────────────────────────
export const fetchPermissionsThunk = createAsyncThunk(
  "permissions/fetchPermissions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchPermissionsApi();
      return response.data.items;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch permissions"
      );
    }
  }
);

// ── Policies ───────────────────────────────────────────────────────────────
export const fetchPoliciesThunk = createAsyncThunk(
  "permissions/fetchPolicies",
  async (params, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.get("/iam/policies/", { params });
      return response.data.data.items;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createPolicy = createAsyncThunk(
  "policy/createPolicy",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.post("/iam/policies/", payload);
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
      const response = await API_CLIENT.put(`/iam/policies/${policyId}`, payload);
      return response.data;
    } catch (error) {
      logDebug("this is the update");
      return rejectWithValue(error.response?.data || "Failed to update policy");
    }
  }
);

// ── Roles ──────────────────────────────────────────────────────────────────
export const fetchRolesThunk = createAsyncThunk(
  "permissions/fetchRoles",
  async (params, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.get("/iam/roles/", { params });
      return response.data?.data?.items;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createRole = createAsyncThunk(
  "role/createRole",
  async (payload, { rejectWithValue }) => {
    try {
      logDebug("Creating role with payload:", payload);
      const response = await API_CLIENT.post("/iam/roles/", payload);
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

export const updateRole = createAsyncThunk(
  "role/updateRole",
  async ({ roleId, payload }, { rejectWithValue }) => {
    try {
      logDebug("Updating role with ID:", roleId, "Payload:", payload);
      const response = await API_CLIENT.put(`/iam/roles/${roleId}`, payload);
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

// ── Policy Packages ────────────────────────────────────────────────────────

// GET /iam/policy-packages/?tenant_id
// Used in edit mode to load the tenant's current package + pre-check permissions
export const fetchPolicyPackagesThunk = createAsyncThunk(
  "permissions/fetchPolicyPackages",
  async (tenantId, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.get("/iam/policy-packages/", {
        params: { tenant_id: tenantId },
      });
      // Returns { package_id, tenant_id, name, permission_ids, permissions }
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// PUT /iam/policy-packages/{package_id}/permissions
// Used in edit mode to replace the full permission set on the package
// ⚠️ Full replace — anything not in the list is removed
export const updatePackagePermissionsThunk = createAsyncThunk(
  "permissions/updatePackagePermissions",
  async ({ packageId, permission_ids }, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.put(
        `/iam/policy-packages/${packageId}/permissions`,
        { permission_ids }
      );
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);
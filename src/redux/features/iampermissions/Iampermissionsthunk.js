import { createAsyncThunk } from "@reduxjs/toolkit";
import { logDebug } from "../../../utils/logger";
import {
  fetchAllPermissionsApi,
  fetchPermissionByIdApi,
  createPermissionApi,
  updatePermissionApi,
  deletePermissionApi,
} from "../iampermissions/Iampermissionsapi";

/**
 * GET all permissions (auto-paginates across all pages)
 * Handles total > 100 by fetching all pages and merging results
 */
export const fetchPermissionsThunk = createAsyncThunk(
  "permissions/fetchPermissions",
  async (_, { rejectWithValue }) => {
    try {
      logDebug("Fetching all permissions (auto-paginated)...");
      const allItems = await fetchAllPermissionsApi();
      logDebug(`Fetched ${allItems.length} total permissions`);
      return allItems;
    } catch (error) {
      logDebug("Fetch permissions failed:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch permissions"
      );
    }
  }
);

/**
 * GET single permission by ID
 * GET /api/v1/iam/permissions/:permission_id
 */
export const fetchPermissionByIdThunk = createAsyncThunk(
  "permissions/fetchPermissionById",
  async (permissionId, { rejectWithValue }) => {
    try {
      logDebug("Fetching permission by ID:", permissionId);
      const response = await fetchPermissionByIdApi(permissionId);
      logDebug("Fetch permission by ID successful:", response.data);
      return response.data?.data ?? response.data;
    } catch (error) {
      logDebug("Fetch permission by ID failed:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch permission"
      );
    }
  }
);

/**
 * POST create new permission
 * POST /api/v1/iam/permissions/
 * payload: { module: string, action: string, description: string | null, is_active: boolean }
 */
export const createPermissionThunk = createAsyncThunk(
  "permissions/createPermission",
  async (payload, { rejectWithValue }) => {
    try {
      logDebug("Creating permission with payload:", payload);
      const response = await createPermissionApi(payload);
      logDebug("Permission creation successful:", response.data);
      return response.data?.data ?? response.data;
    } catch (error) {
      logDebug("Permission creation failed:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data || {
          message: "Failed to create permission",
          details: error.message,
        }
      );
    }
  }
);

/**
 * PUT update existing permission
 * PUT /api/v1/iam/permissions/:permission_id
 * { permissionId: number, payload: { module, action, description, is_active } }
 */
export const updatePermissionThunk = createAsyncThunk(
  "permissions/updatePermission",
  async ({ permissionId, payload }, { rejectWithValue }) => {
    try {
      logDebug("Updating permission ID:", permissionId, "Payload:", payload);
      const response = await updatePermissionApi(permissionId, payload);
      logDebug("Permission update successful:", response.data);
      return response.data?.data ?? response.data;
    } catch (error) {
      logDebug("Permission update failed:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data || {
          message: "Failed to update permission",
          details: error.message,
        }
      );
    }
  }
);

/**
 * DELETE permission by ID
 * DELETE /api/v1/iam/permissions/:permission_id
 */
export const deletePermissionThunk = createAsyncThunk(
  "permissions/deletePermission",
  async (permissionId, { rejectWithValue }) => {
    try {
      logDebug("Deleting permission ID:", permissionId);
      await deletePermissionApi(permissionId);
      logDebug("Permission deletion successful, ID:", permissionId);
      // Return the id so the slice can remove it from state immediately
      return permissionId;
    } catch (error) {
      logDebug("Permission deletion failed:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data || {
          message: "Failed to delete permission",
          details: error.message,
        }
      );
    }
  }
);
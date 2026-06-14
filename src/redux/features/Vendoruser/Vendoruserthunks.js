import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";
import endpoint from "../../../Api/Endpoints";
import { extractDataFromResponse } from "../../../utils/searchHelpers";

/**
 * Fetch vendor users with pagination, search, and filters.
 *
 * API: GET /api/v1/vendor-users/
 * Query params: skip, limit, name, email, vendor_id, is_active, tenant_id
 *
 * NOTE: The API separates `name` and `email` as distinct query params —
 * we send the same search string to both so partial matches work on either field.
 */
export const fetchVendorUsersThunk = createAsyncThunk(
  "vendorUser/fetchVendorUsers",
  async (
    { page, size, search = "", vendorId = "", tenantId },
    { rejectWithValue }
  ) => {
    try {
      const params = {
        skip: (page - 1) * size,
        limit: size,
        tenant_id: tenantId || undefined,
        vendor_id: vendorId || undefined,
        // Send search term to both name & email — API does case-insensitive partial match on each
        ...(search ? { name: search, email: search } : {}),
      };

      const response = await API_CLIENT.get(endpoint.VendorUser, { params });
      const { data: users, total } = extractDataFromResponse(response);

      return { users, total };
    } catch (error) {
      console.error("[Thunk] Failed to fetch vendor users:", error);
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch vendor users"
      );
    }
  }
);

/**
 * Delete a vendor user by ID.
 *
 * API: DELETE /api/v1/vendor-users/{vendor_user_id}
 * Returns 204 No Content on success — no response body.
 * tenant_id required as query param for admin users.
 */
export const deleteVendorUserThunk = createAsyncThunk(
  "vendorUser/deleteVendorUser",
  async ({ id, tenantId }, { rejectWithValue }) => {
    try {
      await API_CLIENT.delete(`${endpoint.VendorUser}${id}`, {
        params: { tenant_id: tenantId || undefined },
      });
      // 204 — no body; return the id so the slice can remove it from state
      return id;
    } catch (error) {
      console.error("[Thunk] Failed to delete vendor user:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete vendor user"
      );
    }
  }
);

/**
 * Toggle vendor user active/inactive status.
 *
 * API: PATCH /api/v1/vendor-users/{vendor_user_id}/toggle-status
 * tenant_id required as query param for admin users.
 * Optimistic update is applied in the slice's pending case;
 * rolled back in rejected case using originalIsActive.
 */
export const toggleVendorUserStatusThunk = createAsyncThunk(
  "vendorUser/toggleStatus",
  async ({ user, tenantId }, { rejectWithValue }) => {
    const userId = user.vendor_user_id || user.id;
    try {
      const response = await API_CLIENT.patch(
        `${endpoint.VendorUser}${userId}/toggle-status`,
        null, // no request body
        { params: { tenant_id: tenantId || undefined } }
      );
      return {
        userId,
        message: response.data?.message,
        originalIsActive: user.is_active,
      };
    } catch (error) {
      console.error("[Thunk] Failed to toggle vendor user status:", error);
      return rejectWithValue({
        userId,
        originalIsActive: user.is_active,
        message:
          error.response?.data?.message || "Failed to toggle vendor user status",
      });
    }
  }
);
import { createSlice } from "@reduxjs/toolkit";
import {
  fetchPermissionsThunk,
  fetchPermissionByIdThunk,
  createPermissionThunk,
  updatePermissionThunk,
  deletePermissionThunk,
} from "../iampermissions/Iampermissionsthunk";

const iamPermissionsSlice = createSlice({
  name: "iamPermissions",
  initialState: {
    // ── List ──────────────────────────────────────────────────
    permissions: [],
    permissionsLoading: false,
    permissionsLoaded: false,
    permissionsError: null,
    fetchedPermissions: false,

    // ── Get By ID ─────────────────────────────────────────────
    selectedPermission: null,
    permissionByIdLoading: false,
    permissionByIdError: null,

    // ── Create ────────────────────────────────────────────────
    createLoading: false,
    createError: null,
    createSuccess: false,

    // ── Update ────────────────────────────────────────────────
    updateLoading: false,
    updateError: null,
    updateSuccess: false,

    // ── Delete ────────────────────────────────────────────────
    deleteLoading: false,
    deleteError: null,
    deleteSuccess: false,
  },

  reducers: {
    // Full reset — call on unmount or logout
    resetPermissionsState: (state) => {
      state.permissions = [];
      state.permissionsLoading = false;
      state.permissionsLoaded = false;
      state.permissionsError = null;
      state.fetchedPermissions = false;

      state.selectedPermission = null;
      state.permissionByIdLoading = false;
      state.permissionByIdError = null;

      state.createLoading = false;
      state.createError = null;
      state.createSuccess = false;

      state.updateLoading = false;
      state.updateError = null;
      state.updateSuccess = false;

      state.deleteLoading = false;
      state.deleteError = null;
      state.deleteSuccess = false;
    },

    // Call after handling create success/error in component
    clearCreateStatus: (state) => {
      state.createLoading = false;
      state.createError = null;
      state.createSuccess = false;
    },

    // Call after handling update success/error in component
    clearUpdateStatus: (state) => {
      state.updateLoading = false;
      state.updateError = null;
      state.updateSuccess = false;
    },

    // Call after handling delete success/error in component
    clearDeleteStatus: (state) => {
      state.deleteLoading = false;
      state.deleteError = null;
      state.deleteSuccess = false;
    },

    // Clear selected permission when closing view/edit modal
    clearSelectedPermission: (state) => {
      state.selectedPermission = null;
      state.permissionByIdLoading = false;
      state.permissionByIdError = null;
    },
  },

  extraReducers: (builder) => {
    // ── Fetch All ──────────────────────────────────────────────
    builder
      .addCase(fetchPermissionsThunk.pending, (state) => {
        state.permissionsLoading = true;
        state.permissionsError = null;
        state.permissionsLoaded = false;
      })
      .addCase(fetchPermissionsThunk.fulfilled, (state, action) => {
        state.permissionsLoading = false;
        state.permissions = action.payload;
        state.permissionsLoaded = true;
        state.fetchedPermissions = true;
        state.permissionsError = null;
      })
      .addCase(fetchPermissionsThunk.rejected, (state, action) => {
        state.permissionsLoading = false;
        state.permissionsError = action.payload;
        state.permissionsLoaded = false;
        state.fetchedPermissions = false;
      });

    // ── Fetch By ID ────────────────────────────────────────────
    builder
      .addCase(fetchPermissionByIdThunk.pending, (state) => {
        state.permissionByIdLoading = true;
        state.permissionByIdError = null;
        state.selectedPermission = null;
      })
      .addCase(fetchPermissionByIdThunk.fulfilled, (state, action) => {
        state.permissionByIdLoading = false;
        state.selectedPermission = action.payload;
        state.permissionByIdError = null;
      })
      .addCase(fetchPermissionByIdThunk.rejected, (state, action) => {
        state.permissionByIdLoading = false;
        state.permissionByIdError = action.payload;
        state.selectedPermission = null;
      });

    // ── Create ─────────────────────────────────────────────────
    builder
      .addCase(createPermissionThunk.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
        state.createSuccess = false;
      })
      .addCase(createPermissionThunk.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createSuccess = true;
        state.createError = null;
        // Optimistically push into list so UI updates without re-fetch
        if (action.payload) {
          state.permissions.push(action.payload);
        }
      })
      .addCase(createPermissionThunk.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
        state.createSuccess = false;
      });

    // ── Update ─────────────────────────────────────────────────
    builder
      .addCase(updatePermissionThunk.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = false;
      })
      .addCase(updatePermissionThunk.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = true;
        state.updateError = null;
        // Optimistically update item in list
        if (action.payload) {
          const idx = state.permissions.findIndex(
            (p) => p.permission_id === action.payload.permission_id
          );
          if (idx !== -1) {
            state.permissions[idx] = action.payload;
          }
        }
      })
      .addCase(updatePermissionThunk.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
        state.updateSuccess = false;
      });

    // ── Delete ─────────────────────────────────────────────────
    builder
      .addCase(deletePermissionThunk.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
        state.deleteSuccess = false;
      })
      .addCase(deletePermissionThunk.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteSuccess = true;
        state.deleteError = null;
        // Optimistically remove from list using returned permission_id
        state.permissions = state.permissions.filter(
          (p) => p.permission_id !== action.payload
        );
      })
      .addCase(deletePermissionThunk.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
        state.deleteSuccess = false;
      });
  },
});

export const {
  resetPermissionsState,
  clearCreateStatus,
  clearUpdateStatus,
  clearDeleteStatus,
  clearSelectedPermission,
} = iamPermissionsSlice.actions;

export default iamPermissionsSlice.reducer;

// ── Selectors ──────────────────────────────────────────────────────────────────

// List
export const selectPermissions        = (state) => state.iamPermissions.permissions;
export const selectPermissionsLoading = (state) => state.iamPermissions.permissionsLoading;
export const selectPermissionsLoaded  = (state) => state.iamPermissions.permissionsLoaded;
export const selectPermissionsError   = (state) => state.iamPermissions.permissionsError;
export const selectFetchedPermissions = (state) => state.iamPermissions.fetchedPermissions;

// Get by ID
export const selectSelectedPermission      = (state) => state.iamPermissions.selectedPermission;
export const selectPermissionByIdLoading   = (state) => state.iamPermissions.permissionByIdLoading;
export const selectPermissionByIdError     = (state) => state.iamPermissions.permissionByIdError;

// Create
export const selectCreateLoading = (state) => state.iamPermissions.createLoading;
export const selectCreateError   = (state) => state.iamPermissions.createError;
export const selectCreateSuccess = (state) => state.iamPermissions.createSuccess;

// Update
export const selectUpdateLoading = (state) => state.iamPermissions.updateLoading;
export const selectUpdateError   = (state) => state.iamPermissions.updateError;
export const selectUpdateSuccess = (state) => state.iamPermissions.updateSuccess;

// Delete
export const selectDeleteLoading = (state) => state.iamPermissions.deleteLoading;
export const selectDeleteError   = (state) => state.iamPermissions.deleteError;
export const selectDeleteSuccess = (state) => state.iamPermissions.deleteSuccess;
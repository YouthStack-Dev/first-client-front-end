import { createSlice } from "@reduxjs/toolkit";
import {
  fetchPermissionsThunk,
  fetchRolesThunk,
  fetchPoliciesThunk,
} from "./permissionsThunk";

const permissionsSlice = createSlice({
  name: "permissions",
  initialState: {
    permissions: [],
    roles: [],
    policies: [],

    permissionsLoading: false,
    rolesLoading: false,
    policiesLoading: false,

    permissionsLoaded: false,
    rolesLoaded: false,
    policiesLoaded: false,

    permissionsError: null,
    rolesError: null,
    policiesError: null,

    // Note: Consider removing these if permissionsLoaded/rolesLoaded serve the same purpose
    fetchedPermissions: false,
    fetchedRoles: false,
  },
  reducers: {
    resetPermissions: (state) => {
      state.permissions = [];
      state.roles = [];
      state.policies = [];

      state.permissionsLoading = false;
      state.rolesLoading = false;
      state.policiesLoading = false;

      state.permissionsLoaded = false;
      state.rolesLoaded = false;
      state.policiesLoaded = false;

      state.permissionsError = null;
      state.rolesError = null;
      state.policiesError = null;

      state.fetchedPermissions = false;
      state.fetchedRoles = false;
    },
  },
  extraReducers: (builder) => {
    // Permissions
    builder
      .addCase(fetchPermissionsThunk.pending, (state) => {
        state.permissionsLoading = true;
        state.permissionsError = null;
        state.permissionsLoaded = false;
      })
      .addCase(fetchPermissionsThunk.fulfilled, (state, action) => {
        state.permissionsLoading = false;
        state.permissions = action.payload; // Will now contain ALL 111+ permissions
        state.permissionsLoaded = true;
        state.fetchedPermissions = true;
        state.permissionsError = null; // Clear any previous errors
      })
      .addCase(fetchPermissionsThunk.rejected, (state, action) => {
        state.permissionsLoading = false;
        state.permissionsError = action.payload;
        state.permissionsLoaded = false;
        state.fetchedPermissions = false;
      });

    // Roles
    builder
      .addCase(fetchRolesThunk.pending, (state) => {
        state.rolesLoading = true;
        state.rolesError = null;
        state.rolesLoaded = false;
      })
      .addCase(fetchRolesThunk.fulfilled, (state, action) => {
        state.rolesLoading = false;
        state.roles = action.payload;
        state.rolesLoaded = true;
        state.fetchedRoles = true;
        state.rolesError = null; // Clear any previous errors
      })
      .addCase(fetchRolesThunk.rejected, (state, action) => {
        state.rolesLoading = false;
        state.rolesError = action.payload;
        state.rolesLoaded = false;
        state.fetchedRoles = false;
      });

    // Policies
    builder
      .addCase(fetchPoliciesThunk.pending, (state) => {
        state.policiesLoading = true;
        state.policiesError = null;
        state.policiesLoaded = false;
      })
      .addCase(fetchPoliciesThunk.fulfilled, (state, action) => {
        state.policiesLoading = false;
        state.policies = action.payload;
        state.policiesLoaded = true;
        state.policiesError = null; // Clear any previous errors
      })
      .addCase(fetchPoliciesThunk.rejected, (state, action) => {
        state.policiesLoading = false;
        state.policiesError = action.payload;
        state.policiesLoaded = false;
      });
  },
});

export const { resetPermissions } = permissionsSlice.actions;
export default permissionsSlice.reducer;

// Selectors
export const selectPermissions = (state) => state.permissions.permissions;
export const selectRoles = (state) => state.permissions.roles;
export const selectPolicies = (state) => state.permissions.policies;

export const permissionsLoading = (state) => state.permissions.permissionsLoading;
export const rolesLoading = (state) => state.permissions.rolesLoading;
export const policiesLoading = (state) => state.permissions.policiesLoading;

export const permissionsLoaded = (state) => state.permissions.permissionsLoaded;
export const rolesLoaded = (state) => state.permissions.rolesLoaded;
export const policiesLoaded = (state) => state.permissions.policiesLoaded;

export const permissionsError = (state) => state.permissions.permissionsError;
export const rolesError = (state) => state.permissions.rolesError;
export const policiesError = (state) => state.permissions.policiesError;
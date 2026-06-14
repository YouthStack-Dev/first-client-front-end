// src/redux/features/vendorUser/vendorUserSlice.js
import { createSlice } from "@reduxjs/toolkit";
import {
  fetchVendorUsersThunk,
  deleteVendorUserThunk,
  toggleVendorUserStatusThunk,
} from "./vendorUserThunks";

const initialState = {
  data: [],
  total: 0,
  loading: false,
  deleting: false,
  toggling: false,
  error: null,
  lastFetched: null,      // timestamp — used to determine staleness
  lastParams: null,       // last fetch params — if filters change, force refetch
};

const vendorUserSlice = createSlice({
  name: "vendorUser",
  initialState,
  reducers: {
    // Call this to force a fresh fetch on next visit (e.g. after bulk ops)
    invalidateVendorUsers: (state) => {
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {

    // ── Fetch vendor users ───────────────────────────────────────────────────
    builder
      .addCase(fetchVendorUsersThunk.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchVendorUsersThunk.fulfilled, (state, action) => {
        state.loading     = false;
        state.data        = action.payload.users;
        state.total       = action.payload.total;
        state.error       = null;
        state.lastFetched = Date.now();
        state.lastParams  = action.meta.arg; // store params used for this fetch
      })
      .addCase(fetchVendorUsersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
        // Leave lastFetched as-is — same reasoning as companySlice:
        // don't trigger a refetch loop on background failure
      });

    // ── Delete vendor user ───────────────────────────────────────────────────
    builder
      .addCase(deleteVendorUserThunk.pending, (state) => {
        state.deleting = true;
        state.error    = null;
      })
      .addCase(deleteVendorUserThunk.fulfilled, (state, action) => {
        state.deleting = false;
        const deletedId = action.payload;
        // Remove from local list immediately — no refetch needed
        state.data  = state.data.filter(
          (u) => (u.vendor_user_id || u.id) !== deletedId
        );
        state.total = Math.max(0, state.total - 1);
      })
      .addCase(deleteVendorUserThunk.rejected, (state, action) => {
        state.deleting = false;
        state.error    = action.payload;
      });

    // ── Toggle vendor user status ────────────────────────────────────────────
    builder
      .addCase(toggleVendorUserStatusThunk.pending, (state, action) => {
        state.toggling = true;
        // Optimistic update — flip immediately in Redux
        const userId = action.meta.arg.vendor_user_id || action.meta.arg.id;
        const user   = state.data.find((u) => (u.vendor_user_id || u.id) === userId);
        if (user) user.is_active = !user.is_active;
      })
      .addCase(toggleVendorUserStatusThunk.fulfilled, (state) => {
        state.toggling = false;
        // Optimistic update already applied in pending — nothing more to do
      })
      .addCase(toggleVendorUserStatusThunk.rejected, (state, action) => {
        state.toggling = false;
        state.error    = action.payload?.message || null;
        // Rollback the optimistic update on failure
        const { userId, originalIsActive } = action.payload || {};
        if (userId !== undefined) {
          const user = state.data.find((u) => (u.vendor_user_id || u.id) === userId);
          if (user) user.is_active = originalIsActive;
        }
      });
  },
});

export const { invalidateVendorUsers } = vendorUserSlice.actions;

// ── Selectors ────────────────────────────────────────────────────────────────
// Safe fallbacks guard against state.vendorUser being undefined if the reducer
// hasn't been registered in store.js yet, or during SSR hydration.
export const selectVendorUsers            = (state) => state.vendorUser?.data        ?? [];
export const selectVendorUsersTotal       = (state) => state.vendorUser?.total       ?? 0;
export const selectVendorUsersLoading     = (state) => state.vendorUser?.loading     ?? false;
export const selectVendorUsersError       = (state) => state.vendorUser?.error       ?? null;
export const selectVendorUsersLastFetched = (state) => state.vendorUser?.lastFetched ?? null;
export const selectVendorUsersLastParams  = (state) => state.vendorUser?.lastParams  ?? null;

export default vendorUserSlice.reducer;
import { createSlice } from "@reduxjs/toolkit";
import {
  fetchViolationsThunk,
  fetchRouteSummaryThunk,
  fetchDriverViolationsThunk,
} from "./speedViolationsThunk";

const initialState = {
  // ── Violations list ──────────────────────────────────────────
  violations:       [],     // current page items
  total:            0,      // total count from API
  page:             1,
  totalPages:       0,
  listLoading:      false,
  listError:        null,

  // ── Route summary ────────────────────────────────────────────
  routeSummary:         null,
  routeSummaryLoading:  false,
  routeSummaryError:    null,

  // ── Driver violations ────────────────────────────────────────
  driverViolations:        [],
  driverViolationsTotal:   0,
  driverViolationsPage:    1,
  driverViolationsTotalPages: 0,
  driverViolationsLoading: false,
  driverViolationsError:   null,
  currentDriverId:         null,

  // ── Active filters (kept in Redux so page re-mount restores them) ──
  filters: {
    tenant_id:  null,
    route_id:   null,
    driver_id:  null,
    date_from:  null,
    date_to:    null,
    page:       1,
    limit:      20,
  },
};

const speedViolationsSlice = createSlice({
  name: "speedViolations",
  initialState,

  reducers: {
    // Update filters and reset page to 1
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload, page: 1 };
    },
    // Reset filters to defaults
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    // Clear route summary (on modal close)
    clearRouteSummary: (state) => {
      state.routeSummary      = null;
      state.routeSummaryError = null;
    },
    // Clear driver violations (on unmount)
    clearDriverViolations: (state) => {
      state.driverViolations        = [];
      state.driverViolationsTotal   = 0;
      state.driverViolationsPage    = 1;
      state.driverViolationsTotalPages = 0;
      state.driverViolationsError   = null;
      state.currentDriverId         = null;
    },
    resetState: () => initialState,
  },

  extraReducers: (builder) => {
    // ── fetchViolationsThunk ─────────────────────────────────
    builder
      .addCase(fetchViolationsThunk.pending, (state) => {
        state.listLoading = true;
        state.listError   = null;
      })
      .addCase(fetchViolationsThunk.fulfilled, (state, action) => {
        const { items, total, page, total_pages } = action.payload.data || action.payload;
        state.violations  = items  || [];
        state.total       = total  || 0;
        state.page        = page   || 1;
        state.totalPages  = total_pages || 0;
        state.listLoading = false;
        state.listError   = null;
      })
      .addCase(fetchViolationsThunk.rejected, (state, action) => {
        state.listLoading = false;
        state.listError   = action.payload?.message || "Failed to fetch violations";
      });

    // ── fetchRouteSummaryThunk ───────────────────────────────
    builder
      .addCase(fetchRouteSummaryThunk.pending, (state) => {
        state.routeSummaryLoading = true;
        state.routeSummaryError   = null;
      })
      .addCase(fetchRouteSummaryThunk.fulfilled, (state, action) => {
        state.routeSummary        = action.payload.data || action.payload;
        state.routeSummaryLoading = false;
        state.routeSummaryError   = null;
      })
      .addCase(fetchRouteSummaryThunk.rejected, (state, action) => {
        state.routeSummaryLoading = false;
        state.routeSummaryError   = action.payload?.message || "Failed to fetch route summary";
      });

    // ── fetchDriverViolationsThunk ───────────────────────────
    builder
      .addCase(fetchDriverViolationsThunk.pending, (state) => {
        state.driverViolationsLoading = true;
        state.driverViolationsError   = null;
      })
      .addCase(fetchDriverViolationsThunk.fulfilled, (state, action) => {
        const { driverId, items, total, page, total_pages } = action.payload;
        state.driverViolations           = items  || [];
        state.driverViolationsTotal      = total  || 0;
        state.driverViolationsPage       = page   || 1;
        state.driverViolationsTotalPages = total_pages || 0;
        state.driverViolationsLoading    = false;
        state.driverViolationsError      = null;
        state.currentDriverId            = driverId;
      })
      .addCase(fetchDriverViolationsThunk.rejected, (state, action) => {
        state.driverViolationsLoading = false;
        state.driverViolationsError   = action.payload?.message || "Failed to fetch driver violations";
      });
  },
});

// ── Actions ───────────────────────────────────────────────────────────────────
export const {
  setFilters,
  resetFilters,
  clearRouteSummary,
  clearDriverViolations,
  resetState,
} = speedViolationsSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────
// List
export const selectViolations          = (s) => s.speedViolations.violations;
export const selectViolationsTotal     = (s) => s.speedViolations.total;
export const selectViolationsPage      = (s) => s.speedViolations.page;
export const selectViolationsTotalPages = (s) => s.speedViolations.totalPages;
export const selectViolationsLoading   = (s) => s.speedViolations.listLoading;
export const selectViolationsError     = (s) => s.speedViolations.listError;

// Filters
export const selectFilters             = (s) => s.speedViolations.filters;

// Route summary
export const selectRouteSummary        = (s) => s.speedViolations.routeSummary;
export const selectRouteSummaryLoading = (s) => s.speedViolations.routeSummaryLoading;
export const selectRouteSummaryError   = (s) => s.speedViolations.routeSummaryError;

// Driver violations
export const selectDriverViolations         = (s) => s.speedViolations.driverViolations;
export const selectDriverViolationsTotal    = (s) => s.speedViolations.driverViolationsTotal;
export const selectDriverViolationsPage     = (s) => s.speedViolations.driverViolationsPage;
export const selectDriverViolationsTotalPages = (s) => s.speedViolations.driverViolationsTotalPages;
export const selectDriverViolationsLoading  = (s) => s.speedViolations.driverViolationsLoading;
export const selectDriverViolationsError    = (s) => s.speedViolations.driverViolationsError;
export const selectCurrentDriverId          = (s) => s.speedViolations.currentDriverId;

export default speedViolationsSlice.reducer;
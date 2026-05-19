import { createSlice } from "@reduxjs/toolkit";
import {
  fetchDelayReportThunk,
  fetchRouteDelayDetailThunk,
} from "./delayReportsThunks";

const delayReportsSlice = createSlice({
  name: "delayReports",
  initialState: {
    // Delay report list
    summary: null,
    routes: [],
    status: "idle",     // idle | loading | succeeded | failed
    error: null,
    // Route delay detail
    detail: null,
    detailStatus: "idle",
    detailError: null,
  },
  reducers: {
    clearDelayReportError: (state) => { state.error = null; },
    clearDetailError: (state) => { state.detailError = null; },
    clearDetail: (state) => {
      state.detail = null;
      state.detailStatus = "idle";
      state.detailError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Fetch delay report list ────────────────────────────────────────────
      .addCase(fetchDelayReportThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDelayReportThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.summary = action.payload?.summary || null;
        state.routes = action.payload?.routes || [];
      })
      .addCase(fetchDelayReportThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to load delay report";
      })

      // ── Fetch route delay detail ───────────────────────────────────────────
      .addCase(fetchRouteDelayDetailThunk.pending, (state) => {
        state.detailStatus = "loading";
        state.detailError = null;
      })
      .addCase(fetchRouteDelayDetailThunk.fulfilled, (state, action) => {
        state.detailStatus = "succeeded";
        state.detail = action.payload;
      })
      .addCase(fetchRouteDelayDetailThunk.rejected, (state, action) => {
        state.detailStatus = "failed";
        state.detailError = action.payload || "Failed to load route delay detail";
      });
  },
});

export const { clearDelayReportError, clearDetailError, clearDetail } =
  delayReportsSlice.actions;
export default delayReportsSlice.reducer;

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectDelayReportStatus  = (state) => state.delayReports.status;
export const selectDelayReportError   = (state) => state.delayReports.error;
export const selectDelayReportSummary = (state) => state.delayReports.summary;
export const selectDelayReportRoutes  = (state) => state.delayReports.routes;
export const selectDetailStatus       = (state) => state.delayReports.detailStatus;
export const selectDetailError        = (state) => state.delayReports.detailError;
export const selectRouteDelayDetail   = (state) => state.delayReports.detail;

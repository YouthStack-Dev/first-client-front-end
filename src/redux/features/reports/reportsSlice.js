import { createSlice } from "@reduxjs/toolkit";
import {
  fetchBookingAnalytics,
  fetchDelayReport,
  fetchDelayDetail,
  fetchDriverDutyHours,
  downloadBookingsReport,
  previewBookingsReport,   // ← NEW
} from "./reportsTrunk";

const initialState = {
  bookingAnalytics: { data: null, loading: false, error: null },
  delays:           { data: null, loading: false, error: null },
  delayDetail:      { data: null, loading: false, error: null, routeId: null },
  driverDutyHours:  { data: null, loading: false, error: null },
  download:         { loading: false, error: null, success: false, filename: null },

  // ── Preview — NEW ──────────────────────────────────────────────────────────
  bookingPreview:   { rows: [], loading: false, error: null },
};

const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    clearBookingAnalytics: (state) => { state.bookingAnalytics = initialState.bookingAnalytics; },
    clearDelays:           (state) => { state.delays           = initialState.delays;           },
    clearDelayDetail:      (state) => { state.delayDetail      = initialState.delayDetail;      },
    clearDriverDutyHours:  (state) => { state.driverDutyHours  = initialState.driverDutyHours;  },
    clearDownloadStatus:   (state) => { state.download         = initialState.download;         },
    clearBookingPreview:   (state) => { state.bookingPreview   = initialState.bookingPreview;   }, // ← NEW
    clearAllReports:       ()      => initialState,
  },
  extraReducers: (builder) => {
    // ── Booking Analytics ──────────────────────────────────────────────────
    builder
      .addCase(fetchBookingAnalytics.pending,   (state)          => { state.bookingAnalytics.loading = true;  state.bookingAnalytics.error = null; })
      .addCase(fetchBookingAnalytics.fulfilled, (state, action)  => { state.bookingAnalytics.loading = false; state.bookingAnalytics.data  = action.payload; state.bookingAnalytics.error = null; })
      .addCase(fetchBookingAnalytics.rejected,  (state, action)  => { state.bookingAnalytics.loading = false; state.bookingAnalytics.error = action.payload; });

    // ── Preview Bookings (JSON) — NEW ──────────────────────────────────────
    builder
      .addCase(previewBookingsReport.pending,   (state)         => { state.bookingPreview.loading = true;  state.bookingPreview.error = null; state.bookingPreview.rows = []; })
      .addCase(previewBookingsReport.fulfilled, (state, action) => { state.bookingPreview.loading = false; state.bookingPreview.rows  = action.payload; state.bookingPreview.error = null; })
      .addCase(previewBookingsReport.rejected,  (state, action) => { state.bookingPreview.loading = false; state.bookingPreview.error = action.payload; });

    // ── Delay Report ───────────────────────────────────────────────────────
    builder
      .addCase(fetchDelayReport.pending,   (state)         => { state.delays.loading = true;  state.delays.error = null; })
      .addCase(fetchDelayReport.fulfilled, (state, action) => { state.delays.loading = false; state.delays.data  = action.payload; state.delays.error = null; })
      .addCase(fetchDelayReport.rejected,  (state, action) => { state.delays.loading = false; state.delays.error = action.payload; });

    // ── Delay Detail ───────────────────────────────────────────────────────
    builder
      .addCase(fetchDelayDetail.pending,   (state, action) => { state.delayDetail.loading = true;  state.delayDetail.error = null; state.delayDetail.routeId = action.meta.arg.route_id; })
      .addCase(fetchDelayDetail.fulfilled, (state, action) => { state.delayDetail.loading = false; state.delayDetail.data  = action.payload; state.delayDetail.error = null; })
      .addCase(fetchDelayDetail.rejected,  (state, action) => { state.delayDetail.loading = false; state.delayDetail.error = action.payload; });

    // ── Driver Duty Hours ──────────────────────────────────────────────────
    builder
      .addCase(fetchDriverDutyHours.pending,   (state)         => { state.driverDutyHours.loading = true;  state.driverDutyHours.error = null; })
      .addCase(fetchDriverDutyHours.fulfilled, (state, action) => { state.driverDutyHours.loading = false; state.driverDutyHours.data  = action.payload; state.driverDutyHours.error = null; })
      .addCase(fetchDriverDutyHours.rejected,  (state, action) => { state.driverDutyHours.loading = false; state.driverDutyHours.error = action.payload; });

    // ── Download ───────────────────────────────────────────────────────────
    builder
      .addCase(downloadBookingsReport.pending,   (state)         => { state.download.loading = true;  state.download.error = null; state.download.success = false; state.download.filename = null; })
      .addCase(downloadBookingsReport.fulfilled, (state, action) => { state.download.loading = false; state.download.success = true; state.download.filename = action.payload.filename; state.download.error = null; })
      .addCase(downloadBookingsReport.rejected,  (state, action) => { state.download.loading = false; state.download.error   = action.payload; state.download.success = false; });
  },
});

export const {
  clearBookingAnalytics,
  clearDelays,
  clearDelayDetail,
  clearDriverDutyHours,
  clearDownloadStatus,
  clearBookingPreview,   // ← NEW
  clearAllReports,
} = reportsSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectBookingAnalytics = (state) => state.reports.bookingAnalytics;
export const selectDelays           = (state) => state.reports.delays;
export const selectDelayDetail      = (state) => state.reports.delayDetail;
export const selectDriverDutyHours  = (state) => state.reports.driverDutyHours;
export const selectDownload         = (state) => state.reports.download;
export const selectBookingPreview   = (state) => state.reports.bookingPreview;   // ← NEW

export default reportsSlice.reducer;
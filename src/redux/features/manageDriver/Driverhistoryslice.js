import { createSlice } from "@reduxjs/toolkit";
import { fetchDriverHistoryReport } from "./Driverhistorythunks";

const initialState = {
  routes: [],          // mapped from API's "bookings" array
  total: 0,
  summary: null,       // raw summary object from API
  driverIdLoaded: null,
  loading: false,
  error: null,
};

const driverHistorySlice = createSlice({
  name: "driverHistory",
  initialState,
  reducers: {
    clearDriverHistory(state) {
      state.routes         = [];
      state.total          = 0;
      state.summary        = null;
      state.driverIdLoaded = null;
      state.loading        = false;
      state.error          = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDriverHistoryReport.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchDriverHistoryReport.fulfilled, (state, action) => {
        state.loading = false;
        // Response: { success, data: { bookings: [...], summary: {...} } }
        const payload        = action.payload?.data ?? action.payload;
        state.routes         = payload?.bookings ?? payload?.routes ?? [];
        state.summary        = payload?.summary  ?? null;
        state.total          = payload?.summary?.total_routes ?? state.routes.length;
        state.driverIdLoaded = action.meta?.arg?.driver_id ?? null;
      })
      .addCase(fetchDriverHistoryReport.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload ?? "Something went wrong";
      });
  },
});

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectDriverHistoryRoutes    = (state) => state.driverHistory.routes;
export const selectDriverHistoryTotal     = (state) => state.driverHistory.total;
export const selectDriverHistoryLoading   = (state) => state.driverHistory.loading;
export const selectDriverHistoryError     = (state) => state.driverHistory.error;
export const selectDriverHistoryApiSummary = (state) => state.driverHistory.summary;

// Derived summary — uses API summary if available, else computes from routes
export const selectDriverHistorySummary = (state) => {
  const api    = state.driverHistory.summary;
  const routes = state.driverHistory.routes;

  if (api) {
    return {
      total:      api.total_routes    ?? routes.length,
      completed:  api.completed       ?? 0,
      cancelled:  api.cancelled       ?? 0,
      totalDist:  routes.reduce((sum, r) => sum + (parseFloat(r.actual_total_distance_km) || 0), 0),
    };
  }

  // Fallback: compute from routes (case-insensitive)
  const completed = routes.filter((r) => r.route_status?.toLowerCase() === "completed").length;
  const cancelled = routes.filter((r) => r.route_status?.toLowerCase() === "cancelled").length;
  const totalDist = routes.reduce((sum, r) => sum + (parseFloat(r.actual_total_distance_km) || 0), 0);
  return { total: routes.length, completed, cancelled, totalDist };
};

export const { clearDriverHistory } = driverHistorySlice.actions;
export default driverHistorySlice.reducer;
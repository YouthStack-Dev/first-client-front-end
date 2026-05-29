import { createSlice } from "@reduxjs/toolkit";
import { fetchDriverHistoryReport } from "./Driverhistorythunks";

const initialState = {
  routes: [],
  total: 0,
  driverIdLoaded: null,
  loading: false,
  error: null,
};

const driverHistorySlice = createSlice({
  name: "driverHistory",
  initialState,
  reducers: {
    clearDriverHistory(state) {
      state.routes = [];
      state.total = 0;
      state.driverIdLoaded = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDriverHistoryReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDriverHistoryReport.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload?.data ?? action.payload;
        state.routes = payload?.routes ?? [];
        state.total = payload?.total ?? state.routes.length;
        state.driverIdLoaded = payload?.driver_id ?? null;
      })
      .addCase(fetchDriverHistoryReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Something went wrong";
      });
  },
});

// Selectors
export const selectDriverHistoryRoutes   = (state) => state.driverHistory.routes;
export const selectDriverHistoryTotal    = (state) => state.driverHistory.total;
export const selectDriverHistoryLoading  = (state) => state.driverHistory.loading;
export const selectDriverHistoryError    = (state) => state.driverHistory.error;

export const selectDriverHistorySummary  = (state) => {
  const routes = state.driverHistory.routes;
  const completed = routes.filter((r) => r.status === "COMPLETED").length;
  const cancelled = routes.filter((r) => r.status === "CANCELLED").length;
  const totalDist = routes.reduce(
    (sum, r) => sum + (parseFloat(r.actual_total_distance) || 0),
    0
  );
  return { total: routes.length, completed, cancelled, totalDist };
};

export const { clearDriverHistory } = driverHistorySlice.actions;
export default driverHistorySlice.reducer;
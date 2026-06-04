import { createSlice } from "@reduxjs/toolkit";

import { fetchRecentLogsThunk } from "./logsThunks";

const logsSlice = createSlice({
  name: "logs",

  initialState: {
    entries: [],

    total: 0,

    loading: false,

    error: null,
  },

  reducers: {
    clearRecentLogs: (state) => {
      state.entries = [];

      state.total = 0;

      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(fetchRecentLogsThunk.pending, (state) => {
        state.loading = true;

        state.error = null;
      })

      .addCase(fetchRecentLogsThunk.fulfilled, (state, action) => {
        state.loading = false;

        state.entries = action.payload.entries;

        state.total = action.payload.total;
      })

      .addCase(fetchRecentLogsThunk.rejected, (state, action) => {
        state.loading = false;

        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Failed to fetch logs";
      });
  },
});

export const { clearRecentLogs } = logsSlice.actions;

// Selectors

export const selectRecentLogEntries = (state) => state.logs.entries;

export const selectRecentLogsTotal = (state) => state.logs.total;

export const selectRecentLogsLoading = (state) => state.logs.loading;

export const selectRecentLogsError = (state) => state.logs.error;

export default logsSlice.reducer;

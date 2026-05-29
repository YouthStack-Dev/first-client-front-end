import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";
import { logDebug } from "../../../utils/logger";

// ---------------------------------------------------------------------------
// GET /driver/history/report
// Fetch route history for a specific driver within a date range.
// ---------------------------------------------------------------------------
export const fetchDriverHistoryReport = createAsyncThunk(
  "driverHistory/fetchReport",
  async ({ driver_id, from_date, to_date }, { rejectWithValue }) => {
    try {
      logDebug("fetchDriverHistoryReport", { driver_id, from_date, to_date });
      const { data } = await API_CLIENT.get("/driver/history/report", {
        params: { driver_id, from_date, to_date },
      });
      return data; // { success, data: { driver_id, routes: [...], total } }
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.detail?.message ||
          error?.response?.data?.message ||
          error?.response?.data?.detail ||
          error?.message ||
          "Failed to fetch driver history report"
      );
    }
  }
);
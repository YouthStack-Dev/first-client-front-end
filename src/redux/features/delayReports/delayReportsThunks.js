import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";
import endpoint from "../../../Api/Endpoints";

// ── Fetch delay report (list) ──────────────────────────────────────────────────
export const fetchDelayReportThunk = createAsyncThunk(
  "delayReports/fetchDelayReport",
  async (params, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.get(endpoint.delayReport, { params });
      if (response.status === 200) {
        return response.data?.data || response.data;
      }
      return rejectWithValue("Failed to fetch delay report");
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ── Fetch route delay detail ───────────────────────────────────────────────────
export const fetchRouteDelayDetailThunk = createAsyncThunk(
  "delayReports/fetchRouteDelayDetail",
  async ({ routeId, tenant_id }, { rejectWithValue }) => {
    try {
      const params = tenant_id ? { tenant_id } : {};
      const response = await API_CLIENT.get(
        endpoint.delayReportByRoute(routeId),
        { params }
      );
      if (response.status === 200) {
        return response.data?.data || response.data;
      }
      return rejectWithValue("Failed to fetch route delay detail");
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

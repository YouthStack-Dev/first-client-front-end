import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";

const getPayload = (response) => {
  const body = response?.data;
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  return body?.data ?? body;
};

const getErrorPayload = (error, fallbackMessage) => {
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string") return { message: detail };
  if (detail?.message) {
    return {
      message: detail.message,
      errorCode: detail.error_code,
      status: error?.response?.status,
    };
  }
  return {
    message: error?.response?.data?.message || error?.message || fallbackMessage,
    status: error?.response?.status,
  };
};

// ─── Fetch paginated violations list ─────────────────────────────────────────
// params: { tenant_id?, route_id?, driver_id?, date_from?, date_to?, page?, limit? }
export const fetchViolationsThunk = createAsyncThunk(
  "speedViolations/fetchList",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.get("/speed-violations/", { params });
      return getPayload(response);
    } catch (error) {
      return rejectWithValue(getErrorPayload(error, "Failed to fetch violations"));
    }
  }
);

// ─── Fetch route/ride summary ─────────────────────────────────────────────────
// { routeId, tenantId? }
export const fetchRouteSummaryThunk = createAsyncThunk(
  "speedViolations/fetchRouteSummary",
  async ({ routeId, tenantId = null }, { rejectWithValue }) => {
    try {
      const params = tenantId ? { tenant_id: tenantId } : {};
      const response = await API_CLIENT.get(`/speed-violations/route/${routeId}/summary`, { params });
      return getPayload(response);
    } catch (error) {
      return rejectWithValue(getErrorPayload(error, "Failed to fetch route summary"));
    }
  }
);

// ─── Fetch driver violations ──────────────────────────────────────────────────
// { driverId, params?: { tenant_id?, route_id?, date_from?, date_to?, page?, limit? } }
export const fetchDriverViolationsThunk = createAsyncThunk(
  "speedViolations/fetchDriverViolations",
  async ({ driverId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.get(`/speed-violations/driver/${driverId}`, { params });
      return { driverId, ...getPayload(response) };
    } catch (error) {
      return rejectWithValue(getErrorPayload(error, "Failed to fetch driver violations"));
    }
  }
);
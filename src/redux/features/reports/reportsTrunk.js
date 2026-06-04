import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";

// ─── Helper ───────────────────────────────────────────────────────────────────
const extractErrorMessage = async (error) => {
  try {
    if (!error.response?.data) return error.response?.statusText || error.message;
    const data = error.response.data;
    if (data instanceof ArrayBuffer) {
      try {
        const text = new TextDecoder("utf-8").decode(data);
        const parsed = JSON.parse(text);
        return parsed?.detail?.message || parsed?.message || parsed?.detail || error.message;
      } catch { return error.message; }
    }
    if (typeof data === "object")
      return data?.detail?.message || data?.message || data?.detail || data?.error || error.message;
    if (typeof data === "string") {
      try { const p = JSON.parse(data); return p?.detail?.message || p?.message || data; }
      catch { return data; }
    }
    return error.message;
  } catch { return error.message; }
};

// ─── Booking Analytics ────────────────────────────────────────────────────────
export const fetchBookingAnalytics = createAsyncThunk(
  "reports/fetchBookingAnalytics",
  async (params, { rejectWithValue }) => {
    try {
      const q = new URLSearchParams();
      q.append("start_date", params.start_date);
      q.append("end_date",   params.end_date);
      if (params.tenant_id) q.append("tenant_id", params.tenant_id);
      if (params.shift_id)  q.append("shift_id",  params.shift_id);
      const response = await API_CLIENT.get(`/reports/bookings/analytics?${q.toString()}`);
      return response.data.data;
    } catch (error) { return rejectWithValue(await extractErrorMessage(error)); }
  }
);

// ─── Preview Bookings Report (JSON) — NEW ────────────────────────────────────
export const previewBookingsReport = createAsyncThunk(
  "reports/previewBookingsReport",
  async (params, { rejectWithValue }) => {
    try {
      const q = new URLSearchParams();
      q.append("start_date", params.start_date);
      q.append("end_date",   params.end_date);
      if (params.tenant_id) q.append("tenant_id", params.tenant_id);
      if (params.shift_id)  q.append("shift_id",  params.shift_id);
      if (params.vendor_id) q.append("vendor_id", params.vendor_id);
      params.booking_status?.forEach((s) => q.append("booking_status", s));
      params.route_status?.forEach((s)   => q.append("route_status",   s));
      q.append("include_unrouted", (params.include_unrouted ?? true).toString());

      const response = await API_CLIENT.get(`/reports/bookings?${q.toString()}`);

      const rows = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data?.results)
        ? response.data.results
        : [];

      return rows;
    } catch (error) { return rejectWithValue(await extractErrorMessage(error)); }
  }
);

// ─── Download Bookings Report (blob) ─────────────────────────────────────────
export const downloadBookingsReport = createAsyncThunk(
  "reports/downloadBookingsReport",
  async (params, { rejectWithValue }) => {
    try {
      const q = new URLSearchParams();
      q.append("start_date", params.start_date);
      q.append("end_date",   params.end_date);
      if (params.tenant_id) q.append("tenant_id", params.tenant_id);
      if (params.shift_id)  q.append("shift_id",  params.shift_id);
      if (params.vendor_id) q.append("vendor_id", params.vendor_id);
      params.booking_status?.forEach((s) => q.append("booking_status", s));
      params.route_status?.forEach((s)   => q.append("route_status",   s));
      q.append("include_unrouted", (params.include_unrouted ?? true).toString());

      const response = await API_CLIENT.get(`/reports/bookings/export?${q.toString()}`, {
        responseType: "arraybuffer",
        timeout: 60000,
        headers: { Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
      });

      const cd = response.headers["content-disposition"];
      let filename = `bookings_report_${params.start_date}_to_${params.end_date}.xlsx`;
      if (cd) { const m = cd.match(/filename="(.+?)"/); if (m?.[1]) filename = m[1]; }

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url  = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href  = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { filename };
    } catch (error) { return rejectWithValue(await extractErrorMessage(error)); }
  }
);

// ─── Delay Report ─────────────────────────────────────────────────────────────
export const fetchDelayReport = createAsyncThunk(
  "reports/fetchDelayReport",
  async (params, { rejectWithValue }) => {
    try {
      const q = new URLSearchParams();
      q.append("start_date", params.start_date);
      q.append("end_date",   params.end_date);
      if (params.tenant_id)      q.append("tenant_id",      params.tenant_id);
      if (params.delay_type)     q.append("delay_type",     params.delay_type);
      if (params.delay_category) q.append("delay_category", params.delay_category);
      const response = await API_CLIENT.get(`/reports/delays?${q.toString()}`);
      return response.data.data;
    } catch (error) { return rejectWithValue(await extractErrorMessage(error)); }
  }
);

// ─── Delay Detail ─────────────────────────────────────────────────────────────
export const fetchDelayDetail = createAsyncThunk(
  "reports/fetchDelayDetail",
  async (params, { rejectWithValue }) => {
    try {
      const q = new URLSearchParams();
      if (params.tenant_id) q.append("tenant_id", params.tenant_id);
      const response = await API_CLIENT.get(`/reports/delays/${params.route_id}?${q.toString()}`);
      return response.data.data;
    } catch (error) { return rejectWithValue(await extractErrorMessage(error)); }
  }
);

// ─── Driver Duty Hours ────────────────────────────────────────────────────────
export const fetchDriverDutyHours = createAsyncThunk(
  "reports/fetchDriverDutyHours",
  async (params, { rejectWithValue }) => {
    try {
      const q = new URLSearchParams();
      q.append("start_date", params.start_date);
      q.append("end_date",   params.end_date);
      if (params.driver_id) q.append("driver_id", params.driver_id);
      const response = await API_CLIENT.get(`/reports/driver-duty-hours?${q.toString()}`);
      return response.data.data;
    } catch (error) { return rejectWithValue(await extractErrorMessage(error)); }
  }
);
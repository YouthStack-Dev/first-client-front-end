import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";

// ─── Helper: extract backend error message ────────────────────────────────────
const extractErrorMessage = async (error) => {
  try {
    if (!error.response?.data) {
      return error.response?.statusText || error.message;
    }

    const data = error.response.data;

    // ArrayBuffer response (from blob/arraybuffer requests)
    if (data instanceof ArrayBuffer) {
      try {
        const text = new TextDecoder("utf-8").decode(data);
        const parsed = JSON.parse(text);
        return (
          parsed?.detail?.message ||
          parsed?.message ||
          parsed?.detail ||
          error.message
        );
      } catch {
        return error.message;
      }
    }

    // Object response
    if (typeof data === "object") {
      return (
        data?.detail?.message ||
        data?.message ||
        data?.detail ||
        data?.error ||
        error.message
      );
    }

    // String response
    if (typeof data === "string") {
      try {
        const parsed = JSON.parse(data);
        return parsed?.detail?.message || parsed?.message || data;
      } catch {
        return data;
      }
    }

    return error.message;
  } catch {
    return error.message;
  }
};

// ─── Booking Analytics ────────────────────────────────────────────────────────
export const fetchBookingAnalytics = createAsyncThunk(
  "reports/fetchBookingAnalytics",
  async (params, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();

      queryParams.append("start_date", params.start_date);
      queryParams.append("end_date", params.end_date);

      if (params.tenant_id) queryParams.append("tenant_id", params.tenant_id);
      if (params.shift_id) queryParams.append("shift_id", params.shift_id);

      const response = await API_CLIENT.get(
        `/reports/bookings/analytics?${queryParams.toString()}`
      );

      return response.data.data;
    } catch (error) {
      const message = await extractErrorMessage(error);
      return rejectWithValue(message);
    }
  }
);

// ─── Download Bookings Report ─────────────────────────────────────────────────
export const downloadBookingsReport = createAsyncThunk(
  "reports/downloadBookingsReport",
  async (params, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();

      // Required
      queryParams.append("start_date", params.start_date);
      queryParams.append("end_date", params.end_date);

      // Optional singles
      if (params.tenant_id) queryParams.append("tenant_id", params.tenant_id);
      if (params.shift_id) queryParams.append("shift_id", params.shift_id);
      if (params.vendor_id) queryParams.append("vendor_id", params.vendor_id);

      // Array params — must use append per value
      if (params.booking_status?.length > 0) {
        params.booking_status.forEach((s) =>
          queryParams.append("booking_status", s)
        );
      }
      if (params.route_status?.length > 0) {
        params.route_status.forEach((s) =>
          queryParams.append("route_status", s)
        );
      }

      // Boolean
      queryParams.append(
        "include_unrouted",
        (params.include_unrouted ?? true).toString()
      );

      const response = await API_CLIENT.get(
        `/reports/bookings/export?${queryParams.toString()}`,
        {
          responseType: "arraybuffer",
          timeout: 60000,
          headers: {
            Accept:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          },
        }
      );

      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers["content-disposition"];
      let filename = `bookings_report_${params.start_date}_to_${params.end_date}.xlsx`;

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+?)"/);
        if (match?.[1]) filename = match[1];
      }

      // Trigger browser download
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { filename };
    } catch (error) {
      // Don't retry on 4xx
      if (
        error.response?.status >= 400 &&
        error.response?.status < 500
      ) {
        const message = await extractErrorMessage(error);
        return rejectWithValue(message);
      }
      const message = await extractErrorMessage(error);
      return rejectWithValue(message);
    }
  }
);

// ─── Delay Report ─────────────────────────────────────────────────────────────
export const fetchDelayReport = createAsyncThunk(
  "reports/fetchDelayReport",
  async (params, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();

      queryParams.append("start_date", params.start_date);
      queryParams.append("end_date", params.end_date);

      if (params.tenant_id) queryParams.append("tenant_id", params.tenant_id);
      if (params.delay_type) queryParams.append("delay_type", params.delay_type);
      if (params.delay_category)
        queryParams.append("delay_category", params.delay_category);

      const response = await API_CLIENT.get(
        `/reports/delays?${queryParams.toString()}`
      );

      return response.data.data;
    } catch (error) {
      const message = await extractErrorMessage(error);
      return rejectWithValue(message);
    }
  }
);

// ─── Delay Detail (single route) ──────────────────────────────────────────────
export const fetchDelayDetail = createAsyncThunk(
  "reports/fetchDelayDetail",
  async (params, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.tenant_id) queryParams.append("tenant_id", params.tenant_id);

      const response = await API_CLIENT.get(
        `/reports/delays/${params.route_id}?${queryParams.toString()}`
      );

      return response.data.data;
    } catch (error) {
      const message = await extractErrorMessage(error);
      return rejectWithValue(message);
    }
  }
);

// ─── Driver Duty Hours ────────────────────────────────────────────────────────
export const fetchDriverDutyHours = createAsyncThunk(
  "reports/fetchDriverDutyHours",
  async (params, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();

      queryParams.append("start_date", params.start_date);
      queryParams.append("end_date", params.end_date);

      if (params.driver_id) queryParams.append("driver_id", params.driver_id);

      const response = await API_CLIENT.get(
        `/reports/driver-duty-hours?${queryParams.toString()}`
      );

      return response.data.data;
    } catch (error) {
      const message = await extractErrorMessage(error);
      return rejectWithValue(message);
    }
  }
);
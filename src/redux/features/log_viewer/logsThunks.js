import { createAsyncThunk } from "@reduxjs/toolkit";

import { API_CLIENT } from "../../../Api/API_Client";

const getErrorPayload = (error, fallback) => {
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
    message: error?.response?.data?.message || error?.message || fallback,

    status: error?.response?.status,
  };
};

/**

 * Fetch recent log entries snapshot from GET /logs/recent

 * params: { tail, level, path, status_code }

 */

export const fetchRecentLogsThunk = createAsyncThunk(
  "logs/fetchRecent",

  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();

      if (params.tail !== "" && params.tail !== undefined)
        query.set("tail", params.tail);

      if (params.level) query.set("level", params.level);

      if (params.path && params.path.trim())
        query.set("path", params.path.trim());

      if (params.status_code !== "" && params.status_code !== undefined)
        query.set("status_code", params.status_code);

      const url = `/logs/recent${query.toString() ? `?${query.toString()}` : ""}`;

      const response = await API_CLIENT.get(url);

      if (response.status === 200 && response.data?.success) {
        return {
          entries: response.data.entries ?? [],

          total: response.data.total ?? 0,
        };
      }

      return rejectWithValue({
        message: response.data?.message || "Failed to fetch logs",
      });
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(error, "Failed to fetch recent logs"),
      );
    }
  },
);

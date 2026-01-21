// src/store/thunks/alertConfigThunk.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";
import { logDebug } from "../../../utils/logger";

export const getAlertConfigThunk = createAsyncThunk(
  "alertconfig/get",
  async (_, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.get("/alert-config");

      // logDebug("This is the alert data fetched", response.data);

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: "Failed to fetch alert config",
        }
      );
    }
  }
);

export const createAlertConfigThunk = createAsyncThunk(
  "alertconfig/create",
  async ({ payload }, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.post("alert-config", payload);

      logDebug("alert config created", response.data);

      // return created config object
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: "Failed to create alert config",
        }
      );
    }
  }
);

export const updateAlertConfigThunk = createAsyncThunk(
  "alertconfig/update",
  async ({ configId, payload, headers = {} }, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.put(
        `alert-config/${configId}`,
        payload,
        { headers }
      );

      logDebug("alert config updated", response.data);

      // return updated config object
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: "Failed to update alert config",
        }
      );
    }
  }
);

export const acknowledgeAlertConfigThunk = createAsyncThunk(
  "alertconfig/acknowledge",
  async ({ alertId, payload = {} }, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.put(
        `/alerts/${alertId}/acknowledge`,
        payload
      );

      logDebug("alert config acknowledged", response.data);

      // return updated config object
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: "Failed to acknowledge alert config",
        }
      );
    }
  }
);

export const escalateAlertConfigThunk = createAsyncThunk(
  "alertconfig/escalate",
  async ({ alertId, payload = {} }, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.post(
        `/alerts/${alertId}/escalate`,
        payload
      );

      logDebug("alert config escalated", response.data);

      // return updated config object
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: "Failed to escalate alert config",
        }
      );
    }
  }
);

export const closeAlertThunk = createAsyncThunk(
  "alertconfig/close",
  async ({ alertId }, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.put(`/alerts/${alertId}/close`);

      logDebug("alert closed", response.data);

      // return updated config object
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: "Failed to close alert",
        }
      );
    }
  }
);

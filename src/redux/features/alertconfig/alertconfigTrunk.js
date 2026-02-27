// src/store/thunks/alertConfigThunk.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";
import { logDebug } from "../../../utils/logger";

export const getAlertConfigThunk = createAsyncThunk(
  "alertconfig/get",
  async (_, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.get("/alert-config");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch alert config" }
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
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to create alert config" }
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
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to update alert config" }
      );
    }
  }
);

// PUT /api/v1/alerts/{alert_id}/acknowledge
// Body: { notes, acknowledged_by }
export const acknowledgeAlertConfigThunk = createAsyncThunk(
  "alertconfig/acknowledge",
  async ({ alertId, payload = {} }, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.put(
        `/alerts/${alertId}/acknowledge`,
        payload
      );
      logDebug("alert acknowledged", response.data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to acknowledge alert" }
      );
    }
  }
);


export const escalateAlertConfigThunk = createAsyncThunk(
  "alertconfig/escalate",
  async ({ alertId, payload = {} }, { rejectWithValue }) => {
    try {
      // Only send fields the API expects
      const { escalation_level, escalated_to, reason } = payload;
      const response = await API_CLIENT.post(`/alerts/${alertId}/escalate`, {
        escalation_level,
        escalated_to,
        reason,
        escalated_by
      });
      logDebug("alert escalated", response.data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to escalate alert" }
      );
    }
  }
);

// PUT /api/v1/alerts/{alert_id}/close
// Body: { resolution_notes, is_false_alarm }
export const closeAlertThunk = createAsyncThunk(
  "alertconfig/close",
  async ({ alertId, resolution_notes, is_false_alarm = false, closed_by }, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.put(`/alerts/${alertId}/close`, {
        resolution_notes,
        is_false_alarm,
        closed_by,  // ← added
      });
      logDebug("alert closed", response.data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to close alert" }
      );
    }
  }
);
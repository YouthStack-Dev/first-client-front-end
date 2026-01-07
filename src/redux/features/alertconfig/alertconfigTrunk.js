// src/store/thunks/alertConfigThunk.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";
import { logDebug } from "../../../utils/logger";

export const getAlertConfigThunk = createAsyncThunk(
  "alertconfig/get",
  async ({ params = {} }, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams(params).toString();

      const response = await API_CLIENT.get(
        `v1/alert-config/applicable/current?${query}`
      );

      logDebug(" this is the alert data fetched ", response);
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
  async ({ payload, headers = {} }, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.post("v1/alert-config", payload, {
        headers,
      });

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
        `v1/alert-config/${configId}`,
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

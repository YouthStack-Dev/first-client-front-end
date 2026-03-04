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

export const fetchEscortsThunk = createAsyncThunk(
  "escort/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.get("/escorts/", { params });
      return getPayload(response) ?? [];
    } catch (error) {
      return rejectWithValue(getErrorPayload(error, "Failed to fetch escorts"));
    }
  }
);

export const fetchAvailableEscortsThunk = createAsyncThunk(
  "escort/fetchAvailable",
  async (_, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.get("/escorts/available/");
      return getPayload(response) ?? [];
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(error, "Failed to fetch available escorts")
      );
    }
  }
);

export const fetchEscortByIdThunk = createAsyncThunk(
  "escort/fetchById",
  async (escortId, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.get(`/escorts/${escortId}`);
      return getPayload(response);
    } catch (error) {
      return rejectWithValue(getErrorPayload(error, "Failed to fetch escort"));
    }
  }
);

export const createEscortThunk = createAsyncThunk(
  "escort/create",
  async (escortData, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.post("/escorts/", escortData);
      if (response?.status === 200 || response?.status === 201) {
        return getPayload(response);
      }
      return rejectWithValue({ message: "Failed to create escort" });
    } catch (error) {
      return rejectWithValue(getErrorPayload(error, "Failed to create escort"));
    }
  }
);

export const updateEscortThunk = createAsyncThunk(
  "escort/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.put(`/escorts/${id}`, data);
      if (response?.status === 200) {
        return getPayload(response);
      }
      return rejectWithValue({ message: "Failed to update escort" });
    } catch (error) {
      return rejectWithValue(getErrorPayload(error, "Failed to update escort"));
    }
  }
);

export const deleteEscortThunk = createAsyncThunk(
  "escort/deleteEscort",
  async (escortId, { rejectWithValue }) => {
    try {
      await API_CLIENT.delete(`/escorts/${escortId}`);
      return {
        id: escortId,
        message: "Escort deleted successfully",
      };
    } catch (error) {
      return rejectWithValue(getErrorPayload(error, "Failed to delete escort"));
    }
  }
);

export const setEscortPasswordThunk = createAsyncThunk(
  "escort/setPassword",
  async ({ escortId, newPassword }, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.post(`/escorts/${escortId}/set-password`, {
        new_password: newPassword,
      });
      return getPayload(response);
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(error, "Failed to reset escort password")
      );
    }
  }
);

export const toggleEscortActiveThunk = createAsyncThunk(
  "escort/toggleActive",
  async ({ id, currentState }, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.put(`/escorts/${id}`, {
        is_active: !currentState,
      });
      return getPayload(response);
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(error, "Failed to toggle active status")
      );
    }
  }
);

export const toggleEscortAvailableThunk = createAsyncThunk(
  "escort/toggleAvailable",
  async ({ id, currentState }, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.put(`/escorts/${id}`, {
        is_available: !currentState,
      });
      return getPayload(response);
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(error, "Failed to toggle availability status")
      );
    }
  }
);

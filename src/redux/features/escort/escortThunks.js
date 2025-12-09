import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";

// ------------------------------------------------------
// FETCH ESCORTS
// ------------------------------------------------------
export const fetchEscortsThunk = createAsyncThunk(
  "escort/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.get("/v1/escorts/");
      if (response?.status === 200) {
        return response.data;
      }
      return rejectWithValue(
        response.data.message || "Failed to fetch escorts"
      );
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ------------------------------------------------------
// CREATE ESCORT
// ------------------------------------------------------
export const createEscortThunk = createAsyncThunk(
  "escort/create",
  async (escortData, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.post("/v1/escorts/", escortData);
      if (response?.status === 200) {
        return response.data;
      }
      return rejectWithValue(
        response.data.message || "Failed to create escort"
      );
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ------------------------------------------------------
// UPDATE ESCORT
// ------------------------------------------------------
export const updateEscortThunk = createAsyncThunk(
  "escort/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.put(`/v1/escorts/${id}`, data);
      if (response?.data?.success) {
        return response.data.data;
      }
      return rejectWithValue(
        response.data.message || "Failed to update escort"
      );
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteEscortThunk = createAsyncThunk(
  "escort/deleteEscort",
  async (escortId, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.delete(`/v1/escort/${escortId}`);

      return {
        id: escortId,
        message: response?.data?.message || "Escort deleted successfully",
      };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to delete escort"
      );
    }
  }
);

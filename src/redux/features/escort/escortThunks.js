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
// export const createEscortThunk = createAsyncThunk(
//   "escort/create",
//   async (escortData, { rejectWithValue }) => {
//     try {
//       const response = await API_CLIENT.post("/v1/escorts/", escortData);
//       if (response?.status === 200) {
//         return response.data;
//       }
//       return rejectWithValue(
//         response.data.message || "Failed to create escort"
//       );
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || error.message);
//     }
//   }
// );

// // ------------------------------------------------------
// // UPDATE ESCORT
// // ------------------------------------------------------
// export const updateEscortThunk = createAsyncThunk(
//   "escort/update",
//   async ({ id, data }, { rejectWithValue }) => {
//     try {
//       const response = await API_CLIENT.put(`/v1/escorts/${id}`, data);
//       if (response?.data?.success) {
//         return response.data.data;
//       }
//       return rejectWithValue(
//         response.data.message || "Failed to update escort"
//       );
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || error.message);
//     }
//   }
// );

// escortThunks.js - Update createEscortThunk

export const createEscortThunk = createAsyncThunk(
  "escort/create",
  async (escortData, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.post("/v1/escorts/", escortData);
      if (response?.status === 200 || response?.status === 201) {
        return response.data;
      }
      return rejectWithValue(
        response.data?.detail ||
          response.data?.message ||
          "Failed to create escort"
      );
    } catch (error) {
      // Handle the specific error structure from your backend
      if (error.response?.data?.detail) {
        return rejectWithValue(error.response.data.detail);
      }
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "An unexpected error occurred"
      );
    }
  }
);

// Add similar error handling to updateEscortThunk
export const updateEscortThunk = createAsyncThunk(
  "escort/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.put(`/v1/escorts/${id}/`, data);
      if (response?.status === 200) {
        return response.data;
      }
      return rejectWithValue(
        response.data?.detail ||
          response.data?.message ||
          "Failed to update escort"
      );
    } catch (error) {
      if (error.response?.data?.detail) {
        return rejectWithValue(error.response.data.detail);
      }
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "An unexpected error occurred"
      );
    }
  }
);
export const deleteEscortThunk = createAsyncThunk(
  "escort/deleteEscort",
  async (escortId, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.delete(`/v1/escorts/${escortId}`);

      return {
        id: escortId,
        message: response?.data?.message || "Escort deleted successfully",
      };
    } catch (error) {
      return rejectWithValue({
        status: err.response?.status,
        message:
          err.response?.data?.detail?.message || "Failed to delete escort",
        errorCode: err.response?.data?.detail?.error_code,
      });
    }
  }
);

// NEW: Toggle active status thunk
export const toggleEscortActiveThunk = createAsyncThunk(
  "escort/toggleActive",
  async ({ id, currentState }, { rejectWithValue }) => {
    try {
      const newState = !currentState;
      console.log(
        `Toggling escort ${id} active from ${currentState} to ${newState}`
      );

      const response = await API_CLIENT.put(`/v1/escorts/${id}`, {
        is_active: newState,
      });

      return {
        id,
        is_active: newState,
        escort: response.data,
      };
    } catch (error) {
      console.error(
        "Toggle active error:",
        error.response?.data || error.message
      );
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// NEW: Toggle availability status thunk
export const toggleEscortAvailableThunk = createAsyncThunk(
  "escort/toggleAvailable",
  async ({ id, currentState }, { rejectWithValue }) => {
    try {
      const newState = !currentState;
      console.log(
        `Toggling escort ${id} available from ${currentState} to ${newState}`
      );

      const response = await API_CLIENT.put(`/v1/escorts/${id}`, {
        is_available: newState,
      });

      return {
        id,
        is_available: newState,
        escort: response.data,
      };
    } catch (error) {
      console.error(
        "Toggle available error:",
        error.response?.data || error.message
      );
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

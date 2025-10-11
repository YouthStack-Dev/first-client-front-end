import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";


export const fetchShiftTrunk = createAsyncThunk(
  "shift/fetchShiftTrunk",
  async (
    { skip = 0, limit = 100, is_active, log_type = "" } = {},
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams({ skip, limit });
      if (log_type) params.append("log_type", log_type);

      const response = await API_CLIENT.get(`/v1/shifts/?${params.toString()}`);

      if (response.status === 200 && response.data?.success) {
        return response.data.data.items; // ✅ return array of shifts
      }
      return rejectWithValue(response.data?.message || "Failed to fetch shift data");
    } catch (error) {
      return rejectWithValue(error.message || "An unexpected error occurred");
    }
  }
);



export const createShiftTrunk = createAsyncThunk(
  "shift/createShift",
  async (shiftData, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.post("/v1/shifts/", shiftData);

      if (response.status === 201 || response.status === 200) {
        return response.data;
      }
      return rejectWithValue("Failed to create shift");
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);




export const toggleShiftStatus = createAsyncThunk(
  "shift/toggleShiftStatus",
  async (shift_id, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.patch(`/v1/shifts/${shift_id}/toggle-status`);

      // Check for successful status
      if (response.status === 200) {
        return response.data; // return updated shift
      }

      return rejectWithValue("Failed to toggle shift status");
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// --- Update Shift ---
export const updateShiftTrunk = createAsyncThunk(
  "shift/updateShiftTrunk",
  async ({ shift_id, data }, { rejectWithValue }) => {
    try {
      // console.log("🔹 Updating shift with ID:", shift_id);
      // console.log("🔹 Data being sent:", data);

      const response = await API_CLIENT.put(`/v1/shifts/${shift_id}`, data);

      console.log("✅ Update Shift Response:", response.data);
      return response.data.data; // The API returns data object inside response
    } catch (error) {
      console.error("❌ Error updating shift:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
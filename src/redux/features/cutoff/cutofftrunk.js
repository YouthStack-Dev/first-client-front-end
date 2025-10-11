import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";

export const fetchCutoffsThunk = createAsyncThunk(
  "cutoff/fetchCutoffs",
  async (_, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.get(`/v1/cutoffs/`);

      if (response.status === 200) {
        return response.data?.data || response.data;
      }

      return rejectWithValue("Failed to fetch cutoff data");
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const saveCutoffThunk = createAsyncThunk(
  "cutoff/saveCutoff",
  async ({ booking, cancellation }, { rejectWithValue }) => {
    try {
      // Convert hours to HH:MM format (e.g., 4 -> "4:00")
      const bookingCutoff = `${Math.floor(booking)}:00`;
      const cancelCutoff = `${Math.floor(cancellation)}:00`;

      const response = await API_CLIENT.put("/v1/cutoffs/", {
        booking_cutoff: bookingCutoff,
        cancel_cutoff: cancelCutoff,
      });

      console.log("Saved cutoff response:", response.data);
      return response.data.data; // contains the updated cutoff object
    } catch (error) {
      console.error("Error saving cutoff:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
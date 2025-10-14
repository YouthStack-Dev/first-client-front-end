// vehicleThunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";


export const fetchVehiclesThunk = createAsyncThunk(
  "vehicles/fetchVehicles",
  async (_, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.get("/v1/vehicles/");
      if (!response.data?.success) {
        return rejectWithValue(response.data?.message || "Failed to fetch vehicles");
      }
      return response.data.data; // { total, items }
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

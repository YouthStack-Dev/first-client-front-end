import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";

export const fetchVehicleTypes = createAsyncThunk(
  "vehicleType/fetchVehicleTypeThunk",
  async ({ active_only } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (active_only !== undefined) params.append("active_only", active_only);

      const response = await API_CLIENT.get(`/v1/vehicle-types/?${params.toString()}`);

      if (response.status === 200 && response.data?.success) {
        return response.data.data.items;
      }

      return rejectWithValue(response.data?.message || "Failed to fetch vehicle types");
    } catch (error) {
      return rejectWithValue(error.message || "Unexpected error");
    }
  }
);

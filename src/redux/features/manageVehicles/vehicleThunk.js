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


// ✅ Update a vehicle
export const updateVehicleThunk = createAsyncThunk(
  "vehicles/update",
  async ({ vehicle_id, data }, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.put(`/vehicles/${vehicle_id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating vehicle:", error);
      return rejectWithValue(error.response?.data || "Failed to update vehicle");
    }
  }
);
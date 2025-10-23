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
      return response.data.data; 
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);


export const createVehicleThunk = createAsyncThunk(
  "vehicles/createVehicle",
  async (formData, { rejectWithValue }) => {
    try {
      // formData is already a FormData object from your VehicleForm
      const response = await API_CLIENT.post("/v1/vehicles/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Return the created vehicle
      return response.data.data?.vehicle || response.data.vehicle;
    } catch (error) {
      console.error("Error creating vehicle:", error);
      return rejectWithValue(
        error.response?.data || { message: error.message || "Something went wrong" }
      );
    }
  }
);



export const updateVehicleThunk = createAsyncThunk(
  "vehicle/update",
  async ({ vehicle_id, data }, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.put(
        `/v1/vehicles/${vehicle_id}`,data,
         {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating vehicle:", error.response || error.message);
      return rejectWithValue(error.response?.data || "Failed to update vehicle");
    }
  }
);
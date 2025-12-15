import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";

export const fetchVehicleTypesThunk = createAsyncThunk(
  "vehicleType/fetch",
  async (params, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.get("/v1/vehicle-types/", {
        params,
      });

      return {
        items: response.data.data.items,
        append: params?.append || false,
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Failed to fetch vehicle types"
      );
    }
  }
);



export const createVehicleType = createAsyncThunk(
  "vehicleType/createVehicleTypeThunk",
  async (vehicleTypeData, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.post(`/v1/vehicle-types/`, vehicleTypeData);

      if ((response.status === 200 || response.status === 201) && response.data) {
        return response.data.data;
      }

      return rejectWithValue(response.data?.message || "Failed to create vehicle type");
    } catch (error) {
      return rejectWithValue(error.message || "Unexpected error");
    }
  }
);


export const updateVehicleType = createAsyncThunk(
  "vehicleType/updateVehicleTypeThunk",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.put(`/v1/vehicle-types/${id}`, payload);

      if (response.status === 200 && response.data?.success) {
        return response.data.data;
      }

      return rejectWithValue(response.data?.message || "Failed to update vehicle type");
    } catch (error) {
      return rejectWithValue(error.message || "Unexpected error");
    }
  }
);


export const toggleVehicleTypeStatus = createAsyncThunk(
  "vehicleType/toggleVehicleTypeStatusThunk",
  async (id, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.patch(`/v1/vehicle-types/${id}/toggle-status`);

      if (response.status === 200 && response.data?.success) {
        return response.data.data;
      }

      return rejectWithValue(response.data?.message || "Failed to toggle vehicle type status");
    } catch (error) {
      return rejectWithValue(error.message || "Unexpected error");
    }
  }
);

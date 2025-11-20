import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";

export const fetchVehicleTypes = createAsyncThunk(
  "vehicleType/fetchVehicleTypeThunk",
  async ({ active_only } = {}, { rejectWithValue }) => {
    try {
      let url = "/v1/vehicle-types/";
      if (active_only !== undefined && active_only !== null) {
        url += `?active_only=${active_only}`;
      }

      const response = await API_CLIENT.get(url);

      if (response.status === 200 && response.data?.success) {
        return response.data.data.items;
      }

      return rejectWithValue(response.data?.message || "Failed to fetch vehicle types");
    } catch (error) {
      return rejectWithValue(error.message || "Unexpected error");
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

export const fetchVendorVehicleTypes = createAsyncThunk(
  "vehicleTypes/fetchVendorVehicleTypes",
  async (vendorId, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.get(
        `/v1/vehicle-types/?vendor_id=${vendorId}`
      );
      return { vendorId, items: response.data.data.items };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch vendor vehicles");
    }
  }
);

// vehicleThunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";

export const fetchVehiclesThunk = createAsyncThunk(
  "vehicles/fetchVehicles",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { filters, pagination } = getState().vehicles;

      // Build params, skipping 'all' values
      const params = {
        skip: pagination.skip,
        limit: pagination.limit,
      };

      if (filters.rc_number) params.rc_number = filters.rc_number;
      if (filters.vehicle_type_id && filters.vehicle_type_id !== "all") {
        params.vehicle_type_id = filters.vehicle_type_id;
      }
      if (filters.driver_id && filters.driver_id !== "all") {
        params.driver_id = filters.driver_id;
      }
      if (filters.is_active && filters.is_active !== "all") {
        params.is_active = filters.is_active === "true"; // convert string to boolean
      }
      if (filters.vendor_id && filters.vendor_id !== "all") {
        params.vendor_id = filters.vendor_id;
      }

      const response = await API_CLIENT.get("/v1/vehicles/", { params });

      if (!response.data?.success) {
        return rejectWithValue(response.data?.message || "Failed to fetch vehicles");
      }

      // Return raw API response
      return response.data.data; // { total, items }
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";

export const fetchVehiclesThunk = createAsyncThunk(
  "vehicles/fetchVehicles",
  async (
    { skip = 0, limit = 10, rc_number = "", vehicle_type_id = "", driver_id = "", is_active = "", vendor_id = "" } = {},
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams({ skip, limit });

      if (rc_number) params.append("rc_number", rc_number);
      if (vehicle_type_id) params.append("vehicle_type_id", vehicle_type_id);
      if (driver_id) params.append("driver_id", driver_id);
      if (is_active) params.append("is_active", is_active);
      if (vendor_id) params.append("vendor_id", vendor_id);

      const response = await API_CLIENT.get(`/v1/vehicles/?${params.toString()}`);

      if (response.status === 200 && response.data?.success) {
        return response.data.data.items; // ✅ return array of vehicles
      }
      return rejectWithValue(response.data?.message || "Failed to fetch vehicles");
    } catch (error) {
      return rejectWithValue(error.message || "An unexpected error occurred");
    }
  }
);

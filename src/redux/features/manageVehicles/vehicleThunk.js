import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";

/* ======================================================
   FETCH VEHICLES — SAME AS DRIVER THUNK
   Backend handles ALL filters (is_active, vendor_id, etc.)
====================================================== */
export const fetchVehiclesThunk = createAsyncThunk(
  "vehicle/fetch",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.get("/v1/vehicles/", {
        params, // 🔥 IMPORTANT: axios params (NO manual query)
      });

      /*
        Expected backend response:
        {
          success: true,
          data: {
            items: [],
            total: number
          }
        }
      */

      return {
        ...response.data.data, // { items, total }
        append: params?.append || false, // for pagination if needed
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Failed to fetch vehicles"
      );
    }
  }
);

/* ======================================================
   CREATE VEHICLE
====================================================== */
export const createVehicleThunk = createAsyncThunk(
  "vehicle/create",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.post(
        "/v1/vehicles/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data.data?.vehicle;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to create vehicle"
      );
    }
  }
);

/* ======================================================
   UPDATE VEHICLE
====================================================== */
export const updateVehicleThunk = createAsyncThunk(
  "vehicle/update",
  async ({ vehicle_id, data }, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.put(
        `/v1/vehicles/${vehicle_id}`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data.data?.vehicle;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to update vehicle"
      );
    }
  }
);

/* ======================================================
   TOGGLE VEHICLE STATUS
====================================================== */
export const toggleVehicleStatus = createAsyncThunk(
  "vehicle/toggleStatus",
  async ({ vehicleId, isActive }, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.patch(
        `/v1/vehicles/${vehicleId}/status`,
        null,
        {
          params: {
            is_active: isActive, // 🔥 boolean true / false
          },
        }
      );

      return response.data.data?.vehicle;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Failed to toggle vehicle status"
      );
    }
  }
);

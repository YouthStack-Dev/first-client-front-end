import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";

/* =========================================================
   FETCH VEHICLE TYPES
   ========================================================= */
export const fetchVehicleTypesThunk = createAsyncThunk(
  "vehicleType/fetch",
  async (params, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.get("/v1/vehicle-types/", {
        params,
      });

      const items = (response.data?.data?.items || []).map(
        (item) => item.vehicle_type || item
      );

      return {
        items,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch vehicle types"
      );
    }
  }
);


export const createVehicleType = createAsyncThunk(
  "vehicleType/create",
  async (payload, { rejectWithValue }) => {
    try {
      console.log("🔥 THUNK RECEIVED:", payload);

      // if (!payload.vendor_id) {
      //   return rejectWithValue("vendor_id is required");
      // }

      const response = await API_CLIENT.post(
        "/v1/vehicle-types/",
        payload   // ✅ send FULL object
      );

      return response.data?.data?.vehicle_type;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to create vehicle type"
      );
    }
  }
);

/* =========================================================
   UPDATE VEHICLE TYPE
   👉 vendor_id REQUIRED (tenant scoped)
   ========================================================= */
export const updateVehicleType = createAsyncThunk(
  "vehicleType/update",
  async ({ id, payload, vendor_id }, { rejectWithValue }) => {
    if (!id) {
      return rejectWithValue("vehicle_type_id is required");
    }
    // if (!vendor_id) {
    //   return rejectWithValue("vendor_id is required for update");
    // }

    try {
      const response = await API_CLIENT.put(
        `/v1/vehicle-types/${id}`,
        {
          ...payload,
          vendor_id,
        },
        {
          params: { vendor_id },
        }
      );

      return response.data?.data?.vehicle_type || response.data?.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to update vehicle type"
      );
    }
  }
);

/* =========================================================
   TOGGLE VEHICLE TYPE STATUS
   👉 NO BODY REQUIRED (backend toggles internally)
   ========================================================= */
export const toggleVehicleTypeStatus = createAsyncThunk(
  "vehicleType/toggleStatus",
  async ({ id, vendor_id }, { rejectWithValue }) => {
    if (!id) {
      return rejectWithValue("vehicle_type_id is required");
    }
    if (!vendor_id) {
      return rejectWithValue("vendor_id is required to toggle status");
    }

    try {
      const response = await API_CLIENT.patch(
        `/v1/vehicle-types/${id}/toggle-status`,
        {},
        {
          params: { vendor_id },
        }
      );

      return response.data?.data?.vehicle_type || response.data?.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to toggle vehicle type status"
      );
    }
  }
);

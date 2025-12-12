// vehicleThunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";

// export const fetchVehiclesThunk = createAsyncThunk(
//   "vehicles/fetchVehicles",
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await API_CLIENT.get("/v1/vehicles/");
//       if (!response.data?.success) {
//         return rejectWithValue(response.data?.message || "Failed to fetch vehicles");
//       }
//       return response.data.data;
//     } catch (err) {
//       return rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );

export const fetchVehiclesThunk = createAsyncThunk(
  "vehicles/fetchVehicles",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { vendor_id, skip = 0, limit = 10 } = params;

      // Build query parameters
      const queryParams = new URLSearchParams();

      if (vendor_id) {
        queryParams.append("vendor_id", vendor_id);
      }

      // Always include pagination parameters
      queryParams.append("skip", skip);
      queryParams.append("limit", limit);

      const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
      const response = await API_CLIENT.get(`/v1/vehicles/${query}`);

      if (!response.data?.success) {
        return rejectWithValue(
          response.data?.message || "Failed to fetch vehicles"
        );
      }

      // ✅ Correctly extract items array from nested structure
      const rawData = response.data.data;
      const items = Array.isArray(rawData?.items)
        ? rawData.items
        : Array.isArray(rawData)
        ? rawData
        : [];

      // Get total count from response
      const total = rawData?.total || items.length;

      console.log("✅ Thunk returning:", {
        vendor_id,
        items: items.length,
        skip,
        limit,
        total,
      });

      // ✅ Return normalized structure that reducer expects
      return {
        vendor_id,
        items,
        pagination: {
          skip,
          limit,
          total,
          hasMore: skip + limit < total,
        },
      };
    } catch (err) {
      console.error("❌ Fetch vehicles failed:", err);
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
        error.response?.data || {
          message: error.message || "Something went wrong",
        }
      );
    }
  }
);

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
      return response.data;
    } catch (error) {
      console.error("Error updating vehicle:", error.response || error.message);
      return rejectWithValue(
        error.response?.data || "Failed to update vehicle"
      );
    }
  }
);

export const toggleVehicleStatus = createAsyncThunk(
  "vehicles/toggleVehicleStatus",
  async ({ vehicleId, isActive }, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.patch(
        `/v1/vehicles/${vehicleId}/status?is_active=${isActive}`
      );

      if (!response.data?.success) {
        return rejectWithValue(
          response.data?.message || "Failed to toggle vehicle status"
        );
      }

      return {
        vehicle: response.data?.data?.vehicle,
        message: response.data?.message || "Status updated successfully",
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

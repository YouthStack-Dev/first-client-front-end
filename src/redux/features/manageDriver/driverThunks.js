// src/redux/features/manageDrivers/driverThunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";

// Fetch all drivers 
export const fetchDriversThunk = createAsyncThunk(
  "drivers/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.get("/v1/drivers/vendor");

      if (response?.data?.success) {
        return response.data.data.items; 
      } else {
        return rejectWithValue(response.data.message || "Failed to fetch drivers");
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);



// --- Thunk for creating a driver ---
export const createDriverThunk = createAsyncThunk(
  'driver/createDriver',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.post('/v1/drivers/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data.driver; // Return driver object
    } catch (error) {
      console.error(error);
      return rejectWithValue(error.response?.data || { message: 'Something went wrong' });
    }
  }
);


/**
 * Update an existing driver
 */

export const updateDriverThunk = createAsyncThunk(
  "driver/updateDriver",
  async ({ driverId, formData }, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.put(
        `/v1/drivers/update?driver_id=${driverId}`, // ✅ no trailing slash needed
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      // ✅ Assuming backend returns something like { data: { driver: {...} } }
      return response.data?.data?.driver || response.data;
    } catch (error) {
      console.error("❌ Error updating driver:", error);

      return rejectWithValue(
        error.response?.data || {
          message: "Something went wrong while updating the driver.",
        }
      );
    }
  }
);

/**
 * Toggle driver active/inactive status
 */
export const toggleDriverStatusThunk = createAsyncThunk(
  'driver/toggleDriver',
  async (driver_id, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.patch(
        `/v1/drivers/${driver_id}/toggle-active`,
        {}, // empty body
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      // Return the driver object from response.data.data
      return response.data.data;
    } catch (error) {
      console.error('[Thunk] Failed to toggle driver status:', error);
      return rejectWithValue(error.response?.data || { message: 'Something went wrong' });
    }
  }
);


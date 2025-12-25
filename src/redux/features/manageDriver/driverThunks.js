// src/redux/features/manageDriver/driverThunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";

// Fetch all drivers
export const fetchDriversThunk = createAsyncThunk(
  "drivers/fetchAll",
  async (vendorId = undefined, { getState, rejectWithValue }) => {
    try {
      // If caller did not provide vendorId, try to derive from current user
      let vid = vendorId;
      if (!vid) {
        const state = getState();
        vid = state?.auth?.user?.vendor_user?.vendor_id;
      }

      if (!vid) {
        // Avoid calling the vendor endpoint without a vendor_id which results in 400
        return rejectWithValue({ message: "vendor_id is required to fetch drivers" });
      }

      const response = await API_CLIENT.get(`/v1/drivers/vendor?vendor_id=${vid}`);

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
        `/v1/drivers/update?driver_id=${driverId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      return response?.data?.data?.driver || response?.data;
    } catch (err) {
      console.error("Error updating driver:", err?.response?.data || err);
      return rejectWithValue(err?.response?.data || { message: "Something went wrong while updating the driver." });
    }
  }
);

/**
 * Toggle driver active/inactive status
 */
export const toggleDriverStatusThunk = createAsyncThunk(
  "driver/toggleDriver",
  async ({ driver_id, vendor_id }, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.patch(
        `/v1/drivers/${driver_id}/toggle-active?vendor_id=${vendor_id}`
      );
      // Return the driver object from response.data.data
      return response.data.data;
    } catch (error) {
      console.error('[Thunk] Failed to toggle driver status:', error);
      return rejectWithValue(error.response?.data || { message: 'Something went wrong' });
    }
  }
);
export const fetchDriversByVendorThunk = createAsyncThunk(
  "drivers/fetchDriversByVendor",
  async (vendorId, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.get(
        `/v1/drivers/vendor?vendor_id=${vendorId}`
      );

      return {
        vendorId,
        items: response.data?.data?.items || []
      };

    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch vendor drivers");
    }
  }
);

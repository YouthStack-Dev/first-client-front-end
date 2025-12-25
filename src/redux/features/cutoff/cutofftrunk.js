import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";

// Cutoff endpoints
export const fetchCutoffsThunk = createAsyncThunk(
  "cutoff/fetchCutoffs",
  async (_, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.get(`/v1/cutoffs/`);

      if (response.status === 200) {
        return response.data?.data || response.data;
      }

      return rejectWithValue("Failed to fetch cutoff data");
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const saveCutoffThunk = createAsyncThunk(
  "cutoff/saveCutoff",
  async (formData, { rejectWithValue }) => {
    try {
      const payload = {
        booking_login_cutoff: formatTime(formData.booking_login_cutoff),
        cancel_login_cutoff: formatTime(formData.cancel_login_cutoff),
        booking_logout_cutoff: formatTime(formData.booking_logout_cutoff),
        cancel_logout_cutoff: formatTime(formData.cancel_logout_cutoff),
        medical_emergency_booking_cutoff: formatTime(
          formData.medical_emergency_booking_cutoff
        ),
        adhoc_booking_cutoff: formatTime(formData.adhoc_booking_cutoff),
        allow_adhoc_booking: formData.allow_adhoc_booking,
        allow_medical_emergency_booking:
          formData.allow_medical_emergency_booking,
      };

      console.log("Saving cutoff payload:", payload);

      const response = await API_CLIENT.put("/v1/cutoffs/", payload);

      if (response.status === 200) {
        return response.data?.data || response.data;
      }

      return rejectWithValue("Failed to save cutoff data");
    } catch (error) {
      console.error("Error saving cutoff:", error);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Tenant Config endpoints (renamed from Escort Config)
export const fetchEscortConfigThunk = createAsyncThunk(
  "cutoff/fetchTenantConfig",
  async (_, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.get(`/v1/tenant-config/`);

      if (response.status === 200) {
        return response.data?.data || response.data;
      }

      return rejectWithValue("Failed to fetch tenant config");
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const saveEscortConfigThunk = createAsyncThunk(
  "cutoff/saveTenantConfig",
  async (formData, { rejectWithValue }) => {
    try {
      const payload = {
        // Escort fields
        escort_required_start_time: formatFullTime(
          formData.escort_required_start_time
        ),
        escort_required_end_time: formatFullTime(
          formData.escort_required_end_time
        ),
        escort_required_for_women: formData.escort_required_for_women,

        // OTP fields
        login_boarding_otp: formData.login_boarding_otp || false,
        login_deboarding_otp: formData.login_deboarding_otp || false,
        logout_boarding_otp: formData.logout_boarding_otp || false,
        logout_deboarding_otp: formData.logout_deboarding_otp || false,
      };

      console.log("Saving tenant config payload:", payload);

      const response = await API_CLIENT.put("/v1/tenant-config/", payload);

      if (response.status === 200) {
        return response.data?.data || response.data;
      }

      return rejectWithValue("Failed to save tenant config");
    } catch (error) {
      console.error("Error saving tenant config:", error);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Helper functions
const formatTime = (timeString) => {
  if (!timeString) return "0:00";

  if (timeString.includes(":")) {
    const [hours, minutes] = timeString.split(":");
    return `${parseInt(hours) || 0}:${(parseInt(minutes) || 0)
      .toString()
      .padStart(2, "0")}`;
  }

  const hours = parseInt(timeString) || 0;
  return `${hours}:00`;
};

const formatFullTime = (timeString) => {
  if (!timeString) return "00:00:00";

  if (timeString.includes(":")) {
    const parts = timeString.split(":");
    if (parts.length === 3) {
      return timeString; // Already in HH:MM:SS format
    } else if (parts.length === 2) {
      return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}:00`;
    }
  }

  return `${parseInt(timeString) || 0}:00:00`;
};

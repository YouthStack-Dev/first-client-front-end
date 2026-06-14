import { createSlice } from "@reduxjs/toolkit";
import {
  fetchCutoffsThunk,
  saveCutoffThunk,
  fetchEscortConfigThunk,
  saveEscortConfigThunk,
} from "./cutofftrunk";

const cutoffSlice = createSlice({
  name: "cutoff",
  initialState: {
    data: null,
    loaded: false,          // ← NEW
    escortConfig: null,
    tenantConfig: null,
    tenantLoaded: false,    // ← NEW
    formData: {
      booking_login_cutoff: "0:00",
      cancel_login_cutoff: "0:00",
      booking_logout_cutoff: "0:00",
      cancel_logout_cutoff: "0:00",
      medical_emergency_booking_cutoff: "0:00",
      adhoc_booking_cutoff: "0:00",
      allow_adhoc_booking: false,
      allow_medical_emergency_booking: false,
      escort_required_start_time: "20:00:00",
      escort_required_end_time: "06:00:00",
      escort_required_for_women: false,
      login_boarding_otp: false,
      login_deboarding_otp: false,
      logout_boarding_otp: false,
      logout_deboarding_otp: false,
      speed_limit_kmph: 0,
      schedule_reminder_enabled: false,
      schedule_reminder_minutes: 30,
      one_trip_per_shift_enabled: false,
      auto_move_on_conflict: false,
      driver_max_duty_minutes: 600,
      driver_rest_enforcement: "warn",
      dark_hour_boarding_mode: "off",
      delay_driver_grace_minutes: 10,
      delay_employee_grace_minutes: 5,
      eta_change_threshold_minutes: 5,
      geofence_arrival_radius_meters: 300,
      stale_driver_threshold_minutes: 5,
    },
    status: "idle",
    tenantStatus: "idle",
    error: null,
    tenantError: null,
  },

  reducers: {
    updateFormField: (state, action) => {
      const { name, value } = action.payload;
      if (name in state.formData) {
        state.formData[name] = value;
      }
    },
    resetForm: (state) => {
      if (state.data || state.tenantConfig) {
        state.formData = mapApiDataToForm(state.data, state.tenantConfig);
      }
    },
    setTenantStatus: (state, action) => {
      state.tenantStatus = action.payload;
    },
    resetLoaded: (state) => {          // ← NEW: force re-fetch on next mount
      state.loaded = false;
      state.tenantLoaded = false;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchCutoffsThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCutoffsThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.loaded = true;           // ← NEW
        const cutoff = action.payload?.cutoffs?.[0] || action.payload?.data || null;
        state.data = cutoff;
        if (cutoff) {
          state.formData = { ...state.formData, ...mapCutoffApiDataToForm(cutoff) };
        }
      })
      .addCase(fetchCutoffsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to load cutoff data";
      })

      .addCase(saveCutoffThunk.pending, (state) => {
        state.status = "saving";
        state.error = null;
      })
      .addCase(saveCutoffThunk.fulfilled, (state, action) => {
        state.status = "saved";
        const cutoff = action.payload?.cutoff || action.payload?.data || action.payload;
        if (cutoff) {
          state.data = cutoff;
          state.formData = { ...state.formData, ...mapCutoffApiDataToForm(cutoff) };
        }
      })
      .addCase(saveCutoffThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to save cutoff data";
      })

      .addCase(fetchEscortConfigThunk.pending, (state) => {
        state.tenantStatus = "loading";
        state.tenantError = null;
      })
      .addCase(fetchEscortConfigThunk.fulfilled, (state, action) => {
        state.tenantStatus = "succeeded";
        state.tenantLoaded = true;     // ← NEW
        const tenantConfig = action.payload?.data || action.payload;
        state.tenantConfig = tenantConfig;
        if (tenantConfig) {
          state.formData = { ...state.formData, ...mapTenantApiDataToForm(tenantConfig) };
        }
      })
      .addCase(fetchEscortConfigThunk.rejected, (state, action) => {
        state.tenantStatus = "failed";
        state.tenantError = action.payload || "Failed to load tenant configuration";
      })

      .addCase(saveEscortConfigThunk.pending, (state) => {
        state.tenantStatus = "saving";
        state.tenantError = null;
      })
      .addCase(saveEscortConfigThunk.fulfilled, (state, action) => {
        state.tenantStatus = "saved";
        const tenantConfig = action.payload?.data || action.payload;
        state.tenantConfig = tenantConfig;
        if (tenantConfig) {
          state.formData = { ...state.formData, ...mapTenantApiDataToForm(tenantConfig) };
        }
      })
      .addCase(saveEscortConfigThunk.rejected, (state, action) => {
        state.tenantStatus = "failed";
        state.tenantError = action.payload || "Failed to save tenant configuration";
      });
  },
});

const mapCutoffApiDataToForm = (apiData) => {
  const defaults = {
    booking_login_cutoff: "4:00",
    cancel_login_cutoff: "2:00",
    booking_logout_cutoff: "4:00",
    cancel_logout_cutoff: "2:00",
    medical_emergency_booking_cutoff: "1:00",
    adhoc_booking_cutoff: "2:00",
    allow_adhoc_booking: false,
    allow_medical_emergency_booking: false,
  };
  const fieldMapping = {
    booking_login_cutoff: apiData.booking_login_cutoff,
    cancel_login_cutoff: apiData.cancel_login_cutoff,
    booking_logout_cutoff: apiData.booking_logout_cutoff,
    cancel_logout_cutoff: apiData.cancel_logout_cutoff,
    medical_emergency_booking_cutoff: apiData.medical_emergency_booking_cutoff,
    adhoc_booking_cutoff: apiData.adhoc_booking_cutoff,
    allow_adhoc_booking: apiData.allow_adhoc_booking,
    allow_medical_emergency_booking: apiData.allow_medical_emergency_booking,
  };
  const formData = {};
  Object.keys(defaults).forEach((key) => {
    const apiValue = fieldMapping[key];
    formData[key] = apiValue !== undefined ? apiValue : defaults[key];
  });
  return formData;
};

const mapTenantApiDataToForm = (apiData) => {
  const defaults = {
    escort_required_start_time: "20:00:00",
    escort_required_end_time: "06:00:00",
    escort_required_for_women: false,
    login_boarding_otp: false,
    login_deboarding_otp: false,
    logout_boarding_otp: false,
    logout_deboarding_otp: false,
    speed_limit_kmph: 0,
    schedule_reminder_enabled: false,
    schedule_reminder_minutes: 30,
    one_trip_per_shift_enabled: false,
    auto_move_on_conflict: false,
    driver_max_duty_minutes: 600,
    driver_rest_enforcement: "warn",
    dark_hour_boarding_mode: "off",
    delay_driver_grace_minutes: 10,
    delay_employee_grace_minutes: 5,
    eta_change_threshold_minutes: 5,
    geofence_arrival_radius_meters: 300,
    stale_driver_threshold_minutes: 5,
  };
  const tenantData = apiData?.config || apiData;
  const fieldMapping = {
    escort_required_start_time: tenantData?.escort_required_start_time || tenantData?.start_time,
    escort_required_end_time: tenantData?.escort_required_end_time || tenantData?.end_time,
    escort_required_for_women: tenantData?.escort_required_for_women || tenantData?.required_for_women,
    login_boarding_otp: tenantData?.login_boarding_otp,
    login_deboarding_otp: tenantData?.login_deboarding_otp,
    logout_boarding_otp: tenantData?.logout_boarding_otp,
    logout_deboarding_otp: tenantData?.logout_deboarding_otp,
    speed_limit_kmph: tenantData?.speed_limit_kmph,
    schedule_reminder_enabled: tenantData?.schedule_reminder_enabled,
    schedule_reminder_minutes: tenantData?.schedule_reminder_minutes,
    one_trip_per_shift_enabled: tenantData?.one_trip_per_shift_enabled,
    auto_move_on_conflict: tenantData?.auto_move_on_conflict,
    driver_max_duty_minutes: tenantData?.driver_max_duty_minutes,
    driver_rest_enforcement: tenantData?.driver_rest_enforcement,
    dark_hour_boarding_mode: tenantData?.dark_hour_boarding_mode,
    delay_driver_grace_minutes: tenantData?.delay_driver_grace_minutes,
    delay_employee_grace_minutes: tenantData?.delay_employee_grace_minutes,
    eta_change_threshold_minutes: tenantData?.eta_change_threshold_minutes,
    geofence_arrival_radius_meters: tenantData?.geofence_arrival_radius_meters,
    stale_driver_threshold_minutes: tenantData?.stale_driver_threshold_minutes,
  };
  const formData = {};
  Object.keys(defaults).forEach((key) => {
    const apiValue = fieldMapping[key];
    if (typeof apiValue === "string") {
      if (apiValue.toLowerCase() === "true") formData[key] = true;
      else if (apiValue.toLowerCase() === "false") formData[key] = false;
      else formData[key] = apiValue !== undefined ? apiValue : defaults[key];
    } else {
      formData[key] = apiValue !== undefined ? apiValue : defaults[key];
    }
  });
  return formData;
};

const mapApiDataToForm = (cutoffData, tenantData) => ({
  ...mapCutoffApiDataToForm(cutoffData || {}),
  ...mapTenantApiDataToForm(tenantData || {}),
});

export const { updateFormField, resetForm, setTenantStatus, resetLoaded } =
  cutoffSlice.actions;
export default cutoffSlice.reducer;
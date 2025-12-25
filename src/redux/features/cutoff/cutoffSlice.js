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
    data: null, // Single cutoff record
    escortConfig: null, // Escort configuration
    tenantConfig: null, // Tenant configuration (includes escort + OTP settings)
    formData: {
      // Cutoff fields
      booking_login_cutoff: "0:00",
      cancel_login_cutoff: "0:00",
      booking_logout_cutoff: "0:00",
      cancel_logout_cutoff: "0:00",
      medical_emergency_booking_cutoff: "0:00",
      adhoc_booking_cutoff: "0:00",
      allow_adhoc_booking: false,
      allow_medical_emergency_booking: false,

      // Tenant configuration fields
      escort_required_start_time: "20:00:00",
      escort_required_end_time: "06:00:00",
      escort_required_for_women: false,
      login_boarding_otp: false,
      login_deboarding_otp: false,
      logout_boarding_otp: false,
      logout_deboarding_otp: false,
    },
    status: "idle", // idle | loading | succeeded | failed | saving | saved
    tenantStatus: "idle", // idle | loading | succeeded | failed | saving | saved (for tenant config)
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
  },

  extraReducers: (builder) => {
    builder
      // Fetch Cutoffs
      .addCase(fetchCutoffsThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCutoffsThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        const cutoff =
          action.payload?.cutoffs?.[0] || action.payload?.data || null;
        state.data = cutoff;

        if (cutoff) {
          state.formData = {
            ...state.formData,
            ...mapCutoffApiDataToForm(cutoff),
          };
        }
      })
      .addCase(fetchCutoffsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to load cutoff data";
      })

      // Save Cutoffs
      .addCase(saveCutoffThunk.pending, (state) => {
        state.status = "saving";
        state.error = null;
      })
      .addCase(saveCutoffThunk.fulfilled, (state, action) => {
        state.status = "saved";
        const cutoff =
          action.payload?.cutoff || action.payload?.data || action.payload;
        if (cutoff) {
          state.data = cutoff;
          state.formData = {
            ...state.formData,
            ...mapCutoffApiDataToForm(cutoff),
          };
        }
      })
      .addCase(saveCutoffThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to save cutoff data";
      })

      // Fetch Tenant Config (replaces fetchEscortConfigThunk)
      .addCase(fetchEscortConfigThunk.pending, (state) => {
        state.tenantStatus = "loading";
        state.tenantError = null;
      })
      .addCase(fetchEscortConfigThunk.fulfilled, (state, action) => {
        state.tenantStatus = "succeeded";
        const tenantConfig = action.payload?.data || action.payload;
        state.tenantConfig = tenantConfig;

        if (tenantConfig) {
          state.formData = {
            ...state.formData,
            ...mapTenantApiDataToForm(tenantConfig),
          };
        }
      })
      .addCase(fetchEscortConfigThunk.rejected, (state, action) => {
        state.tenantStatus = "failed";
        state.tenantError =
          action.payload || "Failed to load tenant configuration";
      })

      // Save Tenant Config (replaces saveEscortConfigThunk)
      .addCase(saveEscortConfigThunk.pending, (state) => {
        state.tenantStatus = "saving";
        state.tenantError = null;
      })
      .addCase(saveEscortConfigThunk.fulfilled, (state, action) => {
        state.tenantStatus = "saved";
        const tenantConfig = action.payload?.data || action.payload;
        state.tenantConfig = tenantConfig;

        if (tenantConfig) {
          state.formData = {
            ...state.formData,
            ...mapTenantApiDataToForm(tenantConfig),
          };
        }
      })
      .addCase(saveEscortConfigThunk.rejected, (state, action) => {
        state.tenantStatus = "failed";
        state.tenantError =
          action.payload || "Failed to save tenant configuration";
      });
  },
});

// Helper functions to map API data to form structure
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
  };

  // Map different possible API field names
  const tenantData = apiData?.config || apiData;

  const fieldMapping = {
    // Escort fields
    escort_required_start_time:
      tenantData?.escort_required_start_time || tenantData?.start_time,
    escort_required_end_time:
      tenantData?.escort_required_end_time || tenantData?.end_time,
    escort_required_for_women:
      tenantData?.escort_required_for_women || tenantData?.required_for_women,

    // OTP fields
    login_boarding_otp: tenantData?.login_boarding_otp,
    login_deboarding_otp: tenantData?.login_deboarding_otp,
    logout_boarding_otp: tenantData?.logout_boarding_otp,
    logout_deboarding_otp: tenantData?.logout_deboarding_otp,
  };

  const formData = {};
  Object.keys(defaults).forEach((key) => {
    const apiValue = fieldMapping[key];

    // Convert string 'true'/'false' to boolean if needed
    if (typeof apiValue === "string") {
      if (apiValue.toLowerCase() === "true") {
        formData[key] = true;
      } else if (apiValue.toLowerCase() === "false") {
        formData[key] = false;
      } else {
        formData[key] = apiValue !== undefined ? apiValue : defaults[key];
      }
    } else {
      formData[key] = apiValue !== undefined ? apiValue : defaults[key];
    }
  });

  return formData;
};

// Helper to combine both mappings (optional, for backward compatibility)
const mapApiDataToForm = (cutoffData, tenantData) => {
  return {
    ...mapCutoffApiDataToForm(cutoffData || {}),
    ...mapTenantApiDataToForm(tenantData || {}),
  };
};

export const { updateFormField, resetForm, setTenantStatus } =
  cutoffSlice.actions;
export default cutoffSlice.reducer;

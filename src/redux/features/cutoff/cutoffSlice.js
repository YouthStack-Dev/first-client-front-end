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
    },
    status: "idle", // idle | loading | succeeded | failed | saving | saved
    escortStatus: "idle", // idle | loading | succeeded | failed | saving | saved
    error: null,
    escortError: null,
  },

  reducers: {
    updateFormField: (state, action) => {
      const { name, value } = action.payload;
      if (name in state.formData) {
        state.formData[name] = value;
      }
    },
    resetForm: (state) => {
      if (state.data) {
        state.formData = mapApiDataToForm(state.data, state.escortConfig);
      }
    },
    setEscortStatus: (state, action) => {
      state.escortStatus = action.payload;
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
        const cutoff = action.payload?.cutoffs?.[0] || null;
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
        const cutoff = action.payload?.cutoff || action.payload;
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

      // Fetch Escort Config
      .addCase(fetchEscortConfigThunk.pending, (state) => {
        state.escortStatus = "loading";
        state.escortError = null;
      })
      .addCase(fetchEscortConfigThunk.fulfilled, (state, action) => {
        state.escortStatus = "succeeded";
        const escortConfig = action.payload?.data || action.payload;
        state.escortConfig = escortConfig;

        if (escortConfig) {
          state.formData = {
            ...state.formData,
            ...mapEscortApiDataToForm(escortConfig),
          };
        }
      })
      .addCase(fetchEscortConfigThunk.rejected, (state, action) => {
        state.escortStatus = "failed";
        state.escortError = action.payload || "Failed to load escort config";
      })

      // Save Escort Config
      .addCase(saveEscortConfigThunk.pending, (state) => {
        state.escortStatus = "saving";
        state.escortError = null;
      })
      .addCase(saveEscortConfigThunk.fulfilled, (state, action) => {
        state.escortStatus = "saved";
        const escortConfig = action.payload?.data || action.payload;
        state.escortConfig = escortConfig;

        if (escortConfig) {
          state.formData = {
            ...state.formData,
            ...mapEscortApiDataToForm(escortConfig),
          };
        }
      })
      .addCase(saveEscortConfigThunk.rejected, (state, action) => {
        state.escortStatus = "failed";
        state.escortError = action.payload || "Failed to save escort config";
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

const mapEscortApiDataToForm = (apiData) => {
  const defaults = {
    escort_required_start_time: "20:00:00",
    escort_required_end_time: "06:00:00",
    escort_required_for_women: false,
  };

  // Map different possible API field names
  const escortConfig = apiData?.config || apiData;

  const fieldMapping = {
    escort_required_start_time:
      escortConfig?.start_time || escortConfig?.escort_required_start_time,
    escort_required_end_time:
      escortConfig?.end_time || escortConfig?.escort_required_end_time,
    escort_required_for_women:
      escortConfig?.required_for_women ||
      escortConfig?.escort_required_for_women,
  };

  const formData = {};
  Object.keys(defaults).forEach((key) => {
    const apiValue = fieldMapping[key];
    formData[key] = apiValue !== undefined ? apiValue : defaults[key];
  });

  return formData;
};

export const { updateFormField, resetForm, setEscortStatus } =
  cutoffSlice.actions;
export default cutoffSlice.reducer;

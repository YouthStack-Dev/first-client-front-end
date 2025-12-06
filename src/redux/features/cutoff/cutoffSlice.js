import { createSlice } from "@reduxjs/toolkit";
import { fetchCutoffsThunk, saveCutoffThunk } from "./cutofftrunk";

const cutoffSlice = createSlice({
  name: "cutoff",
  initialState: {
    data: null, // Single cutoff record
    formData: {
      booking_login_cutoff: "0:00",
      cancel_login_cutoff: "0:00",
      booking_logout_cutoff: "0:00",
      cancel_logout_cutoff: "0:00",
      medical_emergency_booking_cutoff: "0:00",
      adhoc_booking_cutoff: "0:00",
      allow_adhoc_booking: false,
      allow_medical_emergency_booking: false,
    },
    status: "idle", // idle | loading | succeeded | failed | saving | saved
    error: null,
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
        state.formData = mapApiDataToForm(state.data);
      }
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
        const cutoff = action.payload?.cutoffs?.[0] || null;
        state.data = cutoff;

        if (cutoff) {
          state.formData = mapApiDataToForm(cutoff);
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
        state.status = "saved"; // Changed from 'succeeded' to 'saved' for UI distinction
        const cutoff = action.payload?.cutoff || action.payload;
        if (cutoff) {
          state.data = cutoff;
          state.formData = mapApiDataToForm(cutoff);
        }
      })
      .addCase(saveCutoffThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to save cutoff data";
      });
  },
});

// Helper function to map API data to form structure
const mapApiDataToForm = (apiData) => {
  // Default values if API doesn't provide them
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

  // Map API field names to form field names
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

  // Merge with defaults, preferring API data when available
  const formData = {};
  Object.keys(defaults).forEach((key) => {
    const apiValue = fieldMapping[key];
    formData[key] = apiValue !== undefined ? apiValue : defaults[key];
  });

  return formData;
};

export const { updateFormField, resetForm } = cutoffSlice.actions;
export default cutoffSlice.reducer;

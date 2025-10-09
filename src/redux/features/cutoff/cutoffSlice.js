import { createSlice } from "@reduxjs/toolkit";
import { fetchCutoffsThunk, saveCutoffThunk } from "./cutofftrunk";

const cutoffSlice = createSlice({
  name: "cutoff",
  initialState: {
    data: null, // Single cutoff record
    formData: {
      booking: "",
      cancellation: "",
    },
    status: "idle", // idle | loading | succeeded | failed | saving
    error: null,
  },

  reducers: {
    updateFormField: (state, action) => {
      const { name, value } = action.payload;
      state.formData[name] = value;
    },
    resetForm: (state) => {
      if (state.data) {
        state.formData = {
          booking: state.data.booking_cutoff
            ? parseFloat(state.data.booking_cutoff.split(":")[0])
            : "",
          cancellation: state.data.cancel_cutoff
            ? parseFloat(state.data.cancel_cutoff.split(":")[0])
            : "",
        };
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
        // Take the first element from cutoffs array
        const cutoff = action.payload?.cutoffs?.[0] || null;
        state.data = cutoff;
        state.formData = {
          booking: cutoff?.booking_cutoff
            ? parseFloat(cutoff.booking_cutoff.split(":")[0])
            : "",
          cancellation: cutoff?.cancel_cutoff
            ? parseFloat(cutoff.cancel_cutoff.split(":")[0])
            : "",
        };
        // console.log("Slice - fetched cutoff:", cutoff);
      })
      .addCase(fetchCutoffsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to load cutoff data";
      })
      .addCase(saveCutoffThunk.pending, (state) => {
        state.status = "saving";
      })
      .addCase(saveCutoffThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        const cutoff = action.payload?.cutoff;
        if (cutoff) {
          state.data = cutoff;
          state.formData = {
            booking: parseFloat(cutoff.booking_cutoff.split(":")[0]),
            cancellation: parseFloat(cutoff.cancel_cutoff.split(":")[0]),
          };
        }
      })
      .addCase(saveCutoffThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to save cutoff data";
      });
  },
});

export const { updateFormField, resetForm } = cutoffSlice.actions;
export default cutoffSlice.reducer;

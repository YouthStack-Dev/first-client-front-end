import { createSlice, createEntityAdapter } from "@reduxjs/toolkit";
import {
  fetchEscortsThunk,
  createEscortThunk,
  updateEscortThunk,
  deleteEscortThunk,
  toggleEscortActiveThunk,
  toggleEscortAvailableThunk,
} from "./escortThunks";

// ------------------------------------------------------
// ENTITY ADAPTER — NORMALIZED STATE
// ------------------------------------------------------
const escortsAdapter = createEntityAdapter({
  selectId: (escort) => escort.escort_id,
});

// ------------------------------------------------------
// INITIAL STATE
// ------------------------------------------------------
const initialState = escortsAdapter.getInitialState({
  loading: false,
  error: null,
  selectedEscort: null,
});

// ------------------------------------------------------
// SLICE
// ------------------------------------------------------
const escortSlice = createSlice({
  name: "escort",
  initialState,
  reducers: {
    clearSelectedEscort: (state) => {
      state.selectedEscort = null;
    },
    setSelectedEscort: (state, action) => {
      state.selectedEscort = action.payload;
    },
    clearEscortError: (state) => {
      // Add this reducer
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // ============================ FETCH =============================
      .addCase(fetchEscortsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEscortsThunk.fulfilled, (state, action) => {
        escortsAdapter.setAll(state, action.payload || []);
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchEscortsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.payload || "Failed to fetch escorts";
      })

      // ============================ CREATE =============================
      .addCase(createEscortThunk.pending, (state) => {
        state.loading = true;
        state.error = null; // Clear previous errors when starting new operation
      })
      .addCase(createEscortThunk.fulfilled, (state, action) => {
        escortsAdapter.addOne(state, action.payload);
        state.loading = false;
        state.error = null;
      })
      .addCase(createEscortThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.payload || "Failed to create escort";
      })

      // ============================ UPDATE =============================
      .addCase(updateEscortThunk.pending, (state) => {
        state.loading = true;
        state.error = null; // Clear previous errors when starting new operation
      })
      .addCase(updateEscortThunk.fulfilled, (state, action) => {
        escortsAdapter.upsertOne(state, action.payload);
        state.loading = false;
        state.error = null;
      })
      .addCase(updateEscortThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.payload || "Failed to update escort";
      })

      // ============================ DELETE =============================
      .addCase(deleteEscortThunk.pending, (state) => {
        state.loading = true;
        state.error = null; // Clear previous errors when starting new operation
      })
      .addCase(deleteEscortThunk.fulfilled, (state, action) => {
        escortsAdapter.removeOne(state, action.payload?.id);
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteEscortThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.payload || "Failed to delete escort";
      })

      // ======================== TOGGLE STATUS ==========================
      .addCase(toggleEscortActiveThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleEscortActiveThunk.fulfilled, (state, action) => {
        escortsAdapter.upsertOne(state, action.payload);
        state.loading = false;
        state.error = null;
      })
      .addCase(toggleEscortActiveThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.payload || "Failed to update active status";
      })
      .addCase(toggleEscortAvailableThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleEscortAvailableThunk.fulfilled, (state, action) => {
        escortsAdapter.upsertOne(state, action.payload);
        state.loading = false;
        state.error = null;
      })
      .addCase(toggleEscortAvailableThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.payload || "Failed to update availability status";
      });
  },
});

// ------------------------------------------------------
// ACTIONS
// ------------------------------------------------------
export const {
  clearSelectedEscort,
  setSelectedEscort,
  clearEscortError, // Export the new action
} = escortSlice.actions;

// ------------------------------------------------------
// REDUCER
// ------------------------------------------------------
export default escortSlice.reducer;

// ------------------------------------------------------
// SELECTORS
// ------------------------------------------------------
export const escortSelectors = escortsAdapter.getSelectors(
  (state) => state.escort
);

export const selectEscortLoading = (state) => state.escort.loading;
export const selectEscortError = (state) => state.escort.error;
export const selectSelectedEscort = (state) => state.escort.selectedEscort;

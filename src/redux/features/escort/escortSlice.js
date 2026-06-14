import { createSlice, createEntityAdapter } from "@reduxjs/toolkit";
import {
  fetchEscortsThunk,
  createEscortThunk,
  updateEscortThunk,
  deleteEscortThunk,
  toggleEscortActiveThunk,
  toggleEscortAvailableThunk,
} from "./escortThunks";

const escortsAdapter = createEntityAdapter({
  selectId: (escort) => escort.escort_id,
});

const initialState = escortsAdapter.getInitialState({
  loading: false,
  error: null,
  selectedEscort: null,
  loaded: false,              // ← NEW: was data ever fetched?
  lastVendorFilter: null,     // ← NEW: which vendor filter was last fetched with?
});

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
      state.error = null;
    },
    resetEscortLoaded: (state) => {   // ← NEW: force re-fetch if ever needed
      state.loaded = false;
      state.lastVendorFilter = null;
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
        state.loaded = true;                              // ← NEW
        state.lastVendorFilter = action.meta.arg?.vendor_id ?? null; // ← NEW
      })
      .addCase(fetchEscortsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.payload || "Failed to fetch escorts";
        // loaded stays false so next mount retries
      })

      // ============================ CREATE =============================
      .addCase(createEscortThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
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
        state.error = null;
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
        state.error = null;
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

export const {
  clearSelectedEscort,
  setSelectedEscort,
  clearEscortError,
  resetEscortLoaded,
} = escortSlice.actions;

export default escortSlice.reducer;

export const escortSelectors = escortsAdapter.getSelectors(
  (state) => state.escort
);

export const selectEscortLoading     = (state) => state.escort.loading;
export const selectEscortError       = (state) => state.escort.error;
export const selectSelectedEscort    = (state) => state.escort.selectedEscort;
export const selectEscortLoaded      = (state) => state.escort.loaded;           // ← NEW
export const selectEscortLastVendor  = (state) => state.escort.lastVendorFilter; // ← NEW
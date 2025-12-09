import { createSlice, createEntityAdapter } from "@reduxjs/toolkit";
import {
  fetchEscortsThunk,
  createEscortThunk,
  updateEscortThunk,
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
        state.error = action.payload;
      })

      // ============================ CREATE =============================
      .addCase(createEscortThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(createEscortThunk.fulfilled, (state, action) => {
        escortsAdapter.addOne(state, action.payload);
        state.loading = false;
      })
      .addCase(createEscortThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ============================ UPDATE =============================
      .addCase(updateEscortThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateEscortThunk.fulfilled, (state, action) => {
        escortsAdapter.upsertOne(state, action.payload);
        state.loading = false;
      })
      .addCase(updateEscortThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// ------------------------------------------------------
// ACTIONS
// ------------------------------------------------------
export const { clearSelectedEscort } = escortSlice.actions;

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

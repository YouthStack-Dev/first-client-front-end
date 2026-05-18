import { createSlice, createEntityAdapter } from "@reduxjs/toolkit";
import {
  fetchNodalPointsThunk,
  createNodalPointThunk,
  updateNodalPointThunk,
  deleteNodalPointThunk,
  assignNodalPointThunk,
  removeEmployeeAssignmentThunk,
  bulkAssignNearestThunk,
} from "./nodalPointsThunks";

// ─── Entity Adapter (normalized by nodal_point_id) ────────────────────────────
const nodalPointsAdapter = createEntityAdapter({
  selectId: (point) => point.nodal_point_id,
});

// ─── Initial State ─────────────────────────────────────────────────────────────
const initialState = nodalPointsAdapter.getInitialState({
  loading: false,
  error: null,
  meta: { total: 0, page: 1, per_page: 20, total_pages: 1 },
  // Assignment operations state
  assignmentLoading: false,
  assignmentError: null,
  lastBulkResult: null,
});

// ─── Slice ─────────────────────────────────────────────────────────────────────
const nodalPointsSlice = createSlice({
  name: "nodalPoints",
  initialState,
  reducers: {
    clearNodalPointError: (state) => {
      state.error = null;
    },
    clearAssignmentError: (state) => {
      state.assignmentError = null;
    },
    clearBulkResult: (state) => {
      state.lastBulkResult = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // ─── FETCH ALL ──────────────────────────────────────────────────────────
      .addCase(fetchNodalPointsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNodalPointsThunk.fulfilled, (state, action) => {
        nodalPointsAdapter.setAll(state, action.payload.items || []);
        state.meta = action.payload.meta || state.meta;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchNodalPointsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch nodal points";
      })

      // ─── CREATE ─────────────────────────────────────────────────────────────
      .addCase(createNodalPointThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNodalPointThunk.fulfilled, (state, action) => {
        nodalPointsAdapter.addOne(state, action.payload);
        state.loading = false;
        state.error = null;
      })
      .addCase(createNodalPointThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create nodal point";
      })

      // ─── UPDATE ─────────────────────────────────────────────────────────────
      .addCase(updateNodalPointThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateNodalPointThunk.fulfilled, (state, action) => {
        nodalPointsAdapter.upsertOne(state, action.payload);
        state.loading = false;
        state.error = null;
      })
      .addCase(updateNodalPointThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update nodal point";
      })

      // ─── DELETE (soft-deactivate) ────────────────────────────────────────────
      .addCase(deleteNodalPointThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteNodalPointThunk.fulfilled, (state, action) => {
        // Soft-delete: mark is_active = false rather than removing from store
        const existing = state.entities[action.payload.id];
        if (existing) {
          nodalPointsAdapter.upsertOne(state, { ...existing, is_active: false });
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteNodalPointThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to deactivate nodal point";
      })

      // ─── ASSIGN EMPLOYEE ────────────────────────────────────────────────────
      .addCase(assignNodalPointThunk.pending, (state) => {
        state.assignmentLoading = true;
        state.assignmentError = null;
      })
      .addCase(assignNodalPointThunk.fulfilled, (state) => {
        state.assignmentLoading = false;
        state.assignmentError = null;
      })
      .addCase(assignNodalPointThunk.rejected, (state, action) => {
        state.assignmentLoading = false;
        state.assignmentError = action.payload?.message || "Failed to assign nodal point";
      })

      // ─── REMOVE ASSIGNMENT ──────────────────────────────────────────────────
      .addCase(removeEmployeeAssignmentThunk.pending, (state) => {
        state.assignmentLoading = true;
        state.assignmentError = null;
      })
      .addCase(removeEmployeeAssignmentThunk.fulfilled, (state) => {
        state.assignmentLoading = false;
        state.assignmentError = null;
      })
      .addCase(removeEmployeeAssignmentThunk.rejected, (state, action) => {
        state.assignmentLoading = false;
        state.assignmentError = action.payload?.message || "Failed to remove assignment";
      })

      // ─── BULK ASSIGN ────────────────────────────────────────────────────────
      .addCase(bulkAssignNearestThunk.pending, (state) => {
        state.assignmentLoading = true;
        state.assignmentError = null;
        state.lastBulkResult = null;
      })
      .addCase(bulkAssignNearestThunk.fulfilled, (state, action) => {
        state.assignmentLoading = false;
        state.assignmentError = null;
        state.lastBulkResult = action.payload;
      })
      .addCase(bulkAssignNearestThunk.rejected, (state, action) => {
        state.assignmentLoading = false;
        state.assignmentError = action.payload?.message || "Failed to bulk-assign";
      });
  },
});

// ─── Actions ──────────────────────────────────────────────────────────────────
export const {
  clearNodalPointError,
  clearAssignmentError,
  clearBulkResult,
} = nodalPointsSlice.actions;

// ─── Reducer ──────────────────────────────────────────────────────────────────
export default nodalPointsSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const nodalPointSelectors = nodalPointsAdapter.getSelectors(
  (state) => state.nodalPoints
);

export const selectNodalPointsLoading = (state) => state.nodalPoints.loading;
export const selectNodalPointsError = (state) => state.nodalPoints.error;
export const selectNodalPointsMeta = (state) => state.nodalPoints.meta;
export const selectAssignmentLoading = (state) => state.nodalPoints.assignmentLoading;
export const selectAssignmentError = (state) => state.nodalPoints.assignmentError;
export const selectLastBulkResult = (state) => state.nodalPoints.lastBulkResult;

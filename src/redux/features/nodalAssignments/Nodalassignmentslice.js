import { createSlice, createEntityAdapter } from "@reduxjs/toolkit";
import {
  assignNodalPoint,
  removeNodalAssignment,
  bulkAssignNearest,
} from "../../features/nodalAssignments/Nodalassignmentthunks";

/* =========================================================
   ENTITY ADAPTER
   Keyed by assignment `id` returned from the API
   ========================================================= */
const nodalAssignmentAdapter = createEntityAdapter({
  selectId: (item) => item.id,
  sortComparer: (a, b) => a.id - b.id,
});

/* =========================================================
   INITIAL STATE
   ========================================================= */
const initialState = nodalAssignmentAdapter.getInitialState({
  loading: false,
  error: null,

  // Separate flags for bulk so it doesn't block the main UI
  bulkLoading: false,
  bulkError: null,
  bulkResult: null, // { assigned: number, skipped: [] }

  lastAction: null, // "assign" | "remove" | "bulk" — useful for toast triggers
});

/* =========================================================
   SLICE
   ========================================================= */
const nodalAssignmentSlice = createSlice({
  name: "nodalAssignment",
  initialState,

  reducers: {
    clearNodalAssignments: (state) => {
      nodalAssignmentAdapter.removeAll(state);
      state.loading = false;
      state.error = null;
      state.bulkLoading = false;
      state.bulkError = null;
      state.bulkResult = null;
      state.lastAction = null;
    },

    clearBulkResult: (state) => {
      state.bulkResult = null;
      state.bulkError = null;
    },

    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* ================= ASSIGN / RE-ASSIGN ================= */
      .addCase(assignNodalPoint.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.lastAction = null;
      })

      .addCase(assignNodalPoint.fulfilled, (state, action) => {
        state.loading = false;
        const assignment = action.payload?.data;
        if (assignment?.id) {
          nodalAssignmentAdapter.upsertOne(state, assignment);
        }
        state.lastAction = "assign";
      })

      .addCase(assignNodalPoint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to assign nodal point";
      })

      /* ================= REMOVE ================= */
      .addCase(removeNodalAssignment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.lastAction = null;
      })

      .addCase(removeNodalAssignment.fulfilled, (state, action) => {
        state.loading = false;
        const { employee_id } = action.payload;

        // Remove the assignment whose employee_id matches
        const existing = Object.values(state.entities).find(
          (a) => a?.employee_id === employee_id
        );
        if (existing?.id) {
          nodalAssignmentAdapter.removeOne(state, existing.id);
        }

        state.lastAction = "remove";
      })

      .addCase(removeNodalAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to remove nodal assignment";
      })

      /* ================= BULK ASSIGN NEAREST ================= */
      .addCase(bulkAssignNearest.pending, (state) => {
        state.bulkLoading = true;
        state.bulkError = null;
        state.bulkResult = null;
        state.lastAction = null;
      })

      .addCase(bulkAssignNearest.fulfilled, (state, action) => {
        state.bulkLoading = false;
        state.bulkResult = action.payload?.data || null;
        state.lastAction = "bulk";
      })

      .addCase(bulkAssignNearest.rejected, (state, action) => {
        state.bulkLoading = false;
        state.bulkError = action.payload || "Failed to bulk assign";
      });
  },
});

/* =========================================================
   EXPORTS
   ========================================================= */
export const { clearNodalAssignments, clearBulkResult, clearError } =
  nodalAssignmentSlice.actions;

export default nodalAssignmentSlice.reducer;
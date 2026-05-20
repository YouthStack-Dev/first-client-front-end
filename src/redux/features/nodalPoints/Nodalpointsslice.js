import { createSlice, createEntityAdapter } from "@reduxjs/toolkit";
import {
  fetchNodalPointsThunk,
  fetchNodalPointByIdThunk,
  createNodalPointThunk,
  updateNodalPointThunk,
  deleteNodalPointThunk,
  fetchNearestNodalPointsThunk,
} from "../nodalPoints/Nodalpointsthunk";

// ── Entity Adapter ────────────────────────────────────────────────────────────
const nodalPointsAdapter = createEntityAdapter({
  selectId: (nodalPoint) => nodalPoint.nodal_point_id,
});

// ── Initial State ─────────────────────────────────────────────────────────────
const initialState = nodalPointsAdapter.getInitialState({
  loading: false,
  error: null,
  nodalPointIdsByTenant: {},  // tenantId -> nodal_point_id[]
  nearestNodalPoints: [],     // results from /nearest
  nearestLoading: false,
  meta: null,                 // pagination meta { total, page, per_page, total_pages }
});

// ── Slice ─────────────────────────────────────────────────────────────────────
const nodalPointsSlice = createSlice({
  name: "nodalPoints",
  initialState,
  reducers: {
    clearNodalPoints: () => initialState,

    clearError: (state) => {
      state.error = null;
    },

    clearNearestNodalPoints: (state) => {
      state.nearestNodalPoints = [];
    },

    clearMeta: (state) => {
      state.meta = null;
    },

    clearNodalPointsByTenant: (state, action) => {
      const tenantId = action.payload;
      if (state.nodalPointIdsByTenant[tenantId]) {
        state.nodalPointIdsByTenant[tenantId].forEach((id) => {
          nodalPointsAdapter.removeOne(state, id);
        });
        delete state.nodalPointIdsByTenant[tenantId];
      }
    },
  },

  extraReducers: (builder) => {
    builder

      // ── Fetch list ────────────────────────────────────────────────────────
      .addCase(fetchNodalPointsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNodalPointsThunk.fulfilled, (state, action) => {
        state.loading = false;
        const { nodalPoints, tenantId, meta } = action.payload;

        nodalPointsAdapter.upsertMany(state, nodalPoints);

        if (tenantId) {
          state.nodalPointIdsByTenant[tenantId] = nodalPoints.map(
            (np) => np.nodal_point_id
          );
        }

        state.meta = meta || null;
      })
      .addCase(fetchNodalPointsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch nodal points";
      })

      // ── Fetch by ID ───────────────────────────────────────────────────────
      .addCase(fetchNodalPointByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNodalPointByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        nodalPointsAdapter.upsertOne(state, action.payload);
      })
      .addCase(fetchNodalPointByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch nodal point";
      })

      // ── Create ────────────────────────────────────────────────────────────
      .addCase(createNodalPointThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNodalPointThunk.fulfilled, (state, action) => {
        state.loading = false;
        const nodalPoint = action.payload;

        if (nodalPoint?.nodal_point_id) {
          nodalPointsAdapter.addOne(state, nodalPoint);

          const tenantId = nodalPoint.tenant_id;
          if (tenantId) {
            if (!state.nodalPointIdsByTenant[tenantId]) {
              state.nodalPointIdsByTenant[tenantId] = [];
            }
            state.nodalPointIdsByTenant[tenantId].push(
              nodalPoint.nodal_point_id
            );
          }

          // Update meta total count if meta exists
          if (state.meta) {
            state.meta.total = (state.meta.total || 0) + 1;
          }
        }
      })
      .addCase(createNodalPointThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create nodal point";
      })

      // ── Update (partial) ──────────────────────────────────────────────────
      .addCase(updateNodalPointThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateNodalPointThunk.fulfilled, (state, action) => {
        state.loading = false;
        const nodalPoint = action.payload;

        if (nodalPoint?.nodal_point_id) {
          nodalPointsAdapter.updateOne(state, {
            id: nodalPoint.nodal_point_id,
            changes: nodalPoint,
          });
        }
      })
      .addCase(updateNodalPointThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update nodal point";
      })

      // ── Soft-delete ───────────────────────────────────────────────────────
      .addCase(deleteNodalPointThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteNodalPointThunk.fulfilled, (state, action) => {
        state.loading = false;
        const { nodalPointId } = action.payload;

        // Soft-delete: set is_active = false, preserve entity in store
        // selectActiveNodalPointsByTenantId will naturally exclude it
        const nodalPoint = state.entities[nodalPointId];
        if (nodalPoint) {
          nodalPoint.is_active = false;
          nodalPoint.updated_at = new Date().toISOString();
        }
      })
      .addCase(deleteNodalPointThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to deactivate nodal point";
      })

      // ── Nearest ───────────────────────────────────────────────────────────
      .addCase(fetchNearestNodalPointsThunk.pending, (state) => {
        state.nearestLoading = true;
        state.error = null;
      })
      .addCase(fetchNearestNodalPointsThunk.fulfilled, (state, action) => {
        state.nearestLoading = false;
        state.nearestNodalPoints = action.payload;
      })
      .addCase(fetchNearestNodalPointsThunk.rejected, (state, action) => {
        state.nearestLoading = false;
        state.error = action.payload || "Failed to fetch nearest nodal points";
      });
  },
});

// ── Action Exports ────────────────────────────────────────────────────────────
export const {
  clearNodalPoints,
  clearError,
  clearNearestNodalPoints,
  clearMeta,
  clearNodalPointsByTenant,
} = nodalPointsSlice.actions;

// ── Adapter Selector Exports ──────────────────────────────────────────────────
export const {
  selectAll: selectAllNodalPoints,
  selectById: selectNodalPointById,
  selectIds: selectNodalPointIds,
  selectEntities: selectNodalPointEntities,
  selectTotal: selectTotalNodalPoints,
} = nodalPointsAdapter.getSelectors((state) => state.nodalPoints);

export default nodalPointsSlice.reducer;
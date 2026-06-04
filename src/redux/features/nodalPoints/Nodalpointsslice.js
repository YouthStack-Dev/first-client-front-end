import { createSlice, createEntityAdapter } from "@reduxjs/toolkit";
import {
  createNodalPointThunk,
  fetchNodalPointsThunk,
  fetchNodalPointByIdThunk,
  updateNodalPointThunk,
  deleteNodalPointThunk,
  fetchNearestNodalPointsThunk,
} from "./Nodalpointsthunk"; 

const nodalPointsAdapter = createEntityAdapter({
  selectId: (np) => np.nodal_point_id,
});

// ── Initial State ─────────────────────────────────────────────────────────────
// getInitialState gives us { ids: [], entities: {} } plus our extra fields
const initialState = nodalPointsAdapter.getInitialState({
  nodalPointIdsByTenant: {},  // { [tenantId]: [id, id, ...] }
  selectedNodalPoint: null,
  nearestNodalPoints: [],
  meta: null,

  loading: {
    fetch: false,
    fetchById: false,
    create: false,
    update: false,
    delete: false,
  },
  nearestLoading: false,        // ← separate flag (selector reads state.nodalPoints.nearestLoading)
  error: null,
});

// ── Slice ─────────────────────────────────────────────────────────────────────
const nodalPointsSlice = createSlice({
  name: "nodalPoints",
  initialState,

  reducers: {
    clearSelectedNodalPoint(state) {
      state.selectedNodalPoint = null;
    },
    clearNodalPointError(state) {
      state.error = null;
    },
    clearNearestNodalPoints(state) {
      state.nearestNodalPoints = [];
    },
  },

  extraReducers: (builder) => {

    // ── fetchNodalPointsThunk ─────────────────────────────────────────────────
    builder
      .addCase(fetchNodalPointsThunk.pending, (state) => {
        state.loading.fetch = true;
        state.error = null;
      })
      .addCase(fetchNodalPointsThunk.fulfilled, (state, action) => {
        state.loading.fetch = false;
        const { nodalPoints, tenantId, meta } = action.payload;

        nodalPointsAdapter.upsertMany(state, nodalPoints);

        // Keep tenant → ids index in sync
        if (tenantId) {
          state.nodalPointIdsByTenant[tenantId] = nodalPoints.map(
                (np) => np.nodal_point_id
                );
        }

        state.meta = meta;
      })
      .addCase(fetchNodalPointsThunk.rejected, (state, action) => {
        state.loading.fetch = false;
        state.error = action.payload;
      });

    // ── fetchNodalPointByIdThunk ──────────────────────────────────────────────
    builder
      .addCase(fetchNodalPointByIdThunk.pending, (state) => {
        state.loading.fetchById = true;
        state.error = null;
      })
      .addCase(fetchNodalPointByIdThunk.fulfilled, (state, action) => {
        state.loading.fetchById = false;
        nodalPointsAdapter.upsertOne(state, action.payload); // keep entity cache warm
        state.selectedNodalPoint = action.payload;
      })
      .addCase(fetchNodalPointByIdThunk.rejected, (state, action) => {
        state.loading.fetchById = false;
        state.error = action.payload;
      });

    // ── createNodalPointThunk ─────────────────────────────────────────────────
    builder
      .addCase(createNodalPointThunk.pending, (state) => {
        state.loading.create = true;
        state.error = null;
      })
      .addCase(createNodalPointThunk.fulfilled, (state, action) => {
        state.loading.create = false;
        const newNp = action.payload;

        nodalPointsAdapter.addOne(state, newNp);

        // Prepend id to the tenant index so it appears first
        const tenantId = newNp.tenant_id;
        if (tenantId) {
          if (!state.nodalPointIdsByTenant[tenantId]) {
            state.nodalPointIdsByTenant[tenantId] = [];
          }
          state.nodalPointIdsByTenant[tenantId].unshift(newNp.id);
        }
      })
      .addCase(createNodalPointThunk.rejected, (state, action) => {
        state.loading.create = false;
        state.error = action.payload;
      });

    // ── updateNodalPointThunk ─────────────────────────────────────────────────
    builder
      .addCase(updateNodalPointThunk.pending, (state) => {
        state.loading.update = true;
        state.error = null;
      })
      .addCase(updateNodalPointThunk.fulfilled, (state, action) => {
        state.loading.update = false;
        nodalPointsAdapter.upsertOne(state, action.payload);

        if (state.selectedNodalPoint?.id === action.payload.id) {
          state.selectedNodalPoint = action.payload;
        }
      })
      .addCase(updateNodalPointThunk.rejected, (state, action) => {
        state.loading.update = false;
        state.error = action.payload;
      });

    // ── deleteNodalPointThunk ─────────────────────────────────────────────────
    builder
      .addCase(deleteNodalPointThunk.pending, (state) => {
        state.loading.delete = true;
        state.error = null;
      })
      .addCase(deleteNodalPointThunk.fulfilled, (state, action) => {
        state.loading.delete = false;
        const { nodalPointId } = action.payload;

        nodalPointsAdapter.removeOne(state, nodalPointId);

        // Scrub id from every tenant's index
        Object.keys(state.nodalPointIdsByTenant).forEach((tid) => {
          state.nodalPointIdsByTenant[tid] = state.nodalPointIdsByTenant[
            tid
          ].filter((id) => id !== nodalPointId);
        });

        if (state.selectedNodalPoint?.id === nodalPointId) {
          state.selectedNodalPoint = null;
        }
      })
      .addCase(deleteNodalPointThunk.rejected, (state, action) => {
        state.loading.delete = false;
        state.error = action.payload;
      });

    // ── fetchNearestNodalPointsThunk ──────────────────────────────────────────
    builder
      .addCase(fetchNearestNodalPointsThunk.pending, (state) => {
        state.nearestLoading = true;    // ← flat flag, not inside loading{}
        state.error = null;
      })
      .addCase(fetchNearestNodalPointsThunk.fulfilled, (state, action) => {
        state.nearestLoading = false;
        state.nearestNodalPoints = action.payload;
      })
      .addCase(fetchNearestNodalPointsThunk.rejected, (state, action) => {
        state.nearestLoading = false;
        state.error = action.payload;
      });
  },
});

// ── Actions ───────────────────────────────────────────────────────────────────
export const {
  clearSelectedNodalPoint,
  clearNodalPointError,
  clearNearestNodalPoints,
} = nodalPointsSlice.actions;

// ── Entity Adapter Selectors (consumed by Nodalpointsselectors.js) ─────────────
const adapterSelectors = nodalPointsAdapter.getSelectors(
  (state) => state.nodalPoints
);

export const selectAllNodalPoints     = adapterSelectors.selectAll;
export const selectNodalPointEntities = adapterSelectors.selectEntities;
export const selectNodalPointById     = adapterSelectors.selectById;
export const selectNodalPointIds      = adapterSelectors.selectIds;

export default nodalPointsSlice.reducer;
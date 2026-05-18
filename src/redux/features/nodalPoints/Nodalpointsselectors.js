import { createSelector } from "@reduxjs/toolkit";
import {
  selectNodalPointEntities,
  selectAllNodalPoints,
} from "./NodalPointsSlice";

// ── Primitive selectors ───────────────────────────────────────────────────────

export const selectNodalPointsLoading = (state) =>
  state.nodalPoints.loading;

export const selectNearestLoading = (state) =>
  state.nodalPoints.nearestLoading;

export const selectNodalPointsError = (state) =>
  state.nodalPoints.error;

export const selectNearestNodalPoints = (state) =>
  state.nodalPoints.nearestNodalPoints;

export const selectNodalPointsMeta = (state) =>
  state.nodalPoints.meta;

// ── Pagination selectors ──────────────────────────────────────────────────────

export const selectNodalPointsCurrentPage = (state) =>
  state.nodalPoints.meta?.page || 1;

export const selectNodalPointsTotalPages = (state) =>
  state.nodalPoints.meta?.total_pages || 1;

export const selectNodalPointsTotal = (state) =>
  state.nodalPoints.meta?.total || 0;

export const selectNodalPointsPerPage = (state) =>
  state.nodalPoints.meta?.per_page || 20;

// ── Nodal points by tenant ID ─────────────────────────────────────────────────
// Usage: selectNodalPointsByTenantId(state, "SAM001")
export const selectNodalPointsByTenantId = createSelector(
  [
    (state) => state.nodalPoints.nodalPointIdsByTenant,
    selectNodalPointEntities,
    (_, tenantId) => tenantId,
  ],
  (nodalPointIdsByTenant, nodalPointEntities, tenantId) => {
    if (!tenantId || !nodalPointIdsByTenant[tenantId]) return [];

    return nodalPointIdsByTenant[tenantId]
      .map((id) => nodalPointEntities[id])
      .filter(Boolean);
  }
);

// ── Active nodal points only (for a tenant) ───────────────────────────────────
// Usage: selectActiveNodalPointsByTenantId(state, "SAM001")
export const selectActiveNodalPointsByTenantId = createSelector(
  [selectNodalPointsByTenantId],
  (nodalPoints) => nodalPoints.filter((np) => np.is_active)
);

// ── Inactive nodal points (for a tenant) ─────────────────────────────────────
// Usage: selectInactiveNodalPointsByTenantId(state, "SAM001")
export const selectInactiveNodalPointsByTenantId = createSelector(
  [selectNodalPointsByTenantId],
  (nodalPoints) => nodalPoints.filter((np) => !np.is_active)
);

// ── Count selectors ───────────────────────────────────────────────────────────
export const selectActiveNodalPointsCount = createSelector(
  [selectAllNodalPoints],
  (nodalPoints) => nodalPoints.filter((np) => np.is_active).length
);

export const selectInactiveNodalPointsCount = createSelector(
  [selectAllNodalPoints],
  (nodalPoints) => nodalPoints.filter((np) => !np.is_active).length
);

// ── Nearest nodal points — enriched with distance_km ─────────────────────────
// Nearest results already include distance_km from the API
// This selector sorts them ascending (nearest first) just in case
export const selectNearestNodalPointsSorted = createSelector(
  [selectNearestNodalPoints],
  (nearestPoints) =>
    [...nearestPoints].sort((a, b) => a.distance_km - b.distance_km)
);

// ── Re-exports from slice ─────────────────────────────────────────────────────
export { selectNodalPointById } from "./NodalPointsSlice";
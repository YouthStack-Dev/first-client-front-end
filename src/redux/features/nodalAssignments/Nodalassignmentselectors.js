import { createEntityAdapter } from "@reduxjs/toolkit";

const nodalAssignmentAdapter = createEntityAdapter({
  selectId: (item) => item.id,
});

// Base adapter selectors scoped to the slice
const adapterSelectors = nodalAssignmentAdapter.getSelectors(
  (state) => state.nodalAssignment
);

/* =========================================================
   ADAPTER SELECTORS
   ========================================================= */

/** All assignment records */
export const selectAllNodalAssignments = adapterSelectors.selectAll;

/** Single assignment by its primary `id` */
export const selectNodalAssignmentById = adapterSelectors.selectById;

/** Total number of assignments in state */
export const selectNodalAssignmentTotal = adapterSelectors.selectTotal;

/* =========================================================
   DERIVED SELECTORS
   ========================================================= */

/**
 * Find assignment by employee_id.
 * Usage: selectNodalAssignmentByEmployeeId(state, 101)
 */
export const selectNodalAssignmentByEmployeeId = (state, employeeId) => {
  const all = adapterSelectors.selectAll(state);
  return all.find((a) => a.employee_id === employeeId) ?? null;
};

/**
 * Returns true if the employee has a manually overridden assignment.
 * Usage: selectIsAssignmentOverridden(state, 101)
 */
export const selectIsAssignmentOverridden = (state, employeeId) => {
  const assignment = selectNodalAssignmentByEmployeeId(state, employeeId);
  return assignment?.is_overridden ?? false;
};

/* =========================================================
   LOADING / ERROR SELECTORS
   ========================================================= */

/** Loading state for assign / remove actions */
export const selectNodalAssignmentLoading = (state) =>
  state.nodalAssignment?.loading ?? false;

/** Error for assign / remove actions */
export const selectNodalAssignmentError = (state) =>
  state.nodalAssignment?.error ?? null;

/** Loading state specifically for bulk-assign */
export const selectBulkAssignLoading = (state) =>
  state.nodalAssignment?.bulkLoading ?? false;

/** Error specifically for bulk-assign */
export const selectBulkAssignError = (state) =>
  state.nodalAssignment?.bulkError ?? null;

/**
 * Result payload from the last bulk-assign call.
 * Shape: { assigned: number, skipped: [{ employee_id, reason }] }
 */
export const selectBulkAssignResult = (state) =>
  state.nodalAssignment?.bulkResult ?? null;

/**
 * Last action performed — useful for showing the right toast.
 * Values: "assign" | "remove" | "bulk" | null
 */
export const selectNodalLastAction = (state) =>
  state.nodalAssignment?.lastAction ?? null;
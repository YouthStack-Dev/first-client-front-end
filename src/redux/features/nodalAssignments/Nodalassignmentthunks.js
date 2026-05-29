import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";

/* =========================================================
   ASSIGN (or RE-ASSIGN) NODAL POINT TO EMPLOYEE
   POST /api/v1/nodal-points/employees/{employee_id}/assign
   ========================================================= */
export const assignNodalPoint = createAsyncThunk(
  "nodalAssignment/assign",
  async ({ employee_id, tenant_id, nodal_point_id, is_overridden = false }, { rejectWithValue }) => {
    if (!employee_id) {
      return rejectWithValue("employee_id is required");
    }
    if (!tenant_id) {
      return rejectWithValue("tenant_id is required");
    }

    try {
      const body = { is_overridden };
      if (nodal_point_id !== undefined && nodal_point_id !== null) {
        body.nodal_point_id = nodal_point_id;
      }

      const response = await API_CLIENT.post(
        `/nodal-points/employees/${employee_id}/assign`,
        body,
        { params: { tenant_id } }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to assign nodal point"
      );
    }
  }
);

/* =========================================================
   REMOVE EMPLOYEE'S NODAL ASSIGNMENT
   DELETE /api/v1/nodal-points/employees/{employee_id}
   ========================================================= */
export const removeNodalAssignment = createAsyncThunk(
  "nodalAssignment/remove",
  async ({ employee_id, tenant_id }, { rejectWithValue }) => {
    if (!employee_id) {
      return rejectWithValue("employee_id is required");
    }
    if (!tenant_id) {
      return rejectWithValue("tenant_id is required");
    }

    try {
      const response = await API_CLIENT.delete(
        `/nodal-points/employees/${employee_id}`,
        { params: { tenant_id } }
      );

      // Return employee_id so the slice can remove it from state
      return { ...response.data, employee_id };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to remove nodal assignment"
      );
    }
  }
);

/* =========================================================
   BULK AUTO-ASSIGN NEAREST HUB TO ALL EMPLOYEES
   POST /api/v1/nodal-points/employees/bulk-assign-nearest
   ========================================================= */
export const bulkAssignNearest = createAsyncThunk(
  "nodalAssignment/bulkAssignNearest",
  async ({ tenant_id }, { rejectWithValue }) => {
    if (!tenant_id) {
      return rejectWithValue("tenant_id is required");
    }

    try {
      const response = await API_CLIENT.post(
        `/nodal-points/employees/bulk-assign-nearest`,
        {},
        { params: { tenant_id } }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to bulk assign nodal points"
      );
    }
  }
);
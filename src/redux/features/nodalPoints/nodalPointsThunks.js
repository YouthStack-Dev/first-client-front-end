import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";

// ─── shared helpers (same pattern as escortThunks.js) ─────────────────────────
const getPayload = (response) => {
  const body = response?.data;
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  return body?.data ?? body;
};

const getErrorPayload = (error, fallbackMessage) => {
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string") return { message: detail };
  if (detail?.message) {
    return {
      message: detail.message,
      errorCode: detail.error_code,
      status: error?.response?.status,
    };
  }
  return {
    message: error?.response?.data?.message || error?.message || fallbackMessage,
    status: error?.response?.status,
  };
};

// ─── Nodal Points CRUD ─────────────────────────────────────────────────────────

export const fetchNodalPointsThunk = createAsyncThunk(
  "nodalPoints/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.get("/nodal-points/", { params });
      const body = response?.data;
      // API returns { success, data: [...], meta: {...} }
      return {
        items: Array.isArray(body?.data) ? body.data : [],
        meta: body?.meta || {},
      };
    } catch (error) {
      return rejectWithValue(getErrorPayload(error, "Failed to fetch nodal points"));
    }
  }
);

export const createNodalPointThunk = createAsyncThunk(
  "nodalPoints/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.post("/nodal-points/", data);
      return getPayload(response);
    } catch (error) {
      return rejectWithValue(getErrorPayload(error, "Failed to create nodal point"));
    }
  }
);

export const updateNodalPointThunk = createAsyncThunk(
  "nodalPoints/update",
  async ({ id, data, tenant_id }, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.put(
        `/nodal-points/${id}`,
        data,
        { params: { tenant_id } }
      );
      return getPayload(response);
    } catch (error) {
      return rejectWithValue(getErrorPayload(error, "Failed to update nodal point"));
    }
  }
);

export const deleteNodalPointThunk = createAsyncThunk(
  "nodalPoints/delete",
  async ({ id, tenant_id }, { rejectWithValue }) => {
    try {
      await API_CLIENT.delete(`/nodal-points/${id}`, { params: { tenant_id } });
      return { id };
    } catch (error) {
      return rejectWithValue(getErrorPayload(error, "Failed to deactivate nodal point"));
    }
  }
);

// ─── Employee Assignment ───────────────────────────────────────────────────────

export const assignNodalPointThunk = createAsyncThunk(
  "nodalPoints/assignEmployee",
  async ({ employee_id, tenant_id, nodal_point_id, is_overridden }, { rejectWithValue }) => {
    try {
      const body = {};
      if (nodal_point_id !== undefined) body.nodal_point_id = nodal_point_id;
      if (is_overridden !== undefined) body.is_overridden = is_overridden;

      const response = await API_CLIENT.post(
        `/nodal-points/employees/${employee_id}/assign`,
        body,
        { params: { tenant_id } }
      );
      return getPayload(response);
    } catch (error) {
      return rejectWithValue(getErrorPayload(error, "Failed to assign nodal point"));
    }
  }
);

export const fetchEmployeeAssignmentThunk = createAsyncThunk(
  "nodalPoints/fetchEmployeeAssignment",
  async ({ employee_id, tenant_id }, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.get(
        `/nodal-points/employees/${employee_id}`,
        { params: { tenant_id } }
      );
      return { employee_id, assignment: getPayload(response) };
    } catch (error) {
      return rejectWithValue(getErrorPayload(error, "Failed to fetch employee assignment"));
    }
  }
);

export const removeEmployeeAssignmentThunk = createAsyncThunk(
  "nodalPoints/removeEmployeeAssignment",
  async ({ employee_id, tenant_id }, { rejectWithValue }) => {
    try {
      await API_CLIENT.delete(
        `/nodal-points/employees/${employee_id}`,
        { params: { tenant_id } }
      );
      return { employee_id };
    } catch (error) {
      return rejectWithValue(getErrorPayload(error, "Failed to remove assignment"));
    }
  }
);

export const bulkAssignNearestThunk = createAsyncThunk(
  "nodalPoints/bulkAssignNearest",
  async ({ tenant_id }, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.post(
        "/nodal-points/employees/bulk-assign-nearest",
        {},
        { params: { tenant_id } }
      );
      return getPayload(response);
    } catch (error) {
      return rejectWithValue(getErrorPayload(error, "Failed to bulk-assign nodal points"));
    }
  }
);

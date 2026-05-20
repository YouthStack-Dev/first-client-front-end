import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";

// ── POST /api/v1/nodal-points/ ────────────────────────────────────────────────
export const createNodalPointThunk = createAsyncThunk(
  "nodalPoints/createNodalPoint",
  async (nodalPointData, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.post(
        `/nodal-points/`,
        nodalPointData  // tenant_id is part of body per API spec
      );
      if (response.status === 201) {
        return response.data.data;
      } else {
        return rejectWithValue("Failed to create nodal point");
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail?.message ||
        error.response?.data?.message ||
        error.message ||
        "Network error"
      );
    }
  }
);

// ── GET /api/v1/nodal-points/ ─────────────────────────────────────────────────
export const fetchNodalPointsThunk = createAsyncThunk(
  "nodalPoints/fetchNodalPoints",
  async (queryParams = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          queryString.append(key, value);
        }
      });

      const url = `/nodal-points/${
        queryString.toString() ? `?${queryString.toString()}` : ""
      }`;

      const response = await API_CLIENT.get(url);

      if (response.data.success) {
        return {
          nodalPoints: Array.isArray(response.data.data)
            ? response.data.data
            : [],
          tenantId: queryParams.tenant_id,
          meta: response.data.meta || null,
        };
      } else {
        return rejectWithValue(
          response.data.message || "Failed to fetch nodal points"
        );
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail?.message ||
        error.response?.data?.message ||
        error.message ||
        "Network error"
      );
    }
  }
);

// ── GET /api/v1/nodal-points/{nodal_point_id} ─────────────────────────────────
export const fetchNodalPointByIdThunk = createAsyncThunk(
  "nodalPoints/fetchNodalPointById",
  async ({ nodalPointId, tenantId }, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.get(
        `/nodal-points/${nodalPointId}?tenant_id=${tenantId}`
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data.message || "Failed to fetch nodal point"
        );
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail?.message ||
        error.response?.data?.message ||
        error.message ||
        "Network error"
      );
    }
  }
);

// ── PUT /api/v1/nodal-points/{nodal_point_id} ────────────────────────────────
export const updateNodalPointThunk = createAsyncThunk(
  "nodalPoints/updateNodalPoint",
  async ({ nodalPointId, tenantId, nodalPointData }, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.put(
        `/nodal-points/${nodalPointId}?tenant_id=${tenantId}`,
        nodalPointData
      );

      if (response.status === 200) {
        return response.data.data;
      } else {
        return rejectWithValue("Failed to update nodal point");
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail?.message ||
        error.response?.data?.message ||
        error.message ||
        "Network error"
      );
    }
  }
);

// ── DELETE /api/v1/nodal-points/{nodal_point_id}  (soft-delete) ───────────────
export const deleteNodalPointThunk = createAsyncThunk(
  "nodalPoints/deleteNodalPoint",
  async ({ nodalPointId, tenantId }, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.delete(
        `/nodal-points/${nodalPointId}?tenant_id=${tenantId}`
      );

      if (response.data.success) {
        return { nodalPointId };
      } else {
        return rejectWithValue(
          response.data.message || "Failed to deactivate nodal point"
        );
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail?.message ||
        error.response?.data?.message ||
        error.message ||
        "Network error"
      );
    }
  }
);

// ── GET /api/v1/nodal-points/nearest ─────────────────────────────────────────
export const fetchNearestNodalPointsThunk = createAsyncThunk(
  "nodalPoints/fetchNearestNodalPoints",
  async ({ tenantId, latitude, longitude, limit, isActive }, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams();
      queryString.append("tenant_id", tenantId);
      queryString.append("latitude", latitude);
      queryString.append("longitude", longitude);
      if (limit !== undefined && limit !== null) {
        queryString.append("limit", limit);
      }
      if (isActive !== undefined && isActive !== null) {
        queryString.append("is_active", isActive);
      }

      const response = await API_CLIENT.get(
        `/nodal-points/nearest?${queryString.toString()}`
      );

      if (response.data.success) {
        return response.data.data || [];
      } else {
        return rejectWithValue(
          response.data.message || "Failed to fetch nearest nodal points"
        );
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail?.message ||
        error.response?.data?.message ||
        error.message ||
        "Network error"
      );
    }
  }
);
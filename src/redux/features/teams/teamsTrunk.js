import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";
import endpoint from "../../../Api/Endpoints";
import { logDebug, logError } from "../../../utils/logger";

/**
 * Fetch teams with optional query parameters
 * @param {Object} queryParams - Query parameters (tenant_id, skip, limit, etc.)
 */
export const fetchTeamsThunk = createAsyncThunk(
  "teams/fetchTeams",
  async (queryParams = {}, { rejectWithValue }) => {
    try {
      logDebug("Fetching teams with params:", queryParams);

      const response = await API_CLIENT.get(endpoint.getDepartments, {
        params: queryParams,
      });

      logDebug("Teams API response:", response.data);

      // Handle the response format: { success, message, data: { total, items }, timestamp }
      const responseData = response.data;

      if (responseData?.success && responseData?.data) {
        return {
          items: responseData.data.items || [],
          total: responseData.data.total || 0,
          tenantId: queryParams.tenant_id || null,
        };
      }

      // Fallback for different response formats
      if (responseData?.data?.items) {
        return {
          items: responseData.data.items,
          total: responseData.data.total || responseData.data.items.length,
          tenantId: queryParams.tenant_id || null,
        };
      }

      // If response is directly an array
      if (Array.isArray(responseData)) {
        return {
          items: responseData,
          total: responseData.length,
          tenantId: queryParams.tenant_id || null,
        };
      }

      return {
        items: [],
        total: 0,
        tenantId: queryParams.tenant_id || null,
      };
    } catch (error) {
      logError("Failed to fetch teams:", error);
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.detail ||
          error.message ||
          "Failed to fetch teams"
      );
    }
  }
);

export const toggleTeamStatus = createAsyncThunk(
  "teams/toggleTeamStatus",
  async ({ teamId }, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.patch(`/teams/${teamId}/toggle-status`);

      return {
        teamId,
        data: response.data,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Failed to toggle team status"
      );
    }
  }
);

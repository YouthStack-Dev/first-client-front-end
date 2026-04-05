import { createSlice } from "@reduxjs/toolkit";
import { logDebug } from "../../../utils/logger";
import { fetchTeamsThunk, toggleTeamStatus } from "./teamsTrunk";

// Helper function to normalize array to object
const normalizeArrayToObject = (array, key) => {
  return array.reduce((acc, item) => {
    acc[item[key]] = item;
    return acc;
  }, {});
};

// Initial state with normalized structure for O(1) access
const initialState = {
  teams: {
    byId: {}, // O(1) access by team_id: { team_id: teamData }
    allIds: [], // Array of all team IDs
    byTenant: {}, // O(1) access by tenant_id: { tenant_id: [team_ids] }
  },
  loading: false,
  error: null,
  total: 0, // Total count from API
  togglingTeamId: null, // Track which team is being toggled
};

const teamsSlice = createSlice({
  name: "teams",
  initialState,
  reducers: {
    // Keep only clearError reducer for error handling
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch teams pending
      .addCase(fetchTeamsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Fetch teams fulfilled
      .addCase(fetchTeamsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        const { items, total, tenantId } = action.payload;

        if (!items || items.length === 0) {
          logDebug("No teams in response");
          return;
        }

        // Normalize teams by ID
        const normalizedTeams = normalizeArrayToObject(items, "team_id");
        state.teams.byId = { ...state.teams.byId, ...normalizedTeams };

        // Update allIds (avoid duplicates)
        items.forEach((team) => {
          const teamId = team.team_id || team.id;
          if (teamId && !state.teams.allIds.includes(teamId)) {
            state.teams.allIds.push(teamId);
          }
        });

        // Update byTenant structure for O(1) access
        if (tenantId) {
          // Replace teams for this specific tenant
          const teamIds = items
            .map((team) => team.team_id || team.id)
            .filter(Boolean);
          state.teams.byTenant[tenantId] = teamIds;
        } else {
          // Update all tenants
          items.forEach((team) => {
            const teamTenantId = team.tenant_id;
            const teamId = team.team_id || team.id;
            if (teamTenantId && teamId) {
              if (!state.teams.byTenant[teamTenantId]) {
                state.teams.byTenant[teamTenantId] = [];
              }
              if (!state.teams.byTenant[teamTenantId].includes(teamId)) {
                state.teams.byTenant[teamTenantId].push(teamId);
              }
            }
          });
        }

        // Update total count
        state.total = total || items.length;

        logDebug("Teams fetched and normalized:",
           {
          totalTeams: state.teams.allIds.length,
          totalFromAPI: total,
          tenants: Object.keys(state.teams.byTenant).length,
        });
      })
      // Fetch teams rejected
      .addCase(fetchTeamsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch teams";
        logDebug("Failed to fetch teams:", action.payload);
      })
      // Toggle team status pending
      .addCase(toggleTeamStatus.pending, (state, action) => {
        state.togglingTeamId = action.meta.arg.teamId;
        state.error = null;
        logDebug("Toggling team status for teamId:", action.meta.arg.teamId);
      })
      // Toggle team status fulfilled
      .addCase(toggleTeamStatus.fulfilled, (state, action) => {
        const { teamId, data } = action.payload;
        state.togglingTeamId = null;

        // Check if we have the team data in the expected format
        if (data && data.data && data.data.team) {
          const updatedTeam = data.data.team;
          const teamIdKey = updatedTeam.team_id || teamId;

          // Update the team in byId structure
          if (state.teams.byId[teamIdKey]) {
            state.teams.byId[teamIdKey] = {
              ...state.teams.byId[teamIdKey],
              ...updatedTeam,
              is_active: updatedTeam.is_active,
              updated_at: updatedTeam.updated_at,
            };

            logDebug("Team status updated successfully:", {
              teamId: teamIdKey,
              newStatus: updatedTeam.is_active,
              updatedTeam: state.teams.byId[teamIdKey],
            });
          } else {
            // If team doesn't exist in state, add it
            state.teams.byId[teamIdKey] = updatedTeam;

            // Add to allIds if not present
            if (!state.teams.allIds.includes(teamIdKey)) {
              state.teams.allIds.push(teamIdKey);
            }

            // Add to byTenant structure
            const tenantId = updatedTeam.tenant_id;
            if (tenantId) {
              if (!state.teams.byTenant[tenantId]) {
                state.teams.byTenant[tenantId] = [];
              }
              if (!state.teams.byTenant[tenantId].includes(teamIdKey)) {
                state.teams.byTenant[tenantId].push(teamIdKey);
              }
            }

            logDebug("Team added to state after toggle:", {
              teamId: teamIdKey,
              tenantId: tenantId,
            });
          }
        } else {
          // Fallback: Update just the is_active status if data format is different
          if (state.teams.byId[teamId]) {
            state.teams.byId[teamId] = {
              ...state.teams.byId[teamId],
              is_active: !state.teams.byId[teamId].is_active,
              updated_at: new Date().toISOString(),
            };
            logDebug("Team status toggled (fallback):", {
              teamId,
              newStatus: state.teams.byId[teamId].is_active,
            });
          }
        }
      })
      // Toggle team status rejected
      .addCase(toggleTeamStatus.rejected, (state, action) => {
        state.togglingTeamId = null;
        state.error = action.payload || "Failed to toggle team status";
        logDebug("Failed to toggle team status:", action.payload);
      });
  },
});

// Export only clearError reducer
export const { clearError } = teamsSlice.actions;

// Selectors for accessing state
export const selectTeams = (state) => state.teams.teams;
export const selectTeamById = (teamId) => (state) =>
  state.teams.teams.byId[teamId];
export const selectTeamsByTenant = (tenantId) => (state) => {
  const teamIds = state.teams.teams.byTenant[tenantId] || [];
  return teamIds.map((id) => state.teams.teams.byId[id]).filter(Boolean);
};
export const selectTeamsLoading = (state) => state.teams.loading;
export const selectTeamsError = (state) => state.teams.error;
export const selectTogglingTeamId = (state) => state.teams.togglingTeamId;

export default teamsSlice.reducer;

import { createSelector } from "@reduxjs/toolkit";

// Base selector - get the entire teams state
export const selectTeamsState = (state) => state.teams;

// Basic selectors
export const selectTeamsLoading = createSelector(
  [selectTeamsState],
  (teamsState) => teamsState.loading
);

export const selectTeamsError = createSelector(
  [selectTeamsState],
  (teamsState) => teamsState.error
);

export const selectTeamsById = createSelector(
  [selectTeamsState],
  (teamsState) => teamsState.teams.byId
);

export const selectTeamsAllIds = createSelector(
  [selectTeamsState],
  (teamsState) => teamsState.teams.allIds
);

export const selectTeamsByTenant = createSelector(
  [selectTeamsState],
  (teamsState) => teamsState.teams.byTenant
);

// Add selector for togglingTeamId
export const selectTogglingTeamId = createSelector(
  [selectTeamsState],
  (teamsState) => teamsState.togglingTeamId
);

// Derived selectors - get all teams as array
export const selectAllTeams = createSelector(
  [selectTeamsById, selectTeamsAllIds],
  (teamsById, allIds) => allIds.map((id) => teamsById[id]).filter(Boolean)
);

// Selector to get teams by tenant ID (O(1) access) - USED in your component
export const selectTeamsByTenantId = createSelector(
  [selectTeamsById, selectTeamsByTenant, (state, tenantId) => tenantId],
  (teamsById, byTenant, tenantId) => {
    if (!tenantId) return [];
    const teamIds = byTenant[tenantId] || [];
    return teamIds.map((id) => teamsById[id]).filter(Boolean);
  }
);

// Selector to get a single team by ID (O(1) access) - KEEPING as it's useful
export const selectTeamById = createSelector(
  [selectTeamsById, (state, teamId) => teamId],
  (teamsById, teamId) => teamsById[teamId] || null
);

// Selector to get unique tenants from teams data - USED in your component
export const selectUniqueTenantsFromTeams = createSelector(
  [selectAllTeams],
  (teams) => {
    const tenantMap = {};
    teams.forEach((team) => {
      if (team.tenant_id && !tenantMap[team.tenant_id]) {
        tenantMap[team.tenant_id] = {
          tenant_id: team.tenant_id,
          tenant_name: team.tenant_name || `Tenant ${team.tenant_id}`,
        };
      }
    });
    return Object.values(tenantMap);
  }
);

// Selector to get total count of teams - OPTIONAL but useful for pagination
export const selectTotalTeamsCount = createSelector(
  [selectTeamsAllIds],
  (allIds) => allIds.length
);

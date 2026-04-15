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
  (teamsById, allIds) => {
    if (!allIds || allIds.length === 0) return [];
    return allIds.map((id) => teamsById[id]).filter(Boolean);
  }
);

// Factory to create memoized team-by-tenant selector
const teamsByTenantCache = {};

export const makeSelectTeamsByTenantId = (tenantId) => {
  if (!teamsByTenantCache[tenantId]) {
    teamsByTenantCache[tenantId] = createSelector(
      [selectTeamsById, selectTeamsByTenant],
      (teamsById, byTenant) => {
        if (!tenantId) return [];
        const teamIds = byTenant[tenantId] || [];
        if (!teamIds || teamIds.length === 0) return [];
        return teamIds.map((id) => teamsById[id]).filter(Boolean);
      }
    );
  }
  return teamsByTenantCache[tenantId];
};

// Factory to create memoized team-by-id selector
const teamByIdCache = {};

export const makeSelectTeamById = (teamId) => {
  if (!teamByIdCache[teamId]) {
    teamByIdCache[teamId] = createSelector(
      [selectTeamsById],
      (teamsById) => teamsById[teamId] || null
    );
  }
  return teamByIdCache[teamId];
};

// Selector to get unique tenants from teams data - USED in your component
export const selectUniqueTenantsFromTeams = createSelector(
  [selectAllTeams],
  (teams) => {
    if (!teams || teams.length === 0) return [];
    
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

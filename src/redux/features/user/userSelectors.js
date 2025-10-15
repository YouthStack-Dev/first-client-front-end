import { createSelector } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

// Basic selectors
const selectTeamsState = (state) => state.user.teams;

// Team selectors
export const selectAllTeamIds = createSelector(
  selectTeamsState,
  (teams) => teams.allIds
);

export const selectTeamById = (state, teamId) =>
  selectTeamsState(state).byId[teamId] || null;

export const selectAllTeams = createSelector(selectTeamsState, (teams) =>
  teams.allIds.map((id) => teams.byId[id])
);

export const useEmployeeCountByDepartment = (departmentId, isActive) => {
  return useSelector((state) => {
    const department = state.user.departmentEmployees[departmentId];
    if (!department) return 0;

    return isActive
      ? department.active?.length || 0
      : department.inactive?.length || 0;
  });
};

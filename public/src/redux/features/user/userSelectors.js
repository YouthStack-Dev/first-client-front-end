import { createSelector } from '@reduxjs/toolkit';

// Basic selectors
const selectTeamsState = state => state.user.teams;
const selectEmployeesState = state => state.user.employees;

// Team selectors
export const selectAllTeamIds = createSelector(
  selectTeamsState,
  teams => teams.allIds
);

export const selectTeamById = (state, teamId) => 
  selectTeamsState(state).byId[teamId] || null;

export const selectAllTeams = createSelector(
  selectTeamsState,
  teams => teams.allIds.map(id => teams.byId[id])
);

// Employee selectors
export const selectAllEmployeeIds = createSelector(
  selectEmployeesState,
  employees => employees.allIds
);

export const selectEmployeeById = (state, employeeId) => 
  selectEmployeesState(state).byId[employeeId] || null;

export const selectAllEmployees = createSelector(
  selectEmployeesState,
  employees => employees.allIds.map(id => employees.byId[id])
);

// Combined selectors
export const selectEmployeesByTeamId = createSelector(
  [selectTeamsState, selectEmployeesState, (_, teamId) => teamId],
  (teams, employees, teamId) => {
    const team = teams.byId[teamId];
    if (!team) return [];
    return team.employeeIds.map(id => employees.byId[id]).filter(Boolean);
  }
);

export const selectTeamsWithEmployeeCount = createSelector(
  selectAllTeams,
  teams => teams.map(team => ({
    ...team,
    employeeCount: team.employeeIds.length
  }))
);

export const selectEmployeesNotInTeam = createSelector(
  [selectAllEmployees, selectTeamById],
  (employees, team) => {
    if (!team) return employees;
    return employees.filter(employee => !team.employeeIds.includes(employee.id));
  }
);

// Search/filter selectors
export const selectFilteredTeams = createSelector(
  [selectAllTeams, (_, searchTerm) => searchTerm],
  (teams, searchTerm) => {
    if (!searchTerm) return teams;
    return teams.filter(team => 
      team.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
);

export const selectFilteredEmployees = createSelector(
  [selectAllEmployees, (_, searchTerm) => searchTerm],
  (employees, searchTerm) => {
    if (!searchTerm) return employees;
    return employees.filter(employee => 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
);

// Stats selectors
export const selectTotalEmployeeCount = createSelector(
  selectAllEmployeeIds,
  ids => ids.length
);

export const selectTotalTeamCount = createSelector(
  selectAllTeamIds,
  ids => ids.length
);



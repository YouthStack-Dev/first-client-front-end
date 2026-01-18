// employeesSelectors.js
import { createSelector } from "@reduxjs/toolkit";
import { selectEmployeeEntities } from "./employeesSlice";

// 1. Select loading state
export const selectEmployeesLoading = (state) => state.employees.loading;

// 2. Select employees by team ID
export const selectEmployeesByTeamId = createSelector(
  [
    (state) => state.employees.employeeIdsByTeam, // Map of teamId -> employeeId[]
    selectEmployeeEntities, // Normalized employee entities by employee_id
    (_, teamId) => teamId, // Team ID passed as argument
  ],
  (employeeIdsByTeam, employeeEntities, teamId) => {
    // If no teamId or team doesn't exist in index, return empty array
    if (!teamId || !employeeIdsByTeam[teamId]) {
      return [];
    }

    // Get employee IDs for this team
    const employeeIds = employeeIdsByTeam[teamId];

    // Map IDs to full employee objects
    return employeeIds
      .map((employeeId) => employeeEntities[employeeId])
      .filter(Boolean); // Remove any undefined entries
  }
);

// 3. Re-export selectEmployeeById from slice
export { selectEmployeeById } from "./employeesSlice";

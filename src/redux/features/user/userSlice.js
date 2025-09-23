import { createSlice } from '@reduxjs/toolkit';
import { logDebug } from '../../../utils/logger';

// Initial state with typed structure
const initialState = {
  teams: {
    byId: {},
    allIds: []
  },
  employees: {
    byId: {},
    allIds: []
  },
  departmentEmployees: {}, 
  lastFetchedDepId: null
};

// Helper functions for common operations
const normalizeArrayToObject = (array, key) => {
  return array.reduce((acc, item) => {
    acc[item[key]] = item;
    return acc;
  }, {});
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Reset and set all teams
    setTeams: {
      reducer(state, action) {
        const teams = action.payload;
        state.teams.byId = normalizeArrayToObject(teams, 'id');
        state.teams.allIds = teams.map(team => team.id);
      },
      prepare(teams) {
        return { payload: teams.map(team => ({ 
          ...team, 
          employeeIds: team.employeeIds || [] 
        })) };
      }
    },
    
    // Set all departments (for filtering)
    setAllDepartments: (state, action) => {
      const departments = action.payload;
      departments.forEach(dept => {
        state.teams.byId[dept.id] = dept;
        if (!state.teams.allIds.includes(dept.id)) {
          state.teams.allIds.push(dept.id);
        }
      });
    },
    
    setLastFetchedDepId(state, action) {
      state.lastFetchedDepId = action.payload;
    },
    
    // Add or update a single team
    upsertTeam(state, action) {
      const team = action.payload;
      state.teams.byId[team.id] = { ...team};
      
      logDebug("Updated team:", state.teams.byId[team.id]);
      if (!state.teams.allIds.includes(team.id)) {
        state.teams.allIds.push(team.id);
        logDebug("Added new team ID:", team.id);
      }
    },
    
    // Remove a team and optionally its employees
    removeTeam(state, action) {
      const { teamId, removeEmployees = false } = action.payload;
      
      if (!state.teams.byId[teamId]) return;
      
      // Remove employees if requested
      if (removeEmployees) {
        const employeeIds = state.teams.byId[teamId].employeeIds;
        employeeIds.forEach(id => {
          delete state.employees.byId[id];
          state.employees.allIds = state.employees.allIds.filter(eId => eId !== id);
        });
      }
      
      // Remove team
      delete state.teams.byId[teamId];
      state.teams.allIds = state.teams.allIds.filter(id => id !== teamId);
    },
    
    // Add or update an employee
    upsertEmployee(state, action) {
      const employee = action.payload;
      state.employees.byId[employee.userId] = employee;
      
      if (!state.employees.allIds.includes(employee.userId)) {
        state.employees.allIds.push(employee.userId);
      }
    },
    
    // Add employee to a team (without duplicating)
    addEmployeeToTeam(state, action) {
      const { teamId, employee } = action.payload;
      
      // Add/update employee first
      state.employees.byId[employee.userId] = employee;
      if (!state.employees.allIds.includes(employee.userId)) {
        state.employees.allIds.push(employee.userId);
      }
      
      // Add to team if not already present
      if (state.teams.byId[teamId] && 
          !state.teams.byId[teamId].employeeIds.includes(employee.userId)) {
        state.teams.byId[teamId].employeeIds.push(employee.userId);
      }
    },
    
    // Remove employee from a team (optionally globally)
    removeEmployeeFromTeam(state, action) {
      const { teamId, userId, removeGlobally = false } = action.payload;
      
      // Remove from team
      if (state.teams.byId[teamId]) {
        state.teams.byId[teamId].employeeIds = 
          state.teams.byId[teamId].employeeIds.filter(id => id !== userId);
      }
      
      // Remove globally if needed
      if (removeGlobally) {
        delete state.employees.byId[userId];
        state.employees.allIds = state.employees.allIds.filter(id => id !== userId);
        
        // Remove from all teams
        Object.values(state.teams.byId).forEach(team => {
          team.employeeIds = team.employeeIds.filter(id => id !== userId);
        });
      }
    },
    
    setDepartmentEmployees(state, action) {
      const { departmentId, employees } = action.payload;
      
      // Store each employee globally
      employees.forEach(emp => {
        state.employees.byId[emp.userId] = emp;
        if (!state.employees.allIds.includes(emp.userId)) {
          state.employees.allIds.push(emp.userId);
        }
      });
      
      // Store the userIds for this department
      state.departmentEmployees[departmentId] = employees.map(emp => emp.userId);
    },
    
    // Move employee between teams
    moveEmployee(state, action) {
      const { fromTeamId, toTeamId, userId } = action.payload;
      
      if (state.teams.byId[fromTeamId]) {
        state.teams.byId[fromTeamId].employeeIds = 
          state.teams.byId[fromTeamId].employeeIds.filter(id => id !== userId);
      }
      
      if (state.teams.byId[toTeamId] && 
          !state.teams.byId[toTeamId].employeeIds.includes(userId)) {
        state.teams.byId[toTeamId].employeeIds.push(userId);
      }
    },

    setDepartments: (state, action) => {
      const departments = action.payload;
    
      state.teams.byId = {};
      state.teams.allIds = [];
    
      departments.forEach((dept) => {
        state.teams.byId[dept.id] = dept;
        state.teams.allIds.push(dept.id);
      });
    },
    updateEmployeeStatus: (state, action) => {
      const { employeeId, isActive } = action.payload;
      if (state.employees.byId[employeeId]) {
        state.employees.byId[employeeId].isActive = isActive;
      }
    },
  }
});

export const {
  setDepartments,
  setTeams,
  setAllDepartments, 
  upsertTeam,
  removeTeam,
  upsertEmployee,
  addEmployeeToTeam,
  removeEmployeeFromTeam,
  moveEmployee,
  setLastFetchedDepId,
  setDepartmentEmployees,
  updateEmployeeStatus
} = userSlice.actions;

export default userSlice.reducer;
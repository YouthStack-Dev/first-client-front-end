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
        state.teams.byId = normalizeArrayToObject(teams, 'team_id');
        state.teams.allIds = teams.map(team => team.team_id);
       
        
      },
      prepare(teams) {
        return { payload: teams.map(team => ({ 
          ...team, 
          employeeIds: team.employeeIds || [] 
        })) };
      }
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
      state.employees.byId[employee.employee_code] = employee;
      
      if (!state.employees.allIds.includes(employee.employee_code)) {
        state.employees.allIds.push(employee.employee_code);
      }
    },
    
    // Add employee to a team (without duplicating)
    addEmployeeToTeam(state, action) {
      const { teamId, employee } = action.payload;
      
      // Add/update employee first
      state.employees.byId[employee.employee_code] = employee;
      if (!state.employees.allIds.includes(employee.employee_code)) {
        state.employees.allIds.push(employee.employee_code);
      }
      
      // Add to team if not already present
      if (state.teams.byId[teamId] && 
          !state.teams.byId[teamId].employeeIds.includes(employee.employee_code)) {
        
        // Add employee to team
        state.teams.byId[teamId].employeeIds.push(employee.employee_code);
        
        // Update active_employee_count
        const currentCount = state.teams.byId[teamId].active_employee_count || 0;
        state.teams.byId[teamId].active_employee_count = currentCount + 1;
      }
    },
    
    // Remove employee from a team (optionally globally)
    removeEmployeeFromTeam(state, action) {
      const { teamId, employee_code, removeGlobally = false } = action.payload;
      
      // Remove from team
      if (state.teams.byId[teamId]) {
        state.teams.byId[teamId].employeeIds = 
          state.teams.byId[teamId].employeeIds.filter(id => id !== employee_code);
      }
      
      // Remove globally if needed
      if (removeGlobally) {
        delete state.employees.byId[employee_code];
        state.employees.allIds = state.employees.allIds.filter(id => id !== employee_code);
        
        // Remove from all teams
        Object.values(state.teams.byId).forEach(team => {
          team.employeeIds = team.employeeIds.filter(id => id !== employee_code);
        });
      }
    },
    
    setDepartmentEmployees(state, action) {
      const { departmentId, employees } = action.payload;
      
      // Store each employee globally
      employees.forEach(emp => {
        state.employees.byId[emp.employee_code] = emp;
        if (!state.employees.allIds.includes(emp.employee_code)) {
          state.employees.allIds.push(emp.employee_code);
        }
      });
      
      // Store the employee_codes for this department
      state.departmentEmployees[departmentId] = employees.map(emp => emp.employee_code);
    },
    
    // Move employee between teams
    moveEmployee(state, action) {
      const { fromTeamId, toTeamId, employee_code } = action.payload;
      
      if (state.teams.byId[fromTeamId]) {
        state.teams.byId[fromTeamId].employeeIds = 
          state.teams.byId[fromTeamId].employeeIds.filter(id => id !== employee_code);
      }
      
      if (state.teams.byId[toTeamId] && 
          !state.teams.byId[toTeamId].employeeIds.includes(employee_code)) {
        state.teams.byId[toTeamId].employeeIds.push(employee_code);
      }
    },

    setDepartments: (state, action) => {
      const departments = action.payload;
    
      state.teams.byId = {};
      state.teams.allIds = [];
    
      departments.forEach((dept) => {
        state.teams.byId[dept.team_id] = dept;
        state.teams.allIds.push(dept.team_id);
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
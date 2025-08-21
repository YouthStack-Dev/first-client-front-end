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
  departmentEmployees: {}, // { depId: [employeeId, employeeId...] }
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
      const existingTeam = state.teams.byId[team.id];
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
      state.employees.byId[employee.id] = employee;
      
      if (!state.employees.allIds.includes(employee.id)) {
        state.employees.allIds.push(employee.id);
      }
    },
    
    // Add employee to a team (without duplicating)
    addEmployeeToTeam(state, action) {
      const { teamId, employee } = action.payload;
      
      // Add/update employee first
      state.employees.byId[employee.id] = employee;
      if (!state.employees.allIds.includes(employee.id)) {
        state.employees.allIds.push(employee.id);
      }
      
      // Add to team if not already present
      if (state.teams.byId[teamId] && 
          !state.teams.byId[teamId].employeeIds.includes(employee.id)) {
        state.teams.byId[teamId].employeeIds.push(employee.id);
      }
    },
    
    // Remove employee from a team (optionally globally)
    removeEmployeeFromTeam(state, action) {
      const { teamId, employeeId, removeGlobally = false } = action.payload;
      
      // Remove from team
      if (state.teams.byId[teamId]) {
        state.teams.byId[teamId].employeeIds = 
          state.teams.byId[teamId].employeeIds.filter(id => id !== employeeId);
      }
      
      // Remove globally if needed
      if (removeGlobally) {
        delete state.employees.byId[employeeId];
        state.employees.allIds = state.employees.allIds.filter(id => id !== employeeId);
        
        // Remove from all teams
        Object.values(state.teams.byId).forEach(team => {
          team.employeeIds = team.employeeIds.filter(id => id !== employeeId);
        });
      }
    },
    
    setDepartmentEmployees(state, action) {
      const { depId, employees } = action.payload;
      
      // Store each employee globally
      employees.forEach(emp => {
        state.employees.byId[emp.employee_id] = emp;

        if (!state.employees.allIds.includes(emp.employee_id)) {
          state.employees.allIds.push(emp.employee_id); 
        }
      });
      
      state.departmentEmployees[depId] = employees.map(emp => emp.employee_id);
      console.log(" this is the department slice " ,state.departmentEmployees[depId]);
    },
    
    // Move employee between teams
    moveEmployee(state, action) {
      const { fromTeamId, toTeamId, employeeId } = action.payload;
      
      if (state.teams.byId[fromTeamId]) {
        state.teams.byId[fromTeamId].employeeIds = 
          state.teams.byId[fromTeamId].employeeIds.filter(id => id !== employeeId);
      }
      
      if (state.teams.byId[toTeamId] && 
          !state.teams.byId[toTeamId].employeeIds.includes(employeeId)) {
        state.teams.byId[toTeamId].employeeIds.push(employeeId);
      }
    },

    setAllEmployees: (state, action) => {
      const { employees, page = 1 } = action.payload;
      
      // Store each employee globally
      employees.forEach(emp => {
        state.employees.byId[emp.employee_id] = emp;
        
        // Add to allIds if not already present
        if (!state.employees.allIds.includes(emp.employee_id)) {
          state.employees.allIds.push(emp.employee_id);
        }
      });
      
      // For pagination, you might want to track which employees are on which page
      state.currentEmployeesPage = page;
    }
  }
});

// In your userSlice.js

export const {
  setAllEmployees,
  
  setTeams,
  setAllDepartments, // <-- Export the new action
  upsertTeam,
  removeTeam,
  upsertEmployee,
  addEmployeeToTeam,
  removeEmployeeFromTeam,
  moveEmployee,
  setLastFetchedDepId,
  setDepartmentEmployees
} = userSlice.actions;

export default userSlice.reducer;
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
  departmentEmployees: {}, // Structure: { [departmentId]: { active: [], inactive: [] } }
  lastFetchedDepId: null
};

// Helper functions for common operations
const normalizeArrayToObject = (array, key) => {
  return array.reduce((acc, item) => {
    acc[item[key]] = item;
    return acc;
  }, {});
};

// Helper to generate cache key for department + active status
const getDepartmentCacheKey = (departmentId, isActive) => {
  return `${departmentId}_${isActive ? 'active' : 'inactive'}`;
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
      
      // Remove team and its cached employees
      delete state.teams.byId[teamId];
      state.teams.allIds = state.teams.allIds.filter(id => id !== teamId);
      
      // Remove cached department employees
      delete state.departmentEmployees[teamId];
    },
    
    // Add or update an employee
    upsertEmployee(state, action) {
      const employee = action.payload;
      state.employees.byId[employee.employee_id] = employee;
      
      if (!state.employees.allIds.includes(employee.employee_id)) {
        state.employees.allIds.push(employee.employee_id);
      }
    },
    
    // Add employee to a team (without duplicating)
    addEmployeeToTeam(state, action) {
      const { teamId, employee } = action.payload;
      
      // Add/update employee first
      state.employees.byId[employee.employee_id] = employee;
      if (!state.employees.allIds.includes(employee.employee_id)) {
        state.employees.allIds.push(employee.employee_id);
      }
      
      // Add to team if not already present
      if (state.teams.byId[teamId] && 
          !state.teams.byId[teamId].employeeIds.includes(employee.employee_id)) {
        
        // Add employee to team
        state.teams.byId[teamId].employeeIds.push(employee.employee_id);
        
        // Update active_employee_count
        const currentCount = state.teams.byId[teamId].active_employee_count || 0;
        state.teams.byId[teamId].active_employee_count = currentCount + 1;
      }
    },
    
    // Remove employee from a team (optionally globally)
    removeEmployeeFromTeam(state, action) {
      const { teamId, employee_id, removeGlobally = false } = action.payload;
      
      // Remove from team
      if (state.teams.byId[teamId]) {
        state.teams.byId[teamId].employeeIds = 
          state.teams.byId[teamId].employeeIds.filter(id => id !== employee_id);
      }
      
      // Remove globally if needed
      if (removeGlobally) {
        delete state.employees.byId[employee_id];
        state.employees.allIds = state.employees.allIds.filter(id => id !== employee_id);
        
        // Remove from all teams
        Object.values(state.teams.byId).forEach(team => {
          team.employeeIds = team.employeeIds.filter(id => id !== employee_id);
        });
        
        // Remove from all department caches
        Object.keys(state.departmentEmployees).forEach(deptId => {
          if (state.departmentEmployees[deptId]?.active) {
            state.departmentEmployees[deptId].active = 
              state.departmentEmployees[deptId].active.filter(id => id !== employee_id);
          }
          if (state.departmentEmployees[deptId]?.inactive) {
            state.departmentEmployees[deptId].inactive = 
              state.departmentEmployees[deptId].inactive.filter(id => id !== employee_id);
          }
        });
      }
    },
    
    // Set department employees with active/inactive separation
    setDepartmentEmployees(state, action) {
      const { departmentId, employees, isActive } = action.payload;
      
      // Store each employee globally
      employees.forEach(emp => {
        state.employees.byId[emp.employee_id] = emp;
        if (!state.employees.allIds.includes(emp.employee_id)) {
          state.employees.allIds.push(emp.employee_id);
        }
      });
      
      // Initialize department structure if not exists
      if (!state.departmentEmployees[departmentId]) {
        state.departmentEmployees[departmentId] = { active: [], inactive: [] };
      }
      
      // Store employee codes based on active status
      const employeeCodes = employees.map(emp => emp.employee_id);
      
      if (isActive === true) {
        state.departmentEmployees[departmentId].active = employeeCodes;
      } else if (isActive === false) {
        state.departmentEmployees[departmentId].inactive = employeeCodes;
      }
      
      logDebug(`Cached ${employeeCodes.length} ${isActive ? 'active' : 'inactive'} employees for department ${departmentId}`);
    },
    
    // Move employee between teams
    moveEmployee(state, action) {
      const { fromTeamId, toTeamId, employee_id } = action.payload;
      
      if (state.teams.byId[fromTeamId]) {
        state.teams.byId[fromTeamId].employeeIds = 
          state.teams.byId[fromTeamId].employeeIds.filter(id => id !== employee_id);
      }
      
      if (state.teams.byId[toTeamId] && 
          !state.teams.byId[toTeamId].employeeIds.includes(employee_id)) {
        state.teams.byId[toTeamId].employeeIds.push(employee_id);
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
        state.employees.byId[employeeId].is_active = isActive;
        
        // Update cached department lists
        Object.keys(state.departmentEmployees).forEach(deptId => {
          const deptCache = state.departmentEmployees[deptId];
          
          if (isActive) {
            // Move from inactive to active
            if (deptCache.inactive.includes(employeeId)) {
              deptCache.inactive = deptCache.inactive.filter(id => id !== employeeId);
              if (!deptCache.active.includes(employeeId)) {
                deptCache.active.push(employeeId);
              }
            }
          } else {
            // Move from active to inactive
            if (deptCache.active.includes(employeeId)) {
              deptCache.active = deptCache.active.filter(id => id !== employeeId);
              if (!deptCache.inactive.includes(employeeId)) {
                deptCache.inactive.push(employeeId);
              }
            }
          }
        });
      }
    },
    
    // Clear department cache (optional, for cleanup)
    clearDepartmentCache(state, action) {
      const { departmentId } = action.payload;
      if (departmentId) {
        delete state.departmentEmployees[departmentId];
      } else {
        state.departmentEmployees = {};
      }
    }
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
  updateEmployeeStatus,
  clearDepartmentCache
} = userSlice.actions;

export default userSlice.reducer;
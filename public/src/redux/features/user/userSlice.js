import { createSlice } from '@reduxjs/toolkit';
import { logDebug } from '../../../utils/logger';

// Initial state
const initialState = {
  departments: {
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

// Helper function: normalize array to object by key
const normalizeArrayToObject = (array, key) =>
  array.reduce((acc, item) => {
    acc[item[key]] = item;
    return acc;
  }, {});

// Create slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Set all departments (replace existing)
    setDepartments: {
      reducer(state, action) {
        const departments = action.payload;
        state.departments.byId = normalizeArrayToObject(departments, 'id');
        state.departments.allIds = departments.map(dep => dep.id);
      },
      prepare(departments) {
        return {
          payload: departments.map(dep => ({
            ...dep,
            employeeIds: dep.employeeIds || []
          }))
        };
      }
    },

    setLastFetchedDepId(state, action) {
      state.lastFetchedDepId = action.payload;
    },

    // Add or update a single department
    upsertDepartment(state, action) {
      const dep = action.payload;
      state.departments.byId[dep.id] = { ...dep };

      if (!state.departments.allIds.includes(dep.id)) {
        state.departments.allIds.push(dep.id);
      }

      logDebug("Updated department:", state.departments.byId[dep.id]);
    },

    // Remove a department and optionally its employees
    removeDepartment(state, action) {
      const { departmentId, removeEmployees = false } = action.payload;

      if (!state.departments.byId[departmentId]) return;

      // Remove employees if requested
      if (removeEmployees) {
        const employeeIds = state.departments.byId[departmentId].employeeIds;
        employeeIds.forEach(id => {
          delete state.employees.byId[id];
          state.employees.allIds = state.employees.allIds.filter(eId => eId !== id);
        });
      }

      // Remove department
      delete state.departments.byId[departmentId];
      state.departments.allIds = state.departments.allIds.filter(id => id !== departmentId);
    },

    // Add or update an employee globally
    upsertEmployee(state, action) {
      const employee = action.payload;
      state.employees.byId[employee.id] = employee;

      if (!state.employees.allIds.includes(employee.id)) {
        state.employees.allIds.push(employee.id);
      }
    },

    // Add employee to a department (without duplication)
    addEmployeeToDepartment(state, action) {
      const { departmentId, employee } = action.payload;

      // Add/update employee globally
      state.employees.byId[employee.id] = employee;
      if (!state.employees.allIds.includes(employee.id)) {
        state.employees.allIds.push(employee.id);
      }

      // Add employee to department
      if (state.departments.byId[departmentId] &&
          !state.departments.byId[departmentId].employeeIds.includes(employee.id)) {
        state.departments.byId[departmentId].employeeIds.push(employee.id);
      }
    },

    // Remove employee from a department (optionally globally)
    removeEmployeeFromDepartment(state, action) {
      const { departmentId, employeeId, removeGlobally = false } = action.payload;

      // Remove from department
      if (state.departments.byId[departmentId]) {
        state.departments.byId[departmentId].employeeIds =
          state.departments.byId[departmentId].employeeIds.filter(id => id !== employeeId);
      }

      // Remove globally if needed
      if (removeGlobally) {
        delete state.employees.byId[employeeId];
        state.employees.allIds = state.employees.allIds.filter(id => id !== employeeId);

        // Remove from all departments
        Object.values(state.departments.byId).forEach(dep => {
          dep.employeeIds = dep.employeeIds.filter(id => id !== employeeId);
        });
      }
    },

    // Set employees for a specific department
    setDepartmentEmployees(state, action) {
      const { departmentId, employees } = action.payload;

      // Add employees globally
      employees.forEach(emp => {
        state.employees.byId[emp.id] = emp;
        if (!state.employees.allIds.includes(emp.id)) {
          state.employees.allIds.push(emp.id);
        }
      });

      // Map department → employee IDs
      state.departmentEmployees[departmentId] = employees.map(emp => emp.id);
    }
  }
});

// Export actions
export const {
  setDepartments,
  upsertDepartment,
  removeDepartment,
  upsertEmployee,
  addEmployeeToDepartment,
  removeEmployeeFromDepartment,
  setLastFetchedDepId,
  setDepartmentEmployees
} = userSlice.actions;

// Export reducer
export default userSlice.reducer;

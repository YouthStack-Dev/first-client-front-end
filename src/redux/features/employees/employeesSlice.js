// employeesSlice.js
import { createSlice, createEntityAdapter } from "@reduxjs/toolkit";
import { fetchEmployeesThunk, toggleEmployeeStatus, createEmployeeThunk, updateEmployeeThunk } from "./employeesThunk";

const employeesAdapter = createEntityAdapter({
  selectId: (employee) => employee.employee_id,
});

const initialState = employeesAdapter.getInitialState({
  loading: false,
  error: null,
  employeeIdsByTeam: {},
});

const employeesSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {
    // Keep only these synchronous reducers
    clearEmployees: () => initialState,
    clearError: (state) => {
      state.error = null;
    },
    clearEmployeesByTeam: (state, action) => {
      const teamId = action.payload;
      if (state.employeeIdsByTeam[teamId]) {
        state.employeeIdsByTeam[teamId].forEach((employeeId) => {
          employeesAdapter.removeOne(state, employeeId);
        });
        delete state.employeeIdsByTeam[teamId];
      }
    },
    // REMOVE the toggleEmployeeStatus reducer from here
  },
  extraReducers: (builder) => {
    builder
      // Fetch Employees
      .addCase(fetchEmployeesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeesThunk.fulfilled, (state, action) => {
        const { employees, teamId } = action.payload;
        state.loading = false;

        employeesAdapter.upsertMany(state, employees);

        if (teamId) {
          const employeeIds = employees.map((emp) => emp.employee_id);
          state.employeeIdsByTeam[teamId] = employeeIds;
        }
      })
      .addCase(fetchEmployeesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch employees";
      })

      // Toggle Employee Status - This handles the state update
      .addCase(toggleEmployeeStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleEmployeeStatus.fulfilled, (state, action) => {
        state.loading = false;
        const { employeeId, isActive } = action.payload;

        // Update the employee status in the entity adapter
        const employee = state.entities[employeeId];
        if (employee) {
          employee.is_active = isActive; // Use the actual status from API
          employee.updated_at = new Date().toISOString();
        }
      })
      .addCase(toggleEmployeeStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to toggle employee status";
      })

      // Create Employee
      .addCase(createEmployeeThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEmployeeThunk.fulfilled, (state, action) => {
        state.loading = false;
        const employee = action.payload;
        if (employee && employee.employee_id) {
          employeesAdapter.addOne(state, employee);
          // If there's a team_id, update the mapping
          if (employee.team_id) {
            if (!state.employeeIdsByTeam[employee.team_id]) {
              state.employeeIdsByTeam[employee.team_id] = [];
            }
            state.employeeIdsByTeam[employee.team_id].push(employee.employee_id);
          }
        }
      })
      .addCase(createEmployeeThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create employee";
      })

      // Update Employee
      .addCase(updateEmployeeThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEmployeeThunk.fulfilled, (state, action) => {
        state.loading = false;
        const employee = action.payload;
        if (employee && employee.employee_id) {
          employeesAdapter.updateOne(state, {
            id: employee.employee_id,
            changes: employee,
          });
        }
      })
      .addCase(updateEmployeeThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update employee";
      });
  },
});

// Export actions (without toggleEmployeeStatus)
export const { clearEmployees, clearError, clearEmployeesByTeam } =
  employeesSlice.actions;

// Export selectors
export const {
  selectAll: selectAllEmployees,
  selectById: selectEmployeeById,
  selectIds: selectEmployeeIds,
  selectEntities: selectEmployeeEntities,
  selectTotal: selectTotalEmployees,
} = employeesAdapter.getSelectors((state) => state.employees);

export default employeesSlice.reducer;

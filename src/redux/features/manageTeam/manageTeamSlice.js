import { createSlice } from '@reduxjs/toolkit';
import {  createDepartment,  fetchTeams,
  updateDepartment,
  deleteTeams,
  fetchEmployeesByDepartment,
  createEmployee,
  updateEmployee,
} from './manageTeamThunks';

const initialState = {
  // Teams
  teams: [],
  selectedTeams: [],
  showModal: false,
  editingTeamId: null,

  // Employees
  employees: [],
  selectedEmployees: [],
  employeesByDepartment: {},
  employeeFetchStatus: {     
    status: 'idle',
    error: null,
  },

  // API Status Tracking
  apiStatus: {
    fetchTeams: { status: 'idle', error: null },
    createDepartment: { status: 'idle', error: null },
    updateDepartment: { status: 'idle', error: null },
    deleteTeams: { status: 'idle', error: null },
    fetchEmployees: { status: 'idle', error: null },
    fetchEmployeesByDepartment: { status: 'idle', error: null },
    createEmployee: { status: 'idle', error: " default value" }, 
    updateEmployee: { status: 'idle', error: null }, // ✅ add this
  },
};


const manageTeamSlice = createSlice({
  name: 'manageTeam',
  initialState,
  reducers: {
    // Modal & Team Management
    toggleModal(state) {
      state.showModal = !state.showModal;
    },
    setEditingTeamId(state, action) {
      state.editingTeamId = action.payload;
    },
    toggleSelect(state, action) {
      const id = action.payload;
      if (state.selectedTeams.includes(id)) {
        state.selectedTeams = state.selectedTeams.filter((i) => i !== id);
      } else {
        state.selectedTeams.push(id);
      }
    },
    clearSelectedTeams(state) {
      state.selectedTeams = [];
    },
    removeTeams(state, action) {
      const idsToRemove = action.payload;
      state.teams = state.teams.filter((team) => !idsToRemove.includes(team.department_id));
      state.selectedTeams = state.selectedTeams.filter((id) => !idsToRemove.includes(id));
    },

    // Employee Selection
    toggleSelectEmployee(state, action) {
      const id = action.payload;
      if (state.selectedEmployees.includes(id)) {
        state.selectedEmployees = state.selectedEmployees.filter((i) => i !== id);
      } else {
        state.selectedEmployees.push(id);
      }
    },
    clearSelectedEmployees(state) {
      state.selectedEmployees = [];
    },
  },
  extraReducers: (builder) => {
    // =====================
    // Teams - CRUD
    // =====================
    builder
      .addCase(fetchTeams.pending, (state) => {
        state.apiStatus.fetchTeams.status = 'loading';
        state.apiStatus.fetchTeams.error = null;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.apiStatus.fetchTeams.status = 'succeeded';
        state.teams = action.payload;
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.apiStatus.fetchTeams.status = 'failed';
        state.apiStatus.fetchTeams.error = action.payload || action.error.message;
      })
      .addCase(createDepartment.pending, (state) => {
        state.apiStatus.createDepartment.status = 'loading';
        state.apiStatus.createDepartment.error = null;
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.apiStatus.createDepartment.status = 'succeeded';
        const newDepartment = {
          ...action.payload,
          employee_count: action.payload.employee_count ?? 0,
        };
        state.teams = [...state.teams, newDepartment];
      })
      .addCase(createDepartment.rejected, (state, action) => {
        state.apiStatus.createDepartment.status = 'failed';
        state.apiStatus.createDepartment.error = action.payload || action.error.message;
      })
      .addCase(updateDepartment.pending, (state) => {
        state.apiStatus.updateDepartment.status = 'loading';
        state.apiStatus.updateDepartment.error = null;
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        state.apiStatus.updateDepartment.status = 'succeeded';
        state.teams = state.teams.map((team) =>
          team.department_id === action.payload.department_id
            ? { ...team, ...action.payload }
            : team
        );
      })
      .addCase(updateDepartment.rejected, (state, action) => {
        state.apiStatus.updateDepartment.status = 'failed';
        state.apiStatus.updateDepartment.error = action.payload || action.error.message;
      })
      .addCase(deleteTeams.pending, (state) => {
        state.apiStatus.deleteTeams.status = 'loading';
        state.apiStatus.deleteTeams.error = null;
      })
      .addCase(deleteTeams.fulfilled, (state, action) => {
        state.apiStatus.deleteTeams.status = 'succeeded';
        state.teams = state.teams.filter((team) => !action.payload.includes(team.department_id));
        state.selectedTeams = state.selectedTeams.filter((id) => !action.payload.includes(id));
      })
      .addCase(deleteTeams.rejected, (state, action) => {
        state.apiStatus.deleteTeams.status = 'failed';
        state.apiStatus.deleteTeams.error = action.payload || action.error.message;
      });

    // =====================
    // Employees
    // =====================

   

    builder
    // 🚀 createEmployee - Pending
    .addCase(createEmployee.pending, (state) => {
      console.log('🔄 Creating employee...'); // LOG
      state.apiStatus.createEmployee.status = 'loading';
      state.apiStatus.createEmployee.error = null;
    })
  
    // ✅ createEmployee - Fulfilled
// createEmployee - Fulfilled
.addCase(createEmployee.fulfilled, (state, action) => {
  const newEmployee = action.payload;
  const teamId = newEmployee?.department_id || newEmployee?.team_id; // Ensure the key you're using matches your data

  console.log('✅ Employee created and appended to employees array:', newEmployee);

  // ✅ Update global status
  state.apiStatus.createEmployee.status = 'succeeded';
  state.apiStatus.createEmployee.error = null;

  // ✅ Push to main list (optional if you're not using it)
  state.employees.push(newEmployee);

  // ✅ Push to the specific department
  if (teamId) {
    if (!state.employeesByDepartment[teamId]) {
      // Initialize if not present
      state.employeesByDepartment[teamId] = { employees: [] };
    }
    state.employeesByDepartment[teamId].employees.push(newEmployee);
  }

  console.log(`👥 Updated employeesByDepartment[${teamId}] array:`, state.employeesByDepartment[teamId]?.employees || []);
})



    // ❌ createEmployee - Rejected
    .addCase(createEmployee.rejected, (state, action) => {
      console.error('❌ Failed to create employee:', action.payload); // LOG
      state.apiStatus.createEmployee.status = 'failed';
      state.apiStatus.createEmployee.error = action.payload || 'Failed to create employee';
    });
  
  
    builder
    .addCase(fetchEmployeesByDepartment.pending, (state) => {
      state.employeeFetchStatus.status = 'loading';
      state.employeeFetchStatus.error = null;
    })
    .addCase(fetchEmployeesByDepartment.fulfilled, (state, action) => {
      const { departmentId, employees } = action.payload;
      state.employeeFetchStatus.status = 'succeeded';
      state.employeesByDepartment[departmentId] = employees;
    })
    .addCase(fetchEmployeesByDepartment.rejected, (state, action) => {
      state.employeeFetchStatus.status = 'failed';
      state.employeeFetchStatus.error = action.payload || action.error.message;
    });
    

    builder
    // 🔄 updateEmployee pending
    .addCase(updateEmployee.pending, (state) => {
      state.apiStatus.updateEmployee.status = 'loading';
      state.apiStatus.updateEmployee.error = null;
    })

    // ✅ updateEmployee fulfilled
    .addCase(updateEmployee.fulfilled, (state, action) => {
      state.apiStatus.updateEmployee.status = 'succeeded';
      state.apiStatus.updateEmployee.error = null;
    
      const updated = action.payload;
      const index = state.employees.findIndex(emp => emp.id === updated.id);
      if (index !== -1) {
        console.log('🔁 Updating employee:', state.employees[index]); // Before update
        state.employees[index] = updated;
        console.log('✅ Employee updated:', updated); // After update
      } else {
        console.warn('⚠️ Updated employee not found in array:', updated.id);
      }
    })

    // ❌ updateEmployee rejected
    .addCase(updateEmployee.rejected, (state, action) => {
      state.apiStatus.updateEmployee.status = 'failed';
      state.apiStatus.updateEmployee.error = action.payload || 'Update failed';
    });
  },
});

export const {
  toggleModal,
  setEditingTeamId,
  toggleSelect,
  clearSelectedTeams,
  removeTeams,
  toggleSelectEmployee,
  clearSelectedEmployees,
} = manageTeamSlice.actions;

export default manageTeamSlice.reducer;

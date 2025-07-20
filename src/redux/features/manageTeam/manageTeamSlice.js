import { createSlice } from '@reduxjs/toolkit';
import {
  createDepartment,
  fetchTeams,
  updateDepartment,
  deleteTeams,
  fetchEmployeesByDepartment,
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
  employeesByDepartment: {}, // ✅ missing key added
  employeeFetchStatus: {     // ✅ missing key added
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

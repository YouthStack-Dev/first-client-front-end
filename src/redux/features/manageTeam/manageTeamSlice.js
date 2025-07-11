import { createSlice } from '@reduxjs/toolkit';
import { fetchTeams, fetchEmployeesOfDepartment } from './manageTeamThunks';

const initialState = {
  teams: null,
  status: 'idle',
  error: null,

  employeess: null,
  employeesStatus: 'idle',
  employeesError: null,

  selectedTeams: [],
  showModal: false,
  editingTeamId: null,
  formData: {
    teamName: '',
    teamManager1: '',
    teamManager2: '',
    teamManager3: '',
    shiftCategory: 'Default',
    description: '',
    notification: '',
  }
};

const manageTeamSlice = createSlice({
  name: 'manageTeam',
  initialState,
  reducers: {
    toggleModal(state) {
      state.showModal = !state.showModal;
    },
    setEditingTeamId(state, action) {
      state.editingTeamId = action.payload;
    },
    setFormData(state, action) {
      state.formData = action.payload;
    },
    toggleSelect(state, action) {
      const id = action.payload;
      if (state.selectedTeams.includes(id)) {
        state.selectedTeams = state.selectedTeams.filter(i => i !== id);
      } else {
        state.selectedTeams.push(id);
      }
    },
    clearSelectedTeams(state) {
      state.selectedTeams = [];
    },
    removeTeams(state, action) {
      const idsToRemove = action.payload;
      state.teams = state.teams?.filter(team => !idsToRemove.includes(team.id));
      state.selectedTeams = state.selectedTeams.filter(id => !idsToRemove.includes(id));
    }
  },
  extraReducers: (builder) => {
    // fetchTeams handlers
    builder
      .addCase(fetchTeams.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.teams = action.payload;
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      });

    // fetchEmployeesOfDepartment handlers
    builder
      .addCase(fetchEmployeesOfDepartment.pending, (state) => {
        state.employeesStatus = 'loading';
        state.employeesError = null;
      })
      .addCase(fetchEmployeesOfDepartment.fulfilled, (state, action) => {
        state.employeesStatus = 'succeeded';
        state.employees = action.payload.employees;
      })
      .addCase(fetchEmployeesOfDepartment.rejected, (state, action) => {
        state.employeesStatus = 'failed';
        state.employeesError = action.payload || action.error.message;
      });
  }
});

export const { toggleModal, setEditingTeamId, setFormData, toggleSelect, clearSelectedTeams, removeTeams } = manageTeamSlice.actions;
export default manageTeamSlice.reducer;

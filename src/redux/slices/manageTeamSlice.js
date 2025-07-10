import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {API_CLIENT} from '../../Api/API_Client.js';

export const fetchTeams = createAsyncThunk(
  'manageTeam/fetchTeams',
  async ({ skip = 0, limit = 10 }) => {
    const response = await API_CLIENT.get(`departments/?skip=${skip}&limit=${limit}`);
    return response.data;  // adjust based on actual API response shape
  }
);

const manageTeamSlice = createSlice({
  name: 'manageTeam',
  initialState: {
    teams: null,
    status: 'idle',
    error: null,
    selectedTeams: [],     // moved from local
    showModal: false,      // moved from local
    editingTeamId: null,   // moved from local
    formData: {
      teamName: '',
      teamManager1: '',
      teamManager2: '',
      teamManager3: '',
      shiftCategory: 'Default',
      description: '',
      notification: '',
    }
  },
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
    builder
      .addCase(fetchTeams.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.teams = action.payload;
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export const { toggleModal, setEditingTeamId, setFormData, toggleSelect, clearSelectedTeams, removeTeams } = manageTeamSlice.actions;
export default manageTeamSlice.reducer;

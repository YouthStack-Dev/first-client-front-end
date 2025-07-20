
import { createAsyncThunk } from '@reduxjs/toolkit';
import { getTeams, getEmployeesByDepartment, createDepartmentAPI, updateDepartmentAPI, deleteTeamsAPI } from './manageTeamAPI';

export const fetchTeams = createAsyncThunk(
  'manageTeam/fetchTeams',
  async ({ skip = 0, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await getTeams({ skip, limit });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch teams');
    }
  }
);

export const fetchEmployeesOfDepartment = createAsyncThunk(
  'manageTeam/fetchEmployeesOfDepartment',
  async ({ departmentId }, { rejectWithValue }) => {
    try {
      const response = await getEmployeesByDepartment(departmentId);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch employees');
    }
  }
);

export const createDepartment = createAsyncThunk(
  'manageTeam/createDepartment',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await createDepartmentAPI(payload);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateDepartment = createAsyncThunk(
  'manageTeam/updateDepartment',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await updateDepartmentAPI(id, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);



export const deleteTeams = createAsyncThunk(
  'manageTeam/deleteTeams',
  async (teamIds, { rejectWithValue }) => {
    try {
      await Promise.all(teamIds.map((id) => deleteTeamsAPI(id)));
      return teamIds; // Return the deleted team IDs
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete teams');
    }
  }
);
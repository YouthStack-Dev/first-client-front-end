
import { createAsyncThunk } from '@reduxjs/toolkit';
import { getTeams, getEmployeesByDepartment, createDepartmentAPI, updateDepartmentAPI, deleteTeamsAPI } from './manageTeamAPI';
import { API_CLIENT } from '../../../Api/API_Client';

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

// 🔄 Thunk to fetch employees by department
export const fetchEmployeesByDepartment = createAsyncThunk(
  'manageTeam/fetchEmployeesByDepartment',
  async (departmentId, { rejectWithValue }) => {
    try {
      // 🛠️ API call
      const response = await API_CLIENT.get(`/employees/department/${departmentId}`);

      // ✅ Logs for debugging
      console.log('📥 Employee fetch invoked for department:', departmentId);
      console.log('📦 Fetched employees data:', response.data);

      return { departmentId, employees: response.data };
    } catch (error) {
      const errMsg = error.response?.data || error.message || 'Unknown error';
      console.error('❌ Error fetching employees by department:', errMsg);
      return rejectWithValue(errMsg);
    }
  }
);
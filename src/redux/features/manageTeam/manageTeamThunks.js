import { createAsyncThunk } from '@reduxjs/toolkit';
import { getTeams, getEmployeesByDepartment } from './manageTeamAPI';

export const fetchTeams = createAsyncThunk(
  'manageTeam/fetchTeams',
  async ({ skip = 0, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await getTeams({ skip, limit });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch teams");
    }
  }
);


export const fetchEmployeesOfDepartment = createAsyncThunk(
    'manageTeam/fetchEmployeesOfDepartment',

    async ({ departmentId }, { rejectWithValue }) => {
      try {
        const response = await getEmployeesByDepartment(departmentId)
        return response.data;
      } catch (err) {
        return rejectWithValue(err.response?.data?.message || "Failed to fetch teams");
      }
    }
  );
  


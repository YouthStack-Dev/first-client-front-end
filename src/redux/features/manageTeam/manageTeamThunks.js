
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


//  Employe Trunks 


export const createEmployee = createAsyncThunk(
  'manageTeam/createEmployee',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.post('/employees/', payload);
      return response.data; // ✅ Return data to reducer
    } catch (error) {
      // ✅ Return custom error to reducer
      return rejectWithValue(
        error.response?.data || { message: 'Something went wrong' }
      );
    }
  }
);




// export const updateEmployee = createAsyncThunk(
//   'manageTeam/updateEmployee',
//   async ({ id, payload }, { rejectWithValue }) => {
//     try {
//       const response = await API_CLIENT.put(`/employees/${id}`, payload);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Something went wrong');
//     }
//   }
// );


export const updateEmployee = createAsyncThunk(
  'manageTeam/updateEmployee',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      console.log('Updating Employee with ID:', id);
      console.log('Payload:', payload);

      // Simulate a successful API response
      return {
        id,
        ...payload,
        message: 'Simulated update success'
      };
    } catch (error) {
      return rejectWithValue('Simulated error');
    }
  }
);

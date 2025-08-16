import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";

 export const createEmployee=createAsyncThunk("user/createEmployee", async (employeeData, { rejectWithValue }) => {
    try {
        const response = await API_CLIENT.post('/users/employe', employeeData, )
        if (response.status === 201) {
            return response.data;
        } else {
            return rejectWithValue("Failed to create employee");
        }
    } catch (error) {
        return rejectWithValue(error.message);
    }
})



export const fetchDepartments = async (page, limit) => {
  let params = {};

  // If pagination arguments are provided, add them
  if (page && limit) {
    params.skip = (page - 1) * limit;
    params.limit = limit;
  }

  const { data } = await API_CLIENT.get('/departments/', { params });

  // Transform the data to match your UI requirements
  return data.map(dept => ({
    id: dept.department_id,
    name: dept.department_name,
    description: dept.description,
    employeeIds: [],
    users: dept.employee_count
  }));
};

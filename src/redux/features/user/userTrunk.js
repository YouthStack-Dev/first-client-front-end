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

export const fetchDepartments = async (page = 1, limit = 20) => {
    const params = {
      skip: (page - 1) * limit,
      limit,
    };
  
    const { data } = await API_CLIENT.get("api/users/company-departments/", { params });
  
    // Ensure we only map if departments exist
    return (data.departments || []).map(dept => ({
      id: dept.id,
      name: dept.name,
      description: dept.description,
      users: dept.totalUsers,
      active: dept.activeUsers,
      inactive: dept.inactiveUsers,
      companyId: dept.companyId,
    }));
  };
  
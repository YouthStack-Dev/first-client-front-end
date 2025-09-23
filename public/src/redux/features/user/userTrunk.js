import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";
import endpoint from "../../../Api/Endpoints";

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
  let params = {};

  params.skip = (page - 1) * limit;
  params.limit = limit;

  const { data } = await API_CLIENT.get(endpoint.getDepartments, { params });

  return data
};

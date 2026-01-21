import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";
import endpoint from "../../../Api/Endpoints";

// Fetch employees with query parameters
export const fetchEmployeesThunk = createAsyncThunk(
  "employees/fetchEmployees",
  async (queryParams = {}, { rejectWithValue }) => {
    try {
      // Build query string
      const queryString = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          queryString.append(key, value);
        }
      });

      const url = `/employees/${
        queryString.toString() ? `?${queryString.toString()}` : ""
      }`;

      const response = await API_CLIENT.get(url);

      if (response.data.success) {
        const employees = response.data.data.items || [];
        const teamId = queryParams.team_id;

        return { employees, teamId };
      } else {
        return rejectWithValue(
          response.data.message || "Failed to fetch employees"
        );
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Network error"
      );
    }
  }
);

export const toggleEmployeeStatus = createAsyncThunk(
  "teamEmployees/toggleEmployeeStatus",
  async ({ employeeId, isActive }, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.patch(
        `/employees/${employeeId}/toggle-status`
      );

      return {
        employeeId,
        isActive,
        data: response.data,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Failed to toggle employee status"
      );
    }
  }
);


export const createEmployeeThunk = createAsyncThunk(
  "user/createEmployee",
  async (employeeData, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.post("/employees/", employeeData);
      if (response.status === 201) {
        return response.data;
      } else {
        return rejectWithValue("Failed to create employee");
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateEmployeeThunk = createAsyncThunk(
  "employees/updateEmployee",
  async ({ employeeId, employeeData }, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.put(`${endpoint.updateEmployee}${employeeId}`, employeeData);
      if (response.status === 200) {
        return response.data;
      } else {
        return rejectWithValue("Failed to update employee");
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || "Network error");
    }
  }
);
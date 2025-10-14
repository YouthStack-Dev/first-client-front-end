import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";
import endpoint from "../../../Api/Endpoints";
import { logDebug } from "../../../utils/logger";

export const createEmployee = createAsyncThunk(
  "user/createEmployee",
  async (employeeData, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.post("/users/employe", employeeData);
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

// In userTrunk.js - update the thunk to match your API function signature
export const fetchDepartments = async (page = 1, limit = 20, search = "") => {
  const params = {
    skip: (page - 1) * limit,
    limit,
  };

  // Add search parameter if provided
  if (search && search.length > 0) {
    params.search = search;
  }

  logDebug("This is the param for fetching departments:", params);
  const { data } = await API_CLIENT.get(`${endpoint.getDepartments}`, {
    params,
  });
  logDebug("Fetched departments data:", data);

  // Ensure we only map if departments exist
  return data?.data?.items || [];
};

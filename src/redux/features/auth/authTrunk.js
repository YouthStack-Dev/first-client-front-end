import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client"; 
import { logDebug } from "../../../utils/logger";


export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ formData, endpoint }, { rejectWithValue }) => {
    console.log("Login endpoint:", endpoint, formData);

    try {
      // Send login request
      const response = await API_CLIENT.post(endpoint, formData);
      logDebug("Login response data:", response.data.data);

      // Destructure tokens and user
      const { access_token:token, refresh_token, user } = response.data.data;

      // Extract permissions from user
      const allowedModules = user?.permissions || [];

      logDebug("Extracted token:", token);
      logDebug("Allowed modules:", allowedModules);

   
      return {
        user,
        token,
        refresh_token,
        allowedModules
      };
    } catch (error) {
      logDebug("Login error details:", error);

      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data ||
        'Login failed'
      );
    }
  }
);
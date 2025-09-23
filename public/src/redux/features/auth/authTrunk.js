import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client"; 
import Cookies from "js-cookie";

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({formData, endpoint}, { rejectWithValue }) => {
    console.log("Login endpoint:", formData);
    
    try {
      // Use the dynamic endpoint
      const response = await API_CLIENT.post(endpoint, formData);
      const { token, allowedModules, user } = response.data;      
      return { user: user, token, allowedModules };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data || 
        'Login failed'
      );
    }
  }
);
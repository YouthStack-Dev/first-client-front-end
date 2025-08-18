import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";
import Cookies from "js-cookie";
import { logDebug, logError } from "../../../utils/logger";
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.post('/auth/login', credentials);
      const { access_token, permissions, ...userData } = response.data;

      // Store token and user data
      Cookies.set('access_token', access_token, { 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      // Store permissions and user data in session storage
      sessionStorage.setItem('userPermissions', JSON.stringify({
        permissions,
      }));

      return { user: userData, access_token, permissions };
    } catch (error) {
      logError(" this is the erros ", error);
      // Clear storage on error
      Cookies.remove('access_token');
      sessionStorage.removeItem('userPermissions');
      return rejectWithValue(error.response?.data || 'Login failed');
    }
  }
);
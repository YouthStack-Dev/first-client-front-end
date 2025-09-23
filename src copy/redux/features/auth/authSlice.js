import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { loginUser } from "./authTrunk";

const initialState = {
  token: null,
  permissions: null, 
  loading: false,
  error: null,
  isAuthenticated: false,
  lastLogin: null
};

const authSlice = createSlice(
  {
  name: "auth",
  initialState,

  reducers: {
    resetAuthState: (state) => {
      Object.assign(state, initialState);
    },



    
     logout: (state) => {
      
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      sessionStorage.removeItem('userPermissions');
      localStorage.clear();
      
      // Reset state
      Object.assign(state, initialState);
    },
    setCredentials: (state, action) => {
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    loadFromStorage: (state) => {
      // Hydrate state from storage on page refresh
      const storedData = sessionStorage.getItem('userPermissions');
      if (storedData) {
        const { user, permissions } = JSON.parse(storedData);
        state.permissions = permissions;
        state.isAuthenticated = true;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        const { user,access_token: token, permissions } = action.payload;
        
        state.token = token;
        state.permissions = permissions || [];  
        state.isAuthenticated = true;
        state.lastLogin = new Date().toISOString();
        state.loading = false;
        
     
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = {
          message: action.payload?.message || 'Authentication failed',
          status: action?.status || 500,
          errors: action.payload?.errors || null,
          timestamp: new Date().toISOString()
        };
        
        // Clear any partial auth data
        Cookies.remove('access_token');
        sessionStorage.removeItem('userPermissions');
      });
  }
}     );

// Action creators
export const { resetAuthState, logout, setCredentials,loadFromStorage } = authSlice.actions;

// Selectors
export const selectAuthToken = (state) => state.auth.token;
export const selectPermissions = (state) => state.auth.permissions;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectLastLogin = (state) => state.auth.lastLogin;

export default authSlice.reducer;
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { loginUser } from "./authTrunk";
import { logDebug } from "../../../utils/logger";
import { API_CLIENT } from "../../../Api/API_Client";

// Utility function to get token expiration
const getTokenExpiration = (token) => {
  try {
    const decoded = jwtDecode(token);
    if (decoded && decoded.exp) {
      // Convert expiration time (seconds since epoch) to Date object
      return new Date(decoded.exp * 1000);
    }
    return null;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
};

// Async thunk to fetch user data based on token

export const fetchUserFromToken = createAsyncThunk(
  "auth/fetchUserFromToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.get("/api/role-permissions/permissions", {
        withCredentials: true, // send cookies if needed
      });

      return response.data; // Axios automatically parses JSON
    } catch (error) {
      let message = "Something went wrong";

      if (error.response) {
        // Server responded with a status other than 2xx
        message = error.response.data?.message || "Token verification failed";
      } else if (error.request) {
        // No response received
        message = "No response from server";
      } else {
        // Request setup error
        message = error.message;
      }

      return rejectWithValue(message);
    }
  }
);
const initialState = {
  user: null,
  token: null,
  permissions: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  lastLogin: null
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetAuthState: (state) => {
      Object.assign(state, initialState);
    },
    logout: (state) => {
      // Clear all client-side storage
      Cookies.remove('auth_token', { path: '/' });
      Cookies.remove('refresh_token', { path: '/' });
      sessionStorage.removeItem('userPermissions');
      localStorage.removeItem('persist:root'); // More specific clearing
      
      // Reset state
      Object.assign(state, initialState);
    },
    setAuthCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    // New reducer to handle token-based state restoration
    setAuthFromToken: (state, action) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        const { user, token, allowedModules } = action.payload;
        
        state.user = user;
        state.token = token;
        state.permissions = allowedModules;
        state.isAuthenticated = true;
        state.lastLogin = new Date().toISOString();
        state.loading = false;
        state.error = null;
        
        // Set cookie with proper expiration based on token
        const tokenExpiration = getTokenExpiration(token);
        const cookieOptions = {
          expires: tokenExpiration ? tokenExpiration : 7, // Use token expiration or fallback to 7 days
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        };
        
        Cookies.set('auth_token', token, cookieOptions);
        
        // Persist to session storage
        sessionStorage.setItem('userPermissions', JSON.stringify({
          user,
          permissions: allowedModules,
          lastUpdated: new Date().toISOString()
        }));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = {
          message: action.payload?.message || 'Authentication failed',
          status: action.payload?.status || 500,
          errors: action.payload?.errors || null,
          timestamp: new Date().toISOString()
        };
        logDebug("This is the error ", action.payload?.errors);
        
        // Clear any partial auth data
        Cookies.remove('auth_token', { path: '/' });
        sessionStorage.removeItem('userPermissions');
      })
      // Handle token-based user fetching
      .addCase(fetchUserFromToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserFromToken.fulfilled, (state, action) => {
        const { user, allowedModules } = action.payload;
        logDebug(" this is the refresh payloud " ,allowedModules)
        state.user = user;
        state.permissions = allowedModules;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
        
        // Update session storage
        sessionStorage.setItem('userPermissions', JSON.stringify({
          user,
          permissions:allowedModules,
          lastUpdated: new Date().toISOString()
        }));
      })
      .addCase(fetchUserFromToken.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload;
        console.log(" this is the error when fetching the permission " ,action.payload);
        
        // Clear invalid token
        Cookies.remove('auth_token', { path: '/' });
        sessionStorage.removeItem('userPermissions');
      });
  }
});

// Action creators
export const { 
  resetAuthState, 
  logout, 
  setAuthCredentials,
  setAuthFromToken,
  clearError
} = authSlice.actions;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectAuthToken = (state) => state.auth.token;
export const selectPermissions = (state) => state.auth.permissions;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectLastLogin = (state) => state.auth.lastLogin;

// Utility function to initialize auth state
export const initializeAuth = () => async (dispatch) => {
  const token = Cookies.get("auth_token");
logDebug(" this is the token when refres in initializeAuth" ,token)
  if (!token) {
    // No token → reset auth state
    dispatch(resetAuthState());
    return;
  }

  try {
    // Verify token is still valid
    const expiration = getTokenExpiration(token);
    if (expiration && expiration < new Date()) {
      Cookies.remove('auth_token');
      dispatch(resetAuthState());
      return;
    }

    // Decode token and set basic user info
    const decoded = jwtDecode(token);

    const user = {
      email: decoded.email,
      type: decoded.type,
      companyName: decoded.companyName,
    };

    const storedData = sessionStorage.getItem("userPermissions");

    if (storedData) {
      const { permissions } = JSON.parse(storedData);
      dispatch(
        setAuthFromToken({
          token,
          user,
          permissions,
        })
      );
    } else {
      // If no session storage → fetch from server
      await dispatch(fetchUserFromToken());
    }
  } catch (error) {
    console.error("Failed to initialize auth state:", error);
    
    dispatch(resetAuthState());
  }
};

export default authSlice.reducer;
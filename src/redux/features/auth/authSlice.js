import { createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { fetchUserFromToken, loginUser } from "./authTrunk";
import { logDebug } from "../../../utils/logger";

// Utility function to get token expiration
const getTokenExpiration = (token) => {

  logDebug("Decoding token for expiration:", token);
  try {
    const decoded = jwtDecode(token);
    if (decoded && decoded.exp) {
      return new Date(decoded.exp * 1000);
    }
    return null;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
};



const initialState = {
  user: null,
  token: null,
  permissions: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  authloading:false,
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
      const { user, token } = action.payload;
    
      let userType = "admin"; // default type
    
      if (user.employee) {
        userType = "employee";
      } else if (user.vendor_user) {
        userType = "vendor";
      }
    
      // Assign the type to the user object
      const userWithType = { ...user, type: userType };
    
      // Update state
      state.user = userWithType;
      state.token = token;
      state.isAuthenticated = true;
    
      logDebug("Setting auth credentials:", { user: userWithType, token });
    },
    
    // New reducer to handle token-based state restoration
    setAuthFromToken: (state, action) => {
      state.user = action.payload.user;
      state.permissions = action.payload.permissions || null;
      state.isAuthenticated = true;
      state.loading = false; // Ensure loading is set to false
    },
    clearError: (state) => {
      state.error = null;
    },
    // Add a reducer to explicitly set loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    }
    ,   setAuthLoading: (state, action) => {
      state.authloading = action.payload;
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
        logDebug(" this is the payload " , action.payload)
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
        const { user, permissions:allowedModules } = action.payload;
        logDebug(" this is the refresh payload user " , action.payload)
        state.user = user;
        state.permissions = allowedModules;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
        
        // Update session storage
        sessionStorage.setItem('userPermissions', JSON.stringify({
          user,
          permissions: allowedModules,
          lastUpdated: new Date().toISOString()
        }));
      })
      .addCase(fetchUserFromToken.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload;
        console.log(" this is the error when fetching the permission " , action.payload);
        
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
  clearError,
  setLoading,
  setAuthLoading
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
  const token = Cookies.get("auth_token")||"";
  // logDebug("Decoded token:", token);
  dispatch(setAuthLoading(true));
  if (!token) {
    
    // No token → reset auth state
    dispatch(resetAuthState());
    return;
  }else{
  dispatch(setAuthLoading(false));

  }
  try {
    // Verify token is still valid
   

    // Decode token and set basic user info
    const decoded = jwtDecode(token);
  
    const user = {
      email: decoded.email||"dummy@gmail.com",
      type: decoded.user_type,
      companyName: decoded.companyName || "Demo Company",
    };

    const storedData = sessionStorage.getItem("userPermissions");

    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        const { permissions=[] } = parsedData;
        
        dispatch(
          setAuthFromToken({
            user,
            permissions,
          })
        );
  dispatch(setAuthLoading(false));

      } catch (error) {
        console.error("Failed to parse stored permissions:", error);
        // If parsing fails, fetch from server
        await dispatch(fetchUserFromToken());

      }
    } else {
      // If no session storage → fetch from server
      await dispatch(fetchUserFromToken());
    }
  } catch (error) {
    console.error("Failed to initialize auth state:", error);
    dispatch(setAuthLoading(false));  
    dispatch(resetAuthState());
  }
};

export default authSlice.reducer;
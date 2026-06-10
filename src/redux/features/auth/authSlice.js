import { createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { fetchUserFromToken, loginUser } from "./authTrunk";
import { logDebug } from "../../../utils/logger";

const getTokenExpiration = (token) => {
  logDebug("Decoding token for expiration:", token);
  try {
    const decoded = jwtDecode(token);
    if (decoded && decoded.exp) {
      return new Date(decoded.exp * 1000);
    }
    return null;
  } catch (error) {
    console.error("Failed to decode JWT:", error);
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
  authloading: false,
  lastLogin: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetAuthState: (state) => {
      Object.assign(state, initialState);
    },
    logout: (state) => {
      Cookies.remove("auth_token", { path: "/" });
      Cookies.remove("refresh_token", { path: "/" });
      sessionStorage.clear();
      localStorage.clear(); // ✅ clears everything — tenant, vendor_user, userPermissions
      window.location.reload();
      Object.assign(state, initialState);
    },

    setAuthCredentials: (state, action) => {
      const { user, token } = action.payload;

      let userType = "admin";
      if (user.employee) {
        userType = "employee";
      } else if (user.vendor_user) {
        userType = "vendor";
      }

      state.user = {
        ...user,
        type: userType,
        tenant_id: user.tenant_id || user.employee?.tenant_id || user.vendor_user?.tenant_id || null,
      };
      state.token = token;
      state.isAuthenticated = true;

      logDebug("Setting auth credentials:", { user: state.user, token });
    },

    setAuthFromToken: (state, action) => {
      state.user = action.payload.user;
      state.permissions = action.payload.permissions || null;
      state.isAuthenticated = true;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setAuthLoading: (state, action) => {
      state.authloading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        const { user, token, refresh_token, allowedModules } = action.payload;
        console.log("🔥 REFRESH TOKEN FROM PAYLOAD:", refresh_token);
        logDebug("this is the payload", action.payload);

        state.user = {
          ...user,
          tenant_id: user.tenant_id || user.employee?.tenant_id || user.vendor_user?.tenant_id || null,
        };
        state.token = token;
        state.permissions = allowedModules;
        state.isAuthenticated = true;
        state.lastLogin = new Date().toISOString();
        state.loading = false;
        state.error = null;

        const tokenExpiration = getTokenExpiration(token);
        const cookieOptions = {
          expires: tokenExpiration ? tokenExpiration : 7,
          path: "/",
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        };

        Cookies.set("auth_token", token, cookieOptions);
        Cookies.set("refresh_token", refresh_token, {
          path: "/",
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });

        // ✅ localStorage — uniform for all login types
        localStorage.setItem(
          "userPermissions",
          JSON.stringify({
            user,
            permissions: allowedModules,
            lastUpdated: new Date().toISOString(),
          })
        );
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = {
          message: action.payload?.message || "Authentication failed",
          status: action.payload?.status || 500,
          errors: action.payload?.errors || null,
          timestamp: new Date().toISOString(),
        };
        logDebug("This is the error", action.payload?.errors);

        Cookies.remove("auth_token", { path: "/" });
        // ✅ localStorage
        localStorage.removeItem("userPermissions");
      })
      .addCase(fetchUserFromToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserFromToken.fulfilled, (state, action) => {
        const { user, permissions: allowedModules, user_type } = action.payload;
        logDebug("this is the refresh payload user", action.payload);

        state.user = {
          ...user,
          type: user_type,
          tenant_id: user.tenant_id || user.employee?.tenant_id || user.vendor_user?.tenant_id || null,
        };
        state.permissions = allowedModules;

        const freshToken = Cookies.get("auth_token");
        if (freshToken) {
          state.token = freshToken;
        }
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;

        // ✅ localStorage
        localStorage.setItem(
          "userPermissions",
          JSON.stringify({
            user,
            permissions: allowedModules,
            lastUpdated: new Date().toISOString(),
          })
        );
      })
      .addCase(fetchUserFromToken.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload;
        console.log("this is the error when fetching the permission", action.payload);

        Cookies.remove("auth_token", { path: "/" });
        // ✅ localStorage
        localStorage.removeItem("userPermissions");
      });
  },
});

export const {
  resetAuthState,
  logout,
  setAuthCredentials,
  setAuthFromToken,
  clearError,
  setLoading,
  setAuthLoading,
} = authSlice.actions;

export const selectCurrentUser = (state) => state.auth.user;
export const selectAuthToken = (state) => state.auth.token;
export const selectPermissions = (state) => state.auth.permissions;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectLastLogin = (state) => state.auth.lastLogin;

export const initializeAuth = () => async (dispatch) => {
  const token = Cookies.get("auth_token") || "";
  dispatch(setAuthLoading(true));

  if (!token) {
    dispatch(resetAuthState());
    return;
  } else {
    dispatch(setAuthLoading(false));
  }

  try {
    const decoded = jwtDecode(token);
    logDebug("this is the decoded data", decoded);

    // ✅ localStorage
    const storedData = localStorage.getItem("userPermissions");

    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        const { user: storedUser = {}, permissions = [] } = parsedData;

        const user = {
          ...storedUser,
          type: decoded.user_type || storedUser.type,
          tenant_id: decoded.tenant_id || storedUser.tenant_id || null,
        };

        dispatch(setAuthFromToken({ user, permissions }));
        dispatch(setAuthLoading(false));
      } catch (error) {
        console.error("Failed to parse stored permissions:", error);
        await dispatch(fetchUserFromToken());
      }
    } else {
      // ✅ No localStorage → fetch from server
      await dispatch(fetchUserFromToken());
    }
  } catch (error) {
    console.error("Failed to initialize auth state:", error);
    dispatch(setAuthLoading(false));
    dispatch(resetAuthState());
  }
};

export default authSlice.reducer;
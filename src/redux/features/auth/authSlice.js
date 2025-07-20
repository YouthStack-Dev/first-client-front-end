import { createSlice } from "@reduxjs/toolkit";
import { loginUser, logoutUser } from "./authTrunk";

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.loading = false;
    },
    resetAuthState(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
     
      .addCase(loginUser.fulfilled, (state, action) => {
        const userData = action.payload.user || action.payload;

       
        const finalUser = {
          ...userData,
          vendor_id: userData.vendor_id || userData.tenant_id || null,
        };

        state.user = finalUser;
        state.isAuthenticated = true;
        state.loading = false;
      })

      
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
      })

      
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addMatcher(
        (action) => action.type.endsWith("/fulfilled"),
        (state) => {
          state.loading = false;
        }
      )

      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload || action.error?.message || "Something went wrong";
        }
      );
  },
});

export const { setUser, resetAuthState } = authSlice.actions;
export default authSlice.reducer;

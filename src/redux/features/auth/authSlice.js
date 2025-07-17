import { createSlice } from "@reduxjs/toolkit";
import { loginUser, logoutUser } from "./authTrunk";

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
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

      // ✅ loginUser
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user || action.payload;
        state.isAuthenticated = true;
      })

      // ✅ logoutUser
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })

      // ✅ pending matcher
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      // ✅ fulfilled matcher
      .addMatcher(
        (action) => action.type.endsWith('/fulfilled'),
        (state) => {
          state.loading = false;
        }
      )

      // ✅ rejected matcher
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload || action.error?.message || "Something went wrong";
        }
      );
  },
});

// ✅ Export actions
export const { setUser, resetAuthState } = authSlice.actions;

// ✅ Export reducer
export default authSlice.reducer;

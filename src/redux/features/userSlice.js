import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
  loading: false,
  userData: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action) {
      state.isAuthenticated = true; // Explicitly set to true
      state.loading = false;
      state.userData = action.payload;
    },
    logoutUser(state) {
      state.isAuthenticated = false;
      state.loading = false;
      state.userData = null;
    },
  },
});

export const { setUser, logoutUser } = userSlice.actions;
export default userSlice.reducer;
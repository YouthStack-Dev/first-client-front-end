import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

// 🔹 Thunk to handle logout
export const logoutUser = createAsyncThunk("user/logout", async () => {
  try {
    Cookies.remove("auth_token");
  } catch (err) {
    console.error("Error clearing auth_token cookie:", err);
  }
});

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    });
  },
});

export const { setUser, setLoading } = userSlice.actions;
export default userSlice.reducer;

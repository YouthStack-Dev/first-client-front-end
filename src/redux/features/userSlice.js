import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

// 🔹 Thunk to handle logout
export const logoutUser = createAsyncThunk("user/logout", async () => {
  try {
    Cookies.remove("auth_token"); // remove your token cookie
  } catch (err) {
    console.error("Error clearing auth_token cookie:", err);
  }
});

const initialState = {
  user: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
    });
  },
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;

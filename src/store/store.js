// src/store/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../redux/features/authSlice"; // ✅ adjust path if needed

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export default store;

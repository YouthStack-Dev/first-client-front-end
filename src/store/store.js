import { configureStore } from "@reduxjs/toolkit";
import driverReducer from "../redux/slices/driverSlice";
import authApi from "../redux/rtkquery/authApi";


const store = configureStore({
  reducer: {
    driver: driverReducer,
    [authApi.reducerPath]: authApi.reducer, // ✅ Add RTK Query API reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware), // ✅ Add RTK Query middleware
});

export default store;

import { configureStore } from "@reduxjs/toolkit";
import driverReducer from "../redux/features/driverSlice";
import userReducer from "../redux/features/userSlice";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "../redux/slices/authSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    driver: driverReducer,
    auth: authReducer,  // ← add this line
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      // other middleware if needed
    ),
});


// Optional but useful
setupListeners(store.dispatch);

export default store;

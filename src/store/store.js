import { configureStore } from "@reduxjs/toolkit";
import driverReducer from "../redux/features/driverSlice";
import userReducer from "../redux/features/userSlice";
import { setupListeners } from "@reduxjs/toolkit/query";

const store = configureStore({
  reducer: {
    user: userReducer,
    driver: driverReducer,

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      ),
});

// Optional but useful
setupListeners(store.dispatch);

export default store;

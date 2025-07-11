import { configureStore } from "@reduxjs/toolkit";
import driverReducer from "../redux/features/driverSlice";
import userReducer from "../redux/features/userSlice";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "../redux/features/authSlice";
 import manageTeamSlice from "../redux/features/manageTeam/manageTeamSlice"
const store = configureStore({
  reducer: {
    user: userReducer,
    driver: driverReducer,
    auth: authReducer, 
    manageTeam: manageTeamSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      // other middleware if needed
    ),
});


// Optional but useful
setupListeners(store.dispatch);

export default store;

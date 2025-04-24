import { configureStore } from "@reduxjs/toolkit";
import authApi from "../redux/rtkquery/authApi";
import driverApi from "../redux/rtkquery/driverRtk";
import driverReducer from "../redux/features/driverSlice";
import userReducer from "../redux/features/userSlice";
import { setupListeners } from "@reduxjs/toolkit/query";
import clientApi from "../redux/rtkquery/clientRtk";

const store = configureStore({
  reducer: {
    user: userReducer,
    driver: driverReducer,
    [authApi.reducerPath]: authApi.reducer,
    [driverApi.reducerPath]: driverApi.reducer,
    [clientApi.reducerPath]: clientApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware,
       driverApi.middleware,
       clientApi.middleware
      ),
});

// Optional but useful
setupListeners(store.dispatch);

export default store;

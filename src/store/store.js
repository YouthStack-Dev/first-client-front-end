// src/redux/store.js

import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

// RTK Query APIs
import authApi from "../redux/rtkquery/authApi";
import driverApi from "../redux/rtkquery/driverRtk";
import clientApi from "../redux/rtkquery/clientRtk";

// Regular Redux Slices
import userReducer from "../redux/features/userSlice";
import driverReducer from "../redux/features/driverSlice";

const store = configureStore({
  reducer: {
    // Local state reducers
    user: userReducer,
    driver: driverReducer,

    // API slices (RTK Query)
    [authApi.reducerPath]: authApi.reducer,
    [driverApi.reducerPath]: driverApi.reducer,
    [clientApi.reducerPath]: clientApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      driverApi.middleware,
      clientApi.middleware
    ),
});

// Enables features like refetchOnFocus/refetchOnReconnect for all APIs
setupListeners(store.dispatch);

export default store;

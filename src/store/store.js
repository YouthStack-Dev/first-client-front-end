// import { configureStore } from "@reduxjs/toolkit";
// import driverReducer from "../redux/features/driverSlice";
// import userReducer from "../redux/features/userSlice";
// import { setupListeners } from "@reduxjs/toolkit/query";
// import authReducer from "../redux/features/authSlice";
//  import manageTeamSlice from "../redux/features/manageTeam/manageTeamSlice"
// const store = configureStore({
//   reducer: {
//     user: userReducer,
//     driver: driverReducer,
//     auth: authReducer, 
//     manageTeam: manageTeamSlice,
//   },
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware().concat(
//       // other middleware if needed
//     ),
// });


// // Optional but useful
// setupListeners(store.dispatch);

// export default store;


import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import driverReducer from "../redux/features/driverSlice";
import userReducer from "../redux/features/userSlice";
import authReducer from "../redux/features/authSlice";
import manageTeamReducer from "../redux/features/manageTeam/manageTeamSlice";
import shiftCategoryReducer from "../redux/features/Category/shiftCategorySlice";
import shiftReducer from "../redux/features/Shifts/shiftSlice";
import vehicleTypeReducer from "../redux/features/managevehicletype/vehicleTypeSlice"; // ✅ New import

const store = configureStore({
  reducer: {
    user: userReducer,
    driver: driverReducer,
    auth: authReducer,
    manageTeam: manageTeamReducer,
    shiftCategory: shiftCategoryReducer,
    shift: shiftReducer,
    vehicleType: vehicleTypeReducer, // ✅ Register here
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

setupListeners(store.dispatch);

export default store;


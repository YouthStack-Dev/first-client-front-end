import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import driverReducer from "../redux/features/manageDriver/driverSlice";
import authReducer from "../redux/features/auth/authSlice";
import userReducer from "../redux/features/user/userSlice";
import shiftCategoryReducer from "../redux/features/Category/shiftCategorySlice";
import shiftReducer from "../redux/features/Shifts/shiftSlice";
import vehicleTypeReducer from "../redux/features/managevehicletype/vehicleTypeSlice";
import vendorReducer from "../redux/features/managevendors/vendorSlice";  
import vehicleReducer  from "../redux/features/manageVehicles/vehicleSlice";

const store = configureStore({
  reducer: {
    drivers: driverReducer,
    auth: authReducer,
    user:userReducer,
    shiftCategory: shiftCategoryReducer,
    shift: shiftReducer,
    vehicleType: vehicleTypeReducer,
    vendor: vendorReducer,  
     vehicle: vehicleReducer,  
  },
  
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

setupListeners(store.dispatch);

export default store;



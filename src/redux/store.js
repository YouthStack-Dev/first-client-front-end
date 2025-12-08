import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import userReducer from "./features/user/userSlice";
import shiftReducer from "./features/shift/shiftSlice";
import vendorReducer from "./features/vendors/vendorSlice";
import driverReducer from "./features/manageDriver/driverSlice";
import companyReducer from "./features/company/companyslice";
import permissionsReducer from "./features/Permissions/permissionsSlice";
import vehicleTypeReducer from "./features/managevehicletype/vehicleTypeSlice";
import cutoffReducer from "./features/cutoff/cutoffSlice";
import vehicleReducer from "./features/manageVehicles/vehicleSlice";
import routeReducer from "./features/routes/roureSlice";
import newDriverReducer from "./features/manageDriver/newDriverSlice";
import escortReducer from "./features/escort/escortSlice";
const store = configureStore({
  reducer: {
    shift: shiftReducer,
    auth: authReducer,
    user: userReducer,
    vendor: vendorReducer,
    drivers: driverReducer,
    company: companyReducer,
    permissions: permissionsReducer,
    vehicleType: vehicleTypeReducer,
    cutoff: cutoffReducer,
    vehicles: vehicleReducer,
    route: routeReducer,
    newDriver: newDriverReducer,
    escort: escortReducer,
  },
});

export default store;

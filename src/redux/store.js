import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import userReducer from "./features/user/userSlice";
import shiftReducer from "./features/shift/shiftSlice";
import vendorReducer from "./features/vendors/vendorSlice";
import driverReducer from "./features/manageDriver/driverSlice";
import companyReducer from "./features/company/companyslice";
import permissionsReducer from "./features/Permissions/permisssionsSlice";
import companyVendorReducer from "./features/companyVendor/companyVendorSlice";
import vehicleTypeReducer from "./features/managevehicletype/vehicleTypeSlice";
import cutoffReducer from "./features/cutoff/cutoffSlice";
import vehicleReducer from "./features/manageVehicles/vehicleSlice";
import routeReducer from "./features/routes/roureSlice";

const store = configureStore({
  reducer: {
    shift: shiftReducer,
    auth: authReducer,
    user: userReducer,
    vendor: vendorReducer,
    drivers: driverReducer,
    company: companyReducer,
    permissions: permissionsReducer,
    companyVendor: companyVendorReducer,
    vehicleType: vehicleTypeReducer,
    cutoff: cutoffReducer,
    vehicles: vehicleReducer,
    route: routeReducer,
  },
});

export default store;

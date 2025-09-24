import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import userReducer from "./features/user/userSlice";
import shiftReducer from "./features/shift/shiftSlice";
import vendorReducer from "./features/vendors/vendorSlice";
import driverReducer from "./features/drivers/driverSlice";
import companyReducer from "./features/company/companyslice";
import permissionsReducer from "./features/Permissions/permisssionsSlice";
import companyVendorReducer from  "./features/companyVendor/companyVendorSlice"

const store = configureStore({
  reducer: {
    shift: shiftReducer,
    auth: authReducer,
    user: userReducer,
    vendor: vendorReducer,
    driver: driverReducer,
    company: companyReducer, 
    permissions: permissionsReducer,
    companyVendor:companyVendorReducer
  },
});

export default store;

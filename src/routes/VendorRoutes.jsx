import { Route } from "react-router-dom";
import VendorLayout from "../vendor/VendorLayout";
import CompanyDashboard from "../companies/CompanyDashboard";
import ManageEmployees from "../pages/ManageEmployees";
import VendorUserManagement from "../pages/VendorUserManagement";
import RoleManagement from "../components/RoleManagement/RoleManagement";
import VendorRouteManagement from "../components/RouteManagement/VendorRouteManagement";
import ManageDrivers from "../pages/ManageDrivers";
import VehicleManagement from "../pages/VehicleManagement";
import EmployeeForm from "../components/departments/EmployeeForm";
import NewDriverManagement from "../pages/NewDriverManagement";

export const VendorRoutes = () => (
  <Route element={<VendorLayout type="vendor" />}>
    <Route path="dashboard" element={<CompanyDashboard />} />
    <Route path="employees" element={<ManageEmployees />} />
    <Route path="vendor-user-management" element={<VendorUserManagement />} />
    <Route path="role-permission" element={<RoleManagement />} />
    <Route path="routing" element={<VendorRouteManagement />} />
    <Route
      path="routing-listing"
      element={<h1>This is the page of route listing</h1>}
    />
    <Route
      path="employees/:userId/edit"
      element={<EmployeeForm mode="edit" />}
    />
    <Route
      path="employees/:userId/view"
      element={<EmployeeForm mode="view" />}
    />
    <Route path="reports" element={<h1>Vendor Reports</h1>} />
    <Route path="drivers" element={<ManageDrivers />} />
    <Route path="driverform" element={<NewDriverManagement />} />
    <Route path="vehicles" element={<VehicleManagement />} />
  </Route>
);

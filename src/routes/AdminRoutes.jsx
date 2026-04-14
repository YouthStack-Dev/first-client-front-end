import { Route } from "react-router-dom";
import SuperAdminDashboard from "../superadmin/SuperAdminDashboard";
import CompanyManagement from "../pages/CompanyManagement";
import ReportsManagement from "../pages/ReportManagement";
import NewVendorManagement from "../pages/NewVendorManagement";
import AdminLayout from "../superadmin/layout/AdminLayout";
import RoleManagement from "../components/RoleManagement/RoleManagement";
import IamPermissionsPage from "../pages/IamPermissionsPage";
import TeamManagement from "../pages/TeamManagement";
import TeamEmployeesManagement from "../components/TeamEmployees/TeamEmployeesManagemnt.jsx";

export const AdminRoutes = () => (
  <Route element={<AdminLayout />}>
    <Route path="dashboard"             element={<SuperAdminDashboard />} />
    <Route path="manage-companies"      element={<CompanyManagement />} />
    <Route path="reports-management"    element={<ReportsManagement />} />
    <Route path="manage-vendors"        element={<NewVendorManagement />} />
    <Route path="new-vendor-management" element={<NewVendorManagement />} />
    <Route path="role-management"       element={<RoleManagement />} />
    <Route path="iam/permissions"       element={<IamPermissionsPage />} />

    {/* No PermissionCheck here — superadmin bypasses all permission gates */}
    <Route path="teams"                  element={<TeamManagement />} />
    <Route path="teams/:teamId/employees" element={<TeamEmployeesManagement />} />
  </Route>
);
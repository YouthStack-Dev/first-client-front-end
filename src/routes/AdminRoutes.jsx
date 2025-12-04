import { Route } from "react-router-dom";
import SuperAdminLayout from "../superadmin/layout/SuperAdminLayout";
import ManageDepartment from "../pages/ManageDepartment";
import SuperAdminDashboard from "../superadmin/SuperAdminDashboard";
import CompanyManagement from "../pages/CompanyManagement";
import VendorManagement from "../pages/VendorManagement";
import ReportsManagement from "../pages/ReportManagement";
import NewVendorManagement from "../pages/NewVendorManagement";

export const AdminRoutes = () => (
  <Route element={<SuperAdminLayout />}>
    <Route path="departments" element={<ManageDepartment />} />
    <Route path="dashboard" element={<SuperAdminDashboard />} />
    <Route path="manage-companies" element={<CompanyManagement />} />
    <Route path="manage-vendors" element={<VendorManagement />} />
    <Route path="repots-management" element={<ReportsManagement />} />
    <Route path="new-vendor-management" element={<NewVendorManagement />} />
    <Route path="teams" element={<ManageDepartment />} />
  </Route>
);

import { Route } from "react-router-dom";
import SuperAdminDashboard from "../superadmin/SuperAdminDashboard";
import CompanyManagement from "../pages/CompanyManagement";
import ReportsManagement from "../pages/ReportManagement";
import NewVendorManagement from "../pages/NewVendorManagement";
import AdminLayout from "../superadmin/layout/AdminLayout";

export const AdminRoutes = () => (
  // <Route element={<SuperAdminLayout />}>
  <Route element={<AdminLayout />}>
    <Route path="dashboard" element={<SuperAdminDashboard />} />
    <Route path="manage-companies" element={<CompanyManagement />} />
    <Route path="repots-management" element={<ReportsManagement />} />
    <Route path="new-vendor-management" element={<NewVendorManagement />} />
  </Route>
);

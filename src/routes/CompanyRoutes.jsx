import { Route } from "react-router-dom";
import Layout from "../companies/layout/layout";
import EmployeeForm from "../components/departments/EmployeeForm";
import ManageDepartment from "../pages/ManageDepartment";
import ManageEmployees from "../pages/ManageEmployees";
import VehicleManagement from "../pages/VehicleManagement";
// import ManageDrivers from "../pages/ManageDrivers";
import CompanyDashboard from "../companies/CompanyDashboard";
import Schedulemanagement from "../pages/Schedulemanagement";
import CutoffManagement from "../components/Schedulemanagement/CutoffManagement";
import ProfilePage from "../pages/ProfilePage";
import BookingManagement from "../pages/BookingManagement";
import RouteScheduledBookings from "../components/RouteManagement/RouteScheduledBookings";
import ShiftRoutingManagement from "../components/RouteManagement/ShiftRoutingManagement";
import NewVendorManagement from "../pages/NewVendorManagement";
import ReportsManagement from "../pages/ReportManagement";
import PermissionCheck from "../middleware/PermissionCheck";
import RoleManagement from "../components/RoleManagement/RoleManagement";
import ReportDownloader from "../pages/ReportDownloader";
import VendorUserManagement from "../pages/VendorUserManagement";
import TrackingManagement from "../pages/TrackingManagement";
import NewDriverManagement from "../pages/NewDriverManagement";
import EscortManagement from "../pages/EscortManagement";
import AlertConfigManagement from "../pages/AlertManagement";
import NotificationsPage from "../pages/NotificationPage";
import TeamManagement from "../pages/TeamManagement";
import TeamEmployeesManagement from "../components/TeamEmployees/TeamEmployeesManagemnt.jsx";
export const CompanyRoutes = () => (
  <Route path="/companies" element={<Layout type="employee" />}>
    <Route path="dashboard" element={<CompanyDashboard />} />

    <Route
      path="company-management"
      element={
        <PermissionCheck module="permissions" action="read">
          <h1>This is to check the permission based UI</h1>
        </PermissionCheck>
      }
    />
    <Route path="teams" element={<TeamManagement />} />
    <Route
      path="teams/:teamId/employees"
      element={
        <PermissionCheck module="employee" action="read">
          <TeamEmployeesManagement />
        </PermissionCheck>
      }
    />
    <Route path="departments" element={<ManageDepartment />} />
    <Route path="vendor-user-management" element={<VendorUserManagement />} />
    <Route path="shift-categories" element={<ManageDepartment />} />
    <Route path="shifts" element={<Schedulemanagement />} />
    <Route path="role-management" element={<RoleManagement />} />
    <Route path="role-permission" element={<RoleManagement />} />
    <Route path="manage-company" element={<ManageDepartment />} />
    <Route path="scheduling" element={<Schedulemanagement />} />
    <Route path="employees/create" element={<EmployeeForm />} />
    <Route path="cutoff" element={<CutoffManagement />} />
    <Route path="alert-config" element={<AlertConfigManagement />} />
    <Route path="vehicles-management" element={<VehicleManagement />} />
    <Route path="new-vendor-management" element={<NewVendorManagement />} />
    <Route path="profile" element={<ProfilePage />} />
    <Route path="reports-management" element={<ReportsManagement />} />
    <Route path="employee/create-employee" element={<EmployeeForm />} />
    <Route path="driverform" element={<NewDriverManagement />} />
    <Route path="notification" element={<NotificationsPage />} />
    <Route
      path="department/:depId/employees"
      element={
        <PermissionCheck module="employee" action="read">
          <ManageEmployees />
        </PermissionCheck>
      }
    />

    <Route
      path="department/:depId/employees/:userId/edit"
      element={<EmployeeForm mode="edit" />}
    />

    <Route
      path="department/:depId/employees/:userId/view"
      element={<EmployeeForm mode="view" />}
    />

    <Route path="tracking" element={<TrackingManagement />} />
    <Route path="report-downloader" element={<ReportDownloader />} />
    <Route path="routing" element={<RouteScheduledBookings />} />
    <Route path="escort-management" element={<EscortManagement />} />
    <Route
      path="shift/:shiftId/:shiftType/:date/routing-map"
      element={<ShiftRoutingManagement />}
    />

    <Route
      path="employee/:employee_id/bookings"
      element={<BookingManagement />}
    />

    <Route path="repots-management" element={<ReportsManagement />} />
  </Route>
);

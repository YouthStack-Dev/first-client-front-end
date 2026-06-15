import { Route } from "react-router-dom";
import VendorLayout from "../vendor/VendorLayout";
import CompanyDashboard from "../companies/CompanyDashboard";
import VendorUserManagement from "../pages/VendorUserManagement";
import RoleManagement from "../components/RoleManagement/RoleManagement";
import VendorRouteManagement from "../components/RouteManagement/VendorRouteManagement";
import VehicleManagement from "../pages/VehicleManagement";
import NewDriverManagement from "../pages/NewDriverManagement";
import Schedulemanagement from "../pages/Schedulemanagement";
import CutoffManagement from "../components/Schedulemanagement/CutoffManagement";
import ProfilePage from "../pages/ProfilePage";
import ReportsManagement from "../pages/ReportManagement";
import BookingManagement from "../pages/BookingManagement";
import ReportDownloader from "../pages/ReportDownloader";
import TrackingManagement from "../pages/TrackingManagement";
import EscortManagement from "../pages/EscortManagement";
import AlertConfigManagement from "../pages/AlertManagement";
import NotificationsPage from "../pages/NotificationPage";
import TeamManagement from "../pages/TeamManagement";
import TeamEmployeesManagement from "../components/TeamEmployees/TeamEmployeesManagemnt.jsx";
import ReviewManagement from "../pages/ReviewManagement";
import ManageAnnouncements from "../pages/ManageAnnouncements";
import SpeedViolationsPage from "../pages/SpeedViolationsPage";
import NodalPointsPage from "../pages/NodalpointsPage";
import ChatSessionsPage from "../pages/ChatSessionsPage";
import LivedriversPage from "../pages/Livedrivermap";
import ShiftRoutingManagement from "../components/RouteManagement/ShiftRoutingManagement";
import RouteScheduledBookings from "../components/RouteManagement/RouteScheduledBookings";
import ContractManagement from "../pages/ContractManagement";

export const VendorRoutes = () => (
  <Route element={<VendorLayout type="vendor" />}>
    {/* ── Dashboard ──────────────────────────────────────────── */}
    <Route path="dashboard"              element={<CompanyDashboard />} />

    {/* ── Fleet ──────────────────────────────────────────────── */}
    <Route path="vehicles-management"               element={<VehicleManagement />} />
    <Route path="driver-management"      element={<NewDriverManagement />} />
    <Route path="driverform"             element={<NewDriverManagement />} />
    <Route path="escort-management"      element={<EscortManagement />} />

    {/* ── Operations ─────────────────────────────────────────── */}
    <Route path="shifts"                 element={<Schedulemanagement />} />
    <Route path="scheduling"             element={<Schedulemanagement />} />
    <Route path="cutoff"                 element={<CutoffManagement />} />
    <Route path="routing"                element={<VendorRouteManagement />} />
    <Route path="routing-listing"        element={<RouteScheduledBookings />} />
    <Route path="tracking"               element={<TrackingManagement />} />
    <Route path="live-drivers"           element={<LivedriversPage />} />
    <Route path="nodal-points"           element={<NodalPointsPage />} />
    <Route path="speed-violations"       element={<SpeedViolationsPage />} />
    <Route
      path="shift/:shiftId/:shiftType/:date/routing-map"
      element={<ShiftRoutingManagement />}
    />
    <Route path="contracts" element={<ContractManagement />} />

    {/* ── Bookings ───────────────────────────────────────────── */}
    <Route path="booking"                element={<BookingManagement />} />

    {/* ── Teams ──────────────────────────────────────────────── */}
    <Route path="teams"                  element={<TeamManagement />} />
    <Route
      path="teams/:teamId/employees"
      element={<TeamEmployeesManagement />}
    />

    {/* ── Reports ────────────────────────────────────────────── */}
    <Route path="reports-management"     element={<ReportsManagement />} />
    <Route path="report-downloader"      element={<ReportDownloader />} />

    {/* ── Admin ──────────────────────────────────────────────── */}
    <Route path="vendor-user-management" element={<VendorUserManagement />} />
    <Route path="role-permission"        element={<RoleManagement />} />
    <Route path="alert-config"           element={<AlertConfigManagement />} />
    <Route path="reviews"                element={<ReviewManagement />} />
    <Route path="announcements"          element={<ManageAnnouncements />} />
    <Route path="chats"                  element={<ChatSessionsPage />} />
    <Route path="notification"           element={<NotificationsPage />} />
    <Route path="profile"                element={<ProfilePage />} />
  </Route>
);
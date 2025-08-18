import { BrowserRouter as Router, Routes, Route, BrowserRouter } from 'react-router-dom';
import {  lazy, useState } from 'react';

import Layout from './components/layout/layout';
import ManageClients from './pages/ManageClients';
import ManageRoles from './pages/ManageRoles';
import ProtectedRouteAuth from './middleware/ProtectedRouteAuth';
import ShiftCategoryManagement from "./pages/ShiftCategoryManagement";

// ✅ Existing Vehicle Contract Related Pages
import VehicleContract from './pages/VehicleContract';
import ManageCompanies from './pages/ManageCompanies';
import TrackingScreen from './pages/TrackingScreen';
import AdminDashboard from './components/dashboards/AdminDashboard';
import ClientDashboard from './components/dashboards/CompanyDashboard';
import ManageEmployees from './pages/ManageEmployees';
import ManageDepartment from './pages/ManageDepartment';
import { ToastContainer } from 'react-toastify';
import VehicleManagement from './pages/VehicleManagement';
import { Login } from './pages/Login';
import { PublicRoute } from './middleware/PublicRoute';
import CompanyDashboard from './components/dashboards/CompanyDashboard';
import TeamManagement from './components/teams/TeamManagement';
import EmployeTeamManagement from './pages/EmployeTeamManagement';

// ✅ Existing Lazy Loaded Components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));
const ManageDrivers = lazy(() => import('./pages/ManageDrivers'));
const RouteManagement = lazy(() => import('./pages/RouteManagement'));
const ManageVehicles = lazy(() => import('./pages/ManageVehicles'));
const BookingManagement = lazy(() => import('./pages/BookingManagement'));
const ManageUser = lazy(() => import('./pages/ManageUser'));
const EmployeeForm = lazy(() => import('./components/teams/EmployeeForm'));
const VehicleForm = lazy(() => import('./components/VehicleForm'));
const DriverForm = lazy(() => import('./components/driver/DriverForm'));
const ManageVehicleTypes = lazy(() => import('./pages/ManageVehicleType'));
const ShiftManagement = lazy(() => import('./pages/ShiftManagement'));
const ManageVendor = lazy(() => import('./pages/ManageVendor'));
const ManageStaffs = lazy(() => import('./pages/ManageStaffs'));
const CalendarPopupExample = lazy(() => import('./components/ui/CalendarPopupExample'));
const AddContractForm = lazy(() => import('./components/ContractForm'));

// ✅ Placeholder Components for Menu Items (Using h1 as requested)
const PlaceholderPage = ({ title, description }) => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-800 mb-4">{title}</h1>
    {description && <p className="text-gray-600">{description}</p>}
  </div>
);


// User Management Placeholder Components
const UserManagement = () => <PlaceholderPage title="User Management" description="This is User Management screen" />;
const EmployeeManagement = () => <PlaceholderPage title="Employee Management" description="This is Employee Management screen" />;

// Management Placeholder Components
const GroupManagement = () => <PlaceholderPage title="Group Management" description="This is Group Management screen" />;
const MappingManagement = () => <PlaceholderPage title="Mapping Management" description="This is Mapping Management screen" />;

// Policy & Service Management Placeholder Components
const PolicyManagement = () => <PlaceholderPage title="Policy Management" description="This is Policy Management screen" />;
const Policies = () => <PlaceholderPage title="Policies" description="This is Policies screen" />;
const PolicyRules = () => <PlaceholderPage title="Policy Rules" description="This is Policy Rules screen" />;
const ServiceManagement = () => <PlaceholderPage title="Service Management" description="This is Service Management screen" />;
const TenantManagement = () => <PlaceholderPage title="Tenant Management" description="This is Tenant Management screen" />;

// Fleet Management Placeholder Components
const VehicleTypes = () => <PlaceholderPage title="Vehicle Types" description="This is Vehicle Types screen" />;

// Operations Placeholder Components
const RoutingManagement = () => <PlaceholderPage title="Routing Management" description="This is Routing Management screen" />;
const TrackingManagement = () => <PlaceholderPage title="Tracking Management" description="This is Tracking Management screen" />;

// Shift Management Placeholder Components
const Shifts = () => <PlaceholderPage title="Manage Shifts" description="This is Manage Shifts screen" />;
const ShiftCategories = () => <PlaceholderPage title="Shift Categories" description="This is Shift Categories screen" />;
const CutoffSettings = () => <PlaceholderPage title="Cutoff Settings" description="This is Cutoff Settings screen" />;

const NotFound = () => (
  <div className="flex justify-center items-center h-screen">
    <h1 className="text-3xl font-bold text-red-600">404 - Page Not Found</h1>
  </div>
);

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
    
      <Routes>
        {/* ✅ Public Routes */}
        <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
       
        {/* ✅ Protected Routes */}
        <Route element={<ProtectedRouteAuth />}>
          <Route element={<Layout />}>
          <Route path="/practice" element={<EmployeTeamManagement/>} />
            {/* ================================ */}
            {/* 📊 DASHBOARD ROUTES */}
            {/* ================================ */}
            <Route path="/admin_dashboard" element={<AdminDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/client_dashboard" element={<ClientDashboard />} />
            <Route path="/company-dashboard" element={<CompanyDashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* ================================ */}
            {/* 👥 USER MANAGEMENT ROUTES */}
            {/* ================================ */}
            <Route path="/users" element={<ManageUser />} />
            <Route path="/user-management" element={<UserManagement />} />
            <Route path="/employees" element={<EmployeeManagement />} />
            <Route path="/employee/create-employee" element={<EmployeeForm />} />
            <Route path="/department/:depId/employees" element={<ManageEmployees />} />
            <Route path="/department/:depId/employees/:userId/edit" element={<EmployeeForm mode="edit" />} />
            <Route path="/department/:depId/employees/:userId/view" element={<EmployeeForm mode="view" />} />

            {/* ================================ */}
            {/* 🏢 MANAGEMENT ROUTES */}
            {/* ================================ */}
            <Route path="/departments" element={<ManageDepartment />} />
            <Route path="/groups" element={<GroupManagement />} />
            <Route path="/mappings" element={<MappingManagement />} />

            {/* ================================ */}
            {/* 🛡️ POLICY & SERVICE MANAGEMENT */}
            {/* ================================ */}
            <Route path="/policy-management" element={<PolicyManagement />} />
            <Route path="/policies" element={<Policies />} />
            <Route path="/policy-rules" element={<PolicyRules />} />
            <Route path="/services" element={<ServiceManagement />} />
            <Route path="/tenants" element={<TenantManagement />} />

            {/* ================================ */}
            {/* 🚗 FLEET MANAGEMENT ROUTES */}
            {/* ================================ */}
            <Route path="/vehicles" element={<VehicleManagement />} />
            <Route path="/old-vehicles" element={<ManageVehicles />} />
            <Route path="/vehicles/add-vehicle" element={<VehicleForm />} />
            <Route path="/vehicle-types" element={<VehicleTypes />} />
            <Route path="/vehicle-group" element={<ManageVehicleTypes />} />
            <Route path="/drivers" element={<ManageDrivers />} />
            <Route path="/driver-form" element={<DriverForm />} />

            {/* ================================ */}
            {/* 🏪 VENDOR MANAGEMENT */}
            {/* ================================ */}
            <Route path="/vendors" element={<ManageVendor />} />

            {/* ================================ */}
            {/* 🔄 OPERATIONS MANAGEMENT */}
            {/* ================================ */}
            <Route path="/routing" element={<RouteManagement />} />
            <Route path="/routing-management" element={<RoutingManagement />} />
            <Route path="/tracking" element={<TrackingScreen />} />
            <Route path="/tracking-management" element={<TrackingManagement />} />
            <Route path="/bookings" element={<BookingManagement />} />
            <Route path="/booking-management" element={<BookingManagement />} />

            {/* ================================ */}
            {/* ⏰ SHIFT MANAGEMENT ROUTES */}
            {/* ================================ */}
            <Route path="/shifts" element={<Shifts />} />
            <Route path="/manage-shift" element={<ShiftManagement />} />
            <Route path="/shift-categories" element={<ShiftCategories />} />
            <Route path="/shift-Categories" element={<ShiftCategoryManagement />} />
            <Route path="/cutoff-settings" element={<CutoffSettings />} />

            {/* ================================ */}
            {/* 📋 ADDITIONAL EXISTING ROUTES */}
            {/* ================================ */}
            <Route path="/manage-company" element={<ManageCompanies />} />
            <Route path="/role-management" element={<ManageRoles />} />
            <Route path="/staffs" element={<ManageStaffs />} />
            <Route path="/manage-client" element={<ManageClients />} />
            <Route path="/vehicle-contract" element={<VehicleContract />} />
            <Route path="/contract/create-contract" element={<AddContractForm />} />
            <Route path="/calender" element={<CalendarPopupExample />} />

            {/* ================================ */}
            {/* 🔧 UTILITY ROUTES */}
            {/* ================================ */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            
          </Route>
        </Route>

        {/* ✅ Catch All Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
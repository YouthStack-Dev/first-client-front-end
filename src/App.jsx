import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';



import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Unauthorized from './pages/Unauthorized';
import { ROLES } from './utils/auth';
import { useEffect, useState } from 'react';
import ManageDrivers from './pages/ManageDrivers';
import {  useDispatch } from 'react-redux';

import RouteManagement from './pages/RouteManagement';
import Home from './pages/Home';
import { jwtDecode } from 'jwt-decode';
import Cookies from "js-cookie";
import { setUser } from './redux/features/userSlice';
import ManageVehicles from './pages/ManageVehicles';
import BookingManagement from './pages/BookingManagement';
import ManageUser from './pages/ManageUser';
import EmployeeForm from './components/EmployeeForm';
import VehicleForm from './components/VehicleForm';
import DriverForm from './components/DriverForm';
import ManageVehicleTypes from './pages/ManageVehicleType';
import ShiftManagement from './pages/ShiftManagement';
import VehicleContract from './pages/VehicleContract';
import ManageVendor from './pages/ManageVendor';
import RoleManagement from './components/RoleManagement/RoleManagement';
import ManageStaffs from './pages/ManageStaffs';

import DashboardRouter from './components/dashboards/DashboardRouter';
import Layout from './components/layout/layout';
import ProtectedRoute from './components/ProtectedRoute';
import { log } from './utils/logger';

// Layout component for authenticated pages



const NotFound = () => (
  <div className="flex justify-center items-center h-screen">
    <h1 className="text-3xl font-bold text-red-600">404 - Page Not Found</h1>
  </div>
);

function App() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  log('This is a debug message');
  useEffect(() => {
    const token = Cookies.get("auth_token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        dispatch(setUser(decoded));
      } catch (err) {
        console.error("Invalid token");
        Cookies.remove("auth_token");
      }
    }
    setLoading(false);
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-semibold">Loading ...</p>
      </div>
    );
  }

  return (
    <Router>
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/" element={<Home />} />

      {/* Protected Routes */}
      <Route element={<Layout />}>


<Route element={<ProtectedRoute roles={["SUPER_ADMIN", "ADMIN", "VENDOR", "CLIENT"]} />}>
  <Route path="/dashboard" element={<DashboardRouter />} />
</Route>

        {/* Admin & Super Admin */}
        <Route element={<ProtectedRoute roles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/role-management" element={<RoleManagement />} />
          <Route path="/staffs" element={<ManageStaffs />} />
          <Route path="/users/create-employee" element={<EmployeeForm />} />
          <Route path="/users" element={<ManageUser />} />
          <Route path="/bookings" element={<BookingManagement />} />
          <Route path="/vehicles/add-vehicle" element={<VehicleForm />} />
          <Route path="/drivers/driver-form" element={<DriverForm />} />
          <Route path="/manage-shift" element={<ShiftManagement />} />
          <Route path="/shift-Categories" element={<h1>Shift Categories management</h1>} />
          <Route path="/shedule-polysies" element={<h1>Schedule Policies management</h1>} />
      
          <Route path="/audit-report" element={<h1> This is the audit report implimemntation </h1>} />
          <Route path="/manage-team" element={<h1> Manage team Implimentation</h1>} />
          <Route path="/manage-marshal" element={<h1>IMPIMENTATION OF  marshal management</h1>} />
          <Route path="/schedule-policies" element={<h1> IMPIMENTATION Schedule Policies</h1>} />
          <Route path="/staf-administration" element={<h1> IMPIMENTATION Schedule Policies</h1>} />
          <Route path="/security-dashboard" element={<h1> IMPIMENTATION Security-dashboards</h1>} />
          <Route path="/bussiness-unit" element={<h1> IMPIMENTATION bussiness-unit</h1>} />
          <Route path="/routing" element={<RouteManagement />} />
          {/* Additional features only for Super Admin inside Admin+SuperAdmin route */}
          {/* Use a nested ProtectedRoute for SUPER_ADMIN only */}
          <Route element={<ProtectedRoute roles={[ROLES.SUPER_ADMIN]} />}>
            <Route path="/vendors" element={<ManageVendor />} />
            <Route path="/company-admins" element={<h1>Company Admins management</h1>} />
            <Route path="/subadmins" element={<h1>Subadmin management</h1>} />
            <Route path="/sms-config" element={<h1>SMS Configuration</h1>} />
            
        
          </Route>
        </Route>

        {/* Vendor */}
        <Route element={<ProtectedRoute roles={[ROLES.VENDOR]} />}>
         <Route path="/vendor-dashboard" element={<h1>This is Vendor Dash board </h1>} />
          <Route path="/vehicles" element={<ManageVehicles />} />
         
          <Route path="/vehicle-contract" element={<VehicleContract />} />
          <Route path="/vehicle-group" element={<ManageVehicleTypes />} />
          <Route path="/drivers" element={<ManageDrivers />} />
        </Route>

        {/* Client */}
        <Route element={<ProtectedRoute roles={[ROLES.CLIENT]} />}>
          {/* Add client-specific routes */}
          <Route path="/client-dashboard" element={<h1>This is client Dash board </h1>} />
          <Route path="/client-profile" element={<h1>This is client Profile </h1>} />
        </Route>

      </Route>

        <Route path="*" element={<NotFound />} />
    </Routes>
  </Router>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Unauthorized from './pages/Unauthorized';
import { ROLES } from './utils/auth';
import { Menu } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
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
// Layout component for authenticated pages

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const mainContentRef = useRef(null);

  // Handle clicks outside sidebar on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (window.innerWidth < 1024 && // Only on mobile
          sidebarOpen && // Only when sidebar is open
          mainContentRef.current && 
          mainContentRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  return (
    <div className="flex">
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen}
        isPinned={isPinned}
        setIsPinned={setIsPinned}
      />

      <div 
        ref={mainContentRef}
        className={`flex-1 min-h-screen bg-gray-100 transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
        }`}
      >
        <div className="bg-white shadow-sm p-4 flex items-center lg:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors "
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
        <div className="p-2">
          <Outlet />
        </div>
      </div>
    </div>
  );
};




function App() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

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
          <Route path="/roleManagement" element={<RoleManagement />} />
          <Route path="/staffs" element={<ManageStaffs />} />
          <Route path="/users/create-employee" element={<EmployeeForm />} />
          <Route path="/users" element={<ManageUser />} />
          <Route path="/bookings" element={<BookingManagement />} />
          <Route path="/vehicles/add-vehicle" element={<VehicleForm />} />
          <Route path="/drivers/driver-form" element={<DriverForm />} />
          <Route path="/manage-shift" element={<ShiftManagement />} />
          <Route path="/shift-Categories" element={<h1>Shift Categories management</h1>} />
          <Route path="/shedule-polysies" element={<h1>Schedule Policies management</h1>} />
          <Route path="/drivers" element={<ManageDrivers />} />
          <Route path="/audit-report" element={<h1> This is the audit report implimemntation </h1>} />
          <Route path="/manage-team" element={<h1> Manage team Implimentation</h1>} />
          <Route path="/manage-marshal" element={<h1>IMPIMENTATION OF  marshal management</h1>} />
          <Route path="/schedule-policies" element={<h1> IMPIMENTATION Schedule Policies</h1>} />
          <Route path="/routing" element={<RouteManagement />} />
          {/* Additional features only for Super Admin inside Admin+SuperAdmin route */}
          {/* Use a nested ProtectedRoute for SUPER_ADMIN only */}
          <Route element={<ProtectedRoute roles={[ROLES.SUPER_ADMIN]} />}>
            <Route path="/vendors" element={<ManageVendor />} />
            <Route path="/company-admins" element={<h1>Company Admins management</h1>} />
            <Route path="/subadmins" element={<h1>Subadmin management</h1>} />
            <Route path="/sms-config" element={<h1>SMS Configuration</h1>} />
            
            <Route path="/drivers" element={<ManageDrivers />} />
          </Route>
        </Route>

        {/* Vendor */}
        <Route element={<ProtectedRoute roles={[ROLES.VENDOR]} />}>
         <Route path="/vendor-dashboard" element={<h1>This is client Dash board </h1>} />
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
    </Routes>
  </Router>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import Cookies from "js-cookie";
import { setUser } from './redux/features/userSlice';
import { ROLES } from './utils/auth';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/layout';
import Loading from './components/ui/Loading'; // fallback loader
import { ModulePermissionContext} from './context/ModulePermissionContext';
import ManageClients from './pages/ManageClients';
import ManageRoles from './pages/ManageRoles';


// Lazy-loaded components
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));
const Home = lazy(() => import('./pages/Home'));
const ManageDrivers = lazy(() => import('./pages/ManageDrivers'));
const RouteManagement = lazy(() => import('./pages/RouteManagement'));
const ManageVehicles = lazy(() => import('./pages/ManageVehicles'));
const BookingManagement = lazy(() => import('./pages/BookingManagement'));
const ManageUser = lazy(() => import('./pages/ManageUser'));
const EmployeeForm = lazy(() => import('./components/EmployeeForm'));
const VehicleForm = lazy(() => import('./components/VehicleForm'));
const DriverForm = lazy(() => import('./components/driver/DriverForm'));
const ManageVehicleTypes = lazy(() => import('./pages/ManageVehicleType'));
const ShiftManagement = lazy(() => import('./pages/ShiftManagement'));
const VehicleContract = lazy(() => import('./pages/VehicleContract'));
const ManageVendor = lazy(() => import('./pages/ManageVendor'));
const RoleManagement = lazy(() => import('./components/RoleManagement/RoleManagement'));
const ManageStaffs = lazy(() => import('./pages/ManageStaffs'));
const DashboardRouter = lazy(() => import('./components/dashboards/DashboardRouter'));
const ManageTeams = lazy(() => import('./pages/ManageTeams'));
const CalendarPopupExample = lazy(() => import('./components/ui/CalendarPopupExample'));
const EmployeeList = lazy(() => import('./components/Employee/EmployeeList'));

// 404 fallback
const NotFound = () => (
  <div className="flex justify-center items-center h-screen">
    <h1 className="text-3xl font-bold text-red-600">404 - Page Not Found</h1>
  </div>
);

function App() {
  const dispatch = useDispatch();
  const [userLoading, setUserLoading] = useState(true);

  const { loading: permissionLoading } = useContext(ModulePermissionContext); // 👈 Context loading

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        dispatch(setUser(decoded));
      } catch (err) {
        console.error("Invalid token");
        localStorage.removeItem("access_token");
      }
    }
    setUserLoading(false);
  }, [dispatch]);
  

  if (userLoading || permissionLoading) {
    return <Loading />; // 👈 Show loading screen until both are ready
  }

  if (userLoading || permissionLoading) {
    return <Loading />;
  }

  return (
   
    <Router>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/" element={<Home />} />

          {/* Protected Routes */}
          <Route element={<Layout />}>
            <Route element={<ProtectedRoute roles={["SUPER_ADMIN", "ADMIN", "VENDOR", "CLIENT"]} />}>
            <Route path="/drivers" element={<ManageDrivers />} />
            <Route path="/driver-form" element={<DriverForm />} />
            <Route path="/billings-dashboard" element={<h1>This  will  be my billing dash board</h1>} />
            <Route path="/business-unit" element={<h1>This  will  business-unit</h1>} />
            <Route path="/staff-administration" element={<h1>This  will  staff-administration</h1>} />

              <Route path="/dashboard" element={<DashboardRouter />} />
            </Route>

            <Route path="/calender" element={<CalendarPopupExample />} />

            {/* Admin & Super Admin */}
            <Route element={<ProtectedRoute roles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]} />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/role-management" element={<ManageRoles />} />
              <Route path="/staffs" element={<ManageStaffs />} />
              <Route path="/employee/create-employee" element={<EmployeeForm />} />
              <Route path="/users" element={<ManageUser />} />
              <Route path="/bookings" element={<BookingManagement />} />
              <Route path="/vehicles/add-vehicle" element={<VehicleForm />} />
              <Route path="/manage-shift" element={<ShiftManagement />} />
              <Route path="/shift-Categories" element={<h1>Shift Categories management</h1>} />
              <Route path="/shedule-polysies" element={<h1>Schedule Policies management</h1>} />
              <Route path="/audit-report" element={<h1>This is the audit report implementation</h1>} />
              <Route path="/manage-team" element={<ManageTeams />} />
              <Route path="/teams/:teamId/employees" element={<EmployeeList />} />
              <Route path="/manage-marshal" element={<h1>Marshal management</h1>} />
              <Route path="/schedule-policies" element={<h1>Schedule Policies</h1>} />
              <Route path="/staf-administration" element={<h1>Staff Administration</h1>} />
              <Route path="/security-dashboard" element={<h1>Security Dashboard</h1>} />
              <Route path="/bussiness-unit" element={<h1>Business Unit</h1>} />
              <Route path="/routing" element={<RouteManagement />} />

              <Route element={<ProtectedRoute roles={[ROLES.SUPER_ADMIN]} />}>
                <Route path="/vendors" element={<ManageVendor />} />
                <Route path="/company-admins" element={<h1>Company Admins management</h1>} />
                <Route path="/subadmins" element={<h1>Subadmin management</h1>} />
                <Route path="/sms-config" element={<h1>SMS Configuration</h1>} />
              </Route>
            </Route>

            {/* Vendor */}
            <Route element={<ProtectedRoute roles={[ROLES.VENDOR]} />}>
              <Route path="/vendor-dashboard" element={<h1>Vendor Dashboard</h1>} />
              <Route path="/vehicles" element={<ManageVehicles />} />
              <Route path="/vehicle-contract" element={<VehicleContract />} />
              <Route path="/vehicle-group" element={<ManageVehicleTypes />} />
            </Route>


            {/* Client */}
            <Route element={<ProtectedRoute roles={[ROLES.CLIENT]} />}>
              <Route path="/client-dashboard" element={<h1>Client Dashboard</h1>} />
              <Route path="/client-profile" element={<h1>Client Profile</h1>} />
            </Route>
            <Route element={<ProtectedRoute roles={[ROLES.SUPER_ADMIN]} />}>
              <Route path="/manage-client" element={<ManageClients/>} />
            </Route>
          </Route>


          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;

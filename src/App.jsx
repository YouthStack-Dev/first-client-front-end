import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import Cookies from "js-cookie";
import { setUser } from './redux/features/userSlice';

import Layout from './components/layout/layout';
import Loading from './components/ui/Loading';
import { ModulePermissionContext } from './context/ModulePermissionContext';

import ManageClients from './pages/ManageClients';
import ManageRoles from './pages/ManageRoles';
import ProtectedRouteAuth from './middleware/ProtectedRouteAuth';
import ShiftCategoryManagement from "./pages/ShiftCategoryManagement";


// ✅ Vehicle Contract Related Pages
import VehicleContract from './pages/VehicleContract';
import ManageCompanies from './pages/ManageCompanies';
import TrackingScreen from './pages/TrackingScreen';
import { API_CLIENT } from './Api/API_Client';
import { log } from './utils/logger';

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
const ManageVendor = lazy(() => import('./pages/ManageVendor'));
const RoleManagement = lazy(() => import('./components/RoleManagement/RoleManagement'));
const ManageStaffs = lazy(() => import('./pages/ManageStaffs'));
const DashboardRouter = lazy(() => import('./components/dashboards/DashboardRouter'));
const ManageTeams = lazy(() => import('./pages/ManageTeams'));
const CalendarPopupExample = lazy(() => import('./components/ui/CalendarPopupExample'));
const EmployeeList = lazy(() => import('./components/Employee/EmployeeList'));
const AddContractForm = lazy(() => import('./components/ContractForm'));

const NotFound = () => (
  <div className="flex justify-center items-center h-screen">
    <h1 className="text-3xl font-bold text-red-600">404 - Page Not Found</h1>
  </div>
);

function App() {
  const dispatch = useDispatch();
  const [userLoading, setUserLoading] = useState(true);
  const { loading: permissionLoading } = useContext(ModulePermissionContext);

  const check = async ()=>{
 const res= await API_CLIENT.get('/message')
 log(" this is the responce data " , res.data)
  }
  useEffect(() => {
    check()
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
    setUserLoading(false);
  }, [dispatch]);

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
            <Route element={<ProtectedRouteAuth />}>

              {/* General */}
              <Route path="/drivers" element={<ManageDrivers />} />
              <Route path="/driver-form" element={<DriverForm />} />
              <Route path="/billings-dashboard" element={<h1>This will be my billing dashboard</h1>} />
              <Route path="/staff-administration" element={<h1>This will staff-administration</h1>} />
              <Route path="/vehicles" element={<ManageVehicles />} />
              <Route path="/dashboard" element={<DashboardRouter />} />
              <Route path="/calender" element={<CalendarPopupExample />} />
              <Route path="/manage-company" element={<ManageCompanies />} />
              {/* Admin & Super Admin */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/role-management" element={<ManageRoles />} />
              <Route path="/staffs" element={<ManageStaffs />} />
              <Route path="/employee/create-employee" element={<EmployeeForm />} />
              <Route path="/users" element={<ManageUser />} />
              <Route path="/bookings" element={<BookingManagement />} />
              <Route path="/vehicles/add-vehicle" element={<VehicleForm />} />
              <Route path="/manage-shift" element={<ShiftManagement />} />
              <Route path="/shift-Categories" element={<ShiftCategoryManagement />} />
              <Route path="/shedule-polysies" element={<h1>Schedule Policies management</h1>} />
              <Route path="/audit-report" element={<h1>This is the audit report implementation</h1>} />
              <Route path="/manage-team" element={<ManageTeams />} />
              <Route path="/teams/:teamId/employees" element={<EmployeeList />} />
              <Route path="/manage-marshal" element={<h1>Marshal management</h1>} />
              <Route path="/schedule-policies" element={<h1>Schedule Policies</h1>} />
              <Route path="/staf-administration" element={<h1>Staff Administration</h1>} />
              <Route path="/security-dashboard" element={<h1>Security Dashboard</h1>} />
              <Route path="/routing" element={<RouteManagement />} />
              <Route path="/vendors" element={<ManageVendor />} />
              <Route path="/company-admins" element={<h1>Company Admins management</h1>} />
              <Route path="/subadmins" element={<h1>Subadmin management</h1>} />
              <Route path="/sms-config" element={<h1>SMS Configuration</h1>} />
              <Route path="/manage-client" element={<ManageClients />} />
              <Route path="/tracking" element={<TrackingScreen/>} />
              <Route path="/switch-office" element={<h1> This is the screen where u can switch to those company  under u </h1>} />
              {/* ✅ VEHICLE CONTRACT EXTENSIONS */}

              

              {/* Legacy Route if needed */}
              <Route path="/vehicle-contract" element={<VehicleContract />} />
              <Route path="/vehicle-group" element={<ManageVehicleTypes />} />
              <Route path="/contract/create-contract" element={<AddContractForm />} />

              {/* Client Specific */}
              <Route path="/client-dashboard" element={<h1>Client Dashboard</h1>} />
              <Route path="/client-profile" element={<h1>Client Profile</h1>} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;

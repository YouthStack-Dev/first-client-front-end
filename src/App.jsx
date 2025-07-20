import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { jwtDecode } from 'jwt-decode';

import Layout from './components/layout/layout';
import Loading from './components/ui/Loading';
import { ModulePermissionContext } from './context/ModulePermissionContext';
// import ProtectedRouteLogin from './middleware/ProtectedRouteLogin';

import ManageClients from './pages/ManageClients';
import ManageRoles from './pages/ManageRoles';
import ProtectedRouteAuth from './middleware/ProtectedRouteAuth';
import ShiftCategoryManagement from "./pages/ShiftCategoryManagement";

// ✅ Vehicle Contract Related Pages
import VehicleContract from './pages/VehicleContract';
import ManageCompanies from './pages/ManageCompanies';
import TrackingScreen from './pages/TrackingScreen';
import AdminDashboard from './components/dashboards/AdminDashboard';
import ClientDashboard from './components/dashboards/ClientDashboard';
import GoogleMapView from './components/Map';

import { setUser } from './redux/features/auth/authSlice';
import { fetchAllShifts } from './redux/features/Shifts/shiftThunks';
import { fetchCutoffData } from './redux/features/Category/shiftCategoryThunks';



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

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        dispatch(setUser(decoded));
        
        setTimeout(() => {
          dispatch(fetchVendors({ skip: 0, limit: 100, tenant_id: decoded.tenant_id }));
          dispatch(fetchAllShifts());
          dispatch(fetchCutoffData());
        }, 300);
      } catch (err) {
        console.error("Invalid token");
        localStorage.removeItem("access_token");
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
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<GoogleMapView />} />
          {/* Protected Routes */}
          <Route element={<Layout />}>
            <Route element={<ProtectedRouteAuth />}>              
              <Route path="/drivers" element={<ManageDrivers />} />
              <Route path="/driver-form" element={<DriverForm />} />
              <Route path="/vehicles" element={<ManageVehicles />} />
              <Route path="/client_dashboard" element={<ClientDashboard />} />
              <Route path="/admin_dashboard" element={<AdminDashboard />} />
              <Route path="/calender" element={<CalendarPopupExample />} />
              <Route path="/manage-company" element={<ManageCompanies />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/role-management" element={<ManageRoles />} />
              <Route path="/staffs" element={<ManageStaffs />} />
              <Route path="/users" element={<ManageUser />} />
              <Route path="/bookings" element={<BookingManagement />} />
              <Route path="/vehicles/add-vehicle" element={<VehicleForm />} />
              <Route path="/manage-shift" element={<ShiftManagement />} />
              <Route path="/shift-Categories" element={<ShiftCategoryManagement />} />
              <Route path="/manage-team" element={<ManageTeams />} />
              <Route path="/teams/:teamId/employees" element={<EmployeeList />} />
              <Route path="/employee/create-employee" element={<EmployeeForm />} />

              <Route path="/employee/:employeeId/edit" element={<EmployeeForm mode="edit" />} />
              <Route path="/employee/:employeeId/view" element={<EmployeeForm mode="view" />} />
              <Route path="/routing" element={<RouteManagement />} />
              <Route path="/vendors" element={<ManageVendor />} />
              <Route path="/manage-client" element={<ManageClients />} />
              <Route path="/tracking" element={<TrackingScreen />} />
              <Route path="/vehicle-contract" element={<VehicleContract />} />
              <Route path="/vehicle-group" element={<ManageVehicleTypes />} />
              <Route path="/contract/create-contract" element={<AddContractForm />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;

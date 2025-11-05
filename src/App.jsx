import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import { Login } from "./pages/Login";
import { PublicRoute } from "./middleware/PublicRoute";
import Layout from "./companies/layout/layout";
import EmployeeForm from "./components/departments/EmployeeForm";
import ProtectedRouteAuth from "./middleware/ProtectedRouteAuth";
import ManageDepartment from "./pages/ManageDepartment";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ManageEmployees from "./pages/ManageEmployees";
import VendorManagement from "./pages/VendorManagement";
import VehicleManagement from "./pages/VehicleManagement";
import ManageDrivers from "./pages/ManageDrivers";
import SuperAdminLayout from "./superadmin/SuperAdminLayout";
import VendorLayout from "./vendor/VendorLayout";
import { useDispatch } from "react-redux";
import { initializeAuth } from "./redux/features/auth/authSlice";
import CompanyManagement from "./pages/CompanyManagement";
import SuperAdminDashboard from "./superadmin/SuperAdminDashboard";
import CompanyDashboard from "./companies/CompanyDashboard";
import RoleManagement from "./pages/RoleManagement";
import RouteManagement from "./pages/RouteManagement";
import Schedulemanagement from "./pages/Schedulemanagement";
import CutoffManagement from "./components/Schedulemanagement/CutoffManagement";
import ScheduledBookings from "./components/RouteManagement/RouteScheduledBookings";
import ProfilePage from "./pages/ProfilePage";
import BookingManagement from "./pages/BookingManagement";
import ClusterMapViewer from "./components/RouteManagement/ClusterMapViewer";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />

      <Routes>
        {/* ================= PRACTICE ROUTE ================= */}
        <Route path="/practice" element={<RoleManagement />} />

        {/* ================= PUBLIC LOGIN ROUTES ================= */}
        {/* Company Login */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/employee"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Vendor Login - EXACT PATH */}
        <Route
          path="/vendor"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* SuperAdmin Login - EXACT PATH */}
        <Route
          path="/superadmin"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* ================= SUPER ADMIN ROUTES ================= */}
        <Route
          path="/superadmin/*"
          element={
            <ProtectedRouteAuth
              type="admin"
              redirectPath="/superadmin"
              authRedirectPath="/superadmin/dashboard"
            />
          }
        >
          <Route element={<SuperAdminLayout />}>
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="manage-companies" element={<CompanyManagement />} />
            <Route path="manage-vendors" element={<VendorManagement />} />
            <Route path="iam-permissions" element={<VendorManagement />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* ================= VENDOR ROUTES ================= */}
        <Route
          path="/vendor/*"
          element={
            <ProtectedRouteAuth
              type="vendor"
              redirectPath="/vendor"
              authRedirectPath="/dashboard"
            />
          }
        >
          <Route element={<VendorLayout type={"vendor"} />}>
            <Route path="dashboard" element={<h1>Vendor Dashboard</h1>} />
            <Route path="employees" element={<ManageEmployees />} />
            <Route
              path="employees/:userId/edit"
              element={<EmployeeForm mode="edit" />}
            />
            <Route
              path="employees/:userId/view"
              element={<EmployeeForm mode="view" />}
            />
            <Route path="reports" element={<h1>Vendor Reports</h1>} />
            <Route path="drivers" element={<ManageDrivers />} />
            <Route path="vehicles" element={<VehicleManagement />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* ================= COMPANY ROUTES ================= */}
        <Route
          element={
            <ProtectedRouteAuth
              type="employee"
              redirectPath="/"
              authRedirectPath="/dashboard"
            />
          }
        >
          <Route element={<Layout type={"employee"} />}>
            <Route path="/dashboard" element={<CompanyDashboard />} />

            <Route path="departments" element={<ManageDepartment />} />
            <Route path="/shift-categories" element={<ManageDepartment />} />
            <Route path="/shifts" element={<Schedulemanagement />} />
            <Route path="/role-management" element={<RoleManagement />} />
            <Route path="/drivers" element={<ManageDrivers />} />
            <Route path="/manage-company" element={<ManageDepartment />} />
            <Route path="/scheduling" element={<Schedulemanagement />} />
            <Route path="employees/create" element={<EmployeeForm />} />
            <Route path="/cutoff" element={<CutoffManagement />} />
            <Route path="/manage-vendors" element={<VendorManagement />} />
            <Route path="/vehicles" element={<VehicleManagement />} />
            <Route path="/vendors" element={<VendorManagement />} />
            <Route path="/profile" element={<ProfilePage />} />

            <Route
              path="/employee/create-employee"
              element={<EmployeeForm />}
            />
            <Route
              path="/department/:depId/employees"
              element={<ManageEmployees />}
            />
            <Route
              path="/department/:depId/employees/:userId/edit"
              element={<EmployeeForm mode="edit" />}
            />
            <Route
              path="/department/:depId/employees/:userId/view"
              element={<EmployeeForm mode="view" />}
            />
            <Route
              path="/tracking"
              element={<h1> This is the screen of Tracking </h1>}
            />
            <Route
              path="/bookings"
              element={<h1> This is the screen of Booking </h1>}
            />
            <Route path="/routing" element={<RouteManagement />} />
            <Route
              path="/shift/:shiftId/:date/suggestions-route"
              element={<ClusterMapViewer mode="suggestions" />}
            />
            <Route
              path="/shift/:shiftId/:date/saved-routes"
              element={<ClusterMapViewer mode="saved" />}
            />
            <Route
              path="/shift/:shiftId/:date/pending-routes"
              element={<ClusterMapViewer />}
            />
            <Route
              path="/employee/:employee_id/bookings"
              element={<BookingManagement />}
            />

            {/* /   <Route path="/routing-management" element={<RoutingManagement />} /> */}
            <Route path="/pra" element={<ScheduledBookings />} />
            <Route
              path="/audit-report"
              element={<h1> This is the screen of audit-report </h1>}
            />
          </Route>
        </Route>

        {/* ================= 404 ROUTE ================= */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

const NotFound = () => (
  <div className="flex justify-center items-center h-screen">
    <h1 className="text-3xl font-bold text-red-600">404 - Page Not Found</h1>
  </div>
);

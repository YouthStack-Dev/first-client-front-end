import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { initializeAuth } from "./redux/features/auth/authSlice";
import { PublicRoutes } from "./routes/PublicRoutes";
import { CompanyRoutes } from "./routes/CompanyRoutes";
import { AdminRoutes } from "./routes/AdminRoutes";
import { VendorRoutes } from "./routes/VendorRoutes";
import ProtectedRouteAuth from "./middleware/ProtectedRouteAuth";
import Practice from "./pages/Practice";
import DocPage from "./Docs/SupademoPage";
import DriverForm from "./components/driver/NewDriverFrom";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />

      <Routes>
        {/* ================= PRACTICE & DEMO ROUTES ================= */}
        <Route path="/practice" element={<Practice />} />
        <Route path="/supademo" element={<DocPage />} />

        {/* ================= PUBLIC ROUTES ================= */}
        {PublicRoutes()}

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
          {AdminRoutes()}
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* ================= VENDOR ROUTES ================= */}
        <Route
          path="/vendor/*"
          element={
            <ProtectedRouteAuth
              type="vendor"
              redirectPath="/vendor"
              authRedirectPath="/vendor/dashboard"
            />
          }
        >
          {VendorRoutes()}
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* ================= COMPANY ROUTES ================= */}
        <Route
          element={
            <ProtectedRouteAuth
              type="employee"
              redirectPath="/"
              authRedirectPath=""
            />
          }
        >
          {CompanyRoutes()}
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

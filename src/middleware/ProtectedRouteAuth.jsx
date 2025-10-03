import { Navigate, Outlet, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";

const ProtectedRouteAuth = ({ type, redirectPath, authRedirectPath }) => {
  const token = Cookies.get("auth_token");
  const location = useLocation();
  const { user, isAuthenticated, authloading } = useSelector((state) => state.auth);

  // ⏳ If still loading → always wait
  if (authloading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h2 className="text-xl font-semibold animate-pulse">Loading... please wait</h2>
      </div>
    );
  }

    if (!token ||!isAuthenticated && authloading) {
      return <Navigate to={redirectPath} replace state={{ from: location }} />;
    }
 

  // 🚨 Role mismatch handling
  if (user?.type && user?.type !== type) {
    if (user?.type === "employee") return <Navigate to="/dashboard" replace />;
    if (user?.type === "admin") return <Navigate to="/superadmin/dashboard" replace />;
    if (user?.type === "vendor") return <Navigate to="/vendor/dashboard" replace />;
  }

  // 🚨 Redirect only if exactly on login path
  const isExactlyOnLoginPath = location.pathname === redirectPath;
  if (authRedirectPath && isExactlyOnLoginPath) {
    return <Navigate to={authRedirectPath} replace />;
  }

  // ✅ Otherwise, allow access
  return <Outlet />;
};

export default ProtectedRouteAuth;

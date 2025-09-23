import { Navigate, Outlet, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";

const ProtectedRouteAuth = ({ type, redirectPath, authRedirectPath }) => {
  const token = Cookies.get("auth_token");
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // ⏳ While auth is still being restored (we have token but no user data yet)
  if (token && !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h2 className="text-xl font-semibold animate-pulse">Loading...</h2>
      </div>
    );
  }

  // 🚨 If no token or not authenticated → send to login
  if (!token || !isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  // 🚨 Only check role mismatch once user data is available
  if (user?.type && user?.type !== type) {
    if (user?.type === "COMPANY") return <Navigate to="/dashboard" replace />;
    if (user?.type === "admin") return <Navigate to="/superadmin/dashboard" replace />;
    if (user?.type === "Vendor") return <Navigate to="/vendor/dashboard" replace />;
  }

  // 🚨 Only redirect to dashboard if we're exactly on the login path
  // This prevents redirects when refreshing sub-routes
  const isExactlyOnLoginPath = location.pathname === redirectPath;
  if (authRedirectPath && isExactlyOnLoginPath) {
    return <Navigate to={authRedirectPath} replace />;
  }

  // ✅ Otherwise, allow the current route (preserves current path on refresh)
  return <Outlet />;
};

export default ProtectedRouteAuth;
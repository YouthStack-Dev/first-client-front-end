import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRouteAuth = ({ redirectPath = "/login" }) => {
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);

  // Show a loading state while checking authentication
  if (loading) return <div>Loading...</div>;

  // If not authenticated or user not present, redirect
  if (!isAuthenticated || !user) return <Navigate to={redirectPath} replace />;

  // Render nested routes if authenticated
  return <Outlet />;
};

export default ProtectedRouteAuth;

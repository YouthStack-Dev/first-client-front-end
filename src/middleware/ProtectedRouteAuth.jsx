import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRouteAuth = ({ redirectPath = "/login" }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.userslice);

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to={redirectPath} />;

  return <Outlet />;
};

export default ProtectedRouteAuth;

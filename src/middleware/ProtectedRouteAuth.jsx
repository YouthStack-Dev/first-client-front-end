import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";

const ProtectedRouteAuth = ({ redirectPath = "/" }) => {
  const token = Cookies.get("access_token");

  if (!token) return <Navigate to={redirectPath} replace />;

  return <Outlet />;
};

export default ProtectedRouteAuth;

import { Navigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";

export const PublicRoute = ({ children }) => {
  const token = Cookies.get("access_token");
  const location = useLocation();

  // Only redirect if user is on the login page
  if (token && location.pathname === "/") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

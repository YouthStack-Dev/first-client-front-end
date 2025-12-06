import Cookies from "js-cookie";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export const PublicRoute = ({ children }) => {
  const token = Cookies.get("auth_token");
  const { user } = useSelector((state) => state.auth); // adjust slice name if needed

  // 🧠 Determine correct dashboard path based on user type
  const getDashboardPath = () => {
    if (!user?.type) return "/dashboard"; // fallback path

    switch (user.type.toLowerCase()) {
      case "employee":
        return "/companies/dashboard";
      case "vendor":
        return "/vendor/dashboard";
      case "superadmin":
        return "/superadmin/dashboard";
      default:
        return "/dashboard";
    }
  };

  // 🧭 If token exists → redirect to appropriate dashboard
  if (token && user) {
    return <Navigate to={getDashboardPath()} replace />;
  }

  return children;
};

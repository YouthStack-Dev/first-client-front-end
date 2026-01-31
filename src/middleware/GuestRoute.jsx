import Cookies from "js-cookie";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export const GuestRoute = ({ children }) => {
  const token = Cookies.get("auth_token");
  const { user, authloading } = useSelector((state) => state.auth); // adjust slice name if needed

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

  // ⏳ If authenticating or token exists but user not loaded yet -> Show loading
  if (authloading || (token && !user)) {
     return (
      <div className="flex items-center justify-center h-screen">
        <h2 className="text-xl font-semibold animate-pulse">
          Loading...
        </h2>
      </div>
    );
  }

  // 🧭 If token exists AND user is loaded → redirect to appropriate dashboard
  if (token && user) {
    return <Navigate to={getDashboardPath()} replace />;
  }

  return children;
};


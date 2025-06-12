import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoutePermission = ({ module, action = "canRead", fallback = "/unauthorized" }) => {
  const { role } = useSelector((state) => state.userslice);
  const { modules } = useSelector((state) => state.permissions); // permissions slice

  // Super admin bypass
  if (role === "SUPER_ADMIN") return <Outlet />;

  const modulePerm = modules?.[module];

  if (!modulePerm || !modulePerm[action]) {
    return <Navigate to={fallback} />;
  }

  return <Outlet />;
};

export default ProtectedRoutePermission;

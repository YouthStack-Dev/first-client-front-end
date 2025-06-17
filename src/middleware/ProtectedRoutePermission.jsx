// middleware/ProtectedRoutePermission.jsx
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { ModulePermissionContext } from "../context/ModulePermissionContext";

const ProtectedRoutePermission = ({ module, children }) => {
  const { modulePermissions, loading } = useContext(ModulePermissionContext);

  if (loading) return <div>Loading...</div>;

  const hasAccess = modulePermissions.some(
    (perm) => perm.module === module && perm.canRead
  );

  return hasAccess ? children : <Navigate to="/unauthorized" />;
};

export default ProtectedRoutePermission;

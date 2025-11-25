import React from "react";

const PermissionCheck = ({ module, action, children }) => {
  const getPermissions = () => {
    const userPermissions = sessionStorage.getItem("userPermissions");
    if (userPermissions) {
      const { permissions } = JSON.parse(userPermissions) || [];
      return permissions;
    }
    return [];
  };

  const permissions = getPermissions();

  const hasPermission = () => {
    if (!module || !action) return true; // no permission required
    const modulePermission = permissions.find((p) => p.module === module);
    return modulePermission?.action.includes(action);
  };

  if (!hasPermission()) {
    return (
      <div className="p-4 bg-red-50 border border-red-300 rounded text-red-700 my-2">
        <p className="font-bold">Permission Denied</p>
        <p>
          You do not have <b>{action.toUpperCase()}</b> access for{" "}
          <b>{module.toUpperCase()} MODULE</b>. Please contact your
          administrator.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default PermissionCheck;

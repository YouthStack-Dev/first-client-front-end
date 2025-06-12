import { useContext } from "react";
import { ModulePermissionContext } from "../context/ModulePermissionContext";
// Optional hook for easy access
export const useModulePermission = (moduleName) => {
  const { modulePermissions, loading } = useContext(ModulePermissionContext);

  const module = modulePermissions?.find(p => p.module === moduleName);

  return {
    canRead: module?.canRead || false,
    canWrite: module?.canWrite || false,
    canDelete: module?.canDelete || false,
    loading,
  };
};

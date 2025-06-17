import { useContext } from "react";
import { ModulePermissionContext } from "../context/ModulePermissionContext";

// Enhanced hook for module-level permission checks
export const useModulePermission = (moduleName) => {
  const { modulePermissions, loading } = useContext(ModulePermissionContext);

  const module = modulePermissions?.find(p => p.module === moduleName);

  const notFound = !module;

  return {
    canRead: module?.canRead || false,
    canWrite: module?.canWrite || false,
    canDelete: module?.canDelete || false,
    loading,
    notFound,
  };
};

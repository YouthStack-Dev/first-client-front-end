import { useContext } from "react";
import { ModulePermissionContext } from "../context/ModulePermissionContext";
import { log } from "../utils/logger";

// Updated hook to support nested permissions structure
export const useModulePermission = (moduleName) => {
  const { modulePermissions, loading } = useContext(ModulePermissionContext);
  log("Module permissions in hook:", modulePermissions);

  // Recursive function to find module by id
  const findModule = (modules, target) => {
    for (const mod of modules) {
      if (mod.id === target) return mod;
      if (mod.submodules) {
        const found = findModule(mod.submodules, target);
        if (found) return found;
      }
    }
    return null;
  };

  const module = findModule(modulePermissions || [], moduleName);
  const notFound = !module;

  return {
    canRead: module?.permissions?.canRead || false,
    canWrite: module?.permissions?.canWrite || false,
    canDelete: module?.permissions?.canDelete || false,
    loading,
    notFound,
  };
};

import { useContext } from "react";
import { ModulePermissionContext } from "../context/ModulePermissionContext";
import { log } from "../utils/logger";

export const useModulePermission = (moduleName) => {
  const { modulePermissions, loading } = useContext(ModulePermissionContext);
  log("Module permissions in hook:", modulePermissions);

  // Find the module permission object where module matches
  const module = (modulePermissions || []).find(
    (perm) => perm.module === moduleName
  );

  const actions = module?.action || [];

  return {
    canRead: actions.includes("read"),
    canWrite: actions.includes("create") || actions.includes("update"),
    canDelete: actions.includes("delete"),
    loading,
    notFound: !module,
    raw: module, // optional: expose the raw module permission if you need constraints etc.
  };
};

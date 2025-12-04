export const transformPermissionsToModules = (permissionsData) => {
  // Group permissions by module
  const modulesMap = {};

  permissionsData?.forEach((permission) => {
    const { module, action, permission_id, is_active } = permission;

    // Skip if permission is not active
    if (!is_active) {
      return;
    }

    if (!modulesMap[module]) {
      modulesMap[module] = {
        module: module,
        actions: [],
      };
    }

    // Add action to the module with enabled set to false
    modulesMap[module].actions.push({
      id: permission_id,
      name: action.charAt(0).toUpperCase() + action.slice(1), // Capitalize action name
      enabled: false, // Always set to false initially
      action: action, // Keep the original action type
      permission_id: permission_id,
    });
  });

  // Convert to array and filter out modules with no actions
  return Object.values(modulesMap).filter(
    (module) => module.actions.length > 0
  );
};
// Alternative: If you want to start with all permissions disabled
export const transformPermissionsToModulesWithDefaults = (
  permissionsData,
  enabledPermissions = []
) => {
  const modulesMap = {};

  permissionsData?.forEach((permission) => {
    const { module, action, permission_id } = permission;

    if (!modulesMap[module]) {
      modulesMap[module] = {
        module: module,
        actions: [],
      };
    }

    // Check if this permission is enabled (from existing role permissions)
    const isEnabled = enabledPermissions.some(
      (perm) => perm.module === module && perm.action.includes(action)
    );

    modulesMap[module].actions.push({
      id: permission_id,
      name: action.charAt(0).toUpperCase() + action.slice(1),
      enabled: isEnabled,
      action: action,
      permission_id: permission_id,
    });
  });

  return Object.values(modulesMap);
};

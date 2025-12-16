// Function to transform permissions for different modes

// Transform policy permissions to map for easy lookup
const getPolicyPermissionsMap = (policy) => {
  const policyPermissionsMap = {};
  if (policy?.permissions) {
    policy.permissions.forEach((perm) => {
      const key = `${perm.module}-${perm.action}`;
      policyPermissionsMap[key] = {
        ...perm,
        isEnabled: true,
      };
    });
  }
  return policyPermissionsMap;
};

export const transformPermissionsForMode = (mode, policy, allPermissions) => {
  const policyPermissionsMap = getPolicyPermissionsMap(policy);

  const modulesMap = {};

  allPermissions?.forEach((permission) => {
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

    // Determine if permission should be enabled based on mode
    let isEnabled = false;
    const key = `${module}-${action}`;

    if (mode === "view" || mode === "edit") {
      // For view and edit modes, check if permission exists in policy
      isEnabled = policyPermissionsMap[key] !== undefined;
    } else if (mode === "create") {
      // For create mode, all permissions are disabled initially
      isEnabled = false;
    }

    // Add action to the module
    modulesMap[module].actions.push({
      id: permission_id,
      name: action.charAt(0).toUpperCase() + action.slice(1), // Capitalize action name
      enabled: isEnabled,
      action: action,
      permission_id: permission_id,
      module: module,
      description: permission.description || "",
    });
  });

  // Convert to array and filter out modules with no actions
  return Object.values(modulesMap).filter(
    (module) => module.actions.length > 0
  );
};

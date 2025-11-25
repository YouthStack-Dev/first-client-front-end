export const MODULES = {
  Dashboard: ["view", "edit", "create"],
  Booking: ["view", "edit", "create"],
  Clients: ["view", "edit", "create"],
  UserManagement: ["view", "edit", "create"],
  ManageVehicles: ["view", "edit", "create"],
  CompanyAdmins: ["view", "edit", "create"],
  Subadmins: ["view", "edit", "create"],
  Vehicles: ["view", "edit", "create"],
  VehicleContract: ["view", "edit", "create"],
  VehicleType: ["view", "edit", "create"],
  SchedulingManagement: ["view", "edit", "create"],
  ManageShift: ["view", "edit", "create"],
  ShiftCategories: ["view", "edit", "create"],
  SchedulePolicies: ["view", "edit", "create"],
  Drivers: ["view", "edit", "create"],
  Routing: ["view", "edit", "create"],
  Vendors: ["view", "edit", "create"],
  Users: ["view", "edit", "delete", "create"],
  Content: ["view", "edit", "delete", "create", "publish"],
  Settings: ["view", "configure", "export"],
  Reports: ["view", "export", "schedule"],
  RoleManagement: ["view", "export", "schedule"],
};

export const TEMPLATES = {
  admin: {
    name: "Administrator",
    description: "Full system access with all permissions",
    permissions: createAllPermissions(true),
  },
  editor: {
    name: "Editor",
    description: "Can edit content but cannot change system settings",
    permissions: {
      Dashboard: { view: true, edit: false, create: false },
      Users: { view: true, edit: false, delete: false, create: false },
      Content: {
        view: true,
        edit: true,
        delete: false,
        create: true,
        publish: false,
      },
      Settings: { view: false, configure: false, export: false },
      Reports: { view: true, export: true, schedule: false },
    },
  },
  viewer: {
    name: "Viewer",
    description: "Read-only access to content and reports",
    permissions: {
      Dashboard: { view: true, edit: false, create: false },
      Users: { view: false, edit: false, delete: false, create: false },
      Content: {
        view: true,
        edit: false,
        delete: false,
        create: false,
        publish: false,
      },
      Settings: { view: false, configure: false, export: false },
      Reports: { view: true, export: false, schedule: false },
    },
  },
};

export function defaultPermissions() {
  return createAllPermissions(false);
}

export function createAllPermissions(defaultValue) {
  const permissions = {};

  Object.entries(MODULES).forEach(([module, actions]) => {
    permissions[module] = {};
    actions.forEach((action) => {
      permissions[module][action] = defaultValue;
    });
  });

  return permissions;
}

export function countEnabledPermissions(permissions) {
  let count = 0;

  Object.values(permissions).forEach((modulePermissions) => {
    Object.values(modulePermissions).forEach((enabled) => {
      if (enabled) count++;
    });
  });

  return count;
}

export function getTotalPermissionsCount(permissions) {
  let count = 0;

  Object.values(permissions).forEach((modulePermissions) => {
    count += Object.keys(modulePermissions).length;
  });

  return count;
}

export function getPermissionPercentage(permissions) {
  const enabled = countEnabledPermissions(permissions);
  const total = getTotalPermissionsCount(permissions);

  return total > 0 ? Math.round((enabled / total) * 100) : 0;
}

export function toggleAllModulePermissions(permissions, moduleName, value) {
  return {
    ...permissions,
    [moduleName]: Object.keys(permissions[moduleName]).reduce((acc, action) => {
      acc[action] = value;
      return acc;
    }, {}),
  };
}

export function getModulePermissionStatus(permissions, moduleName) {
  const modulePermissions = permissions[moduleName];
  const values = Object.values(modulePermissions);

  if (values.every((v) => v === true)) return "all";
  if (values.every((v) => v === false)) return "none";
  return "some";
}

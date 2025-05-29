
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  VENDOR: 'VENDOR',
  CLIENT: 'CLIENT'
};

// Function to check if user has required role
export const hasPermission = (userRole, requiredRoles) => {
  return true
  // if (!requiredRoles) return true;
  // return requiredRoles.includes(userRole);
};

const user = {
  id: 1,
  name: 'Admin User',
  email: 'admin@example.com',
  roleId: 1,
  permissions: [
    {
      module: 'Dashboard',
      canRead: true,
      canWrite: false,
      canDelete: false,
    },
    {
      module: 'Users',
      canRead: true,
      canWrite: true,
      canDelete: false,
    },
    {
      module: 'Vehicles',
      canRead: false,
      canWrite: false,
      canDelete: false,
    },
    {
      module: 'Drivers',
      canRead: true,
      canWrite: false,
      canDelete: false,
    },
    {
      module: 'UserManagement',
      canRead: true,
      canWrite: false,
      canDelete: false,
    },
    {
      module: 'SchedulingManagement',
      canRead: true,
      canWrite: false,
      canDelete: false,
    },
    {
      module: 'Clients',
      canRead: true,
      canWrite: false,
      canDelete: false,
    }
  ]
};


export function hasModuleAccess(users, moduleName) {
  return true
  // if (!user?.permissions) return false;

  // return user.permissions.some(
  //   (perm) => 
  //     perm.module.toLowerCase() === moduleName?.toLowerCase() &&
  //     (perm.canRead || perm.canWrite || perm.canDelete)
  // );
}


export function hasSubModuleAccess(users, subModuleName) {
  return true

  // if (!user?.permissions) return false;

  // return user.permissions.some(
  //   (perm) =>
  //     perm.module?.toLowerCase() === subModuleName?.toLowerCase() &&
  //     (perm.canRead || perm.canWrite || perm.canDelete)
  // );
}

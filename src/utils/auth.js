// Static user data for demonstration
export const users = [
  {
    id: 1,
    username: 'superadmin',
    password: 'super123',
    role: 'SUPER_ADMIN',
    name: 'Super Admin'
  },
  {
    id: 2,
    username: 'admin',
    password: 'admin123',
    role: 'ADMIN',
    name: 'Admin User'
  },
  {
    id: 3,
    username: 'vendor',
    password: 'vendor123',
    role: 'VENDOR',
    name: 'Vendor User'
  }
];

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  VENDOR: 'VENDOR',
  CLIENT: 'CLIENT'
};

// Function to check if user has required role
export const hasPermission = (userRole, requiredRoles) => {
  // if (!requiredRoles) return true;
  return requiredRoles.includes(userRole);
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
    }
  ]
};

export function hasModuleAccess(users, moduleName) {
  if (!user?.permissions) return false;

  return user.permissions.some(
    (perm) => 
      perm.module.toLowerCase() === moduleName?.toLowerCase() &&
      (perm.canRead || perm.canWrite || perm.canDelete)
  );
}

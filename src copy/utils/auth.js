
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  VENDOR: 'VENDOR',
  CLIENT: 'CLIENT'
};



// Function to check if user has required role
export const hasPermission = (userRole, requiredRoles) => {
  // return true
  if (!requiredRoles) return true;
  return requiredRoles.includes(userRole);
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


export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  VENDOR: 'VENDOR',
  CLIENT: 'CLIENT'
};

export const MOCK_TOKENS = {
  SUPER_ADMIN:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN1cGVyYWRtaW4iLCJlbWFpbCI6InN1cGVyQGVtYWlsLmNvbSIsInJvbGUiOiJTVVBFUl9BRE1JTiIsImV4cCI6MTkwMDAwMDAwMH0.dummy-signature"
,

  ADMIN:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluVXNlciIsImVtYWlsIjoiYWRtaW5AZW1haWwuY29tIiwicm9sZSI6IkFETUlOIiwiZXhwIjoxOTAwMDAwMDAwfQ.dummy-signature"
,

  VENDOR:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InZlbmRvclVzZXIiLCJlbWFpbCI6InZlbmRvckBlbWFpbC5jb20iLCJyb2xlIjoiVkVORE9SIiwiZXhwIjoxOTAwMDAwMDAwfQ.dummy-signature"
,

  CLIENT:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImNsaWVudFVzZXIiLCJlbWFpbCI6ImNsaWVudEBlbWFpbC5jb20iLCJyb2xlIjoiQ0xJRU5UIiwiZXhwIjoxOTAwMDAwMDAwfQ.dummy-signatur",
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

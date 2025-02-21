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
    VENDOR: 'VENDOR'
  };
  
  // Function to check if user has required role
  export const hasPermission = (userRole, requiredRoles) => {
    if (!requiredRoles) return true;
    return requiredRoles.includes(userRole);
  };
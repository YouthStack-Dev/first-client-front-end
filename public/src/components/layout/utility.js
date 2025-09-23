export const pathTitleMap = {
  '/': 'Login',
  '/dashboard': 'Dashboard',
  '/manage-team': 'Manage Team',
  '/shift-categories': 'Shift Categories',
  '/role-management': 'Role Management', 
  '/manage-company': 'Manage Company',
  '/manage-shift': 'Manage Shifts',
  '/manage-vendors': 'Manage Vendors',
  '/manage-drivers': 'Manage Drivers',
  '/manage-vehicles': 'Manage Vehicles',
  '/employee/create-employee': 'Create Employee',
  '/department': 'Manage Employees', // Base path for all department routes
  '/department/:depId/employees': 'Manage Employees',
  '/department/:depId/employees/:employeeId/edit': 'Edit Employee',
  '/department/:depId/employees/:employeeId/view': 'View Employee'
};

export const getTitleFromPath = (path) => {
  // Handle root path
  if (path === '/') return pathTitleMap['/'];
  
  // Split path into segments
  const pathSegments = path.split('/').filter(Boolean);
  
  // Check for department/employees paths
  if (pathSegments[0] === 'department') {
    if (pathSegments[2] === 'employees') {
      if (pathSegments[4] === 'edit') {
        return pathTitleMap['/department/:depId/employees/:employeeId/edit'];
      }
      if (pathSegments[4] === 'view') {
        return pathTitleMap['/department/:depId/employees/:employeeId/view'];
      }
      return pathTitleMap['/department/:depId/employees'];
    }
    return pathTitleMap['/department'];
  }
  
  // Check for other specific paths
  const basePath = '/' + pathSegments[0];
  return pathTitleMap[basePath] || 'Dashboard';
};
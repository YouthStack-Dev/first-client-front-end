export const pathTitleMap = {
  // Dashboard Routes
  '/dashboard': 'Dashboard',
  '/admin_dashboard': 'Admin Dashboard',
  '/admin-dashboard': 'Admin Dashboard',
  '/client_dashboard': 'Client Dashboard',
  '/company-dashboard': 'Company Dashboard',

  // User Management
  '/users': 'Manage Users',
  '/user-management': 'User Management',
  '/employees': 'Employee Management',
  '/employee': 'Employee',
  '/department': 'Department Employees',

  // Management
  '/departments': 'Departments',
  '/groups': 'Group Management',
  '/mappings': 'Mapping Management',

  // Policy & Service
  '/policy-management': 'Policy Management',
  '/policies': 'Policies',
  '/policy-rules': 'Policy Rules',
  '/services': 'Service Management',
  '/tenants': 'Tenant Management',

  // Fleet Management
  '/vehicles': 'Manage Vehicles',
  '/old-vehicles': 'Manage Vehicles (Legacy)',
  '/vehicle-types': 'Vehicle Types',
  '/vehicle-group': 'Vehicle Groups',
  '/drivers': 'Manage Drivers',

  // Vendor Management
  '/vendors': 'Manage Vendors',

  // Operations
  '/routing': 'Route Management',
  '/routing-management': 'Routing Management',
  '/tracking': 'Tracking',
  '/tracking-management': 'Tracking Management',
  '/bookings': 'Manage Bookings',
  '/booking-management': 'Booking Management',

  // Shift Management
  '/shifts': 'Manage Shifts',
  '/manage-shift': 'Shift Management',
  '/shift-categories': 'Shift Categories',
  '/shift-Categories': 'Shift Categories Management',
  '/cutoff-settings': 'Cutoff Settings',

  // Additional Routes
  '/manage-company': 'Manage Companies',
  '/role-management': 'Manage Roles',
  '/staffs': 'Manage Staff',
  '/manage-client': 'Manage Clients',
  '/vehicle-contract': 'Vehicle Contracts',
  '/contract': 'Contracts',
  '/calender': 'Calendar',

  // Utility
  '/unauthorized': 'Unauthorized'
};

/**
 * Gets the page title based on the current path
 * @param {string} path - The current path (e.g. '/vehicles/add-vehicle')
 * @returns {string} The matching title or 'Dashboard' as fallback
 */
export const getTitleFromPath = (path) => {
  // Handle root path
  if (path === '/') return 'Login';
  
  // Split path into segments
  const segments = path.split('/').filter(segment => segment !== '');
  
  // Try to find the longest matching path
  for (let i = segments.length; i > 0; i--) {
    const testPath = '/' + segments.slice(0, i).join('/');
    if (pathTitleMap[testPath]) {
      return pathTitleMap[testPath];
    }
  }
  
  // Fallback to Dashboard if no match found
  return 'Dashboard';
};
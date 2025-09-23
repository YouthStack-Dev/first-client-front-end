export const companyPermissionModules = [
    { key: 'role_management', name: 'Role Management', category: 'Administration' },
    { key: 'scheduling_management', name: 'Scheduling Management', category: 'Operations' },
    { key: 'driver_management', name: 'Driver Management', category: 'Operations' },
    { key: 'vendor_management', name: 'Vendor Management', category :'Operations' },
    { key: 'routing', name: 'Routing', category: 'Operations' },
    { key: 'admin_dashboard', name: 'Admin Dashboard', category: 'Administration' },
    { key: 'tracking', name: 'Tracking', category: 'Operations' }
  ];
  
  export const vendorPermissionModules = [
    { key: 'fleet_management', name: 'Fleet Management', category: 'Operations' },
    { key: 'driver_management', name: 'Driver Management', category: 'Operations' },
    { key: 'order_management', name: 'Order Management', category: 'Operations' },
    { key: 'tracking', name: 'Tracking', category: 'Operations' },
    { key: 'reports', name: 'Reports', category: 'Analytics' },
    { key: 'billing', name: 'Billing', category: 'Finance' }
  ];
  
  export const getModulesByCategory = (modules) => {
    const categorized = {};
    modules.forEach(module => {
      if (!categorized[module.category]) {
        categorized[module.category] = [];
      }
      categorized[module.category].push(module);
    });
    return categorized;
  };
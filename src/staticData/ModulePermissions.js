export const staticPermissions = {
  'super@email.com': [
    { module: 'Dashboard', canRead: true, canWrite: false, canDelete: false },
    
    // User Management
    { module: 'Company Admins', canRead: true, canWrite: true, canDelete: true },
    { module: 'Subadmins', canRead: true, canWrite: true, canDelete: true },

    // Contracts
    { module: 'Vehicle Contract', canRead: true, canWrite: true, canDelete: true },
    { module: 'Vendor Contract', canRead: true, canWrite: true, canDelete: true },
    
    // Vehicles
    { module: 'Vehicles', canRead: true, canWrite: true, canDelete: true },
    { module: 'Vehicle Type', canRead: true, canWrite: true, canDelete: true },

    // Scheduling
    { module: 'Manage Shift', canRead: true, canWrite: true, canDelete: true },
    { module: 'Manage Shift Categories', canRead: true, canWrite: true, canDelete: true },
    { module: 'Manage Schedule Policies', canRead: true, canWrite: true, canDelete: true },

    // Flat modules
    { module: 'Manage Team', canRead: true, canWrite: true, canDelete: true },
    { module: 'Manage Billing', canRead: true, canWrite: true, canDelete: true },
    { module: 'Role Managemet', canRead: true, canWrite: true, canDelete: true },
    { module: 'Audit Report', canRead: true, canWrite: true, canDelete: true },
    { module: 'Drivers', canRead: true, canWrite: true, canDelete: true },
    { module: 'Routing', canRead: true, canWrite: true, canDelete: true },
    { module: 'Vendors', canRead: true, canWrite: true, canDelete: true },
    { module: 'Bussiness-unit', canRead: true, canWrite: true, canDelete: true },
    { module: 'Staf', canRead: true, canWrite: true, canDelete: true },
    { module: 'Security Dashboard', canRead: true, canWrite: true, canDelete: true },
    { module: 'SMS Config', canRead: true, canWrite: true, canDelete: true }
  ],

  'admin@email.com': [
    { module: 'Dashboard', canRead: true, canWrite: false, canDelete: false },
    
    // User Management
    { module: 'Subadmins', canRead: true, canWrite: true, canDelete: false },

    // Contracts
    { module: 'Vehicle Contract', canRead: true, canWrite: true, canDelete: false },

    // Vehicles
    { module: 'Vehicles', canRead: true, canWrite: false, canDelete: false },
    { module: 'Vehicle Type', canRead: true, canWrite: false, canDelete: false },

    // Scheduling
    { module: 'Manage Shift', canRead: true, canWrite: true, canDelete: false },
    { module: 'Manage Shift Categories', canRead: true, canWrite: true, canDelete: false },
    { module: 'Manage Schedule Policies', canRead: true, canWrite: true, canDelete: false },

    // Flat modules
    { module: 'Manage Team', canRead: true, canWrite: true, canDelete: false },
    { module: 'Manage Billing', canRead: true, canWrite: true, canDelete: false },
    { module: 'Role Managemet', canRead: true, canWrite: false, canDelete: false },
    { module: 'Audit Report', canRead: true, canWrite: false, canDelete: false },
    { module: 'Drivers', canRead: true, canWrite: false, canDelete: false },
    { module: 'Routing', canRead: true, canWrite: false, canDelete: false },
    { module: 'Bussiness-unit', canRead: true, canWrite: false, canDelete: false },
    { module: 'Staf', canRead: true, canWrite: false, canDelete: false },
    { module: 'Security Dashboard', canRead: true, canWrite: false, canDelete: false }
  ],

  'vendor@email.com': [
    { module: 'Dashboard', canRead: true, canWrite: false, canDelete: false },
    
    // Contracts
    { module: 'Vehicle Contract', canRead: true, canWrite: true, canDelete: false },
    { module: 'Vendor Contract', canRead: true, canWrite: true, canDelete: false },

    // Vehicles
    { module: 'Vehicles', canRead: true, canWrite: true, canDelete: false },
    { module: 'Vehicle Type', canRead: true, canWrite: true, canDelete: false },

    { module: 'Drivers', canRead: true, canWrite: false, canDelete: false }
  ],

  'client@email.com': [
    { module: 'Dashboard', canRead: true, canWrite: false, canDelete: false },
    { module: 'Manage Bookings', canRead: true, canWrite: false, canDelete: false },
    { module: 'Manage Shift', canRead: true, canWrite: false, canDelete: false },
    { module: 'Vehicle Contract', canRead: true, canWrite: false, canDelete: false }
  ]
};

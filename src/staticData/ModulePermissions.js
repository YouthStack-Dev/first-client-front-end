export const staticPermissions = {
  'super@email.com': [
    { module: 'dashboard', canRead: true, canWrite: false, canDelete: false },
    { module: 'manageClients', canRead: true, canWrite: true, canDelete: true },
    { module: 'manageCompany', canRead: true, canWrite: true, canDelete: true },
    
    // // User Management
    // { module: 'companyAdmins', canRead: true, canWrite: true, canDelete: true },
    // { module: 'subadmins', canRead: true, canWrite: true, canDelete: true },

    // // Contracts
    // { module: 'vehicleContract', canRead: true, canWrite: true, canDelete: true },
    // { module: 'vendorContract', canRead: true, canWrite: true, canDelete: true },
    
    // // Vehicles
    // { module: 'vehicles', canRead: true, canWrite: true, canDelete: true },
    // { module: 'vehicleType', canRead: true, canWrite: true, canDelete: true },

    // Scheduling
    // { module: 'manageShift', canRead: true, canWrite: true, canDelete: true },
    // { module: 'manageShiftCategories', canRead: true, canWrite: true, canDelete: true },
    // { module: 'manageSchedulePolicies', canRead: true, canWrite: true, canDelete: true },

    // Flat modules
    // { module: 'manageTeam', canRead: true, canWrite: true, canDelete: true },
    // { module: 'manageBilling', canRead: true, canWrite: true, canDelete: true },
    // { module: 'roleManagement', canRead: true, canWrite: true, canDelete: true },
    // { module: 'auditReport', canRead: true, canWrite: true, canDelete: true },
    // { module: 'drivers', canRead: true, canWrite: true, canDelete: true },
    // { module: 'routing', canRead: true, canWrite: true, canDelete: true },
    // { module: 'vendors', canRead: true, canWrite: true, canDelete: true },
    // { module: 'businessUnit', canRead: true, canWrite: true, canDelete: true },
    // { module: 'staff', canRead: true, canWrite: true, canDelete: true },
    // { module: 'securityDashboard', canRead: true, canWrite: true, canDelete: true },
    // { module: 'smsConfig', canRead: true, canWrite: true, canDelete: true }
  ],

    'admin@email.com': [
      { module: 'dashboard', canRead: true, canWrite: false, canDelete: false },
      { module: 'manageContracts', canRead: true, canWrite: true, canDelete: false },
      // User Management
      { module: 'subadmins', canRead: true, canWrite: true, canDelete: false },

      // Contracts
      { module: 'vehicleContract', canRead: true, canWrite: true, canDelete: false },
      { module:'allcontract', canRead:true, canWrite:true, canDelete: false},

      // Vehicles
      { module: 'vehicles', canRead: true, canWrite: false, canDelete: false },
      { module: 'vehicleType', canRead: true, canWrite: false, canDelete: false },

      // Scheduling
      { module: 'SchedulingManagement', canRead: true, canWrite: false, canDelete:false},
      { module: 'manageShift', canRead: true, canWrite: true, canDelete: false },
      { module: 'manageShiftCategories', canRead: true, canWrite: true, canDelete: false },
      { module: 'manageSchedulePolicies', canRead: true, canWrite: true, canDelete: false },

      // Flat modules
      { module: 'manageTeam', canRead: true, canWrite: true, canDelete: false },
      { module: 'manageBilling', canRead: true, canWrite: true, canDelete: false },
      { module: 'roleManagement', canRead: true, canWrite: false, canDelete: false },
      { module: 'auditReport', canRead: true, canWrite: false, canDelete: false },
      { module: 'drivers', canRead: true, canWrite: false, canDelete: false },
      { module: 'routing', canRead: true, canWrite: false, canDelete: false },
      { module: 'businessUnit', canRead: true, canWrite: false, canDelete: false },
      { module: 'staff', canRead: true, canWrite: false, canDelete: false },
      { module: 'securityDashboard', canRead: true, canWrite: false, canDelete: false }
    ],

    'vendor@email.com': [
      { module: 'dashboard', canRead: true, canWrite: false, canDelete: false },
      
      // Contracts
      { module: 'vehicleContract', canRead: true, canWrite: true, canDelete: false },
      { module:'allcontract', canRead:true, canWrite:true, canDelete: false},
      { module: 'vendorContract', canRead: true, canWrite: true, canDelete: false },

      // Vehicles
      { module: 'vehicles', canRead: true, canWrite: true, canDelete: false },
      { module: 'vehicleType', canRead: true, canWrite: true, canDelete: false },

      { module: 'drivers', canRead: true, canWrite: false, canDelete: false }
    ],

    'client@email.com': [
      { module: 'dashboard', canRead: true, canWrite: false, canDelete: false },
      { module: 'manageBookings', canRead: true, canWrite: false, canDelete: false },
      { module: 'manageShift', canRead: true, canWrite: false, canDelete: false },
      { module: 'vehicleContract', canRead: true, canWrite: false, canDelete: false }
    ]
  };
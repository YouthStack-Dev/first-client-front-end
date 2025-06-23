export const staticPermissions = {
  'superadmin@email.com': {
    allowedModules: [
      {
        id: 'dashboard',
        permissions: { canRead: true, canWrite: true, canDelete: true },
      },
      {
        id: 'user-management',
        permissions: { canRead: true, canWrite: true },
        submodules: [
          {
            id: 'role-management',
            permissions: { canRead: true, canWrite: true },
          },
          {
            id: 'subadmins',
            permissions: { canRead: true, canWrite: true },
          },
        ],
      },
      {
        id: 'manage-clients',
        permissions: { canRead: true, canWrite: true },
      },
    ],
  },

  'client1@email.com': {
    allowedModules: [
      {
        id: 'dashboard',
        permissions: { canRead: true },
      },
      {
        id: 'manage-bookings',
        permissions: { canRead: true },
      },
      {
        id: 'scheduling-management',
        permissions: { canRead: true },
        submodules: [
          {
            id: 'manage-shift',
            permissions: { canRead: true },
          },
          {
            id: 'manage-shift-categories',
            permissions: { canRead: false }, // not shown
          },
        ],
      },
    ],
  },

  'client2@email.com': {
    allowedModules: [
      {
        id: 'dashboard',
        permissions: { canRead: true },
      },
      {
        id: 'manage-team',
        permissions: { canRead: true, canWrite: true },
        submodules: [
          {
            id: 'employee-under-team',
            permissions: { canRead: true },
          },
          {
            id: 'business-unit',
            permissions: { canRead: false },
          },
        ],
      },
    ],
  },

  'admin1@company.com': {
    allowedModules: [
      {
        id: 'dashboard',
        permissions: { canRead: true },
      },
      {
        id: 'manage-vehicles',
        permissions: { canRead: true },
      },
      {
        id: 'manage-drivers',
        permissions: { canRead: true, canWrite: true },
      },
      {
        id: 'user-management',
        permissions: { canRead: true },
        submodules: [
          {
            id: 'role-management',
            permissions: { canRead: true },
          },
        ],
      },
    ],
  },

  'admin2@company.com': {
    allowedModules: [
      {
        id: 'dashboard',
        permissions: { canRead: true },
      },
      {
        id: 'manage-vehicles',
        permissions: { canRead: true, canWrite: true },
      },
      {
        id: 'manage-team',
        permissions: { canRead: true },
        submodules: [
          {
            id: 'business-unit',
            permissions: { canRead: true },
          },
        ],
      },
    ],
  },

  'vendor1@email.com': {
    allowedModules: [
      {
        id: 'dashboard',
        permissions: { canRead: true },
      },
      {
        id: 'vendor-contract',
        permissions: { canRead: true, canWrite: true },
      },
      {
        id: 'vehicles',
        permissions: { canRead: true },
      },
    ],
  },

  'vendor2@email.com': {
    allowedModules: [
      {
        id: 'dashboard',
        permissions: { canRead: true },
      },
      {
        id: 'vehicle-contract',
        permissions: { canRead: true },
      },
      {
        id: 'notifications',
        permissions: { canRead: true },
      },
    ],
  },
};

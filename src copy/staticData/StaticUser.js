
// Static login credentials
export const STATIC_USERS = {
  // Super Admin
  'superadmin@system.com': {
    password: 'admin123',
    user: {
      id: 'sa-1',
      email: 'superadmin@system.com',
      name: 'System Administrator',
      type: 'super_admin' ,
      status: 'active' ,
      createdAt: '2024-01-01T00:00:00Z'
    }
  },
  
  // Clients
  'client1@acme.com': {
    password: 'client123',
    user: {
      id: 'cl-1',
      email: 'client1@acme.com',
      name: 'John Smith',
      type: 'client',
      status: 'active' ,
      createdAt: '2024-01-15T10:00:00Z',
      allowedModules: [
        'employee-management', 'employee-transfer', 'shift-management',
        'vehicle-management', 'driver-management', 'real-time-tracking',
        'route-planning', 'transport-analytics', 'user-management'
      ],
      companyName: 'ACME Corp',
      contactPerson: 'John Smith',
      phone: '+1 (555) 123-4567'
    }
  },
  
  'client2@techflow.com': {
    password: 'client123',
    user: {
      id: 'cl-2',
      email: 'client2@techflow.com',
      name: 'Sarah Johnson',
      type: 'client' ,
      status: 'active' ,
      createdAt: '2024-01-20T14:30:00Z',
      allowedModules: [
        'employee-management', 'employee-transfer', 'attendance-tracking',
        'transport-booking', 'pickup-drop-points', 'transport-analytics',
        'cost-analysis', 'vendor-management'
      ],
      companyName: 'TechFlow Solutions',
      contactPerson: 'Sarah Johnson',
      phone: '+1 (555) 987-6543'
    }
  },

  // Companies
  'company1@acmebangalore.com': {
    password: 'company123',
    user: {
      id: 'co-1',
      email: 'company1@acmebangalore.com',
      name: 'Mike Wilson',
      type: 'company',
      status: 'active' ,
      createdAt: '2024-02-01T09:00:00Z',
      allowedModules: [
        'employee-management', 'employee-transfer', 'shift-management',
        'vehicle-management', 'real-time-tracking', 'route-planning'
      ],
      companyName: 'ACME Bangalore Office',
      clientId: 'cl-1',
      contactPerson: 'Mike Wilson',
      phone: '+91 80 1234 5678',
      address: 'Bangalore, Karnataka, India'
    }
  },

  // Vendors
  'vendor1@quicktransport.com': {
    password: 'vendor123',
    user: {
      id: 'v-1',
      email: 'vendor1@quicktransport.com',
      name: 'David Brown',
      type: 'vendor',
      status: 'active',
      createdAt: '2024-02-15T11:00:00Z',
      allowedModules: [
        'vehicle-management', 'driver-management', 'real-time-tracking',
        'route-planning', 'geofencing', 'notifications'
      ],
      vendorName: 'Quick Transport Services',
      companyId: 'co-1',
      contactPerson: 'David Brown',
      phone: '+91 80 9876 5432',
      serviceType: 'Employee Transportation'
    }
  }
};

// Static roles data
export const STATIC_ROLES= [
  {
    id: 'role-1',
    name: 'HR Manager',
    description: 'Manages employee transfers and HR operations',
    permissions: [
      {
        moduleId: 'employee-management',
        actions: ['view', 'create', 'edit']
      },
      {
        moduleId: 'employee-transfer',
        actions: ['view', 'create', 'edit']
      },
      {
        moduleId: 'shift-management',
        actions: ['view', 'edit']
      }
    ],
    createdBy: 'cl-1',
    createdAt: '2024-02-01T10:00:00Z',
    isSystemRole: false,
    entityType: 'client',
    entityId: 'cl-1'
  },
  {
    id: 'role-2',
    name: 'Transport Coordinator',
    description: 'Coordinates transport operations and vehicle management',
    permissions: [
      {
        moduleId: 'vehicle-management',
        actions: ['view', 'edit']
      },
      {
        moduleId: 'driver-management',
        actions: ['view', 'create', 'edit']
      },
      {
        moduleId: 'real-time-tracking',
        actions: ['view']
      },
      {
        moduleId: 'route-planning',
        actions: ['view', 'create', 'edit']
      }
    ],
    createdBy: 'co-1',
    createdAt: '2024-02-05T14:00:00Z',
    isSystemRole: false,
    entityType: 'company',
    entityId: 'co-1'
  }
];
export const superAdminModules = [
  { id: 'dashboard', permissions: { canRead: true, canWrite: true, canDelete: true } },
  { id: 'dashboard', permissions: { canRead: true } },
  { id: 'manage-team', permissions: { canRead: true } },

  { id: 'scheduling-management', permissions: { canRead: true }, submodules: [
    { id: 'manage-shift', permissions: { canRead: true } },
    { id: 'manage-shift-categories', permissions: { canRead: true } },
   
  ]},
  
  {  id: 'manage-vehicles', permissions: { canRead: true }, submodules: [
    { id: 'vehicles', permissions: { canRead: true } },
    { id: 'vehicle-type', permissions: { canRead: true } }
  ]},

  { id: 'drivers', permissions: { canRead: true, canWrite: true } },
  { id: 'routing', permissions: { canRead: true, canWrite: true } },
  { id: 'tracking', permissions: { canRead: true, canWrite: true } },
 
];

export const clientadmin1Modules = [
  { id: 'dashboard', permissions: { canRead: true } },
  { id: 'manage-company', permissions: { canRead: true, canWrite: true } },
  
];

export const clientadmin2Modules = [
  { id: 'dashboard', permissions: { canRead: true } },
  { id: 'manage-company', permissions: { canRead: true, canWrite: true } },
];

export const admin1Modules = [
  { id: 'dashboard', permissions: { canRead: true } },
  { id: 'tracking', permissions: { canRead: true, canWrite: true } },
  { id: 'manage-team', permissions: { canRead: true } },
];

export const admi2Modules = [
  { id: 'dashboard', permissions: { canRead: true } },
  { id: 'manage-vehicles', permissions: { canRead: true, canWrite: true } },
  { id: 'manage-contracts', permissions: { canRead: true }, submodules: [
    { id: 'vehicle-contract', permissions: { canRead: true } },
    { id: 'vadjustment-penalty', permissions: { canRead: true } },
    { id: 'cost-center', permissions: { canRead: true } },
    { id: 'show-contractsInMaster', permissions: { canRead: true } },

   
   
  ]},
  { id: 'manage-team', permissions: { canRead: true }, submodules: [
    { id: 'business-unit', permissions: { canRead: true } }
  ]}
];

export const vendo1Module = [
  { id: 'dashboard', permissions: { canRead: true } },
  { id: 'manage-contracts', permissions: { canRead: true }, submodules: [
    { id: 'vehicle-contract', permissions: { canRead: true } },
    
  ]},
  { id: 'routing', permissions: { canRead: true, canWrite: true } },
  { id: 'tracking', permissions: { canRead: true, canWrite: true } },

  { id: 'vehicles', permissions: { canRead: true } },
];

export const vendor2Module = [
  { id: 'dashboard', permissions: { canRead: true } },
  { id: 'manage-contracts', permissions: { canRead: true }, submodules: [
    { id: 'vehicle-contract', permissions: { canRead: true } },
   
  ]},
  { id: 'routing', permissions: { canRead: true, canWrite: true } },
  { id: 'tracking', permissions: { canRead: true, canWrite: true } },
  
  { id: 'vehicles', permissions: { canRead: true } },
];

export const staticPermissions = {
  'super@email.com': { allowedModules: superAdminModules },
  'client1@email.com': { allowedModules: clientadmin1Modules },
  'client2@email.com': { allowedModules: clientadmin2Modules },
  'admin1@company.com': { allowedModules: admin1Modules },
  'admin2@company.com': { allowedModules: admi2Modules },
  'vendor1@email.com': { allowedModules: vendo1Module },
  'vendor2@email.com': { allowedModules: vendor2Module }
};



export const FirstClientpermissions=[
  {
      "module": "user_management",
      "service": "Fleet Manager",
      "module_id": 1,
      "service_id": 1,
      "action": [
          "read",
          "create",
          "update",
          "delete"
      ],
      "resource": "Fleet Manager",
      "constraints": {
          "ip_range": "10.0.0.0/8"
      }
  },
  {
      "module": "department_management",
      "service": "Fleet Manager",
      "module_id": 2,
      "service_id": 1,
      "action": [
          "read",
          "create",
          "update",
          "delete"
      ],
      "resource": "Fleet Manager",
      "constraints": {
          "ip_range": "10.0.0.0/8"
      }
  },
  {
      "module": "employee_management",
      "service": "Fleet Manager",
      "module_id": 3,
      "service_id": 1,
      "action": [
          "read",
          "create",
          "update",
          "delete"
      ],
      "resource": "Fleet Manager",
      "constraints": {
          "ip_range": "10.0.0.0/8"
      }
  },
  {
      "module": "group_management",
      "service": "Fleet Manager",
      "module_id": 4,
      "service_id": 1,
      "action": [
          "read",
          "create",
          "update",
          "delete"
      ],
      "resource": "Fleet Manager",
      "constraints": {
          "ip_range": "10.0.0.0/8"
      }
  },
  {
      "module": "mapping_management",
      "service": "Fleet Manager",
      "module_id": 5,
      "service_id": 1,
      "action": [
          "read",
          "create",
          "update",
          "delete"
      ],
      "resource": "Fleet Manager",
      "constraints": {
          "ip_range": "10.0.0.0/8"
      }
  },
  {
      "module": "policy_management",
      "service": "Fleet Manager",
      "module_id": 6,
      "service_id": 1,
      "action": [
          "read",
          "create",
          "update",
          "delete"
      ],
      "resource": "Fleet Manager",
      "constraints": {
          "ip_range": "10.0.0.0/8"
      }
  },
  {
      "module": "service_management",
      "service": "Fleet Manager",
      "module_id": 7,
      "service_id": 1,
      "action": [
          "read",
          "create",
          "update",
          "delete"
      ],
      "resource": "Fleet Manager",
      "constraints": {
          "ip_range": "10.0.0.0/8"
      }
  },
  {
      "module": "tenant_management",
      "service": "Fleet Manager",
      "module_id": 8,
      "service_id": 1,
      "action": [
          "read",
          "create",
          "update",
          "delete"
      ],
      "resource": "Fleet Manager",
      "constraints": {
          "ip_range": "10.0.0.0/8"
      }
  },
  {
      "module": "driver_management",
      "service": "Fleet Manager",
      "module_id": 9,
      "service_id": 1,
      "action": [
          "read",
          "create",
          "update",
          "delete"
      ],
      "resource": "Fleet Manager",
      "constraints": {
          "ip_range": "10.0.0.0/8"
      }
  },
  {
      "module": "vehicle_management",
      "service": "Fleet Manager",
      "module_id": 10,
      "service_id": 1,
      "action": [
          "read",
          "create",
          "update",
          "delete"
      ],
      "resource": "Fleet Manager",
      "constraints": {
          "ip_range": "10.0.0.0/8"
      }
  },
  {
      "module": "vehicle_type_management",
      "service": "Fleet Manager",
      "module_id": 11,
      "service_id": 1,
      "action": [
          "read",
          "create",
          "update",
          "delete"
      ],
      "resource": "Fleet Manager",
      "constraints": {
          "ip_range": "10.0.0.0/8"
      }
  },
  {
      "module": "vendor_management",
      "service": "Fleet Manager",
      "module_id": 12,
      "service_id": 1,
      "action": [
          "read",
          "create",
          "update",
          "delete"
      ],
      "resource": "Fleet Manager",
      "constraints": {
          "ip_range": "10.0.0.0/8"
      }
  },
  {
      "module": "admin_dashboard",
      "service": "Fleet Manager",
      "module_id": 13,
      "service_id": 1,
      "action": [
          "read",
          "create",
          "update",
          "delete"
      ],
      "resource": "Fleet Manager",
      "constraints": {
          "ip_range": "10.0.0.0/8"
      }
  },
  {
      "module": "company_dashboard",
      "service": "Fleet Manager",
      "module_id": 14,
      "service_id": 1,
      "action": [
          "read",
          "create",
          "update",
          "delete"
      ],
      "resource": "Fleet Manager",
      "constraints": {
          "ip_range": "10.0.0.0/8"
      }
  },
  {
      "module": "routing_management",
      "service": "Fleet Manager",
      "module_id": 15,
      "service_id": 1,
      "action": [
          "read",
          "create",
          "update",
          "delete"
      ],
      "resource": "Fleet Manager",
      "constraints": {
          "ip_range": "10.0.0.0/8"
      }
  },
  {
      "module": "tracking_management",
      "service": "Fleet Manager",
      "module_id": 16,
      "service_id": 1,
      "action": [
          "read",
          "create",
          "update",
          "delete"
      ],
      "resource": "Fleet Manager",
      "constraints": {
          "ip_range": "10.0.0.0/8"
      }
  },
  {
      "module": "booking_management",
      "service": "Fleet Manager",
      "module_id": 17,
      "service_id": 1,
      "action": [
          "read",
          "create",
          "update",
          "delete"
      ],
      "resource": "Fleet Manager",
      "constraints": {
          "ip_range": "10.0.0.0/8"
      }
  },
  {
      "module": "shift_management",
      "service": "Fleet Manager",
      "module_id": 18,
      "service_id": 1,
      "action": [
          "read",
          "create",
          "update",
          "delete"
      ],
      "resource": "Fleet Manager",
      "constraints": {
          "ip_range": "10.0.0.0/8"
      }
  },
  {
      "module": "shift_category",
      "service": "Fleet Manager",
      "module_id": 19,
      "service_id": 1,
      "action": [
          "read",
          "create",
          "update",
          "delete"
      ],
      "resource": "Fleet Manager",
      "constraints": {
          "ip_range": "10.0.0.0/8"
      }
  },
  {
      "module": "cutoff",
      "service": "Fleet Manager",
      "module_id": 20,
      "service_id": 1,
      "action": [
          "read",
          "create",
          "update",
          "delete"
      ],
      "resource": "Fleet Manager",
      "constraints": {
          "ip_range": "10.0.0.0/8"
      }
  }
]
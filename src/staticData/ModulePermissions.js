export const superAdminModules = [
  { id: 'dashboard', permissions: { canRead: true, canWrite: true, canDelete: true } },
  { id: 'manage-clients', permissions: { canRead: true, canWrite: true } },
  { id: 'manage-company', permissions: { canRead: true, canWrite: true } }
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
  { id: 'role-management', permissions: { canRead: true } },
  { id: 'manage-team', permissions: { canRead: true } },
  { id: 'scheduling-management', permissions: { canRead: true }, submodules: [
    { id: 'manage-shift', permissions: { canRead: true } },
    { id: 'manage-shift-categories', permissions: { canRead: true } },
   
  ]},
  { id: 'manage-contracts', permissions: { canRead: true }, submodules: [
    { id: 'vehicle-contract', permissions: { canRead: true } },
    { id: 'vadjustment-penalty', permissions: { canRead: true } },
    { id: 'cost-center', permissions: { canRead: true } },
    { id: 'show-contractsInMaster', permissions: { canRead: true } },
    { id: 'toll-management', permissions: { canRead: true } },
    
   
  ]},
  {  id: 'manage-vehicles', permissions: { canRead: true }, submodules: [
    { id: 'vehicles', permissions: { canRead: true } },
    { id: 'vehicle-type', permissions: { canRead: true } }
  ]},
  { id: 'drivers', permissions: { canRead: true, canWrite: true } },
  { id: 'routing', permissions: { canRead: true, canWrite: true } },
  { id: 'tracking', permissions: { canRead: true, canWrite: true } },
  { id: 'bussiness-unit', permissions: { canRead: true, canWrite: true } },
  
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


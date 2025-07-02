export const MODULES = [
  { id: 'dashboard', name: 'Dashboard', description: 'Overview and key metrics', icon: 'LayoutDashboard', category: 'core', submodules: [] },
  { id: 'role-management', name: 'Role Management', description: 'Manage roles and permissions', icon: 'ShieldCheck' ,submodules: [] },
  { id: 'user-administrator', name: 'User Administrator', description: 'Manage user accounts and access', icon: 'UserCog' ,submodules: [] },

  { id: 'manage-team', name: 'Manage Team', description: 'Create and manage internal teams', icon: 'Users', category: 'organization', submodules: [] },
  { id: 'manage-clients', name: 'Manage Clients', description: 'Handle client organizations', icon: 'Briefcase', category: 'organization', submodules: [] },
  { id: 'scheduling-management', name: 'Scheduling Management', description: 'Manage trip schedules and bookings', icon: 'CalendarCheck', category: 'scheduling', submodules: [
    { id: 'manage-shift', name: 'Manage Shift', icon: 'Clock' },
    { id: 'manage-shift-categories', name: 'Shift Categories', icon: 'ListOrdered' },
  ]},

  { id: 'manage-drivers', name: 'Manage Drivers', description: 'Maintain and assign drivers', icon: 'UserTie', category: 'fleet', submodules: []},
  { id: 'manage-vendors', name: ' Manage Vendors', description: 'Manage third-party vendors', icon: 'Handshake', category: 'vendor', submodules: []},
  { id: 'manage-contracts', name: 'Manage Contracts', description: 'View and handle all contracts', icon: 'ScrollText', category: 'contracts', submodules: [
    { id: 'vehicle-contract', name: 'Vehicle Contract', icon: 'FileText' },
    { id: 'vadjustment-penalty', name: 'Adjustment & Penalty', icon: 'FileText' },
    { id: 'cost-center', name: 'Cost Center', icon: 'FileText' },
    { id: 'show-contractsInMaster', name: 'Master Contracts', icon: 'FileText' },
    { id: 'toll-management', name: 'Toll Management', icon: 'FileText' }

  ]},
  { id: 'routing', name: ' Manage Routing', description: 'Manage routing', icon: 'Handshake', category: 'routing', submodules: []},
  { id: 'tracking', name: ' Manage Tracking', description: 'Manage Tracking', icon: 'Han  dshake', category: 'routing', submodules: []},

  { id: 'audit-report', name: 'Audit Report', description: 'System activity and compliance logs', icon: 'FileSearch', category: 'reports', submodules: [] },
  { id: 'security-dashboard', name: 'Security Dashboard', description: 'View security logs and issues', icon: 'Building2', category: 'security', submodules: [
    { id: 'sms-config', name: 'SMS Config', icon: 'MessageCircleCode' }
  ]}
];

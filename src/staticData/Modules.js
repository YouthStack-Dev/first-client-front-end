export const FLEET_MODULES = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Overview and key metrics',
    icon: 'LayoutDashboard',
    category: 'core',
  },
  {
    id: 'manageUsers',
    name: 'User Management',
    description: 'Manage users and roles',
    icon: 'User',
    category: 'users'
  },
  {
    id: 'companyAdmins',
    name: 'Company Admins',
    description: 'Admin users for specific companies',
    icon: 'UserCog',
    category: 'users'
  },

  {
    id: 'manageContracts',
    name: 'Manage Contracts',
    description: 'Handle contracts with vendors and vehicles',
    icon: 'ClipboardList',
    category: 'admin'
  },
  {
    id: 'vehicleContract',
    name: 'Vehicle Contract',
    description: 'Manage vehicle contract details',
    icon: 'Car',
    category: 'admin'
  },
  {
    id: 'vendorContract',
    name: 'Vendor Contract',
    description: 'Manage vendor contract details',
    icon: 'Building2',
    category: 'admin'
  },
  {
    id: 'manageVehicles',
    name: 'Manage Vehicles',
    description: 'Handle vehicle inventory and types',
    icon: 'Car',
    category: 'fleet'
  },
  {
    id: 'vehicles',
    name: 'Vehicles',
    description: 'List and update vehicle details',
    icon: 'CarTaxiFront',
    category: 'fleet'
  },
  {
    id: 'vehicleType',
    name: 'Vehicle Type',
    description: 'Manage different vehicle types or categories',
    icon: 'ClipboardList',
    category: 'fleet'
  },
  {
    id: 'SchedulingManagement',
    name: 'Scheduling Management',
    description: 'Manage shifts and scheduling policies',
    icon: 'Calendar',
    category: 'scheduling'
  },
  {
    id: 'manageShift',
    name: 'Manage Shift',
    description: 'Define shift timings and availability',
    icon: 'Calendar',
    category: 'scheduling'
  },
  {
    id: 'manageShiftCategories',
    name: 'Shift Categories',
    description: 'Categorize and manage shifts',
    icon: 'ClipboardList',
    category: 'scheduling'
  },
  {
    id: 'manageSchedulePolicies',
    name: 'Schedule Policies',
    description: 'Set rules for shift and route scheduling',
    icon: 'ClipboardList',
    category: 'scheduling'
  },
  {
    id: 'manageClients',
    name: 'Manage Clients',
    description: 'Manage client companies and contacts',
    icon: 'Users2',
    category: 'admin'
  },
  {
    id: 'manageTeam',
    name: 'Manage Team',
    description: 'Assign roles and manage internal team members',
    icon: 'Users2',
    category: 'admin'
  },
  {
    id: 'manageBilling',
    name: 'Manage Billing',
    description: 'View and manage billing and invoices',
    icon: 'Users2',
    category: 'finance'
  },
  {
    id: 'roleManagement',
    name: 'Role Management',
    description: 'Manage user roles and access control',
    icon: 'Users2',
    category: 'users'
  },
  {
    id: 'auditReport',
    name: 'Audit Report',
    description: 'System audit trails and logs',
    icon: 'ClipboardList',
    category: 'reports'
  },
  {
    id: 'drivers',
    name: 'Drivers',
    description: 'Manage driver information and status',
    icon: 'CarTaxiFront',
    category: 'fleet'
  },
  {
    id: 'routing',
    name: 'Routing',
    description: 'Plan and monitor routes',
    icon: 'Route',
    category: 'tracking'
  },
  {
    id: 'vendors',
    name: 'Vendors',
    description: 'Manage vendors and partners',
    icon: 'Building2',
    category: 'admin'
  },
  {
    id: 'businessUnit',
    name: 'Business Unit',
    description: 'Manage internal business units',
    icon: 'Building2',
    category: 'admin'
  },
  {
    id: 'staff',
    name: 'Staff Administration',
    description: 'Manage support and operational staff',
    icon: 'Building2',
    category: 'admin'
  },
  {
    id: 'securityDashboard',
    name: 'Security Dashboard',
    description: 'View security logs and issues',
    icon: 'Building2',
    category: 'security'
  },
  {
    id: 'smsConfig',
    name: 'SMS Config',
    description: 'Configure SMS notifications and templates',
    icon: 'MessageCircleCode',
    category: 'settings'
  }
];




export const MODULES = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Overview and key metrics',
    icon: 'LayoutDashboard',
    category: 'core',
    submodules: [],
  },
  {
    id: 'user-management',
    name: 'User Management',
    description: 'Manage users and roles',
    icon: 'User',
    category: 'users',
    submodules: [
      {
        id: 'role-management',
        name: 'Role Management',
        description: 'Manage roles and permissions',
        icon: 'ShieldCheck',
      },
      {
        id: 'user-administrator',
        name: 'User Administrator',
        description: 'Manage user accounts and access',
        icon: 'UserCog',
      },
    ],
  },
  {
    id: 'manage-team',
    name: 'Manage Team',
    description: 'Create and manage internal teams',
    icon: 'Users',
    category: 'organization',
    submodules: [
      {
        id: 'employee-under-team',
        name: 'Employee under Team',
        description: 'Assign employees to teams',
        icon: 'UserPlus',
      },
      {
        id: 'business-unit',
        name: 'Business Unit',
        description: 'Define departments or business units',
        icon: 'Building2',
      },
      {
        id: 'staff-administration',
        name: 'Staff Administration',
        description: 'Manage support and operational staff',
        icon: 'Building2',
      },
    ],
  },
  {
    id: 'manage-clients',
    name: 'Manage Clients',
    description: 'Handle client organizations',
    icon: 'Briefcase',
    category: 'organization',
    submodules: [],
  },
  {
    id: 'scheduling-management',
    name: 'Scheduling Management',
    description: 'Manage trip schedules and bookings',
    icon: 'CalendarCheck',
    category: 'scheduling',
    submodules: [
      {
        id: 'manage-shift',
        name: 'Manage Shift',
        icon: 'Clock',
      },
      {
        id: 'manage-shift-categories',
        name: 'Shift Categories',
        icon: 'ListOrdered',
      },
      {
        id: 'schedule-policies',
        name: 'Schedule Policies',
        icon: 'ClipboardList',
      },
    ],
  },
  {
    id: 'manage-drivers',
    name: 'Manage Drivers',
    description: 'Maintain and assign drivers',
    icon: 'UserTie',
    category: 'fleet',
    submodules: [
      {
        id: 'drivers',
        name: 'Drivers',
        icon: 'CarTaxiFront',
      },
      {
        id: 'vehicle-type',
        name: 'Vehicle Type',
        icon: 'Car',
      },
    ],
  },
  {
    id: 'vendors',
    name: 'Vendors',
    description: 'Manage third-party vendors',
    icon: 'Handshake',
    category: 'vendor',
    submodules: [
      {
        id: 'vendor-contract',
        name: 'Vendor Contract',
        icon: 'FileSignature',
      },
    ],
  },
  {
    id: 'manage-contracts',
    name: 'Manage Contracts',
    description: 'View and handle all contracts',
    icon: 'ScrollText',
    category: 'contracts',
    submodules: [
      {
        id: 'vehicle-contract',
        name: 'Vehicle Contract',
        icon: 'FileText',
      },
    ],
  },
  {
    id: 'real-time-tracking',
    name: 'Real-time Tracking',
    description: 'Live map-based tracking of vehicles',
    icon: 'MapPin',
    category: 'tracking',
    submodules: [
      {
        id: 'routing',
        name: 'Routing',
        icon: 'Route',
      },
    ],
  },
  {
    id: 'audit-report',
    name: 'Audit Report',
    description: 'System activity and compliance logs',
    icon: 'FileSearch',
    category: 'reports',
    submodules: [],
  },
  {
    id: 'security-dashboard',
    name: 'Security Dashboard',
    description: 'View security logs and issues',
    icon: 'Building2',
    category: 'security',
    submodules: [
      {
        id: 'sms-config',
        name: 'SMS Config',
        icon: 'MessageCircleCode',
      },
    ],
  },
];

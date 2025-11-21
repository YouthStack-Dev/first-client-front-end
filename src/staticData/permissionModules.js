export const companyPermissionModules = [
  {
    key: "role_management",
    name: "Role Management",
    category: "Administration",
  },
  {
    key: "scheduling_management",
    name: "Scheduling Management",
    category: "Operations",
  },
  {
    key: "driver_management",
    name: "Driver Management",
    category: "Operations",
  },
  {
    key: "vendor_management",
    name: "Vendor Management",
    category: "Operations",
  },
  { key: "routing", name: "Routing", category: "Operations" },
  {
    key: "admin_dashboard",
    name: "Admin Dashboard",
    category: "Administration",
  },
  { key: "tracking", name: "Tracking", category: "Operations" },
];

export const vendorPermissionModules = [
  { key: "fleet_management", name: "Fleet Management", category: "Operations" },
  {
    key: "driver_management",
    name: "Driver Management",
    category: "Operations",
  },
  { key: "order_management", name: "Order Management", category: "Operations" },
  { key: "tracking", name: "Tracking", category: "Operations" },
  { key: "reports", name: "Reports", category: "Analytics" },
  { key: "billing", name: "Billing", category: "Finance" },
];

export const getModulesByCategory = (modules) => {
  const categorized = {};
  modules.forEach((module) => {
    if (!categorized[module.category]) {
      categorized[module.category] = [];
    }
    categorized[module.category].push(module);
  });
  return categorized;
};

// Static employee data
export const staticEmployees = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@company.com",
    phone: "+1-555-0101",
    employeeId: "EMP001",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@company.com",
    phone: "+1-555-0102",
    employeeId: "EMP002",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike.johnson@company.com",
    phone: "+1-555-0103",
    employeeId: "EMP003",
  },
  {
    id: 4,
    name: "Sarah Wilson",
    email: "sarah.wilson@company.com",
    phone: "+1-555-0104",
    employeeId: "EMP004",
  },
  {
    id: 5,
    name: "David Brown",
    email: "david.brown@company.com",
    phone: "+1-555-0105",
    employeeId: "EMP005",
  },
  {
    id: 6,
    name: "Emily Davis",
    email: "emily.davis@company.com",
    phone: "+1-555-0106",
    employeeId: "EMP006",
  },
  {
    id: 7,
    name: "Robert Lee",
    email: "robert.lee@company.com",
    phone: "+1-555-0107",
    employeeId: "EMP007",
  },
  {
    id: 8,
    name: "Lisa Garcia",
    email: "lisa.garcia@company.com",
    phone: "+1-555-0108",
    employeeId: "EMP008",
  },
];

// Mock allowed modules data for the RoleForm
export const mockAllowedModules = [
  {
    moduleKey: "dashboard",
    name: "Dashboard",
    canRead: true,
    canWrite: false,
    canDelete: false,
    isRestricted: false,
  },
  {
    moduleKey: "users",
    name: "User Management",
    canRead: true,
    canWrite: true,
    canDelete: true,
    isRestricted: false,
  },
  {
    moduleKey: "content",
    name: "Content Management",
    canRead: true,
    canWrite: true,
    canDelete: true,
    isRestricted: false,
  },
  {
    moduleKey: "settings",
    name: "System Settings",
    canRead: true,
    canWrite: true,
    canDelete: false,
    isRestricted: false,
  },
  {
    moduleKey: "reports",
    name: "Reports & Analytics",
    canRead: true,
    canWrite: true,
    canDelete: true,
    isRestricted: false,
  },
  {
    moduleKey: "billing",
    name: "Billing & Payments",
    canRead: true,
    canWrite: false,
    canDelete: false,
    isRestricted: true,
  },
];

export const dummyRoledata = [
  {
    id: 1,
    name: "Administrator",
    description: "Full system access with all permissions",
    permissions: {
      Dashboard: { view: true, edit: true, create: true },
      Users: { view: true, edit: true, delete: true, create: true },
      Content: {
        view: true,
        edit: true,
        delete: true,
        create: true,
        publish: true,
      },
      Settings: { view: true, configure: true, export: true },
      Reports: { view: true, export: true, schedule: true },
    },
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z",
    isSystemLevel: true,
    isAssignable: true,
    assignedUsers: [1, 2, 3],
  },
  {
    id: 2,
    name: "Editor",
    description: "Can edit content but cannot change system settings",
    permissions: {
      Dashboard: { view: true, edit: false, create: false },
      Users: { view: true, edit: false, delete: false, create: false },
      Content: {
        view: true,
        edit: true,
        delete: false,
        create: true,
        publish: false,
      },
      Settings: { view: false, configure: false, export: false },
      Reports: { view: true, export: true, schedule: false },
    },
    createdAt: "2024-02-10T00:00:00Z",
    updatedAt: "2024-02-15T00:00:00Z",
    isSystemLevel: false,
    isAssignable: true,
    assignedUsers: [4, 5],
  },
  {
    id: 3,
    name: "Viewer",
    description: "Read-only access to content and reports",
    permissions: {
      Dashboard: { view: true, edit: false, create: false },
      Users: { view: false, edit: false, delete: false, create: false },
      Content: {
        view: true,
        edit: false,
        delete: false,
        create: false,
        publish: false,
      },
      Settings: { view: false, configure: false, export: false },
      Reports: { view: true, export: false, schedule: false },
    },
    createdAt: "2024-03-05T00:00:00Z",
    updatedAt: "2024-03-08T00:00:00Z",
    isSystemLevel: false,
    isAssignable: true,
    assignedUsers: [6, 7, 8],
  },
  {
    id: 4,
    name: "System Auditor",
    description: "Read-only access to system logs and audit trails",
    permissions: {
      Dashboard: { view: true, edit: false, create: false },
      Users: { view: true, edit: false, delete: false, create: false },
      Content: {
        view: true,
        edit: false,
        delete: false,
        create: false,
        publish: false,
      },
      Settings: { view: true, configure: false, export: true },
      Reports: { view: true, export: true, schedule: false },
    },
    createdAt: "2024-01-20T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z",
    isSystemLevel: true,
    isAssignable: false,
    assignedUsers: [],
  },
];

export const dummyPermission = [
  {
    module: "shift",
    action: ["delete", "update", "read", "create"],
  },
  {
    module: "route_vehicle_assignment",
    action: ["read", "update", "delete", "create"],
  },
  {
    module: "admin.tenant",
    action: ["create", "update", "read", "delete"],
  },
  {
    module: "route",
    action: ["update", "delete", "read", "create"],
  },
  {
    module: "team",
    action: ["update", "read", "create", "delete"],
  },
  {
    module: "vehicle-type",
    action: ["create", "read", "delete", "update"],
  },
  {
    module: "policy",
    action: ["create", "read", "delete", "update"],
  },
  {
    module: "route_vendor_assignment",
    action: ["create", "update", "delete", "read"],
  },
  {
    module: "vehicle",
    action: ["update", "create", "read", "delete"],
  },
  {
    module: "permissions",
    action: ["create", "read", "update", "delete"],
  },
  {
    module: "role",
    action: ["delete", "update", "read", "create"],
  },
  {
    module: "route_merge",
    action: ["create", "update", "read", "delete"],
  },
  {
    module: "report",
    action: ["read", "delete", "update", "create"],
  },
  {
    module: "cutoff",
    action: ["read", "update", "create", "delete"],
  },
  {
    module: "vendor-user",
    action: ["update", "read", "delete", "create"],
  },
  {
    module: "vendor",
    action: ["create", "read", "update", "delete"],
  },
  {
    module: "weekoff-config",
    action: ["delete", "read", "update", "create"],
  },
  {
    module: "booking",
    action: ["update", "create", "delete", "read"],
  },
  {
    module: "route-booking",
    action: ["delete", "read", "update", "create"],
  },
  {
    module: "driver",
    action: ["delete", "update", "create", "read"],
  },
  {
    module: "app-driver",
    action: ["read", "delete", "update", "create"],
  },
  {
    module: "employee",
    action: ["read", "create", "delete", "update"],
  },
];

// utils/permissionCategories.js

export const categorizePermissions = (permissions) => {
    const categories = {
      // Core Operations
      operations: {
        name: "Operations",
        icon: "🚚", // or use Lucide icons
        modules: ["booking", "route-booking", "route", "shift"]
      },
      
      // People Management
      people: {
        name: "People Management", 
        icon: "👥",
        modules: ["employee", "driver", "team", "vendor", "vendor-user"]
      },
      
      // Fleet Management
      fleet: {
        name: "Fleet Management",
        icon: "🚛",
        modules: ["vehicle", "vehicle-type"]
      },
      
      // Administration
      administration: {
        name: "Administration",
        icon: "⚙️",
        modules: ["admin.tenant", "weekoff-config", "permissions", "policy", "role"]
      }
    };
  
    const categorized = {};
  
    Object.keys(categories).forEach(categoryKey => {
      const category = categories[categoryKey];
      categorized[categoryKey] = {
        ...category,
        permissions: permissions.filter(permission => 
          category.modules.includes(permission.module)
        )
      };
    });
  
    return categorized;
  };
  
  // Alternative: Module-based grouping for sidebar
  export const getSidebarNavigation = (userPermissions) => {
    return [
      {
        group: "Operations",
        icon: "Truck",
        items: [
          {
            name: "Bookings",
            path: "/bookings",
            requiredPermissions: ["booking.read"],
            subItems: [
              { name: "All Bookings", path: "/bookings", permission: "booking.read" },
              { name: "Create Booking", path: "/bookings/create", permission: "booking.create" },
            ]
          },
          {
            name: "Route Bookings", 
            path: "/route-bookings",
            requiredPermissions: ["route-booking.read"],
            subItems: [
              { name: "Route Schedule", path: "/route-bookings", permission: "route-booking.read" },
              { name: "Plan Route", path: "/route-bookings/create", permission: "route-booking.create" },
            ]
          },
          {
            name: "Routes",
            path: "/routes",
            requiredPermissions: ["route.read"],
            subItems: [
              { name: "Route Map", path: "/routes", permission: "route.read" },
              { name: "Add Route", path: "/routes/create", permission: "route.create" },
            ]
          },
          {
            name: "Shifts",
            path: "/shifts", 
            requiredPermissions: ["shift.read"],
            subItems: [
              { name: "Shift Schedule", path: "/shifts", permission: "shift.read" },
              { name: "Create Shift", path: "/shifts/create", permission: "shift.create" },
            ]
          }
        ]
      },
      {
        group: "People Management",
        icon: "Users",
        items: [
          {
            name: "Employees",
            path: "/employees",
            requiredPermissions: ["employee.read"],
            subItems: [
              { name: "All Employees", path: "/employees", permission: "employee.read" },
              { name: "Add Employee", path: "/employees/create", permission: "employee.create" },
            ]
          },
          {
            name: "Drivers",
            path: "/drivers",
            requiredPermissions: ["driver.read"],
            subItems: [
              { name: "Driver List", path: "/drivers", permission: "driver.read" },
              { name: "Add Driver", path: "/drivers/create", permission: "driver.create" },
            ]
          },
          {
            name: "Teams",
            path: "/teams",
            requiredPermissions: ["team.read"],
            subItems: [
              { name: "Team Management", path: "/teams", permission: "team.read" },
              { name: "Create Team", path: "/teams/create", permission: "team.create" },
            ]
          },
          {
            name: "Vendors",
            path: "/vendors",
            requiredPermissions: ["vendor.read"],
            subItems: [
              { name: "Vendor List", path: "/vendors", permission: "vendor.read" },
              { name: "Add Vendor", path: "/vendors/create", permission: "vendor.create" },
            ]
          }
        ]
      },
      {
        group: "Fleet Management", 
        icon: "Car",
        items: [
          {
            name: "Vehicles",
            path: "/vehicles",
            requiredPermissions: ["vehicle.read"],
            subItems: [
              { name: "Fleet Overview", path: "/vehicles", permission: "vehicle.read" },
              { name: "Add Vehicle", path: "/vehicles/create", permission: "vehicle.create" },
            ]
          },
          {
            name: "Vehicle Types",
            path: "/vehicle-types",
            requiredPermissions: ["vehicle-type.read"],
            subItems: [
              { name: "Types List", path: "/vehicle-types", permission: "vehicle-type.read" },
              { name: "Add Type", path: "/vehicle-types/create", permission: "vehicle-type.create" },
            ]
          }
        ]
      },
      {
        group: "Administration",
        icon: "Settings",
        items: [
          {
            name: "Tenants",
            path: "/tenants",
            requiredPermissions: ["admin.tenant.read"],
            subItems: [
              { name: "Tenant List", path: "/tenants", permission: "admin.tenant.read" },
              { name: "Add Tenant", path: "/tenants/create", permission: "admin.tenant.create" },
            ]
          },
          {
            name: "Week-off Config",
            path: "/weekoff-config",
            requiredPermissions: ["weekoff-config.read"],
            subItems: [
              { name: "Configuration", path: "/weekoff-config", permission: "weekoff-config.read" },
              { name: "Update Config", path: "/weekoff-config/update", permission: "weekoff-config.update" },
            ]
          },
          {
            name: "Permissions",
            path: "/permissions",
            requiredPermissions: ["permissions.read"],
            subItems: [
              { name: "Permission Matrix", path: "/permissions", permission: "permissions.read" },
              { name: "Manage Permissions", path: "/permissions/manage", permission: "permissions.update" },
            ]
          },
          {
            name: "Policies",
            path: "/policies", 
            requiredPermissions: ["policy.read"],
            subItems: [
              { name: "Policy List", path: "/policies", permission: "policy.read" },
              { name: "Create Policy", path: "/policies/create", permission: "policy.create" },
            ]
          },
          {
            name: "Roles",
            path: "/roles",
            requiredPermissions: ["role.read"],
            subItems: [
              { name: "Role Management", path: "/roles", permission: "role.read" },
              { name: "Create Role", path: "/roles/create", permission: "role.create" },
            ]
          }
        ]
      }
    ];
  };
  
  // Helper to check if user has permission
  export const hasPermission = (userPermissions, requiredPermission) => {
    return userPermissions.some(perm => 
      `${perm.module}.${perm.action}` === requiredPermission
    );
  };
  
  // Filter sidebar based on user permissions
  export const getFilteredSidebar = (sidebarConfig, userPermissions) => {
    return sidebarConfig.map(group => ({
      ...group,
      items: group.items
        .map(item => ({
          ...item,
          subItems: item.subItems.filter(subItem => 
            hasPermission(userPermissions, subItem.permission)
          )
        }))
        .filter(item => item.subItems.length > 0) // Remove items with no accessible subItems
    })).filter(group => group.items.length > 0); // Remove empty groups
  };


  export const  permissionModules = [
    {
        "module": "booking",
        "action": "create",
        "description": "Create booking",
        "is_active": true,
        "permission_id": 1,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "booking",
        "action": "read",
        "description": "Read booking",
        "is_active": true,
        "permission_id": 2,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "booking",
        "action": "update",
        "description": "Update booking",
        "is_active": true,
        "permission_id": 3,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "booking",
        "action": "delete",
        "description": "Delete booking",
        "is_active": true,
        "permission_id": 4,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "driver",
        "action": "create",
        "description": "Create driver",
        "is_active": true,
        "permission_id": 5,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "driver",
        "action": "read",
        "description": "Read driver",
        "is_active": true,
        "permission_id": 6,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "driver",
        "action": "update",
        "description": "Update driver",
        "is_active": true,
        "permission_id": 7,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "driver",
        "action": "delete",
        "description": "Delete driver",
        "is_active": true,
        "permission_id": 8,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "employee",
        "action": "create",
        "description": "Create employee",
        "is_active": true,
        "permission_id": 9,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "employee",
        "action": "read",
        "description": "Read employee",
        "is_active": true,
        "permission_id": 10,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "employee",
        "action": "update",
        "description": "Update employee",
        "is_active": true,
        "permission_id": 11,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "employee",
        "action": "delete",
        "description": "Delete employee",
        "is_active": true,
        "permission_id": 12,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "route-booking",
        "action": "create",
        "description": "Create route-booking",
        "is_active": true,
        "permission_id": 13,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "route-booking",
        "action": "read",
        "description": "Read route-booking",
        "is_active": true,
        "permission_id": 14,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "route-booking",
        "action": "update",
        "description": "Update route-booking",
        "is_active": true,
        "permission_id": 15,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "route-booking",
        "action": "delete",
        "description": "Delete route-booking",
        "is_active": true,
        "permission_id": 16,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "route",
        "action": "create",
        "description": "Create route",
        "is_active": true,
        "permission_id": 17,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "route",
        "action": "read",
        "description": "Read route",
        "is_active": true,
        "permission_id": 18,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "route",
        "action": "update",
        "description": "Update route",
        "is_active": true,
        "permission_id": 19,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "route",
        "action": "delete",
        "description": "Delete route",
        "is_active": true,
        "permission_id": 20,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "shift",
        "action": "create",
        "description": "Create shift",
        "is_active": true,
        "permission_id": 21,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "shift",
        "action": "read",
        "description": "Read shift",
        "is_active": true,
        "permission_id": 22,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "shift",
        "action": "update",
        "description": "Update shift",
        "is_active": true,
        "permission_id": 23,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "shift",
        "action": "delete",
        "description": "Delete shift",
        "is_active": true,
        "permission_id": 24,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "team",
        "action": "create",
        "description": "Create team",
        "is_active": true,
        "permission_id": 25,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "team",
        "action": "read",
        "description": "Read team",
        "is_active": true,
        "permission_id": 26,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "team",
        "action": "update",
        "description": "Update team",
        "is_active": true,
        "permission_id": 27,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "team",
        "action": "delete",
        "description": "Delete team",
        "is_active": true,
        "permission_id": 28,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "admin.tenant",
        "action": "create",
        "description": "Create admin.tenant",
        "is_active": true,
        "permission_id": 29,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "admin.tenant",
        "action": "read",
        "description": "Read admin.tenant",
        "is_active": true,
        "permission_id": 30,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "admin.tenant",
        "action": "update",
        "description": "Update admin.tenant",
        "is_active": true,
        "permission_id": 31,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "admin.tenant",
        "action": "delete",
        "description": "Delete admin.tenant",
        "is_active": true,
        "permission_id": 32,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "vehicle",
        "action": "create",
        "description": "Create vehicle",
        "is_active": true,
        "permission_id": 33,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "vehicle",
        "action": "read",
        "description": "Read vehicle",
        "is_active": true,
        "permission_id": 34,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "vehicle",
        "action": "update",
        "description": "Update vehicle",
        "is_active": true,
        "permission_id": 35,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "vehicle",
        "action": "delete",
        "description": "Delete vehicle",
        "is_active": true,
        "permission_id": 36,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "vehicle-type",
        "action": "create",
        "description": "Create vehicle-type",
        "is_active": true,
        "permission_id": 37,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "vehicle-type",
        "action": "read",
        "description": "Read vehicle-type",
        "is_active": true,
        "permission_id": 38,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "vehicle-type",
        "action": "update",
        "description": "Update vehicle-type",
        "is_active": true,
        "permission_id": 39,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "vehicle-type",
        "action": "delete",
        "description": "Delete vehicle-type",
        "is_active": true,
        "permission_id": 40,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "vendor",
        "action": "create",
        "description": "Create vendor",
        "is_active": true,
        "permission_id": 41,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "vendor",
        "action": "read",
        "description": "Read vendor",
        "is_active": true,
        "permission_id": 42,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "vendor",
        "action": "update",
        "description": "Update vendor",
        "is_active": true,
        "permission_id": 43,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "vendor",
        "action": "delete",
        "description": "Delete vendor",
        "is_active": true,
        "permission_id": 44,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "vendor-user",
        "action": "create",
        "description": "Create vendor-user",
        "is_active": true,
        "permission_id": 45,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "vendor-user",
        "action": "read",
        "description": "Read vendor-user",
        "is_active": true,
        "permission_id": 46,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "vendor-user",
        "action": "update",
        "description": "Update vendor-user",
        "is_active": true,
        "permission_id": 47,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "vendor-user",
        "action": "delete",
        "description": "Delete vendor-user",
        "is_active": true,
        "permission_id": 48,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "weekoff-config",
        "action": "create",
        "description": "Create weekoff-config",
        "is_active": true,
        "permission_id": 49,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "weekoff-config",
        "action": "read",
        "description": "Read weekoff-config",
        "is_active": true,
        "permission_id": 50,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "weekoff-config",
        "action": "update",
        "description": "Update weekoff-config",
        "is_active": true,
        "permission_id": 51,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "weekoff-config",
        "action": "delete",
        "description": "Delete weekoff-config",
        "is_active": true,
        "permission_id": 52,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "permissions",
        "action": "create",
        "description": "Create permissions",
        "is_active": true,
        "permission_id": 53,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "permissions",
        "action": "read",
        "description": "Read permissions",
        "is_active": true,
        "permission_id": 54,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "permissions",
        "action": "update",
        "description": "Update permissions",
        "is_active": true,
        "permission_id": 55,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "permissions",
        "action": "delete",
        "description": "Delete permissions",
        "is_active": true,
        "permission_id": 56,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "policy",
        "action": "create",
        "description": "Create policy",
        "is_active": true,
        "permission_id": 57,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "policy",
        "action": "read",
        "description": "Read policy",
        "is_active": true,
        "permission_id": 58,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "policy",
        "action": "update",
        "description": "Update policy",
        "is_active": true,
        "permission_id": 59,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "policy",
        "action": "delete",
        "description": "Delete policy",
        "is_active": true,
        "permission_id": 60,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "role",
        "action": "create",
        "description": "Create role",
        "is_active": true,
        "permission_id": 61,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "role",
        "action": "read",
        "description": "Read role",
        "is_active": true,
        "permission_id": 62,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "role",
        "action": "update",
        "description": "Update role",
        "is_active": true,
        "permission_id": 63,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    },
    {
        "module": "role",
        "action": "delete",
        "description": "Delete role",
        "is_active": true,
        "permission_id": 64,
        "created_at": "2025-09-23T14:28:51.098110",
        "updated_at": "2025-09-23T14:28:51.098110"
    }
]
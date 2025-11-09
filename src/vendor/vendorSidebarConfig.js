// vendorSidebarConfig.js
import {
  Calendar,
  Users,
  UserCheck,
  MapPin,
  Route,
  Clock,
  Users2,
  Car,
  Truck,
  Store,
  UserCog,
  CalendarOff,
} from "lucide-react";

// Vendor-specific sidebar configuration
export const vendorSidebarConfig = [
  // {
  //   title: 'Operations',
  //   items: [
  //     {
  //       title: 'Bookings',
  //       icon: Calendar,
  //        path: '/vendor/bookings',
  //        permission: 'booking.read',
  //        icon: Calendar
  //     },
  //     {
  //       title: 'Route Bookings',
  //       icon: Route,
  //       subItems: [
  //         { title: 'Route Booking List', path: '/vendor/route-bookings', permission: 'route-booking.read', icon: Route },
  //         { title: 'Create Route Booking', path: '/vendor/route-bookings/create', permission: 'route-booking.create', icon: Route }
  //       ]
  //     }
  //   ]
  // },
  {
    title: "Resources",
    items: [
      {
        title: "Manage Drivers",
        icon: Users,
        path: "/vendor/drivers",
        permission: "driver.read",
      },
      {
        title: "Vehicles",
        icon: Car,
        path: "/vendor/vehicles",
        permission: "vehicle.read",
      },
      // {
      //   title: 'Vehicle Types',
      //   icon: Truck,
      //   subItems: [
      //     { title: 'Type List', path: '/vendor/vehicle-types', permission: 'vehicle-type.read', icon: Truck },
      //     { title: 'Add Type', path: '/vendor/vehicle-types/add', permission: 'vehicle-type.create', icon: Truck }
      //   ]
      // }
    ],
  },
  {
    title: "Management",
    items: [
      {
        title: "Route Management",
        path: "/vendor/routing",
        permission: "route.read",
        icon: MapPin,
      },
      {
        title: "Shift Management",
        icon: Clock,
        path: "/vendor/shifts",
        permission: "shift.read",
      },
      {
        title: "Cutoff Management",
        icon: Clock,
        path: "/vendor/cutoff",
        permission: "cutoff.read",
      },
      {
        title: "Teams",
        icon: Users2,
        path: "/vendor/departments",
        permission: "team.read",
      },
      {
        title: "Vendor",
        path: "/vendor/vendors",
        permission: "vendor.read",
        icon: Store,
      },
    ],
  },
  // {
  //   title: "Administration",
  //   items: [
  //     // {
  //     //   title: 'Weekoff Config',
  //     //   icon: CalendarOff,
  //     //   subItems: [
  //     //     { title: 'Configuration', path: '/vendor/weekoff-config', permission: 'weekoff-config.read', icon: CalendarOff },
  //     //     { title: 'Manage Config', path: '/vendor/weekoff-config/manage', permission: 'weekoff-config.create', icon: CalendarOff }
  //     //   ]
  //     // },
  //     {
  //       title: "Permissions",
  //       icon: Key,
  //       subItems: [
  //         {
  //           title: "Permission Matrix",
  //           path: "/vendor/permissions",
  //           permission: "permissions.read",
  //           icon: Key,
  //         },
  //         {
  //           title: "Manage Permissions",
  //           path: "/vendor/permissions/manage",
  //           permission: "permissions.create",
  //           icon: Key,
  //         },
  //       ],
  //     },
  //     {
  //       title: "Policies",
  //       icon: FileText,
  //       subItems: [
  //         {
  //           title: "Policy List",
  //           path: "/vendor/policies",
  //           permission: "policy.read",
  //           icon: FileText,
  //         },
  //         {
  //           title: "Create Policy",
  //           path: "/vendor/policies/create",
  //           permission: "policy.create",
  //           icon: FileText,
  //         },
  //       ],
  //     },
  //     {
  //       title: "Roles",
  //       icon: Shield,
  //       subItems: [
  //         {
  //           title: "Role Management",
  //           path: "/vendor/roles",
  //           permission: "role.read",
  //           icon: Shield,
  //         },
  //         {
  //           title: "Create Role",
  //           path: "/vendor/roles/create",
  //           permission: "role.create",
  //           icon: Shield,
  //         },
  //       ],
  //     },
  //     {
  //       title: "Tenant Settings",
  //       icon: Settings,
  //       subItems: [
  //         {
  //           title: "Tenant Management",
  //           path: "/vendor/admin/tenant",
  //           permission: "admin.tenant.read",
  //           icon: Settings,
  //         },
  //         {
  //           title: "Configure Tenant",
  //           path: "/vendor/admin/tenant/configure",
  //           permission: "admin.tenant.create",
  //           icon: Settings,
  //         },
  //       ],
  //     },
  //   ],
  // },
];

// Helper function to check if user has permission
const hasPermission = (userPermissions, requiredPermission) => {
  if (!requiredPermission) return true; // No permission required

  const [module, action] = requiredPermission.split(".");
  const userModule = userPermissions.find((p) => p.module === module);

  return userModule && userModule.action.includes(action);
};

// Filter sidebar based on user permissions
export const getFilteredVendorSidebar = (userPermissions) => {
  return vendorSidebarConfig
    .map((group) => ({
      ...group,
      items: group.items
        .map((item) => ({
          ...item,
          subItems: item.subItems
            ? item.subItems.filter((subItem) =>
                hasPermission(userPermissions, subItem.permission)
              )
            : [],
        }))
        .filter(
          (item) =>
            item.subItems.length > 0 ||
            (item.path && hasPermission(userPermissions, item.permission))
        ),
    }))
    .filter((group) => group.items.length > 0);
};

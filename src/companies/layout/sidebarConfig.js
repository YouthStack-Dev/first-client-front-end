// sidebarConfig.js
import { Users, MapPin, Clock, Users2, Car, Store } from "lucide-react";

// Base sidebar configuration
export const baseSidebarConfig = [
  {
    title: "Dashboard",
    items: [
      {
        title: "Dashboard",
        icon: Users,
        path: "/companies/dashboard",
        permission: "role.read",
        icon: Users,
      },
    ],
  },
  {
    title: "User Administrator",
    items: [
      {
        title: "User Role & Permission",
        icon: Users,
        path: "/companies/role-permission",
        permission: "role.read",
        icon: Users,
      },
      {
        title: "Vendor Users",
        icon: Users,
        path: "/companies/vendor-user-management",
        permission: "role.read",
        icon: Users,
      },
      {
        title: "Escort Management",
        icon: Users,
        path: "/companies/escort-management",
        permission: "escort.read",
        icon: Users,
      },
    ],
  },
  {
    title: "Resources",
    items: [
      {
        title: "Manage Drivers",
        icon: Users,
        path: "/companies/drivers",
        permission: "driver.read",
        icon: Users,
      },
      {
        title: " New Manage Drivers",
        icon: Users,
        path: "/companies/driverform",
        permission: "driver.read",
        icon: Users,
      },
      {
        title: "Vehicles",
        icon: Car,
        path: "/companies/vehicles",
        permission: "vehicle.read",
        icon: Car,
      },
    ],
  },

  {
    title: "Management",
    items: [
      {
        title: "Route Management",
        path: "/companies/routing",
        permission: "route.read",
        icon: MapPin,
      },
      {
        title: "Shift Management",
        icon: Clock,
        path: "/companies/shifts",
        permission: "shift.read",
        icon: Clock,
      },
      {
        title: "Cutoff Management",
        icon: Clock,
        path: "/companies/cutoff",
        permission: "cutoff.read",
        icon: Clock,
      },
      {
        title: "Teams",
        icon: Users2,
        path: "/companies/departments",
        permission: "team.read",
        icon: Users2,
      },
      {
        title: "Vendor Management",
        path: "/companies/vendors",
        permission: "vendor.read",
        icon: Store,
      },
      {
        title: "Tracking Management",
        path: "/companies/tracking",
        permission: "route.read",
        icon: Store,
      },
    ],
  },
  {
    title: "Reports",
    items: [
      {
        title: "Reports Managements",
        icon: Users,
        path: "/companies/repots-management",
        permission: "report.read",
        icon: Users,
      },
    ],
  },
];

// Helper function to check if user has permission
const hasPermission = (userPermissions, requiredPermission) => {
  if (!requiredPermission) return true; // No permission required

  const [module, action] = requiredPermission.split(".");
  const userModule = userPermissions.find((p) => p.module === module);

  return userModule && userModule.action.includes(action);
};

// Filter sidebar based on user permissions
export const getFilteredSidebar = (userPermissions) => {
  return baseSidebarConfig
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

// sidebarConfig.js
import {
  Calendar,
  Users,
  UserCheck,
  MapPin,
  Route,
  Clock,
  Users2,
  Settings,
  Car,
  Truck,
  Store,
  UserCog,
  CalendarOff,
  Shield,
  FileText,
  Key,
} from "lucide-react";

// Base sidebar configuration
export const baseSidebarConfig = [
  {
    title: "User Administrator",
    items: [
      {
        title: " User Role & Permission",
        icon: Users,
        path: "/role-permission",
        permission: "role.read",
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
        path: "/drivers",
        permission: "driver.read",
        icon: Users,
      },
      {
        title: "Vehicles",
        icon: Car,
        path: "/vehicles",
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
        path: "/routing",
        permission: "route.read",
        icon: MapPin,
      },
      {
        title: "Shift Management",
        icon: Clock,
        path: "/shifts",
        permission: "shift.read",
        icon: Clock,
      },
      {
        title: "Cutoff Management",
        icon: Clock,
        path: "/cutoff",
        permission: "cutoff.read",
        icon: Clock,
      },
      {
        title: "Teams",
        icon: Users2,
        path: "/departments",
        permission: "team.read",
        icon: Users2,
      },
      {
        title: "Vendor Management",
        path: "/vendors",
        permission: "vendor.read",
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
        path: "/repots-management",
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

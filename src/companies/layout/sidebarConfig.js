// sidebarConfig.js
import {
  Users,
  MapPin,
  Clock,
  Users2,
  Car,
  Store,
  Key,
  Shield,
  FileText,
  Settings,
  Bell,
  Megaphone,
  Star,
} from "lucide-react";

export const baseSidebarConfig = [
  {
    title: "Transport Management",
    items: [
      {
        title: "Manage Drivers",
        icon: Users,
        path: "/companies/driverform",
        permission: "driver.read",
      },
      {
        title: "Vehicles",
        icon: Car,
        path: "/companies/vehicles-management",
        permission: "vehicle.read",
      },
      {
        title: "Escort Management",          // moved here from User Administrator
        icon: Users2,
        path: "/companies/escort-management",
        permission: "escort.read",
      },
    ],
  },
  {
    title: "Operations Management",
    items: [
      {
        title: "Route Management",
        icon: MapPin,
        path: "/companies/routing",
        permission: "route.read",
      },
      {
        title: "Shift Management",
        icon: Clock,
        path: "/companies/shifts",
        permission: "shift.read",
      },
      {
        title: "Teams",
        icon: Users2,
        path: "/companies/teams",
        permission: "team.read",
      },
    ],
  },
  {
    title: "Configuration",
    items: [
      {
        title: "System Configuration",
        icon: Settings,
        path: "/companies/cutoff",
        permission: "cutoff.read",
      },
      {
        title: "Alert Configuration",
        icon: Shield,
        path: "/companies/alert-config",
        permission: "alert.read",
      },
      {
        title: "Alert Notifications",
        icon: Bell,
        path: "/companies/notification",
        permission: "alert.read",
      },
      {
        title: "Announcements",
        icon: Megaphone,
        path: "/companies/announcements",
        permission: null,
      },
      {
        title: "Reviews",
        icon: Star,
        path: "/companies/reviews",
        permission: null,
      },
    ],
  },
  {
    title: "Reports",
    items: [
      {
        title: "Reports Management",
        icon: FileText,
        path: "/companies/reports-management",
        permission: "report.read",
      },
    ],
  },
  {
    title: "Vendor Management",              // moved to last
    items: [
      {
        title: "All Vendors",
        icon: Store,
        path: "/companies/new-vendor-management",
        permission: "vendor.read",
      },
      {
        title: "Vendor Users",
        icon: Users,
        path: "/companies/vendor-user-management",
        permission: "vendor_user.read",
      },
    ],
  },
  {
    title: "User Administrator",
    items: [
      {
        title: "User Role & Permission",
        icon: Key,
        path: "/companies/role-permission",
        permission: "role.read",
      },
    ],
  },
];

const hasPermission = (userPermissions, requiredPermission) => {
  if (!requiredPermission) return true;
  const [module, action] = requiredPermission.split(".");
  const userModule = userPermissions.find((p) => p.module === module);
  return userModule && userModule.action.includes(action);
};

export const getFilteredSidebar = (userPermissions) => {
  return baseSidebarConfig
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        hasPermission(userPermissions, item.permission)
      ),
    }))
    .filter((group) => group.items.length > 0);
};
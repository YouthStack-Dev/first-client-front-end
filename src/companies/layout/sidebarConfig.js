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
    title: "Vendor Management",
    items: [
      {
        title: "All Vendors",
        icon: Store,
        path: "/companies/new-vendor-management",
        permission: "vendor.read",           // ✅ module: "vendor"
      },
      {
        title: "Vendor Users",
        icon: Users,
        path: "/companies/vendor-user-management",
        permission: "vendor_user.read",      // ✅ module: "vendor_user"
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
        permission: "role.read",             // ✅ module: "role"
      },
      {
        title: "Escort Management",
        icon: Users2,
        path: "/companies/escort-management",
        permission: "escort.read",           // ✅ module: "escort"
      },
    ],
  },
  {
    title: "Transport Management",
    items: [
      {
        title: "Manage Drivers",
        icon: Users,
        path: "/companies/driverform",
        permission: "driver.read",           // ✅ module: "driver"
      },
      {
        title: "Vehicles",
        icon: Car,
        path: "/companies/vehicles-management",
        permission: "vehicle.read",          // ✅ module: "vehicle"
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
        permission: "route.read",            // ✅ module: "route"
      },
      {
        title: "Shift Management",
        icon: Clock,
        path: "/companies/shifts",
        permission: "shift.read",            // ✅ module: "shift"
      },
      {
        title: "Teams",
        icon: Users2,
        path: "/companies/teams",
        permission: "team.read",             // ✅ module: "team"
      },
      // {
      //   title: "Tracking Management",
      //   icon: MapPin,
      //   path: "/companies/tracking",
      //   permission: "route.read",            // ✅ closest match: module: "route"
      // },
    ],
  },
  {
    title: "Configuration",
    items: [
      {
        title: "System Configuration",
        icon: Settings,
        path: "/companies/cutoff",
        permission: "cutoff.read",           // ✅ module: "cutoff"
      },
      {
        title: "Alert Configuration",
        icon: Shield,
        path: "/companies/alert-config",
        permission: "alert.read",            // ✅ module: "alert"
      },
      {
        title: "Alert Notifications",
        icon: Bell,
        path: "/companies/notification",
        permission: "alert.read",            // ✅ module: "alert"
      },
      {
        title: "Announcements",
        icon: Megaphone,
        path: "/companies/announcements",
        permission: null,                    // ⚠️ no "announcement" module in permissions, showing for all
      },
      {
        title: "Reviews",
        icon: Star,
        path: "/companies/reviews",
        permission: null,                    // ⚠️ no "review" module in permissions, showing for all
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
        permission: "report.read",           // ✅ module: "report"
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
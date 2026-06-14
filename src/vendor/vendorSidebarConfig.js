import {
  LayoutDashboard,
  Car,
  Users,
  UserCheck,
  MapPin,
  AlertTriangle,
  FileText,
  Settings,
  Shield,
  Bell,
  Megaphone,
  Star,
} from "lucide-react";

export const vendorSidebarConfig = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        icon: LayoutDashboard,
        path: "/vendor/dashboard",
        permission: null,
      },
    ],
  },
  {
    title: "Fleet Management",
    items: [
      {
        title: "Manage Vehicles",
        icon: Car,
        path: "/vendor/vehicles-management",
        permission: "vehicle.read",
      },
      {
        title: "Manage Drivers",
        icon: Users,
        path: "/vendor/driverform",
        permission: "driver.read",
      },
      {
        title: "Escort Management",
        icon: UserCheck,
        path: "/vendor/escort-management",
        permission: "escort.read",
      },
      {
        title: "Vendor Users",
        icon: Users,
        path: "/vendor/vendor-user-management",
        permission: "vendor_user.read",
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        title: "Route Management",
        icon: MapPin,
        path: "/vendor/routing",
        permission: "route.read",
      },
      {
        title: "Speed Violations",
        icon: AlertTriangle,
        path: "/vendor/speed-violations",
        permission: "speed.read",
      },
    ],
  },
  {
    title: "Reports & Analytics",
    items: [
      {
        title: "Reports Management",
        icon: FileText,
        path: "/vendor/reports-management",
        permission: "report.read",
      },
      {
        title: "Contract Management",
        icon: FileText,
        path: "/vendor/contracts",
        permission: "contract.read",
      },
    ],
  },
  {
    title: "Configuration",
    items: [
      // {
      //   title: "System Configuration",
      //   icon: Settings,
      //   path: "/vendor/cutoff",
      //   permission: "cutoff.read",
      // },
      // {
      //   title: "Alert Configuration",
      //   icon: Shield,
      //   path: "/vendor/alert-config",
      //   permission: "alert.read",
      // },
      {
        title: "Alert Notifications",
        icon: Bell,
        path: "/vendor/notification",
        permission: "alert.read",
      },
      {
        title: "Announcements",
        icon: Megaphone,
        path: "/vendor/announcements",
        permission: null,
      },
      {
        title: "Reviews",
        icon: Star,
        path: "/vendor/reviews",
        permission: null,
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

export const getFilteredVendorSidebar = (userPermissions) => {
  return vendorSidebarConfig
    .map((group) => ({
      ...group,
      items: group.items
        .map((item) => ({
          ...item,
          subItems: item.subItems
            ? item.subItems.filter((sub) =>
                hasPermission(userPermissions, sub.permission)
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
// sidebarConfig.js
import {
  Users,
  MapPin,
  Clock,
  Users2,
  Car,
  Store,
  Building,
  Key,
  Shield,
  FileText,
  Settings,
   Truck,
   Bell, 
} from "lucide-react";

// Base sidebar configuration
export const baseSidebarConfig = [
  {
    title: "Dashboard",
    items: [
      {
        title: "Dashboard",
        icon: Users,
        path: "/companies/dashboard",
        permission: "dashboard.read",
      },
    ],
  },
  {
    title: "Vendor Management",
    items: [
      // {
      //   title: "Tenant Overview",
      //   icon: Building,
      //   path: "/companies/tenants",
      //   permission: "tenant.read",
      //   subItems: [
      //     {
      //       title: "Add New Tenant",
      //       icon: Building,
      //       path: "/companies/tenants/create",
      //       permission: "tenant.create",
      //     },
      //     {
      //       title: "Tenant Settings",
      //       icon: Settings,
      //       path: "/companies/tenants/settings",
      //       permission: "tenant.update",
      //     },
      //     {
      //       title: "Billing & Subscription",
      //       icon: FileText,
      //       path: "/companies/tenants/billing",
      //       permission: "billing.read",
      //     },
      //   ],
      // },
      {
        title: "Manage Vendors",
        icon: Store,
        path: "/companies/vendors",
        permission: "vendor.read",
        subItems: [
          {
            title: " All Vendor ",
            path: "/companies/new-vendor-management",
            permission: "vendor.read",
            icon: Store,
          },
          {
            title: "Vendor Users",
            icon: Users,
            path: "/companies/vendor-user-management",
            permission: "role.read",
            icon: Users,
          },
        ],
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
      {
        title: "Vendor Users",
        icon: Users,
        path: "/companies/vendor-user-management",
        permission: "vendor.user.read",
      },
      {
        title: "Escort Management",
        icon: Users2,
        path: "/companies/escort-management",
        permission: "escort.read",
      },
    ],
  },
  {
    title: "Resources",
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
    ],
  },
  {
    title: "Operations Management",
    items: [
    {
      title: "Route Management",
      icon: MapPin,
      path: "/companies/routing", // Keep the path for the parent
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
      {
        title: "Tracking Management",
        path: "/companies/tracking",
        permission: "tracking.read",
        icon: MapPin,
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
        subItems: [
          {
            title: "Tenant Reports",
            icon: Building,
            path: "/companies/reports/tenants",
            permission: "report.tenant.read",
          },
          {
            title: "Vendor Reports",
            icon: Store,
            path: "/companies/reports/vendors",
            permission: "report.vendor.read",
          },
          {
            title: "Operational Reports",
            icon: MapPin,
            path: "/companies/reports/operations",
            permission: "report.operations.read",
          },
        ],
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
            (item.subItems && item.subItems.length > 0) ||
            (item.path && hasPermission(userPermissions, item.permission))
        ),
    }))
    .filter((group) => group.items.length > 0);
};

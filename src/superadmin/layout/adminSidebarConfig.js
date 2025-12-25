// sidebarConfig.js
import { BarChart3, Building2, Truck } from "lucide-react";

// Base sidebar configuration
export const baseSidebarConfig = [
  {
    title: "Dashboard",
    items: [
      {
        title: "Dashboard",
        path: "/superadmin/dashboard",
        permission: "dashboard.read",
        icon: BarChart3,
      },
    ],
  },

  {
    title: "Companies",
    items: [
      {
        title: "Manage Companies",
        path: "/superadmin/manage-companies",
        permission: "admin_tenant.create",
        icon: Building2,
      },
    ],
  },

  {
    title: "Vendors",
    items: [
      {
        title: "Manage Vendors",
        path: "/superadmin/manage-vendors",
        permission: "vendor.read",
        icon: Truck,
      },
      {
        title: "New Vendor Management",
        path: "/superadmin/new-vendor-management",
        permission: "vendor.read",
        icon: BarChart3,
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
      items: group.items.filter((item) =>
        hasPermission(userPermissions, item.permission)
      ),
    }))
    .filter((group) => group.items.length > 0);
};

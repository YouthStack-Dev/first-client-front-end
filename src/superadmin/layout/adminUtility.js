// Utility functions for admin panel
export const getAdminTitleFromPath = (pathname) => {
  const pathMap = {
    "/admin/dashboard": "Dashboard Overview",
    "/admin/analytics": "Analytics & Reports",
    "/admin/activity-log": "Activity Log",
    "/admin/users": "User Management",
    "/admin/user-roles": "User Roles",
    "/admin/permissions": "Permissions Management",
    "/admin/system-settings": "System Settings",
    "/admin/cutoff-management": "Cutoff Management",
    "/admin/company-info": "Company Information",
    "/admin/reports/shifts": "Shift Reports",
    "/admin/reports/users": "User Reports",
    "/admin/reports/financial": "Financial Reports",
    "/admin/database/backup": "Database Backup",
    "/admin/database/migration": "Data Migration",
    "/admin/notifications": "System Notifications",
    "/admin/broadcast": "Broadcast Message",
    "/admin/profile": "Admin Profile",
    "/admin/settings": "Admin Settings",
    "/admin/system-health": "System Health",
    "/admin/login": "Admin Login",
  };

  // Try exact match first
  if (pathMap[pathname]) {
    return pathMap[pathname];
  }

  // Try partial match for nested routes
  for (const [key, value] of Object.entries(pathMap)) {
    if (pathname.startsWith(key) && key !== "/admin") {
      return value;
    }
  }

  // Fallback to parsing the path
  const segments = pathname.split("/").filter((segment) => segment);
  if (segments.length > 1) {
    const lastSegment = segments[segments.length - 1];
    return lastSegment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  return "Admin Dashboard";
};

export const checkAdminPermissions = (user, requiredPermission) => {
  if (!user || !user.permissions) return false;

  // Super admin always has access
  if (user.role?.toLowerCase().includes("super")) return true;

  // Check for specific permission
  return user.permissions.includes(requiredPermission);
};

export const formatAdminDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

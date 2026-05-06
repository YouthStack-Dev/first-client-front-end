export const pathTitleMap = {
  // Dashboard Routes
  "/dashboard": "Dashboard",
  "/admin_dashboard": "Admin Dashboard",
  "/admin-dashboard": "Admin Dashboard",
  "/client_dashboard": "Client Dashboard",
  "/company-dashboard": "Company Dashboard",

  // User Management
  "/users": "Manage Users",
  "/user-management": "User Management",
  "/employees": "Employee Management",
  "/employee": "Employee",
  "/department": "Department Employees",

  // Management
  "/departments": "Departments",
  "/groups": "Group Management",
  "/mappings": "Mapping Management",

  // Policy & Service
  "/policy-management": "Policy Management",
  "/policies": "Policies",
  "/policy-rules": "Policy Rules",
  "/services": "Service Management",
  "/tenants": "Tenant Management",

  // Fleet Management
  "/vehicles-management": "Manage Vehicles",
  // "/old-vehicles": "Manage Vehicles (Legacy)",
  // "/vehicle-types": "Vehicle Types",
  // "/vehicle-group": "Vehicle Groups",
  "/driverform": "Manage Drivers",

  // Vendor Management
  "/new-vendor-management": "Manage Vendors",
  "/vendor-user-management": "Vendor Users",

  // Operations
  "/routing": "Route Management",
  "/routing-management": "Routing Management",
  "/tracking": "Tracking",
  "/tracking-management": "Tracking Management",
  "/bookings": "Manage Bookings",
  "/booking-management": "Booking Management",

  // Shift Management
  "/shifts": "Manage Shifts",
  // "/manage-shift": "Shift Management",
  // "/shift-categories": "Shift Categories",
  // "/shift-Categories": "Shift Categories Management",
  "/cutoff": "System Configuration",

  // Additional Routes
  "/manage-company": "Manage Companies",
  // "/role-permission": "Role And Policies Mangement",
  "/staffs": "Manage Staff",
  "/manage-client": "Manage Clients",
  "/vehicle-contract": "Vehicle Contracts",
  "/contract": "Contracts",
  "/calender": "Calendar",

  // Utility
  "/unauthorized": "Unauthorized",

  // ✅ Add these missing ones
"/teams":                "Team Management",
"/announcements":        "Announcements",
"/reviews":              "Review Management",
"/profile":              "Profile",
"/reports":              "Reports Management",
"/alert-config":          "Alert Configuration",
"/notification":          "Alert Notifications",
"/role-permission":      "User Role & Permission",
"/escort-management":    "Escort Management",

};

/**
 * Gets the page title based on the current path
 * @param {string} path - The current path (e.g. '/vehicles/add-vehicle')
 * @returns {string} The matching title or 'Dashboard' as fallback
 */
export const getTitleFromPath = (path) => {
  if (path === "/") return "Login";

  // ✅ Strip base prefixes so "/companies/vehicles" matches "/vehicles"
  const strippedPath = path
    .replace(/^\/companies/, "")
    .replace(/^\/superadmin/, "")
    .replace(/^\/vendor(?=\/|$)/, "");

  const segments = strippedPath.split("/").filter((segment) => segment !== "");

  // Try longest match first
  for (let i = segments.length; i > 0; i--) {
    const testPath = "/" + segments.slice(0, i).join("/");
    if (pathTitleMap[testPath]) {
      return pathTitleMap[testPath];
    }
  }

  return "Dashboard";
};
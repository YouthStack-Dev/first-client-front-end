export const vendorPathTitleMap = {
  // Overview
  "/dashboard": "Dashboard",

  // Fleet Management
  "/vehicles-management": "Manage Vehicles",
  "/driverform": "Manage Drivers",
  "/escort-management": "Escort Management",
  "/vendor-user-management": "Vendor Users",

  // Operations
  "/routing": "Route Management",
  "/speed-violations": "Speed Violations",
  "/live-drivers": "Live Driver Map",

  // Reports
  "/reports-management": "Reports Management",

  // Configuration
  "/cutoff": "System Configuration",
  "/alert-config": "Alert Configuration",
  "/notification": "Alert Notifications",
  "/announcements": "Announcements",
  "/reviews": "Review Management",

  // Account
  "/profile": "Profile",
};

/**
 * Gets the page title for the current vendor path.
 * Strips the /vendor prefix before matching.
 * @param {string} path - e.g. "/vendor/vehicles-management"
 * @returns {string}
 */
export const getTitleFromVendorPath = (path) => {
  if (path === "/" || path === "/vendor" || path === "/vendor/") {
    return "Vendor Portal";
  }

  const stripped = path.replace(/^\/vendor/, "");
  const segments = stripped.split("/").filter(Boolean);

  // Try longest match first (handles future nested routes)
  for (let i = segments.length; i > 0; i--) {
    const testPath = "/" + segments.slice(0, i).join("/");
    if (vendorPathTitleMap[testPath]) {
      return vendorPathTitleMap[testPath];
    }
  }

  return "Vendor Portal";
};
import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";
import SuperAdminSidebar from "./SuperAdminSidbar";
import Header from "@components/Header";

// Static title mapping for super admin routes
const superAdminPathTitleMap = {
  "/superadmin/dashboard": "Super Admin Dashboard",
  "/superadmin/companies": "Company Management",
  "/superadmin/companies/add": "Add Company",
  "/superadmin/companies/edit": "Edit Company",
  "/superadmin/companies/view": "View Company Details",
  "/superadmin/vendors": "Vendor Management",
  "/superadmin/vendors/add": "Add Vendor",
  "/superadmin/vendors/edit": "Edit Vendor",
  "/superadmin/vendors/view": "View Vendor Details",
  "/superadmin/partnerships": "Company-Vendor Partnerships",
  "/superadmin/partnerships/create": "Create Partnership",
  "/superadmin/partnerships/manage": "Manage Partnerships",
  "/superadmin/admins": "Admin Management",
  "/superadmin/admins/add": "Add Admin",
  "/superadmin/admins/roles": "Admin Roles",
  "/superadmin/users": "User Management",
  "/superadmin/users/companies": "Company Users",
  "/superadmin/users/vendors": "Vendor Users",
  "/superadmin/platform": "Platform Management",
  "/superadmin/platform/modules": "Module Management",
  "/superadmin/platform/permissions": "Permission Management",
  "/superadmin/platform/settings": "Platform Settings",
  "/superadmin/monitoring": "System Monitoring",
  "/superadmin/monitoring/performance": "Performance Metrics",
  "/superadmin/monitoring/logs": "System Logs",
  "/superadmin/monitoring/alerts": "System Alerts",
  "/superadmin/analytics": "Platform Analytics",
  "/superadmin/analytics/revenue": "Revenue Analytics",
  "/superadmin/analytics/usage": "Usage Analytics",
  "/superadmin/analytics/growth": "Growth Analytics",
  "/superadmin/reports": "Reports & Analytics",
  "/superadmin/reports/companies": "Company Reports",
  "/superadmin/reports/vendors": "Vendor Reports",
  "/superadmin/reports/system": "System Reports",
  "/superadmin/billing": "Billing Management",
  "/superadmin/billing/subscriptions": "Subscriptions",
  "/superadmin/billing/invoices": "Invoices",
  "/superadmin/billing/payments": "Payments",
  "/superadmin/support": "Support Management",
  "/superadmin/support/tickets": "Support Tickets",
  "/superadmin/support/chat": "Live Chat",
  "/superadmin/compliance": "Compliance & Audit",
  "/superadmin/compliance/audit": "Audit Logs",
  "/superadmin/compliance/security": "Security Settings",
  "/superadmin/settings": "Super Admin Settings",
  "/superadmin/profile": "Admin Profile",
};

const getTitleFromSuperAdminPath = (pathname) => {
  return superAdminPathTitleMap[pathname] || "Super Admin Portal";
};

const SuperAdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isPinned, setIsPinned] = useState(true); // Default pinned for super admin
  const mainContentRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle outside click to close sidebar on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        window.innerWidth < 1024 &&
        sidebarOpen &&
        mainContentRef.current &&
        mainContentRef.current.contains(event.target)
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const title = getTitleFromSuperAdminPath(location.pathname);

  return (
    <div
      className={`h-screen flex overflow-hidden bg-gray-50 ${
        mounted ? "transition-opacity duration-500 opacity-100" : "opacity-0"
      }`}
    >
      <SuperAdminSidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isPinned={isPinned}
        setIsPinned={setIsPinned}
      />

      <div
        ref={mainContentRef}
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          sidebarOpen ? "lg:ml-72" : "lg:ml-20"
        }`}
      >
        {/* Header */}
        <Header toggleSidebar={toggleSidebar} title={title} />
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pt-16 pb-6">
          <div className="w-full mx-auto px-4 lg:px-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-gray-900 opacity-50 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
};

export default SuperAdminLayout;

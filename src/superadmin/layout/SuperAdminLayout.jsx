import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";
import SuperAdminSidebar from "./SuperAdminSidbar";
import Header from "@components/Header";

// Static title mapping for super admin routes
const superAdminPathTitleMap = {
  "/superadmin/dashboard": "Super Admin Dashboard",
  "/superadmin/companies": "Company Management",
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

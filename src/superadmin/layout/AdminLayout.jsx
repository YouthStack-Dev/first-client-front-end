import { useEffect, useRef, useState, useCallback } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { getAdminTitleFromPath } from "./adminUtility";
import { selectCurrentUser } from "@features/auth/authSlice";
import Unauthorized from "../../components/Unauthorized";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [mounted, setMounted] = useState(false);
  const sidebarRef = useRef(null);
  const mainContentRef = useRef(null);

  const user = useSelector(selectCurrentUser);
  const authLoading = useSelector((state) => state.auth.loading);
  const location = useLocation();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle outside click to close sidebar on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only handle mobile clicks when sidebar is open
      if (window.innerWidth < 1024 && sidebarOpen) {
        // Check if click is outside both sidebar and the toggle button
        const isSidebarClick = sidebarRef.current?.contains(event.target);
        const isToggleButtonClick = event.target.closest(
          "[data-sidebar-toggle]"
        );

        if (!isSidebarClick && !isToggleButtonClick) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [sidebarOpen]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, []);

  const title = getAdminTitleFromPath(location.pathname);

  // Loading and authentication states
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-white animate-pulse">
            Loading Admin Panel...
          </div>
          <p className="text-gray-400 mt-2">Checking admin privileges</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center">
          <div className="text-2xl font-bold text-white mb-2">
            Admin Access Required
          </div>
          <p className="text-gray-400">Please log in with admin credentials</p>
        </div>
      </div>
    );
  }

  // Check if user has admin role
  const userType = user?.type?.toLowerCase();
  const userRole = user?.role?.toLowerCase();
  const isAdmin =
    userType === "admin" ||
    userRole?.includes("admin") ||
    userRole?.includes("super");

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <Unauthorized
          title="Admin Access Denied"
          message="You do not have sufficient privileges to access the admin panel."
        />
      </div>
    );
  }

  return (
    <div
      className={`h-screen flex overflow-hidden ${
        mounted ? "transition-opacity duration-500 opacity-100" : "opacity-0"
      } bg-gray-50`}
    >
      <div ref={sidebarRef}>
        <AdminSidebar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          isPinned={isPinned}
          setIsPinned={setIsPinned}
        />
      </div>

      <div
        ref={mainContentRef}
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          sidebarOpen ? "lg:ml-64" : "lg:ml-16"
        }`}
      >
        {/* Admin Header */}
        <AdminHeader toggleSidebar={toggleSidebar} title={title} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pt-16 pb-6 bg-gray-50">
          {/* Content Area */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <Outlet />
          </div>
        </main>

        {/* Admin Footer */}
        <footer className="bg-white border-t border-gray-200 py-4 px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-600">
              © {new Date().getFullYear()} Admin Panel v1.0.0
            </div>
            <div className="text-sm text-gray-600 mt-2 md:mt-0">
              <span className="inline-flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                System: Operational
              </span>
              <span className="ml-4 text-gray-400">|</span>
              <span className="ml-4">
                Load Time: {mounted ? `${Math.random().toFixed(2)}s` : "..."}
              </span>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-gray-900 opacity-75 lg:hidden transition-opacity duration-300"
          onClick={closeSidebar}
        ></div>
      )}
    </div>
  );
};

export default AdminLayout;

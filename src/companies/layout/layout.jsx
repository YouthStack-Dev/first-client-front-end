import { useEffect, useRef, useState, useCallback } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { getTitleFromPath } from "./utility";
import { selectCurrentUser, selectAuthLoading } from "@features/auth/authSlice";
import { logDebug } from "@utils/logger";
import Unauthorized from "../../components/Unauthorized";

const Layout = ({ type }) => {
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (window.innerWidth < 1024 && sidebarOpen) {
        const isSidebarClick = sidebarRef.current?.contains(event.target);
        const isToggleButtonClick = event.target.closest("[data-sidebar-toggle]");
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

  const title = getTitleFromPath(location.pathname);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-semibold animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-semibold animate-pulse">Please log in</div>
      </div>
    );
  }

  if (type !== user.type) {
    return <Unauthorized />;
  }

  return (
    <div
      className={`h-screen flex overflow-hidden ${
        mounted ? "transition-opacity duration-500 opacity-100" : "opacity-0"
      }`}
    >
      <div ref={sidebarRef}>
        <Sidebar
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
        {/* Header — fixed at top */}
        <Header toggleSidebar={toggleSidebar} title={title} />

        {/* ✅ Main content — pt-16 offsets fixed header, flex-col + min-h-0 so children can use h-full */}
        <main className="flex-1 flex flex-col min-h-0 pt-16 overflow-hidden">
          <div className="flex-1 min-h-0 w-full mx-auto overflow-y-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-gray-600 opacity-75 lg:hidden"
          onClick={closeSidebar}
        />
      )}
    </div>
  );
};

export default Layout;
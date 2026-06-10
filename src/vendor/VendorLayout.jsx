import { useEffect, useRef, useState, useCallback } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import VendorSidebar from "./VendorSidebar";
import VendorHeader from "./VendorHeader";
import { getTitleFromVendorPath } from "./vendorUtility";
import { selectCurrentUser, selectAuthLoading } from "@features/auth/authSlice";
import Unauthorized from "../components/Unauthorized";

const VendorLayout = ({ type }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPinned, setIsPinned]       = useState(false);

  const sidebarRef    = useRef(null);
  const sidebarOpenRef = useRef(sidebarOpen);

  const user        = useSelector(selectCurrentUser);
  const authLoading = useSelector(selectAuthLoading);
  const location    = useLocation();

  // Keep ref in sync with state so the stable listener can read fresh value
  useEffect(() => {
    sidebarOpenRef.current = sidebarOpen;
  }, [sidebarOpen]);

  // Stable outside-click listener — registered once, reads via ref
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (window.innerWidth >= 1024 || !sidebarOpenRef.current) return;
      const isSidebarClick = sidebarRef.current?.contains(event.target);
      const isToggleClick  = event.target.closest("[data-sidebar-toggle]");
      if (!isSidebarClick && !isToggleClick) setSidebarOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []); // stable for component lifetime

  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
  const closeSidebar  = useCallback(() => {
    if (window.innerWidth < 1024) setSidebarOpen(false);
  }, []);

  const title = getTitleFromVendorPath(location.pathname);

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
    <div className="h-screen flex overflow-hidden">
      <div ref={sidebarRef}>
        <VendorSidebar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          isPinned={isPinned}
          setIsPinned={setIsPinned}
        />
      </div>

      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          sidebarOpen ? "lg:ml-64" : "lg:ml-16"
        }`}
      >
        <VendorHeader
          toggleSidebar={toggleSidebar}
          title={title}
          isSidebarOpen={sidebarOpen}
        />

        <main className="flex-1 flex flex-col min-h-0 pt-16 overflow-hidden">
          <div className="flex-1 min-h-0 w-full mx-auto overflow-y-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-gray-600 opacity-75 lg:hidden"
          onClick={closeSidebar}
        />
      )}
    </div>
  );
};

export default VendorLayout;
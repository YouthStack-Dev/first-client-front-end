import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { BarChart3, Building2, Truck } from "lucide-react";
import SidebarMenuItem from "../SidebarMenuItem";
import SidebarFooter from "../SidebarFooter";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/features/auth/authSlice";

// Import your constants (move these to a separate file if needed)
const superAdminData = {
  platformName: "TransportHub Platform",
};

// constants.js
export const superAdminMenuItems = [
  {
    name: "Dashboard",
    path: "/superadmin/dashboard",
    icon: BarChart3,
  },
  {
    name: "Companies",
    path: "/superadmin/manage-companies",
    icon: Building2,
  },
  {
    name: "Vendors",
    path: "/superadmin/manage-vendors",
    icon: Truck,
  },
  {
    name: "New Vendor Management",
    path: "/superadmin/new-vendor-management",
    icon: BarChart3,
  },
  {
    name: "Reports Management",
    path: "/superadmin/repots-management",
    icon: BarChart3,
  },
];

const SuperAdminSidebar = ({ isOpen, setIsOpen, isPinned, setIsPinned }) => {
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const dispatch = useDispatch();
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setIsPinned(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [setIsPinned]);

  const toggleDropdown = (menuName) => {
    setOpenDropdown((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const handleMouseEnter = () => {
    if (!isMobile && !isPinned) {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile && !isPinned) {
      setIsOpen(false);
      setOpenDropdown({});
    }
  };

  const togglePin = () => {
    if (!isMobile) {
      setIsPinned(!isPinned);
      setIsOpen(!isPinned);
    }
  };
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout from Super Admin?")) {
      // Dispatch logout first
      dispatch(logout());

      // Optional alert for user feedback
      alert("Logging out from Super Admin...");

      // Redirect after logout
      window.location.href = "/superadmin";
    }
  };

  const sidebarWidth = isOpen ? "w-sidebar" : "w-sidebar-collapsed";
  const sidebarClass = `h-screen ${sidebarWidth} bg-gradient-to-b from-sidebar-primary-900 via-sidebar-primary-800 to-sidebar-primary-900 text-white flex flex-col fixed left-0 transition-all duration-400 ease-in-out z-50 border-r border-sidebar-primary-700 shadow-sidebar`;

  return (
    <aside
      className={`${sidebarClass} ${
        isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {superAdminMenuItems.map((item) => (
          <SidebarMenuItem
            key={item.path || item.name}
            item={item}
            isOpen={isOpen}
            openDropdown={openDropdown}
            toggleDropdown={toggleDropdown}
          />
        ))}
      </nav>

      <SidebarFooter isOpen={isOpen} handleLogout={handleLogout} />
    </aside>
  );
};

export default React.memo(SuperAdminSidebar);

import React, { useState, useEffect } from "react";
import { 
  LogOut, 
  ChevronDown, 
  Pin, 
  PinOff,
  Building2
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { getFilteredSidebar } from "../companies/layout/sidebarConfig";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@features/auth/authSlice";

// Static vendor data
const vendorData = {
  companyName: "Swift Transport Services",
  email: "admin@swifttransport.com",
  phone: "+1 (555) 123-4567",
  totalVehicles: 45,
  activeDrivers: 38,
  todayTrips: 12
};

const VendorSidebar = ({ isOpen, setIsOpen, isPinned, setIsPinned }) => {
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [filteredMenuItems, setFilteredMenuItems] = useState([]);
  
  // Get permissions from Redux store
  const { permissions, loading: authLoading } = useSelector((state) => state.auth);

  // Filter menu items based on permissions
  useEffect(() => {
    if (permissions && !authLoading) {
      const filtered = getFilteredSidebar(permissions);
      setFilteredMenuItems(filtered);
    } else {
      // Optionally show empty sidebar or loading state
      setFilteredMenuItems([]);
    }
  }, [permissions, authLoading]);

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
const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/vendor", { replace: true });
  };

  const sidebarWidth = isOpen ? "w-64" : "w-16";
  const sidebarClass = `h-screen ${sidebarWidth} bg-indigo-900 text-white flex flex-col fixed left-0 transition-all duration-300 ease-in-out z-50`;

  // Helper function to check if any subitem is active
  const isSubItemActive = (subItems) => {
    return subItems.some(subItem => location.pathname === subItem.path);
  };

  // Show loading state if permissions are still loading
  if (authLoading) {
    return (
      <aside className={`${sidebarClass} flex items-center justify-center`}>
        <div className="text-white">Loading...</div>
      </aside>
    );
  }

  return (
    <aside
      className={`${sidebarClass} ${
        isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Header */}
      <div className="p-4 border-b border-indigo-800 flex items-center justify-between">
        {isOpen && (
          <>
            <div className="flex flex-col">
              <h2 className="text-lg font-bold text-white">{vendorData.companyName}</h2>
              <span className="text-xs text-indigo-300">Vendor Portal</span>
            </div>
            {!isMobile && (
              <button
                onClick={togglePin}
                className="text-indigo-400 hover:text-white transition-colors"
              >
                {isPinned ? (
                  <Pin className="w-4 h-4" />
                ) : (
                  <PinOff className="w-4 h-4" />
                )}
              </button>
            )}
          </>
        )}
        {!isOpen && (
          <div className="w-8 h-8 bg-indigo-700 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredMenuItems.length === 0 && !authLoading ? (
          <div className="px-3 py-2 text-center text-indigo-300 text-sm">
            No menu items available
          </div>
        ) : (
          filteredMenuItems.map((group) => (
            <div key={group.title}>
              {/* Group Title - Only show when sidebar is open */}
              {isOpen && group.items.length > 0 && (
                <div className="px-3 py-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                  {group.title}
                </div>
              )}
              
              {/* Group Items */}
              {group.items.map((item) => {
                const IconComponent = item.icon;
                
                if (item.subItems && item.subItems.length > 0) {
                  return (
                    <div key={item.title} className="relative">
                      <button
                        onClick={() => toggleDropdown(item.title)}
                        className={`flex items-center w-full px-3 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                          openDropdown[item.title] || isSubItemActive(item.subItems)
                            ? "bg-indigo-700 text-white"
                            : "hover:bg-indigo-800 text-indigo-100"
                        }`}
                      >
                        <IconComponent className="w-5 h-5 min-w-[1.25rem]" />
                        {isOpen && (
                          <>
                            <span className="ml-3 flex-1 text-left">{item.title}</span>
                            <ChevronDown
                              className={`w-4 h-4 transition-transform duration-200 ${
                                openDropdown[item.title] ? "rotate-180" : ""
                              }`}
                            />
                          </>
                        )}
                      </button>

                      {isOpen && openDropdown[item.title] && (
                        <div className="mt-1 space-y-1 pl-4">
                          {item.subItems.map((subItem) => {
                            const SubIconComponent = subItem.icon;
                            return (
                              <Link
                                key={subItem.path}
                                to={subItem.path}
                                className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                                  location.pathname === subItem.path
                                    ? "bg-indigo-600 text-white"
                                    : "text-indigo-200 hover:bg-indigo-800 hover:text-white"
                                }`}
                              >
                                <SubIconComponent className="w-4 h-4" />
                                <span className="ml-2">{subItem.title}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                } else {
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center px-3 py-2.5 rounded-lg transition-colors text-sm ${
                        location.pathname === item.path
                          ? "bg-indigo-600 text-white"
                          : "hover:bg-indigo-800 text-indigo-100"
                      }`}
                    >
                      <IconComponent className="w-5 h-5 min-w-[1.25rem]" />
                      {isOpen && <span className="ml-3">{item.title}</span>}
                    </Link>
                  );
                }
              })}
            </div>
          ))
        )}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-indigo-800">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          {isOpen && <span className="ml-2">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default React.memo(VendorSidebar);
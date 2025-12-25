import { LogOut, ChevronDown, Pin, PinOff } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import { getFilteredSidebar } from "./sidebarConfig";
import { logout } from "../../redux/features/auth/authSlice";


// Skeleton Loading Components using react-loading-skeleton
const SkeletonMenuItem = ({ isOpen }) => (
  <div className="px-4 py-2.5 rounded-sidebar">
    <div className="flex items-center">
      <Skeleton
        circle
        width={20}
        height={20}
        baseColor="#374151"
        highlightColor="#4B5563"
      />
      {isOpen && (
        <div className="ml-3">
          <Skeleton
            width={96}
            height={16}
            baseColor="#374151"
            highlightColor="#4B5563"
          />
        </div>
      )}
    </div>
  </div>
);

const SkeletonHeader = ({ isOpen }) => (
  <div className="p-4 border-b border-sidebar-primary-200/30 flex items-center justify-between">
    {isOpen ? (
      <>
        <Skeleton
          width={192}
          height={24}
          baseColor="#374151"
          highlightColor="#4B5563"
        />
        <Skeleton
          circle
          width={16}
          height={16}
          baseColor="#374151"
          highlightColor="#4B5563"
        />
      </>
    ) : (
      <Skeleton
        circle
        width={32}
        height={32}
        baseColor="#374151"
        highlightColor="#4B5563"
      />
    )}
  </div>
);

const Sidebar = ({ isOpen, setIsOpen, isPinned, setIsPinned }) => {
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarConfig, setSidebarConfig] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const tenant = JSON.parse(localStorage.getItem("tenant"));

  // Get auth state from Redux
  const {
    permissions,
    loading: authLoading,
    isAuthenticated,
  } = useSelector((state) => state.auth);

  // Generate filtered sidebar based on permissions
  useEffect(() => {
    if (permissions && permissions?.length > 0) {
      const filteredConfig = getFilteredSidebar(permissions);
      setSidebarConfig(filteredConfig);
    }
  }, [permissions]);


// useEffect(() => {
//   // 1) Try from Redux
//   if (authUser?.tenant?.name) {
//     setCompanyName(authUser.tenant.name);
//     return;
//   }

//   // 2) Fallback: from sessionStorage.userPermissions.user.tenant
//   const stored = sessionStorage.getItem("userPermissions");
//   if (stored) {
//     const parsed = JSON.parse(stored);

//     const nameFromUserTenant = parsed?.user?.tenant?.name;
//     const idFromUserTenant = parsed?.user?.tenant?.tenant_id || parsed?.user?.tenant_id;

//     setCompanyName(nameFromUserTenant || idFromUserTenant || "");
//   }
// }, [authUser]);


  const handleLogout = () => {
    dispatch(logout());
    navigate("/", { replace: true });
  };

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

  const toggleDropdown = (menuName, e) => {
    if (e) {
      e.stopPropagation(); // Prevent event bubbling
    }
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

  const togglePin = (e) => {
    if (e) {
      e.stopPropagation(); // Prevent event bubbling
    }
    if (!isMobile) {
      setIsPinned(!isPinned);
      setIsOpen(!isPinned);
    }
  };

  // Close sidebar on mobile when clicking a menu item - FIXED VERSION
  const handleMenuItemClick = (e) => {
    if (e) {
      e.stopPropagation(); // Prevent event bubbling to parent elements
    }

    if (isMobile) {
      // Use setTimeout to allow the navigation to happen first
      setTimeout(() => {
        setIsOpen(false);
        setOpenDropdown({});
      }, 300); // Increased delay to ensure navigation completes
    }
  };

  const sidebarWidth = isOpen ? "w-sidebar" : "w-sidebar-collapsed";
  const sidebarClass = `h-screen ${sidebarWidth} bg-gradient-to-b from-sidebar-primary-900 via-sidebar-primary-800 to-sidebar-primary-900 text-white flex flex-col fixed left-0 transition-all duration-300 ease-in-out z-50 shadow-sidebar border-r border-sidebar-primary-200/30`;

  // Show loading state if auth is still loading or user is not authenticated
  const isLoading = authLoading || !isAuthenticated || !permissions;

  return (
    <aside
      className={`${sidebarClass} ${
        isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={(e) => e.stopPropagation()} // Prevent click propagation from entire sidebar
    >
      {/* Header Section */}
      {isLoading ? (
        <SkeletonHeader isOpen={isOpen} />
      ) : (
        <div className="p-4 border-b border-sidebar-primary-200/30 flex items-center justify-between bg-sidebar-primary-800/50 backdrop-blur-sm">
          {isOpen && (
            <>
              <h2 className="text-xl font-bold text-white">{tenant?.name}</h2>
              {!isMobile && (
                <button
                  onClick={togglePin}
                  className="text-sidebar-primary-200 hover:text-white transition-colors duration-200 p-1 rounded-sidebar hover:bg-sidebar-primary-700/50"
                  title={isPinned ? "Unpin sidebar" : "Pin sidebar"}
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
        </div>
      )}

      {/* Navigation Section */}
      <nav
        className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-sidebar-primary-200 scrollbar-track-transparent"
        onClick={(e) => e.stopPropagation()} // Prevent click propagation from nav
      >
        {isLoading
          ? // Skeleton loading state
            Array.from({ length: 6 }).map((_, index) => (
              <SkeletonMenuItem key={index} isOpen={isOpen} />
            ))
          : // Actual sidebar content
            sidebarConfig.map((group) => (
              <div key={group.title} className="mb-4">
                {/* Group Title */}
                {isOpen && group.items.length > 0 && (
                  <div className="px-4 py-2 text-xs font-semibold text-sidebar-primary-300 uppercase tracking-wider">
                    {group.title}
                  </div>
                )}

                {/* Group Items */}
                {group.items.map((item) => (
                  <div key={item.title} className="relative">
                    {item.subItems && item.subItems.length > 0 ? (
                      <>
                        <button
                          onClick={(e) => toggleDropdown(item.title, e)}
                          className={`flex items-center w-full px-4 py-2.5 rounded-sidebar transition-all duration-200 group ${
                            openDropdown[item.title]
                              ? "bg-gradient-to-r from-sidebar-primary-600 to-sidebar-primary-400 text-white shadow-sidebar-item-hover"
                              : "hover:bg-sidebar-primary-700/50 hover:shadow-sidebar-item"
                          }`}
                        >
                          <item.icon
                            className={`w-5 h-5 min-w-[1.25rem] transition-colors ${
                              openDropdown[item.title]
                                ? "text-white"
                                : "text-sidebar-primary-200 group-hover:text-white"
                            }`}
                          />
                          {isOpen && (
                            <>
                              <span
                                className={`ml-3 text-sm flex-1 font-medium ${
                                  openDropdown[item.title]
                                    ? "text-white"
                                    : "text-sidebar-primary-100"
                                }`}
                              >
                                {item.title}
                              </span>
                              <ChevronDown
                                className={`w-5 h-5 transition-all duration-200 ${
                                  openDropdown[item.title]
                                    ? "rotate-180 text-white"
                                    : "text-sidebar-primary-300 group-hover:text-white"
                                }`}
                              />
                            </>
                          )}
                        </button>

                        {isOpen && openDropdown[item.title] && (
                          <div className="mt-1 space-y-1 px-2 animate-fadeIn">
                            {item.subItems.map((subItem) => (
                              <Link
                                key={subItem.path}
                                to={subItem.path}
                                onClick={handleMenuItemClick}
                                className={`flex items-center px-4 py-2 text-sm rounded-sidebar transition-all duration-200 group relative ${
                                  location.pathname === subItem.path
                                    ? "bg-gradient-to-r from-sidebar-accent-500 to-sidebar-accent-600 text-white shadow-sidebar-item"
                                    : "text-sidebar-primary-200 hover:bg-sidebar-primary-700/50 hover:text-white hover:shadow-sm"
                                }`}
                              >
                                {location.pathname === subItem.path && (
                                  <div className="absolute left-0 w-1 h-full bg-white rounded-r-full"></div>
                                )}
                                <subItem.icon
                                  className={`w-4 h-4 transition-colors ${
                                    location.pathname === subItem.path
                                      ? "text-white"
                                      : "text-sidebar-primary-300 group-hover:text-white"
                                  }`}
                                />
                                <span className="ml-2 font-medium">
                                  {subItem.title}
                                </span>
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      item.path && (
                        <Link
                          to={item.path}
                          onClick={handleMenuItemClick}
                          className={`flex items-center px-4 py-2.5 rounded-sidebar transition-all duration-200 group relative ${
                            location.pathname === item.path
                              ? "bg-gradient-to-r from-sidebar-primary-600 to-sidebar-primary-400 text-white shadow-sidebar-item-hover"
                              : "hover:bg-sidebar-primary-700/50 hover:shadow-sidebar-item"
                          }`}
                        >
                          {location.pathname === item.path && (
                            <div className="absolute left-0 w-1 h-full bg-white rounded-r-full"></div>
                          )}
                          <item.icon
                            className={`w-5 h-5 min-w-[1.25rem] transition-colors ${
                              location.pathname === item.path
                                ? "text-white"
                                : "text-sidebar-primary-200 group-hover:text-white"
                            }`}
                          />
                          {isOpen && (
                            <span
                              className={`ml-3 text-sm font-medium ${
                                location.pathname === item.path
                                  ? "text-white"
                                  : "text-sidebar-primary-100"
                              }`}
                            >
                              {item.title}
                            </span>
                          )}
                        </Link>
                      )
                    )}
                  </div>
                ))}
              </div>
            ))}
      </nav>

      {/* Footer Section */}
      <div
        className="p-4 border-t border-sidebar-primary-200/30 bg-sidebar-primary-800/50 backdrop-blur-sm"
        onClick={(e) => e.stopPropagation()} // Prevent click propagation from footer
      >
        {isLoading ? (
          <Skeleton
            height={40}
            baseColor="#374151"
            highlightColor="#4B5563"
            borderRadius="0.5rem"
          />
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLogout();
            }}
            className="flex items-center justify-center w-full px-4 py-2.5 bg-gradient-to-r from-sidebar-danger-600 to-sidebar-danger-500 text-white rounded-sidebar hover:from-sidebar-danger-700 hover:to-sidebar-danger-600 transition-all duration-200 shadow-sidebar-item hover:shadow-sidebar-item-hover group"
            aria-label="Logout"
            title="Logout"
          >
            <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
            {isOpen && <span className="ml-2 font-medium">Logout</span>}
          </button>
        )}
      </div>
    </aside>
  );
};

export default React.memo(Sidebar);

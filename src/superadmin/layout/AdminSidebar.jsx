import { LogOut, ChevronDown, Pin, PinOff, Users, Shield } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import { logout } from "../../redux/features/auth/authSlice";
import { getFilteredSidebar } from "./adminSidebarConfig";

const SkeletonMenuItem = ({ isOpen }) => (
  <div className="px-4 py-2.5 rounded-sidebar">
    <div className="flex items-center">
      <Skeleton
        circle
        width={20}
        height={20}
        baseColor="#f8fafc"
        highlightColor="#e2e8f0"
      />
      {isOpen && (
        <div className="ml-3">
          <Skeleton
            width={96}
            height={16}
            baseColor="#f8fafc"
            highlightColor="#e2e8f0"
          />
        </div>
      )}
    </div>
  </div>
);

const SkeletonHeader = ({ isOpen }) => (
  <div className="p-4 border-b border-app-border flex items-center justify-between">
    {isOpen ? (
      <>
        <Skeleton
          width={192}
          height={24}
          baseColor="#f8fafc"
          highlightColor="#e2e8f0"
        />
        <Skeleton
          circle
          width={16}
          height={16}
          baseColor="#f8fafc"
          highlightColor="#e2e8f0"
        />
      </>
    ) : (
      <Skeleton
        circle
        width={32}
        height={32}
        baseColor="#f8fafc"
        highlightColor="#e2e8f0"
      />
    )}
  </div>
);

const AdminSidebar = ({ isOpen, setIsOpen, isPinned, setIsPinned }) => {
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarConfig, setSidebarConfig] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get auth state from Redux
  const {
    permissions,
    loading: authLoading,
    isAuthenticated,
    user,
  } = useSelector((state) => state.auth);

  // Generate admin sidebar based on permissions
  useEffect(() => {
    if (permissions && permissions.length > 0) {
      const filteredConfig = getFilteredSidebar(permissions);
      setSidebarConfig(filteredConfig);
    }
  }, [permissions]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/admin/login", { replace: true });
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
      e.stopPropagation();
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
      e.stopPropagation();
    }
    if (!isMobile) {
      setIsPinned(!isPinned);
      setIsOpen(!isPinned);
    }
  };

  const handleMenuItemClick = (e) => {
    if (e) {
      e.stopPropagation();
    }

    if (isMobile) {
      setTimeout(() => {
        setIsOpen(false);
        setOpenDropdown({});
      }, 300);
    }
  };

  const sidebarWidth = isOpen ? "w-sidebar" : "w-sidebar-collapsed";
  const sidebarClass = `h-screen ${sidebarWidth} bg-gradient-to-b from-blue-50 via-white to-blue-50 text-app-text-primary flex flex-col fixed left-0 transition-all duration-300 ease-in-out z-50 shadow-sidebar border-r border-app-border`;

  // Show loading state if auth is still loading or user is not authenticated
  const isLoading = authLoading || !isAuthenticated || !permissions;

  return (
    <aside
      className={`${sidebarClass} ${
        isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header Section */}
      {isLoading ? (
        <SkeletonHeader isOpen={isOpen} />
      ) : (
        <div className="p-4 border-b border-app-border flex items-center justify-between bg-white/80 backdrop-blur-sm">
          {isOpen && (
            <>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-400 to-blue-300 rounded-xl shadow-sm">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-app-text-primary">
                    Team Portal
                  </h2>
                  <p className="text-xs text-app-text-secondary">
                    {user?.role || "Team Member"}
                  </p>
                </div>
              </div>
              {!isMobile && (
                <button
                  onClick={togglePin}
                  className="text-app-text-secondary hover:text-app-text-primary transition-colors duration-200 p-1 rounded-sidebar hover:bg-blue-50"
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
          {!isOpen && (
            <div className="flex items-center justify-center w-full">
              <div className="p-2 bg-gradient-to-br from-blue-400 to-blue-300 rounded-xl shadow-sm">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation Section */}
      <nav
        className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <SkeletonMenuItem key={index} isOpen={isOpen} />
            ))
          : sidebarConfig.map((group) => (
              <div key={group.title} className="mb-4">
                {/* Group Title */}
                {isOpen && group.items.length > 0 && (
                  <div className="px-4 py-2 text-xs font-semibold text-app-text-muted uppercase tracking-wider">
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
                              ? "bg-sidebar-active text-white shadow-sidebar-item-hover"
                              : "hover:bg-blue-50 hover:shadow-sidebar-item"
                          }`}
                        >
                          <item.icon
                            className={`w-5 h-5 min-w-[1.25rem] transition-colors ${
                              openDropdown[item.title]
                                ? "text-white"
                                : "text-app-text-secondary group-hover:text-blue-500"
                            }`}
                          />
                          {isOpen && (
                            <>
                              <span
                                className={`ml-3 text-sm flex-1 font-medium ${
                                  openDropdown[item.title]
                                    ? "text-white"
                                    : "text-app-text-primary"
                                }`}
                              >
                                {item.title}
                              </span>
                              <ChevronDown
                                className={`w-5 h-5 transition-all duration-200 ${
                                  openDropdown[item.title]
                                    ? "rotate-180 text-white"
                                    : "text-app-text-secondary group-hover:text-blue-500"
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
                                    ? "bg-gradient-to-r from-blue-500 to-blue-400 text-white shadow-sidebar-item"
                                    : "text-app-text-secondary hover:bg-blue-50 hover:text-blue-500 hover:shadow-sm"
                                }`}
                              >
                                {location.pathname === subItem.path && (
                                  <div className="absolute left-0 w-1 h-full bg-blue-500 rounded-r-full"></div>
                                )}
                                <subItem.icon
                                  className={`w-4 h-4 transition-colors ${
                                    location.pathname === subItem.path
                                      ? "text-white"
                                      : "text-app-text-secondary group-hover:text-blue-500"
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
                              ? "bg-sidebar-active text-white shadow-sidebar-item-hover"
                              : "hover:bg-blue-50 hover:shadow-sidebar-item"
                          }`}
                        >
                          {location.pathname === item.path && (
                            <div className="absolute left-0 w-1 h-full bg-blue-500 rounded-r-full"></div>
                          )}
                          <item.icon
                            className={`w-5 h-5 min-w-[1.25rem] transition-colors ${
                              location.pathname === item.path
                                ? "text-white"
                                : "text-app-text-secondary group-hover:text-blue-500"
                            }`}
                          />
                          {isOpen && (
                            <span
                              className={`ml-3 text-sm font-medium ${
                                location.pathname === item.path
                                  ? "text-white"
                                  : "text-app-text-primary"
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
        className="p-4 border-t border-app-border bg-white/80 backdrop-blur-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading ? (
          <Skeleton
            height={40}
            baseColor="#f8fafc"
            highlightColor="#e2e8f0"
            borderRadius="0.5rem"
          />
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLogout();
            }}
            className="flex items-center justify-center w-full px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-400 text-white rounded-sidebar hover:from-red-600 hover:to-red-500 transition-all duration-200 shadow-sidebar-item hover:shadow-sidebar-item-hover group"
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

export default React.memo(AdminSidebar);

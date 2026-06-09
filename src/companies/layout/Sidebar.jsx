import { LogOut, ChevronDown, Pin, PinOff } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import { getFilteredSidebar } from "./sidebarConfig";
import { logout } from "../../redux/features/auth/authSlice";

// ─── Skeleton components ──────────────────────────────────────────────────────

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

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const Sidebar = ({ isOpen, setIsOpen, isPinned, setIsPinned }) => {
  const location = useLocation();
  const dispatch = useDispatch();

  const [openDropdown, setOpenDropdown] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  const {
    permissions,
    loading: authLoading,
    isAuthenticated,
  } = useSelector((state) => state.auth);

  // ── Safe tenant parse — never throws ──────────────────────────────────────
  const tenant = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("tenant")) ?? {};
    } catch {
      return {};
    }
  }, []);

  // ── Derived sidebar config — no extra state or effect needed ──────────────
  const sidebarConfig = useMemo(
    () => (permissions?.length > 0 ? getFilteredSidebar(permissions) : []),
    [permissions]
  );

  const isLoading = authLoading || !isAuthenticated || !permissions;

  // ── Mobile detection ──────────────────────────────────────────────────────
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsPinned(false);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [setIsPinned]);

  // ── Close sidebar on mobile when route changes ────────────────────────────
  // Replaces the fragile setTimeout pattern in click handlers
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
      setOpenDropdown({});
    }
  }, [location.pathname, isMobile, setIsOpen]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleLogout = useCallback(() => {
    dispatch(logout());
    // Navigation is handled by the isAuthenticated useEffect in Login
  }, [dispatch]);

  const handleMouseEnter = useCallback(() => {
    if (!isMobile && !isPinned) setIsOpen(true);
  }, [isMobile, isPinned, setIsOpen]);

  const handleMouseLeave = useCallback(() => {
    if (!isMobile && !isPinned) {
      setIsOpen(false);
      setOpenDropdown({});
    }
  }, [isMobile, isPinned, setIsOpen]);

  const toggleDropdown = useCallback((menuName, e) => {
    e?.stopPropagation();
    setOpenDropdown((prev) => ({ ...prev, [menuName]: !prev[menuName] }));
  }, []);

  const togglePin = useCallback(
    (e) => {
      e?.stopPropagation();
      if (!isMobile) {
        const newPinned = !isPinned;
        setIsPinned(newPinned);
        setIsOpen(newPinned); // pin → keep open; unpin → collapse
      }
    },
    [isMobile, isPinned, setIsPinned, setIsOpen]
  );

  // ── Helpers ───────────────────────────────────────────────────────────────
  const isActive = (path) => location.pathname === path;

  return (
    <aside
      className={`
        h-screen bg-gradient-to-b from-sidebar-primary via-sidebar-secondary to-sidebar-primary
        text-white flex flex-col fixed left-0 z-50 shadow-sidebar border-r border-sidebar-secondary/30
        transition-all duration-300 ease-in-out
        ${isOpen ? "w-sidebar" : "w-sidebar-collapsed"}
        ${isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={(e) => e.stopPropagation()}
    >
      {/* ── Header ── */}
      {isLoading ? (
        <SkeletonHeader isOpen={isOpen} />
      ) : (
        <div className="p-4 border-b border-sidebar-primary-200/30 flex items-center justify-between bg-sidebar-primary-800/50 backdrop-blur-sm">
          {isOpen && (
            <>
              <Link
                to="/companies/dashboard"
                className="text-xl font-bold text-white hover:text-sidebar-primary-200 transition-colors duration-200 cursor-pointer truncate"
              >
                {tenant?.name}
              </Link>
              {!isMobile && (
                <button
                  onClick={togglePin}
                  className="text-sidebar-primary-200 hover:text-white transition-colors duration-200 p-1 rounded-sidebar hover:bg-sidebar-primary-700/50"
                  title={isPinned ? "Unpin sidebar" : "Pin sidebar"}
                  aria-label={isPinned ? "Unpin sidebar" : "Pin sidebar"}
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

      {/* ── Navigation ── */}
      <nav
        className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-sidebar-primary-200 scrollbar-track-transparent"
        aria-label="Main navigation"
      >
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <SkeletonMenuItem key={i} isOpen={isOpen} />
          ))
        ) : sidebarConfig.length === 0 ? (
          isOpen && (
            <p className="px-4 py-6 text-xs text-sidebar-primary-300 text-center">
              No menu items available.
            </p>
          )
        ) : (
          sidebarConfig.map((group) => (
            <div key={group.title} className="mb-4">
              {/* Group title */}
              {isOpen && group.items.length > 0 && (
                <div className="px-4 py-2 text-xs font-semibold text-sidebar-primary-300 uppercase tracking-wider">
                  {group.title}
                </div>
              )}

              {/* Group items */}
              {group.items.map((item) => (
                <div key={item.title} className="relative">
                  {item.subItems?.length > 0 ? (
                    <>
                      {/* Dropdown trigger */}
                      <button
                        onClick={(e) => toggleDropdown(item.title, e)}
                        aria-expanded={!!openDropdown[item.title]}
                        aria-controls={`dropdown-${item.title}`}
                        aria-label={item.title}
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
                          aria-hidden="true"
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
                              aria-hidden="true"
                            />
                          </>
                        )}
                      </button>

                      {/* Dropdown items */}
                      {isOpen && openDropdown[item.title] && (
                        <div
                          id={`dropdown-${item.title}`}
                          className="mt-1 space-y-1 px-2 animate-fadeIn"
                        >
                          {item.subItems.map((subItem) => (
                            <Link
                              key={subItem.path}
                              to={subItem.path}
                              aria-current={
                                isActive(subItem.path) ? "page" : undefined
                              }
                              className={`flex items-center px-4 py-2 text-sm rounded-sidebar transition-all duration-200 group relative ${
                                isActive(subItem.path)
                                  ? "bg-gradient-to-r from-sidebar-accent-500 to-sidebar-accent-600 text-white shadow-sidebar-item"
                                  : "text-sidebar-primary-200 hover:bg-sidebar-primary-700/50 hover:text-white hover:shadow-sm"
                              }`}
                            >
                              {isActive(subItem.path) && (
                                <div className="absolute left-0 w-1 h-full bg-white rounded-r-full" />
                              )}
                              <subItem.icon
                                className={`w-4 h-4 transition-colors ${
                                  isActive(subItem.path)
                                    ? "text-white"
                                    : "text-sidebar-primary-300 group-hover:text-white"
                                }`}
                                aria-hidden="true"
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
                        aria-label={item.title}
                        aria-current={isActive(item.path) ? "page" : undefined}
                        className={`flex items-center px-4 py-2.5 rounded-sidebar transition-all duration-200 group relative ${
                          isActive(item.path)
                            ? "bg-gradient-to-r from-sidebar-primary-600 to-sidebar-primary-400 text-white shadow-sidebar-item-hover"
                            : "hover:bg-sidebar-primary-700/50 hover:shadow-sidebar-item"
                        }`}
                      >
                        {isActive(item.path) && (
                          <div className="absolute left-0 w-1 h-full bg-white rounded-r-full" />
                        )}
                        <item.icon
                          className={`w-5 h-5 min-w-[1.25rem] transition-colors ${
                            isActive(item.path)
                              ? "text-white"
                              : "text-sidebar-primary-200 group-hover:text-white"
                          }`}
                          aria-hidden="true"
                        />
                        {isOpen && (
                          <span
                            className={`ml-3 text-sm font-medium ${
                              isActive(item.path)
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
          ))
        )}
      </nav>

      {/* ── Footer ── */}
      <div className="p-4 border-t border-sidebar-primary-200/30 bg-sidebar-primary-800/50 backdrop-blur-sm">
        {isLoading ? (
          <Skeleton
            height={40}
            baseColor="#374151"
            highlightColor="#4B5563"
            borderRadius="0.5rem"
          />
        ) : (
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-sidebar hover:from-red-700 hover:to-red-600 transition-all duration-200 shadow-sidebar-item hover:shadow-sidebar-item-hover group"
            aria-label="Logout"
            title="Logout"
          >
            <LogOut
              className="w-4 h-4 group-hover:scale-110 transition-transform duration-200"
              aria-hidden="true"
            />
            {isOpen && <span className="ml-2 font-medium">Logout</span>}
          </button>
        )}
      </div>
    </aside>
  );
};

export default React.memo(Sidebar);
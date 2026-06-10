import React, { useState, useEffect, useMemo, useCallback } from "react";
import { LogOut, ChevronDown, Pin, PinOff, Building2 } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { logout } from "@features/auth/authSlice";
import { getFilteredVendorSidebar } from "./vendorSidebarConfig";

// ─── Skeleton components ──────────────────────────────────────────────────────

const SkeletonMenuItem = ({ isOpen }) => (
  <div className="px-4 py-2.5 rounded-lg">
    <div className="flex items-center">
      <Skeleton
        circle
        width={20}
        height={20}
        baseColor="#3730a3"
        highlightColor="#4338ca"
      />
      {isOpen && (
        <div className="ml-3">
          <Skeleton
            width={96}
            height={16}
            baseColor="#3730a3"
            highlightColor="#4338ca"
          />
        </div>
      )}
    </div>
  </div>
);

const SkeletonHeader = ({ isOpen }) => (
  <div className="p-4 border-b border-indigo-800 flex items-center justify-between">
    {isOpen ? (
      <>
        <Skeleton
          width={160}
          height={24}
          baseColor="#3730a3"
          highlightColor="#4338ca"
        />
        <Skeleton
          circle
          width={16}
          height={16}
          baseColor="#3730a3"
          highlightColor="#4338ca"
        />
      </>
    ) : (
      <Skeleton
        circle
        width={32}
        height={32}
        baseColor="#3730a3"
        highlightColor="#4338ca"
      />
    )}
  </div>
);

// ─── VendorSidebar ────────────────────────────────────────────────────────────

const VendorSidebar = ({ isOpen, setIsOpen, isPinned, setIsPinned }) => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const dispatch  = useDispatch();

  const [openDropdown, setOpenDropdown] = useState({});
  const [isMobile, setIsMobile]         = useState(false);

  const {
    permissions,
    loading: authLoading,
    isAuthenticated,
  } = useSelector((state) => state.auth);

  // ── Vendor name from Redux user ───────────────────────────────────────
  const user = useSelector((state) => state.auth.user);
  const vendorName = user?.vendor?.name || user?.vendor_user?.vendor?.name || "";

  // ── Derived sidebar config ────────────────────────────────────────────
  const sidebarConfig = useMemo(
    () => (permissions?.length > 0 ? getFilteredVendorSidebar(permissions) : []),
    [permissions]
  );

  const isLoading = authLoading || !isAuthenticated || !permissions;

  // ── Mobile detection ──────────────────────────────────────────────────
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

  // ── Close sidebar on mobile when route changes ────────────────────────
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
      setOpenDropdown({});
    }
  }, [location.pathname, isMobile, setIsOpen]);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleLogout = useCallback(() => {
    dispatch(logout());
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
        setIsOpen(newPinned);
      }
    },
    [isMobile, isPinned, setIsPinned, setIsOpen]
  );

  // ── Helpers ───────────────────────────────────────────────────────────
  const isActive    = (path) => location.pathname === path;
  const hasActiveChild = (subItems) =>
    subItems?.some((sub) => location.pathname === sub.path);

  return (
    <aside
      className={`
        h-screen bg-gradient-to-b from-indigo-900 via-indigo-800 to-indigo-900
        text-white flex flex-col fixed left-0 z-50 shadow-xl border-r border-indigo-700/30
        transition-all duration-300 ease-in-out
        ${isOpen ? "w-64" : "w-16"}
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
        <div className="p-4 border-b border-indigo-700/50 flex items-center justify-between bg-indigo-900/50 backdrop-blur-sm">
          {isOpen ? (
            <>
              <Link
                to="/vendor/dashboard"
                className="text-base font-bold text-white hover:text-indigo-200 transition-colors duration-200 truncate"
              >
                {vendorName || "Vendor Portal"}
              </Link>
              {!isMobile && (
                <button
                  onClick={togglePin}
                  className="text-indigo-300 hover:text-white transition-colors duration-200 p-1 rounded-lg hover:bg-indigo-700/50 flex-shrink-0"
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
          ) : (
            <div className="w-8 h-8 bg-indigo-700 rounded-lg flex items-center justify-center mx-auto">
              <Building2 className="w-5 h-5 text-white" />
            </div>
          )}
        </div>
      )}

      {/* ── Navigation ── */}
      <nav
        className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-indigo-600 scrollbar-track-transparent"
        aria-label="Vendor navigation"
      >
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <SkeletonMenuItem key={i} isOpen={isOpen} />
          ))
        ) : sidebarConfig.length === 0 ? (
          isOpen && (
            <p className="px-4 py-6 text-xs text-indigo-300 text-center">
              No menu items available.
            </p>
          )
        ) : (
          sidebarConfig.map((group) => (
            <div key={group.title} className="mb-4">
              {/* Group title */}
              {isOpen && group.items.length > 0 && (
                <div className="px-4 py-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
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
                        className={`flex items-center w-full px-4 py-2.5 rounded-lg transition-all duration-200 group ${
                          openDropdown[item.title] || hasActiveChild(item.subItems)
                            ? "bg-indigo-700 text-white shadow-md"
                            : "hover:bg-indigo-700/50 text-indigo-100"
                        }`}
                      >
                        <item.icon
                          className={`w-5 h-5 min-w-[1.25rem] transition-colors ${
                            openDropdown[item.title] || hasActiveChild(item.subItems)
                              ? "text-white"
                              : "text-indigo-300 group-hover:text-white"
                          }`}
                          aria-hidden="true"
                        />
                        {isOpen && (
                          <>
                            <span className="ml-3 text-sm flex-1 font-medium text-left">
                              {item.title}
                            </span>
                            <ChevronDown
                              className={`w-4 h-4 transition-transform duration-200 ${
                                openDropdown[item.title]
                                  ? "rotate-180 text-white"
                                  : "text-indigo-400 group-hover:text-white"
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
                          className="mt-1 space-y-1 px-2"
                        >
                          {item.subItems.map((subItem) => (
                            <Link
                              key={subItem.path}
                              to={subItem.path}
                              aria-current={isActive(subItem.path) ? "page" : undefined}
                              className={`flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200 group relative ${
                                isActive(subItem.path)
                                  ? "bg-indigo-600 text-white shadow-md"
                                  : "text-indigo-200 hover:bg-indigo-700/50 hover:text-white"
                              }`}
                            >
                              {isActive(subItem.path) && (
                                <div className="absolute left-0 w-1 h-full bg-white rounded-r-full" />
                              )}
                              <subItem.icon
                                className={`w-4 h-4 transition-colors ${
                                  isActive(subItem.path)
                                    ? "text-white"
                                    : "text-indigo-300 group-hover:text-white"
                                }`}
                                aria-hidden="true"
                              />
                              <span className="ml-2 font-medium">{subItem.title}</span>
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
                        className={`flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 group relative ${
                          isActive(item.path)
                            ? "bg-indigo-600 text-white shadow-md"
                            : "hover:bg-indigo-700/50 text-indigo-100"
                        }`}
                      >
                        {isActive(item.path) && (
                          <div className="absolute left-0 w-1 h-full bg-white rounded-r-full" />
                        )}
                        <item.icon
                          className={`w-5 h-5 min-w-[1.25rem] transition-colors ${
                            isActive(item.path)
                              ? "text-white"
                              : "text-indigo-300 group-hover:text-white"
                          }`}
                          aria-hidden="true"
                        />
                        {isOpen && (
                          <span
                            className={`ml-3 text-sm font-medium ${
                              isActive(item.path) ? "text-white" : "text-indigo-100"
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
      <div className="p-4 border-t border-indigo-700/50 bg-indigo-900/50 backdrop-blur-sm">
        {isLoading ? (
          <Skeleton
            height={40}
            baseColor="#3730a3"
            highlightColor="#4338ca"
            borderRadius="0.5rem"
          />
        ) : (
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:from-red-700 hover:to-red-600 transition-all duration-200 shadow-md group"
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

export default React.memo(VendorSidebar);
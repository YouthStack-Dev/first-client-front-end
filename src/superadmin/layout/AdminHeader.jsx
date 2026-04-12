import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Bell,
  Search,
  Menu,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { logout, selectCurrentUser } from "../../redux/features/auth/authSlice";

const AdminHeader = ({ toggleSidebar, isSidebarOpen = false, title = "Team Dashboard" }) => {
  const [isProfileOpen,      setIsProfileOpen]      = useState(false);
  const [notifications,      setNotifications]      = useState([]);
  const [showNotifications,  setShowNotifications]  = useState(false);
  const profileRef       = useRef(null);
  const notificationsRef = useRef(null);
  const navigate         = useNavigate();
  const dispatch         = useDispatch();

  // ── Real user from Redux ───────────────────────────────────────────────
  const user = useSelector(selectCurrentUser);

  // ── Email: decode directly from JWT cookie (superadmin-safe) ──────────
  const userEmail = useMemo(() => {
    try {
      const token = Cookies.get("auth_token");
      if (token) {
        const decoded = jwtDecode(token);
        return (
          decoded.email      ||
          decoded.user_email ||
          decoded.sub        ||
          user?.email        ||
          "—"
        );
      }
    } catch {
      // fall through to Redux value
    }
    return user?.email || "—";
  }, [user]);

  const userRole = user?.type === "admin"
    ? "Super Admin"
    : user?.type === "employee"
    ? "Company Admin"
    : user?.type === "vendor"
    ? "Vendor"
    : "User";

  // Display name — prefer full name fields, fall back to email prefix
  const displayName =
    user?.name           ||
    user?.full_name      ||
    user?.employee?.name ||
    user?.vendor_user?.name ||
    userEmail.split("@")[0] ||
    "User";

  // Avatar initials from display name
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // ── Mock notifications ─────────────────────────────────────────────────
  useEffect(() => {
    setNotifications([
      { id: 1, title: "Team Update",        message: "Team meeting scheduled for tomorrow",  time: "10 min ago",  read: false, type: "team"          },
      { id: 2, title: "New Task Assigned",  message: "You have been assigned 3 new tasks",   time: "30 min ago",  read: true,  type: "task"          },
      { id: 3, title: "Project Deadline",   message: "Project submission due in 2 days",     time: "1 hour ago",  read: false, type: "project"       },
      { id: 4, title: "Team Collaboration", message: "New comment on your shared document",  time: "2 hours ago", read: true,  type: "collaboration" },
    ]);
  }, []);

  // ── Close dropdowns on outside click ──────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target))
        setIsProfileOpen(false);
      if (notificationsRef.current && !notificationsRef.current.contains(event.target))
        setShowNotifications(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setIsProfileOpen(false);
    navigate("/superadmin", { replace: true });
  };

  const handleNotificationClick = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setShowNotifications(false);
  };

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Sidebar-aware left offset — adjust px values to match your sidebar widths
  const leftOffset = isSidebarOpen ? "lg:left-64" : "lg:left-16";

  return (
    <header
      className={`bg-white border-b border-app-border fixed top-0 right-0 left-0 ${leftOffset} z-40 shadow-sm transition-all duration-300`}
    >
      <div className="px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* ── Left ─────────────────────────────────────────────────── */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="text-app-text-secondary hover:text-app-text-primary lg:hidden transition-colors"
              onClick={toggleSidebar}
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-app-text-primary font-bold text-xl">{title}</h1>
          </div>

          {/* ── Right ────────────────────────────────────────────────── */}
          <div className="flex items-center gap-3">

            {/* Search — desktop only */}
            {/* <div className="hidden md:block relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-app-text-muted" />
              <input
                type="text"
                placeholder="Search team portal..."
                className="pl-10 pr-4 py-2 bg-app-surface border border-app-border rounded-lg text-sm text-app-text-primary placeholder-app-text-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-56"
              />
            </div> */}

            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                type="button"
                onClick={() => setShowNotifications((v) => !v)}
                className="p-2 rounded-lg text-app-text-secondary hover:text-blue-500 hover:bg-blue-50 transition-colors relative"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl shadow-xl bg-white border border-app-border overflow-hidden z-50">
                  <div className="py-3 px-4 border-b border-app-border flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-app-text-primary">Notifications</h3>
                    <button
                      onClick={markAllRead}
                      className="text-xs text-blue-500 hover:text-blue-600 font-medium"
                    >
                      Mark all as read
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => handleNotificationClick(n.id)}
                        className={`flex items-start w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors ${
                          !n.read ? "bg-blue-50/50" : ""
                        }`}
                      >
                        <div
                          className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full mr-3 ${
                            n.type === "team"       ? "bg-blue-500"
                            : n.type === "project"  ? "bg-purple-500"
                            : n.type === "task"     ? "bg-yellow-500"
                            : "bg-green-500"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <p className="text-sm font-medium text-app-text-primary truncate">{n.title}</p>
                            {!n.read && <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 ml-2" />}
                          </div>
                          <p className="text-xs text-app-text-secondary truncate">{n.message}</p>
                          <p className="text-xs text-app-text-muted mt-0.5">{n.time}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="py-2 px-4 border-t border-app-border bg-gray-50">
                    <p className="text-xs text-app-text-muted text-center">
                      View all notifications in the main portal
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen((v) => !v)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
                  {initials}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-app-text-primary leading-tight">
                    {displayName}
                  </p>
                  <p className="text-xs text-app-text-secondary leading-tight">{userRole}</p>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-app-text-secondary transition-transform duration-200 ${
                    isProfileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-xl shadow-xl bg-white border border-app-border overflow-hidden z-50">
                  {/* User info */}
                  <div className="py-3 px-4 border-b border-app-border">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-app-text-primary truncate">
                          {displayName}
                        </p>
                        {/* ✅ Real email from JWT */}
                        <p className="text-xs text-app-text-muted truncate">{userEmail}</p>
                      </div>
                    </div>
                    <span className="inline-block text-xs font-medium px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                      {userRole}
                    </span>
                  </div>

                  {/* Logout */}
                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Logout
                    </button>
                  </div>

                  <div className="py-2 px-4 bg-gray-50 border-t border-app-border">
                    <p className="text-xs text-app-text-muted">
                      Last active: Today,{" "}
                      {new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
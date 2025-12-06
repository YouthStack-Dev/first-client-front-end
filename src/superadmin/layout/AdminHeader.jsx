import React, { useState, useRef, useEffect } from "react";
import {
  Bell,
  Search,
  Menu,
  Settings,
  User,
  LogOut,
  ChevronDown,
  Users,
  Activity,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminHeader = ({ toggleSidebar, title = "Team Dashboard" }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);
  const navigate = useNavigate();

  // Mock notifications
  useEffect(() => {
    // Simulate fetching notifications
    const mockNotifications = [
      {
        id: 1,
        title: "Team Update",
        message: "Team meeting scheduled for tomorrow",
        time: "10 min ago",
        read: false,
        type: "team",
      },
      {
        id: 2,
        title: "New Task Assigned",
        message: "You have been assigned 3 new tasks",
        time: "30 min ago",
        read: true,
        type: "task",
      },
      {
        id: 3,
        title: "Project Deadline",
        message: "Project submission due in 2 days",
        time: "1 hour ago",
        read: false,
        type: "project",
      },
      {
        id: 4,
        title: "Team Collaboration",
        message: "New comment on your shared document",
        time: "2 hours ago",
        read: true,
        type: "collaboration",
      },
    ];
    setNotifications(mockNotifications);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleProfileClick = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const handleNotificationsClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleProfileNavigation = () => {
    navigate("/admin/profile");
    setIsProfileOpen(false);
  };

  const handleSettingsNavigation = () => {
    navigate("/admin/settings");
  };

  const handleLogout = () => {
    // Handle logout logic
    console.log("Logging out...");
    navigate("/admin/login");
    setIsProfileOpen(false);
  };

  const handleNotificationClick = (notificationId) => {
    // Mark notification as read
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setShowNotifications(false);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="bg-white border-b border-app-border fixed w-full z-10 shadow-lg">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center">
            <button
              type="button"
              className="text-app-text-secondary hover:text-app-text-primary lg:hidden transition-colors duration-200"
              onClick={toggleSidebar}
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Title with team badge */}
            <div className="ml-4 lg:ml-0 flex items-center gap-3">
              <div>
                <h1 className="text-app-text-primary font-bold text-xl">
                  {title}
                </h1>
                <p className="text-xs text-app-text-secondary">
                  Team Collaboration Portal
                </p>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Search - Hidden on mobile, visible on desktop */}
            <div className="hidden md:block relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-app-text-muted" />
                <input
                  type="text"
                  placeholder="Search team portal..."
                  className="pl-10 pr-4 py-2 bg-app-surface border border-app-border rounded-lg text-sm text-app-text-primary placeholder-app-text-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
            </div>

            {/* Activity Monitor */}
            <button
              type="button"
              className="p-2 rounded-lg text-app-text-secondary hover:text-blue-500 hover:bg-blue-50 transition-colors duration-200 relative"
              onClick={() => navigate("/admin/activity-log")}
              title="Activity Log"
            >
              <Activity className="h-5 w-5" />
            </button>

            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                type="button"
                className="p-2 rounded-lg text-app-text-secondary hover:text-blue-500 hover:bg-blue-50 transition-colors duration-200 relative"
                onClick={handleNotificationsClick}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-lg shadow-xl bg-white border border-app-border ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
                  <div className="py-2 px-4 border-b border-app-border">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-app-text-primary">
                        Notifications
                      </h3>
                      <span className="text-xs text-blue-500 cursor-pointer hover:text-blue-600">
                        Mark all as read
                      </span>
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <button
                          key={notification.id}
                          onClick={() =>
                            handleNotificationClick(notification.id)
                          }
                          className={`flex items-start w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-150 ${
                            !notification.read ? "bg-blue-50/50" : ""
                          }`}
                        >
                          <div
                            className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full mr-3 ${
                              notification.type === "security"
                                ? "bg-red-500"
                                : notification.type === "team"
                                ? "bg-blue-500"
                                : notification.type === "project"
                                ? "bg-purple-500"
                                : "bg-green-500"
                            }`}
                          ></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium text-app-text-primary truncate">
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <span className="flex-shrink-0 ml-2">
                                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-app-text-secondary truncate">
                              {notification.message}
                            </p>
                            <p className="text-xs text-app-text-muted mt-1">
                              {notification.time}
                            </p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-app-text-secondary">
                          No notifications
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="py-2 px-4 border-t border-app-border">
                    <button
                      onClick={() => navigate("/admin/notifications")}
                      className="text-sm text-blue-500 hover:text-blue-600 w-full text-center py-2"
                    >
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <button
              type="button"
              className="p-2 rounded-lg text-app-text-secondary hover:text-blue-500 hover:bg-blue-50 transition-colors duration-200"
              onClick={handleSettingsNavigation}
              title="Team Settings"
            >
              <Settings className="h-5 w-5" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors duration-200 group"
                onClick={handleProfileClick}
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-300 flex items-center justify-center text-white font-bold relative overflow-hidden shadow-sm">
                  {/* Profile image with fallback */}
                  <img
                    src="/team-avatar.png"
                    alt="Team Member"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-300 text-white font-bold">
                    TM
                  </div>
                </div>

                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-app-text-primary">
                    Team Member
                  </p>
                  <p className="text-xs text-app-text-secondary">Team Lead</p>
                </div>

                <ChevronDown
                  className={`h-4 w-4 text-app-text-secondary transition-transform duration-200 ${
                    isProfileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-lg shadow-xl bg-white border border-app-border ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
                  <div className="py-3 px-4 border-b border-app-border">
                    <p className="text-sm font-medium text-app-text-primary">
                      Signed in as
                    </p>
                    <p className="text-sm text-app-text-secondary truncate">
                      member@team.com
                    </p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={handleProfileNavigation}
                      className="flex items-center w-full px-4 py-2.5 text-sm text-app-text-secondary hover:bg-blue-50 hover:text-app-text-primary transition-colors duration-150"
                    >
                      <User className="mr-3 h-4 w-4 text-app-text-muted" />
                      My Profile
                    </button>

                    <button
                      onClick={() => navigate("/admin/team-activity")}
                      className="flex items-center w-full px-4 py-2.5 text-sm text-app-text-secondary hover:bg-blue-50 hover:text-app-text-primary transition-colors duration-150"
                    >
                      <Activity className="mr-3 h-4 w-4 text-app-text-muted" />
                      Team Activity
                    </button>

                    <div className="border-t border-app-border my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Logout
                    </button>
                  </div>

                  <div className="py-2 px-4 bg-gray-50 border-t border-app-border">
                    <p className="text-xs text-app-text-muted">
                      Last active: Today, 14:30
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

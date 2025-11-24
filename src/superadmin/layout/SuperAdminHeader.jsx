import React, { useState, useRef, useEffect } from "react";
import {
  Bell,
  Search,
  Menu,
  Settings,
  User,
  LogOut,
  ChevronDown,
  Shield,
  Users,
  Database,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const SuperAdminHeader = ({
  toggleSidebar,
  title = "Super Admin Dashboard",
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const profileRef = useRef(null);
  const quickMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (
        quickMenuRef.current &&
        !quickMenuRef.current.contains(event.target)
      ) {
        setIsQuickMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleProfileClick = () => {
    setIsProfileOpen(!isProfileOpen);
    setIsQuickMenuOpen(false);
  };

  const handleQuickMenuClick = () => {
    setIsQuickMenuOpen(!isQuickMenuOpen);
    setIsProfileOpen(false);
  };

  const handleProfileNavigation = () => {
    navigate("/super-admin/profile");
    setIsProfileOpen(false);
  };

  const handleSystemSettings = () => {
    navigate("/super-admin/system-settings");
    setIsQuickMenuOpen(false);
  };

  const handleUserManagement = () => {
    navigate("/super-admin/user-management");
    setIsQuickMenuOpen(false);
  };

  const handleDatabaseManagement = () => {
    navigate("/super-admin/database");
    setIsQuickMenuOpen(false);
  };

  const handleLogout = () => {
    // Handle super admin logout logic
    console.log("Super Admin logging out...");
    setIsProfileOpen(false);
    // Redirect to super admin login
    navigate("/super-admin/login");
  };

  const quickActions = [
    {
      icon: Users,
      label: "User Management",
      onClick: handleUserManagement,
      color: "text-blue-600",
    },
    {
      icon: Settings,
      label: "System Settings",
      onClick: handleSystemSettings,
      color: "text-green-600",
    },
    {
      icon: Database,
      label: "Database",
      onClick: handleDatabaseManagement,
      color: "text-purple-600",
    },
  ];

  return (
    <header className="bg-gradient-to-r from-gray-900 to-blue-900 border-b border-blue-700 fixed w-full z-10 shadow-lg">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center">
            <button
              type="button"
              className="text-white hover:text-blue-200 lg:hidden transition-colors duration-200"
              onClick={toggleSidebar}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="ml-4 lg:ml-0 flex items-center">
              <Shield className="h-8 w-8 text-yellow-400 mr-3" />
              <span className="text-white font-bold text-xl bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                {title}
              </span>
            </div>
          </div>

          {/* Center Section - Search */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-blue-600 rounded-lg bg-blue-800/50 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="Search across all systems..."
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Quick Actions Dropdown */}
            <div className="hidden lg:block relative" ref={quickMenuRef}>
              <button
                type="button"
                className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-600 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                onClick={handleQuickMenuClick}
              >
                <Settings className="h-4 w-4 mr-2" />
                Quick Actions
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>

              {isQuickMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-2">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      System Management
                    </div>
                    {quickActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={action.onClick}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors duration-150"
                      >
                        <action.icon
                          className={`mr-3 h-4 w-4 ${action.color}`}
                        />
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <button
              type="button"
              className="relative p-2 rounded-lg text-blue-200 hover:text-white hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 block h-2 w-2 bg-red-500 rounded-full ring-2 ring-blue-900"></span>
            </button>

            {/* System Status */}
            <div className="hidden xl:flex items-center space-x-2 text-sm">
              <div className="flex items-center text-green-400">
                <div className="h-2 w-2 bg-green-400 rounded-full mr-2"></div>
                <span className="text-white">System OK</span>
              </div>
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                className="flex items-center max-w-xs rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
                onClick={handleProfileClick}
              >
                <div className="h-9 w-9 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center text-gray-900 font-bold relative overflow-hidden border-2 border-white shadow-lg">
                  {/* Default profile image with fallback initials */}
                  <img
                    src="/superadmin-avatar.png"
                    alt="Super Admin"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  <div className="h-full w-full flex items-center justify-center bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 font-bold">
                    SA
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 ml-1 text-white" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-2">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50 rounded-t-lg">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center text-gray-900 font-bold mr-3">
                          SA
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            Super Administrator
                          </p>
                          <p className="text-sm text-gray-500">
                            superadmin@system.com
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center text-xs">
                        <Shield className="h-3 w-3 text-yellow-500 mr-1" />
                        <span className="text-yellow-600 font-medium">
                          Full System Access
                        </span>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <button
                      onClick={handleProfileNavigation}
                      className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors duration-150"
                    >
                      <User className="mr-3 h-4 w-4 text-blue-500" />
                      Super Admin Profile
                    </button>

                    <button
                      onClick={handleSystemSettings}
                      className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors duration-150"
                    >
                      <Settings className="mr-3 h-4 w-4 text-green-500" />
                      System Configuration
                    </button>

                    <div className="border-t border-gray-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Logout Super Admin
                    </button>
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

export default SuperAdminHeader;

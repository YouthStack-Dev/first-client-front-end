import React, { useState, useRef, useEffect } from "react";
import { Bell, Search, Menu, User, LogOut, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Header = ({ toggleSidebar, title = "Dashboard" }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleProfileClick = () => {
    navigate("/companies/profile");
    setIsProfileOpen(false);
  };

  const handleNotificationClick = () => {
    navigate("/companies/notification");
  };

  const handleProfileNavigation = (e) => {
    e.stopPropagation(); // Prevent triggering parent click
    navigate("/companies/profile");
    setIsProfileOpen(false);
  };

  const handleLogout = (e) => {
    e.stopPropagation(); // Prevent triggering parent click
    // Handle logout logic
    console.log("Logging out...");
    setIsProfileOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 fixed w-full z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-600 lg:hidden"
              onClick={toggleSidebar}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="ml-4 lg:ml-0">
              <span className="text-blue-600 font-bold text-xl">{title}</span>
            </div>
          </div>

          <div className="flex items-center m-12">
            {/* Notification Button - Navigates to notification page */}
            <button
              type="button"
              className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={handleNotificationClick}
            >
              <span className="sr-only">View notifications</span>
              <Bell className="h-6 w-6" />
            </button>

            {/* Profile Dropdown - Clicking profile icon navigates to companies/profile */}
            <div className="ml-3 relative" ref={profileRef}>
              <button
                type="button"
                className="flex items-center max-w-xs rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={handleProfileClick}
              >
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium relative overflow-hidden">
                  {/* Default profile image with fallback initials */}
                  <img
                    src="/default-avatar.png" // Replace with your default image path
                    alt="Profile"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  <div className="h-full w-full flex items-center justify-center bg-blue-500 text-white font-medium">
                    AD
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500 ml-1" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                      <p className="font-medium">Admin User</p>
                      <p className="text-gray-500">admin@example.com</p>
                    </div>

                    <button
                      onClick={handleProfileNavigation}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <User className="mr-3 h-4 w-4 text-gray-400" />
                      Your Profile
                    </button>

                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="mr-3 h-4 w-4 text-gray-400" />
                      Sign out
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

export default Header;

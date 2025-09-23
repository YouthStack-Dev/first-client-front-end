import React, { useState, useEffect } from "react";
import { 
  Menu, 
  Bell, 
  Search, 
  User, 
  ChevronDown,
  Pin,
  PinOff
} from "lucide-react";

const SimpleHeader = ({ toggleSidebar, title, sidebarOpen, isPinned, setIsPinned }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleNotificationClick = () => {
    alert("3 new notifications!");
  };

  const handleProfileClick = () => {
    alert("Profile menu clicked!");
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      const searchTerm = e.target.value;
      if (searchTerm.trim()) {
        alert(`Search for: ${searchTerm}`);
      }
    }
  };

  const togglePin = () => {
    if (!isMobile) {
      setIsPinned(!isPinned);
    }
  };

  return (
    <header className="fixed top-0 right-0 left-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleSidebar}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          {/* Desktop Pin Toggle */}
          {!isMobile && sidebarOpen && (
            <button
              onClick={togglePin}
              className="hidden lg:flex p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title={isPinned ? "Unpin sidebar" : "Pin sidebar"}
            >
              {isPinned ? (
                <Pin className="w-4 h-4" />
              ) : (
                <PinOff className="w-4 h-4" />
              )}
            </button>
          )}
          
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-4">
          <div className="hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                onKeyDown={handleSearch}
              />
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <button
            onClick={handleNotificationClick}
            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </button>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={handleProfileClick}
              className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-medium text-gray-900">Admin User</div>
                <div className="text-xs text-gray-500">Administrator</div>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default SimpleHeader;
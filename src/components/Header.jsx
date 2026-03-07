import React from "react";
import { Bell, Menu, Settings } from "lucide-react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../redux/features/auth/authSlice";

const Header = ({ toggleSidebar, isSidebarOpen, title = "Dashboard" }) => {
  const user = useSelector(selectCurrentUser);

  const initials = user?.name
    ? user.name.slice(0, 2).toUpperCase()
    : "AD";

  return (
    <header className={`
      bg-white border-b border-gray-200 fixed top-0 right-0 z-10 transition-all duration-300
      ${isSidebarOpen ? "left-[220px]" : "left-[56px]"}
    `}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <div className="flex items-center">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-600"
              onClick={toggleSidebar}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="ml-4">
              <span className="text-blue-600 font-bold text-xl">{title}</span>
            </div>
          </div>

          <div className="flex items-center">
            <button
              type="button"
              className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span className="sr-only">View notifications</span>
              <Bell className="h-6 w-6" />
            </button>

            <button
              type="button"
              className="ml-3 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span className="sr-only">Settings</span>
              <Settings className="h-6 w-6" />
            </button>

            <div className="ml-3 relative">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-sm">
                {initials}
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;
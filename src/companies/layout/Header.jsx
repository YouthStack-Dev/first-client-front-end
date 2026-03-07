import React, { useState, useRef, useEffect, useCallback } from "react";
import { Megaphone, Star, Menu, User, LogOut, ChevronDown } from "lucide-react";
import { useNavigate }                                       from "react-router-dom";
import { useDispatch, useSelector }                          from "react-redux";
import { logout, selectCurrentUser }                         from "../../redux/features/auth/authSlice";

const Header = ({ toggleSidebar, isSidebarOpen, title = "Dashboard" }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user     = useSelector(selectCurrentUser);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const initials     = user?.name ? user.name.slice(0, 2).toUpperCase() : "AD";
  const displayName  = user?.name  ?? "Admin User";
  const displayEmail = user?.email ?? "";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAvatarClick       = useCallback(() => setIsProfileOpen(prev => !prev), []);
  const handleProfileNavigation = useCallback(() => { navigate("/companies/profile");      setIsProfileOpen(false); }, [navigate]);
  const handleAnnouncementClick = useCallback(() =>   navigate("/companies/announcements"), [navigate]);
  const handleReviewsClick      = useCallback(() =>   navigate("/companies/reviews"),       [navigate]);
  const handleLogout            = useCallback(() => { dispatch(logout()); setIsProfileOpen(false); }, [dispatch]);

  return (
    <header className={`
      bg-white border-b border-gray-100 fixed top-0 right-0 z-10
      transition-all duration-300 shadow-sm
      ${isSidebarOpen ? "left-[256px]" : "left-[64px]"}
    `}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Left — toggle + title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              data-sidebar-toggle
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-blue-600 font-bold text-xl">{title}</span>
          </div>

          {/* Right — announcements + reviews + avatar */}
          <div className="flex items-center gap-1">

            {/* Announcements button */}
            <button
              type="button"
              onClick={handleAnnouncementClick}
              className="group relative flex items-center gap-2 px-3 py-2 rounded-xl
                text-gray-500 hover:text-indigo-600 hover:bg-indigo-50
                transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <div className="relative p-1.5 rounded-lg bg-gray-100 group-hover:bg-indigo-100 transition-colors">
                <Megaphone className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold tracking-wide hidden sm:block">
                Announcements
              </span>
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-200 mx-1" />

            {/* Reviews button */}
            <button
              type="button"
              onClick={handleReviewsClick}
              className="group relative flex items-center gap-2 px-3 py-2 rounded-xl
                text-gray-500 hover:text-amber-600 hover:bg-amber-50
                transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-300"
            >
              <div className="relative p-1.5 rounded-lg bg-gray-100 group-hover:bg-amber-100 transition-colors">
                <Star className="h-4 w-4" />
                {/* New reviews dot */}
                <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white" />
              </div>
              <span className="text-xs font-semibold tracking-wide hidden sm:block">
                Reviews
              </span>
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-200 mx-1" />

            {/* Profile dropdown */}
            <div className="relative ml-1" ref={profileRef}>
              <button
                type="button"
                onClick={handleAvatarClick}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl
                  hover:bg-gray-100 transition-colors
                  focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600
                  flex items-center justify-center text-white text-sm font-semibold select-none shadow-sm">
                  {initials}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-gray-700 leading-none truncate max-w-[100px]">
                    {displayName}
                  </p>
                  {displayEmail && (
                    <p className="text-[10px] text-gray-400 leading-none mt-0.5 truncate max-w-[100px]">
                      {displayEmail}
                    </p>
                  )}
                </div>
                <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200
                  ${isProfileOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl shadow-lg bg-white
                  ring-1 ring-black ring-opacity-5 z-20 overflow-hidden">

                  {/* User info header */}
                  <div className="px-4 py-3 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600
                        flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{displayName}</p>
                        {displayEmail && (
                          <p className="text-xs text-gray-500 truncate">{displayEmail}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="py-1.5">
                    <button
                      onClick={handleProfileNavigation}
                      className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700
                        hover:bg-gray-50 transition-colors"
                    >
                      <div className="p-1 rounded-md bg-gray-100 mr-3">
                        <User className="h-3.5 w-3.5 text-gray-500" />
                      </div>
                      Your Profile
                    </button>

                    <div className="mx-4 my-1 border-t border-gray-100" />

                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2.5 text-sm text-red-600
                        hover:bg-red-50 transition-colors"
                    >
                      <div className="p-1 rounded-md bg-red-100 mr-3">
                        <LogOut className="h-3.5 w-3.5 text-red-500" />
                      </div>
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
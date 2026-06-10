import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Menu, ChevronDown, MapPin, Gauge, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { logout, selectCurrentUser } from "@features/auth/authSlice";

const VendorHeader = ({
  toggleSidebar,
  isSidebarOpen = false,
  title = "Dashboard",
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user     = useSelector(selectCurrentUser);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const currentPath        = window.location.pathname;
  const isLiveDrivers      = currentPath === "/vendor/live-drivers";
  const isSpeedViolations  = currentPath === "/vendor/speed-violations";

  // ── Email ──────────────────────────────────────────────────────────────
  const displayEmail = useMemo(() => {
    const vendorEmail = user?.vendor_user?.email;
    if (vendorEmail) return vendorEmail;
    try {
      const token = Cookies.get("auth_token");
      if (token) {
        const decoded = jwtDecode(token);
        return decoded.email || decoded.user_email || decoded.sub || user?.email || "";
      }
    } catch {
      // fall through
    }
    return user?.email || "";
  }, [user]);

  // ── Display name ───────────────────────────────────────────────────────
  const displayName =
    user?.vendor_user?.name ||
    user?.name              ||
    user?.full_name         ||
    displayEmail.split("@")[0] ||
    "Vendor User";

  // ── Role badge ─────────────────────────────────────────────────────────
  const userRole = user?.roles?.[0]
    ? user.roles[0].replace(/([A-Z])/g, " $1").trim()
    : "Vendor";

  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "VU";

  // ── Close profile dropdown on outside click ────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setIsProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAvatarClick = useCallback(
    () => setIsProfileOpen((prev) => !prev),
    []
  );
  const handleProfileNavigation = useCallback(() => {
    navigate("/vendor/profile");
    setIsProfileOpen(false);
  }, [navigate]);
  const handleLiveDriversClick = useCallback(
    () => navigate("/vendor/live-drivers"),
    [navigate]
  );
  const handleSpeedViolationsClick = useCallback(
    () => navigate("/vendor/speed-violations"),
    [navigate]
  );
  const handleLogout = useCallback(() => {
    dispatch(logout());
    setIsProfileOpen(false);
  }, [dispatch]);

  return (
    <header
      className={`
        bg-white border-b border-gray-100 fixed top-0 right-0 z-40
        transition-all duration-300 shadow-sm
        left-0
        ${isSidebarOpen ? "lg:left-64" : "lg:left-16"}
      `}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Left — hamburger + title */}
          <div className="flex items-center">
            <button
              type="button"
              data-sidebar-toggle
              onClick={toggleSidebar}
              className="text-gray-500 hover:text-gray-600 mr-3 lg:hidden"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>
            <span className="text-indigo-600 font-bold text-xl">{title}</span>
          </div>

          {/* Right — speed violations + live drivers + avatar */}
          <div className="flex items-center gap-1">

            {/* Speed Violations */}
            <button
              type="button"
              onClick={handleSpeedViolationsClick}
              className={`group relative flex items-center gap-2 px-3 py-2 rounded-xl
                transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-300
                ${isSpeedViolations
                  ? "text-red-700 bg-red-50"
                  : "text-gray-500 hover:text-red-600 hover:bg-red-50"
                }`}
            >
              <div
                className={`relative p-1.5 rounded-lg transition-colors
                  ${isSpeedViolations
                    ? "bg-red-100"
                    : "bg-gray-100 group-hover:bg-red-100"
                  }`}
              >
                <Gauge className="h-4 w-4" />
                <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              </div>
              <span className="text-xs font-semibold tracking-wide hidden sm:block">
                Speed Violations
              </span>
            </button>

            <div className="w-px h-6 bg-gray-200 mx-1" />

            {/* Live Drivers */}
            <button
              type="button"
              onClick={handleLiveDriversClick}
              className={`group relative flex items-center gap-2 px-3 py-2 rounded-xl
                transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-300
                ${isLiveDrivers
                  ? "text-emerald-700 bg-emerald-50"
                  : "text-gray-500 hover:text-emerald-600 hover:bg-emerald-50"
                }`}
            >
              <div
                className={`relative p-1.5 rounded-lg transition-colors
                  ${isLiveDrivers
                    ? "bg-emerald-100"
                    : "bg-gray-100 group-hover:bg-emerald-100"
                  }`}
              >
                <MapPin className="h-4 w-4" />
                <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white">
                  <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                </span>
              </div>
              <span className="text-xs font-semibold tracking-wide hidden sm:block">
                Drivers Tracking
              </span>
            </button>

            <div className="w-px h-6 bg-gray-200 mx-1" />

            {/* Profile dropdown */}
            <div className="relative ml-1" ref={profileRef}>
              <button
                type="button"
                onClick={handleAvatarClick}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl
                  hover:bg-gray-100 transition-colors
                  focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <div
                  className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600
                  flex items-center justify-center text-white text-sm font-semibold select-none shadow-sm"
                >
                  {initials}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-gray-700 leading-none truncate max-w-[100px]">
                    {displayName}
                  </p>
                  <p className="text-[10px] text-gray-400 leading-none mt-0.5 truncate max-w-[100px]">
                    {userRole}
                  </p>
                </div>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200
                    ${isProfileOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isProfileOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 rounded-xl shadow-lg bg-white
                  ring-1 ring-black ring-opacity-5 z-50 overflow-hidden"
                >
                  {/* User info */}
                  <div className="px-4 py-3 bg-gradient-to-br from-indigo-50 to-blue-50 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600
                        flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {displayName}
                        </p>
                        {displayEmail && (
                          <p className="text-xs text-gray-500 truncate">{displayEmail}</p>
                        )}
                        <span className="inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">
                          {userRole}
                        </span>
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

export default VendorHeader;
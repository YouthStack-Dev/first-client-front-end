import {
  LogOut,
  ChevronDown,
  Pin,
  PinOff,
} from 'lucide-react';

import { Link, useLocation, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { menuItems } from './MenuItems';
import { logout } from '../../redux/features/auth/authSlice';
import { logDebug } from '../../utils/logger';

// Skeleton Loading Components
const SkeletonMenuItem = ({ isOpen }) => (
  <div className="px-4 py-2.5 rounded-sidebar">
    <div className="flex items-center">
      <div className="w-5 h-5 bg-sidebar-primary-100 rounded animate-pulse"></div>
      {isOpen && (
        <div className="ml-3 h-4 bg-sidebar-primary-100 rounded animate-pulse w-24"></div>
      )}
    </div>
  </div>
);

const SkeletonHeader = ({ isOpen }) => (
  <div className="p-4 border-b border-sidebar-primary-200/30 flex items-center justify-between">
    {isOpen ? (
      <>
        <div className="h-6 bg-sidebar-primary-100 rounded animate-pulse w-48"></div>
        <div className="w-4 h-4 bg-sidebar-primary-100 rounded animate-pulse"></div>
      </>
    ) : (
      <div className="w-8 h-8 bg-sidebar-primary-100 rounded animate-pulse mx-auto"></div>
    )}
  </div>
);

const Sidebar = ({ isOpen, setIsOpen, isPinned, setIsPinned }) => {
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userPermissions, setUserPermissions] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Load permissions from session storage
  useEffect(() => {
    const storedPermissions = sessionStorage.getItem('userPermissions');
    if (storedPermissions) {
      try {
        const parsedPermissions = JSON.parse(storedPermissions);
        setUserPermissions(parsedPermissions.permissions || []);
      
      } catch (error) {
        console.error('Error parsing user permissions:', error);
        setUserPermissions([]);
      }
    }
  }, []);

  const hasModulePermission = (moduleName, permissionType = 'read') => {
    if (!Array.isArray(userPermissions)) return false;
    
    return userPermissions.some(
      (perm) =>
        perm?.module === moduleName &&
        Array.isArray(perm.action) &&
        perm.action.includes(permissionType)
    );
  };

  const handleLogout = () => {
    // Clear session storage on logout
    sessionStorage.removeItem("userPermissions");
    dispatch(logout());

    // Redirect to login
    navigate("/", { replace: true });
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setIsPinned(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setIsPinned]);

  // Simulate loading state
  useEffect(() => {
    if (userPermissions.length > 0) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [userPermissions]);

  const toggleDropdown = (menuName) => {
    setOpenDropdown((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const handleMouseEnter = () => {
    if (!isMobile && !isPinned) {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile && !isPinned) {
      setIsOpen(false);
      setOpenDropdown({});
    }
  };

  const togglePin = () => {
    if (!isMobile) {
      setIsPinned(!isPinned);
      setIsOpen(!isPinned);
    }
  };

  // Close sidebar on mobile when clicking a menu item
  const handleMenuItemClick = () => {
    if (isMobile) {
      setIsOpen(false);
      setOpenDropdown({});
    }
  };

  // Filter menu items based on permissions
  const getFilteredMenuItems = () => {
    return menuItems.filter((item) => {
      const hasMainPermission = hasModulePermission(item.permissionModule);
      
      if (!hasMainPermission) return false;
      
      if (item.subItems) {
        const accessibleSubItems = item.subItems.filter((subItem) =>
          hasModulePermission(subItem.permissionModule)
        );
        return accessibleSubItems.length > 0;
      }
      
      return true;
    });
  };

  const getFilteredSubItems = (subItems) => {
    return subItems.filter((subItem) =>
      hasModulePermission(subItem.permissionModule)
    );
  };

  const sidebarWidth = isOpen ? 'w-sidebar' : 'w-sidebar-collapsed';
  const sidebarClass = `h-screen ${sidebarWidth} bg-gradient-to-b from-sidebar-primary-900 via-sidebar-primary-800 to-sidebar-primary-900 text-white flex flex-col fixed left-0 transition-all duration-300 ease-in-out z-50 shadow-sidebar border-r border-sidebar-primary-200/30`;

  return (
    <aside
      className={`${sidebarClass} ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Header Section */}
      {isLoading ? (
        <SkeletonHeader isOpen={isOpen} />
      ) : (
        <div className="p-4 border-b border-sidebar-primary-200/30 flex items-center justify-between bg-sidebar-primary-800/50 backdrop-blur-sm">
          {isOpen && (
            <>
              <h2 className="text-xl font-bold text-white">
                MLT ETS Management
              </h2>
              {!isMobile && (
                <button 
                  onClick={togglePin} 
                  className="text-sidebar-primary-200 hover:text-white transition-colors duration-200 p-1 rounded-sidebar hover:bg-sidebar-primary-700/50"
                  title={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
                >
                  {isPinned ? <Pin className="w-4 h-4" /> : <PinOff className="w-4 h-4" />}
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Navigation Section */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-sidebar-primary-200 scrollbar-track-transparent">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <SkeletonMenuItem key={index} isOpen={isOpen} />
          ))
        ) : (
          getFilteredMenuItems().map((item) => (
            <div key={item.path || item.name} className="relative">
              {item.subItems ? (
                <>
                  <button
                    onClick={() => toggleDropdown(item.name)}
                    className={`flex items-center w-full px-4 py-2.5 rounded-sidebar transition-all duration-200 group ${
                      openDropdown[item.name]
                        ? 'bg-gradient-to-r from-sidebar-primary-600 to-sidebar-primary-400 text-white shadow-sidebar-item-hover'
                        : 'hover:bg-sidebar-primary-700/50 hover:shadow-sidebar-item'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 min-w-[1.25rem] transition-colors ${
                      openDropdown[item.name] ? 'text-white' : 'text-sidebar-primary-200 group-hover:text-white'
                    }`} />
                    {isOpen && (
                      <>
                        <span className={`ml-3 text-sm flex-1 font-medium ${
                          openDropdown[item.name] ? 'text-white' : 'text-sidebar-primary-100'
                        }`}>
                          {item.name}
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 transition-all duration-200 ${
                            openDropdown[item.name] 
                              ? 'rotate-180 text-white' 
                              : 'text-sidebar-primary-300 group-hover:text-white'
                          }`}
                        />
                      </>
                    )}
                  </button>

                  {isOpen && openDropdown[item.name] && (
                    <div className="mt-1 space-y-1 px-2 animate-fadeIn">
                      {getFilteredSubItems(item.subItems).map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          onClick={handleMenuItemClick}
                          className={`flex items-center px-4 py-2 text-sm rounded-sidebar transition-all duration-200 group relative ${
                            location.pathname === subItem.path
                              ? 'bg-gradient-to-r from-sidebar-accent-500 to-sidebar-accent-600 text-white shadow-sidebar-item'
                              : 'text-sidebar-primary-200 hover:bg-sidebar-primary-700/50 hover:text-white hover:shadow-sm'
                          }`}
                        >
                          {location.pathname === subItem.path && (
                            <div className="absolute left-0 w-1 h-full bg-white rounded-r-full"></div>
                          )}
                          <subItem.icon className={`w-4 h-4 transition-colors ${
                            location.pathname === subItem.path 
                              ? 'text-white' 
                              : 'text-sidebar-primary-300 group-hover:text-white'
                          }`} />
                          <span className="ml-2 font-medium">{subItem.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={item.path}
                  onClick={handleMenuItemClick}
                  className={`flex items-center px-4 py-2.5 rounded-sidebar transition-all duration-200 group relative ${
                    location.pathname === item.path
                      ? 'bg-gradient-to-r from-sidebar-primary-600 to-sidebar-primary-400 text-white shadow-sidebar-item-hover'
                      : 'hover:bg-sidebar-primary-700/50 hover:shadow-sidebar-item'
                  }`}
                >
                  {location.pathname === item.path && (
                    <div className="absolute left-0 w-1 h-full bg-white rounded-r-full"></div>
                  )}
                  <item.icon className={`w-5 h-5 min-w-[1.25rem] transition-colors ${
                    location.pathname === item.path 
                      ? 'text-white' 
                      : 'text-sidebar-primary-200 group-hover:text-white'
                  }`} />
                  {isOpen && (
                    <span className={`ml-3 text-sm font-medium ${
                      location.pathname === item.path ? 'text-white' : 'text-sidebar-primary-100'
                    }`}>
                      {item.name}
                    </span>
                  )}
                </Link>
              )}
            </div>
          ))
        )}
      </nav>

      {/* Footer Section */}
      <div className="p-4 border-t border-sidebar-primary-200/30 bg-sidebar-primary-800/50 backdrop-blur-sm">
        {isLoading ? (
          <div className="w-full h-10 bg-sidebar-primary-100 rounded-sidebar animate-pulse"></div>
        ) : (
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-4 py-2.5 bg-gradient-to-r from-sidebar-danger-600 to-sidebar-danger-500 text-white rounded-sidebar hover:from-sidebar-danger-700 hover:to-sidebar-danger-600 transition-all duration-200 shadow-sidebar-item hover:shadow-sidebar-item-hover group"
            aria-label="Logout"
            title="Logout"
          >
            <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
            {isOpen && <span className="ml-2 font-medium">Logout</span>}
          </button>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-thumb-sidebar-primary-200::-webkit-scrollbar-thumb {
          background-color: theme('colors.sidebar.primary.200');
          border-radius: 3px;
        }
        
        .scrollbar-track-transparent::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </aside>
  );
};

export default React.memo(Sidebar);
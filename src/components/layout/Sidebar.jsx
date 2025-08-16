import {
  LogOut,
  ChevronDown,
  Pin,
  PinOff,
} from 'lucide-react';

import { Link, useLocation } from 'react-router-dom';
import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ModulePermissionContext } from '../../context/ModulePermissionContext';
import { logoutUser } from '../../redux/features/auth/authTrunk';
import { menuItems } from './MenuItems';

// Skeleton Loading Components
const SkeletonMenuItem = ({ isOpen }) => (
  <div className="px-4 py-2.5 rounded-lg">
    <div className="flex items-center">
      <div className="w-5 h-5 bg-blue-100 rounded animate-pulse"></div>
      {isOpen && (
        <div className="ml-3 h-4 bg-blue-100 rounded animate-pulse w-24"></div>
      )}
    </div>
  </div>
);

const SkeletonHeader = ({ isOpen }) => (
  <div className="p-4 border-b border-blue-200 flex items-center justify-between">
    {isOpen ? (
      <>
        <div className="h-6 bg-blue-100 rounded animate-pulse w-48"></div>
        <div className="w-4 h-4 bg-blue-100 rounded animate-pulse"></div>
      </>
    ) : (
      <div className="w-8 h-8 bg-blue-100 rounded animate-pulse mx-auto"></div>
    )}
  </div>
);

const Sidebar = ({ isOpen, setIsOpen, isPinned, setIsPinned }) => {
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { modulePermissions } = useContext(ModulePermissionContext);

  const hasModulePermission = (permissions, moduleName, permissionType = 'read') => {
    if (!Array.isArray(permissions)) return false;
    return permissions.some(
      (perm) =>
        perm?.module === moduleName &&
        Array.isArray(perm.action) &&
        perm.action.includes(permissionType)
    );
  };

  const handleLogout = () => {
    dispatch(logoutUser());
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
    if (user && modulePermissions) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000); // 1 second loading simulation
      return () => clearTimeout(timer);
    }
  }, [user, modulePermissions]);

  if (!user) return null;

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

  const sidebarWidth = isOpen ? 'w-64' : 'w-16';
  const sidebarClass = `h-screen ${sidebarWidth} bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white flex flex-col fixed left-0 transition-all duration-300 ease-in-out z-50 shadow-2xl border-r border-blue-200/30`;

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
        <div className="p-4 border-b border-blue-200/30 flex items-center justify-between bg-blue-800/50 backdrop-blur-sm">
          {isOpen && (
            <>
              <h2 className="text-xl font-bold text-white">
                MLT ETS Management
              </h2>
              {!isMobile && (
                <button 
                  onClick={togglePin} 
                  className="text-blue-200 hover:text-white transition-colors duration-200 p-1 rounded hover:bg-blue-700/50"
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
      <nav className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent">
        {isLoading ? (
          // Skeleton loading for menu items
          Array.from({ length: 6 }).map((_, index) => (
            <SkeletonMenuItem key={index} isOpen={isOpen} />
          ))
        ) : (
          menuItems
            .filter((item) => hasModulePermission(modulePermissions, item.permissionModule))
            .map((item) => (
              <div key={item.path || item.name} className="relative">
                {item.subItems ? (
                  <>
                    <button
                      onClick={() => toggleDropdown(item.name)}
                      className={`flex items-center w-full px-4 py-2.5 rounded-lg transition-all duration-200 group ${
                        openDropdown[item.name]
                          ? 'bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-lg shadow-blue-500/20'
                          : 'hover:bg-blue-700/50 hover:shadow-md'
                      }`}
                    >
                      <item.icon className={`w-5 h-5 min-w-[1.25rem] transition-colors ${
                        openDropdown[item.name] ? 'text-white' : 'text-blue-200 group-hover:text-white'
                      }`} />
                      {isOpen && (
                        <>
                          <span className={`ml-3 text-sm flex-1 font-medium ${
                            openDropdown[item.name] ? 'text-white' : 'text-blue-100'
                          }`}>
                            {item.name}
                          </span>
                          <ChevronDown
                            className={`w-5 h-5 transition-all duration-200 ${
                              openDropdown[item.name] 
                                ? 'rotate-180 text-white' 
                                : 'text-blue-300 group-hover:text-white'
                            }`}
                          />
                        </>
                      )}
                    </button>

                    {isOpen && openDropdown[item.name] && (
                      <div className="mt-1 space-y-1 px-2 animate-fadeIn">
                        {item.subItems
                          .filter((subItem) =>
                            hasModulePermission(modulePermissions, subItem.permissionModule)
                          )
                          .map((subItem) => (
                            <Link
                              key={subItem.path}
                              to={subItem.path}
                              onClick={handleMenuItemClick}
                              className={`flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200 group relative ${
                                location.pathname === subItem.path
                                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/20'
                                  : 'text-blue-200 hover:bg-blue-700/50 hover:text-white hover:shadow-sm'
                              }`}
                            >
                              {location.pathname === subItem.path && (
                                <div className="absolute left-0 w-1 h-full bg-white rounded-r-full"></div>
                              )}
                              <subItem.icon className={`w-4 h-4 transition-colors ${
                                location.pathname === subItem.path 
                                  ? 'text-white' 
                                  : 'text-blue-300 group-hover:text-white'
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
                    className={`flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 group relative ${
                      location.pathname === item.path
                        ? 'bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-lg shadow-blue-500/20'
                        : 'hover:bg-blue-700/50 hover:shadow-md'
                    }`}
                  >
                    {location.pathname === item.path && (
                      <div className="absolute left-0 w-1 h-full bg-white rounded-r-full"></div>
                    )}
                    <item.icon className={`w-5 h-5 min-w-[1.25rem] transition-colors ${
                      location.pathname === item.path 
                        ? 'text-white' 
                        : 'text-blue-200 group-hover:text-white'
                    }`} />
                    {isOpen && (
                      <span className={`ml-3 text-sm font-medium ${
                        location.pathname === item.path ? 'text-white' : 'text-blue-100'
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
      <div className="p-4 border-t border-blue-200/30 bg-blue-800/50 backdrop-blur-sm">
        {isLoading ? (
          <div className="w-full h-10 bg-blue-100 rounded-lg animate-pulse"></div>
        ) : (
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-lg hover:from-blue-500 hover:to-blue-700 transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 group"
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
        
        .scrollbar-thumb-blue-200::-webkit-scrollbar-thumb {
          background-color: #bfdbfe;
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
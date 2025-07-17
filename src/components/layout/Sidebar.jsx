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
import { logoutUser } from '../../redux/features/auth/authTrunk'; // ✅ Make sure this path is correct
import { menuItems } from './MenuItems';

const Sidebar = ({ isOpen, setIsOpen, isPinned, setIsPinned }) => {
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth); // ✅ Correct auth access
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

  const sidebarWidth = isOpen ? 'w-64' : 'w-16';
  const sidebarClass = `h-screen ${sidebarWidth} bg-gray-800 text-white flex flex-col fixed left-0 transition-all duration-300 ease-in-out z-50`;

  return (
    <aside
      className={`${sidebarClass} ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        {isOpen && (
          <>
            <h2 className="text-xl font-bold">MLT ETS Management</h2>
            {!isMobile && (
              <button onClick={togglePin} className="text-gray-400 hover:text-white">
                {isPinned ? <Pin className="w-4 h-4" /> : <PinOff className="w-4 h-4" />}
              </button>
            )}
          </>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-2">
        {menuItems
          .filter((item) => hasModulePermission(modulePermissions, item.permissionModule))
          .map((item) => (
            <div key={item.path || item.name} className="relative">
              {item.subItems ? (
                <>
                  <button
                    onClick={() => toggleDropdown(item.name)}
                    className={`flex items-center w-full px-4 py-2.5 rounded-lg transition-all duration-200 ${
                      openDropdown[item.name]
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-700'
                    }`}
                  >
                    <item.icon className="w-5 h-5 min-w-[1.25rem]" />
                    {isOpen && (
                      <>
                        <span className="ml-3 text-sm flex-1">{item.name}</span>
                        <ChevronDown
                          className={`w-5 h-5 transition-transform duration-200 ${
                            openDropdown[item.name] ? 'rotate-180' : ''
                          }`}
                        />
                      </>
                    )}
                  </button>

                  {isOpen && openDropdown[item.name] && (
                    <div className="mt-1 space-y-1 px-2">
                      {item.subItems
                        .filter((subItem) =>
                          hasModulePermission(modulePermissions, subItem.permissionModule)
                        )
                        .map((subItem) => (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                              location.pathname === subItem.path
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-300 hover:bg-gray-700'
                            }`}
                          >
                            <subItem.icon className="w-4 h-4" />
                            <span className="ml-2">{subItem.name}</span>
                          </Link>
                        ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-2.5 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="w-5 h-5 min-w-[1.25rem]" />
                  {isOpen && <span className="ml-3 text-sm">{item.name}</span>}
                </Link>
              )}
            </div>
          ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full p-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <LogOut size={16} />
          {isOpen && <span className="ml-2">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default React.memo(Sidebar);

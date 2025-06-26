import {
  LogOut,
  ChevronDown,
  Pin,
  PinOff,
} from 'lucide-react';

  import { Link, useLocation, useNavigate } from 'react-router-dom';
  import React, { useState, useEffect, useContext } from 'react';
  import { useDispatch, useSelector } from 'react-redux';
  import { logoutUser } from '../../redux/features/userSlice';
  import { ModulePermissionContext } from '../../context/ModulePermissionContext';
  import { log } from '../../utils/logger';
  import { menuItems } from './MenuItems';

  // import { logoutUser } from '../redux/features/userSlice';

  const Sidebar = ({ isOpen, setIsOpen, isPinned, setIsPinned }) => {
    const location = useLocation();
    const [openDropdown, setOpenDropdown] = useState({});
    const [isMobile, setIsMobile] = useState(false);

  const user = useSelector((state) => state.user?.user);
  const { modulePermissions, loading } = useContext(ModulePermissionContext);
  
  const hasModulePermission = (modulePermissions, moduleName, permissionType = 'canRead') => {
    if (!Array.isArray(modulePermissions)) return false;
  
    for (const mod of modulePermissions) {
      if (mod?.id === moduleName && mod?.permissions?.[permissionType]) return true;
  
      if (Array.isArray(mod.submodules)) {
        const submod = mod.submodules.find((s) => s?.id === moduleName);
        if (submod?.permissions?.[permissionType]) return true;
      }
    }
  
    return false;
  };
  
  const navigate = useNavigate();

  
  log("this is the module permission of  the user ",modulePermissions)
    // console.log(" this is the user in the side bar " ,user);
  const dispatch = useDispatch();

const handleLogout = () => {
  dispatch(logoutUser());
};
  // Check if screen is mobile
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
  }, []);

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
        // setIsHovered(true);
      }
    };

    const handleMouseLeave = () => {
      if (!isMobile && !isPinned) {
        setIsOpen(false);
        // setIsHovered(false);
        setOpenDropdown({});
      }
    };

    const togglePin = () => {
      if (!isMobile) {
        setIsPinned(!isPinned);
        setIsOpen(!isPinned);
      }
    };
    useSelector

    
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
      .filter(item => hasModulePermission(modulePermissions, item.permissionModule))
      .map((item) => (
        <div key={item.path || item.name} className="relative">
          {item.subItems ? (
            <>
              <button
                onClick={() => toggleDropdown(item.name)}
                className={`flex items-center w-full px-4 py-2.5 rounded-lg transition-all duration-200 ${
                  openDropdown[item.name] ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'   }`} >

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
                    .filter(subItem =>
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
  <div className="mb-3">
    <button
      onClick={() => navigate('/switch-office')}
      className="flex items-center justify-center w-full p-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
    >
      <Pin className="w-4 h-4" />
      {isOpen && <span className="ml-2">Switch Office</span>}
    </button>
  </div>

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

import { hasModuleAccess, hasPermission, hasSubModuleAccess } from '../src/utils/auth';
import { ROLES } from '../src/utils/auth';
import { 
 Calendar, Building2, 
  LayoutDashboard, LogOut, User as UserIcon, 
  ChevronDown, UserCog, UserPlus, Users2,
  Pin, PinOff, CarTaxiFront,Car,RouteIcon
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../src/redux/features/userSlice';

const Sidebar = ({ isOpen, setIsOpen, isPinned, setIsPinned }) => {

  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState({});
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const user = useSelector((state) => state.user?.user);
  
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
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile && !isPinned) {
      setIsOpen(false);
      setIsHovered(false);
      setOpenDropdown({});
    }
  };

  const togglePin = () => {
    if (!isMobile) {
      setIsPinned(!isPinned);
      setIsOpen(!isPinned);
    }
  };



  const menuItems = [
    {
      path: '/dashboard',
      name: 'Dashboard',
      moduleName: 'Dashboard',
      icon: LayoutDashboard,
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.VENDOR],
    },
    {
      name: 'User Management',
      moduleName: 'UserManagement',
      icon: UserIcon,
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
      subItems: [
        {
          path: '/staffs',
          name: 'Staff',
          moduleName: 'Clients',
          icon: Users2,
          roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
        },
        {
          path: '/company-admins',
          name: 'Company Admins',
          moduleName: 'CompanyAdmins',
          icon: UserCog,
          roles: [ROLES.SUPER_ADMIN],
        },
        {
          path: '/subadmins',
          name: 'Subadmins',
          moduleName: 'Subadmins',
          icon: UserPlus,
          roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
        },
      ],
    },
    {
      name: 'Manage Vehicles',
      moduleName: 'ManageVehicles',
      icon: Car,
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
      subItems: [
        {
          path: '/vehicles',
          name: 'Vehicles',
          moduleName: 'Vehicles',
          icon: Users2,
          roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
        },
        {
          path: '/vehicle-contract',
          name: 'Vehicle Contract',
          moduleName: 'VehicleContract',
          icon: UserCog,
          roles: [ROLES.SUPER_ADMIN],
        },
          {
        path: '/contracts',
        name: 'All Contracts',
        name: 'allContracts',
        icon: FileText,
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
       
      },
        {
          path: '/vehicle-group',
          name: 'Vehicle Type',
          moduleName: 'VehicleType',
          icon: UserPlus,
          roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
        },
      ],
    },
    {
      name: 'Scheduling Management',
      moduleName: 'SchedulingManagement',
      icon: Car,
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
      subItems: [
        {
          path: '/manage-shift',
          name: 'Manage Shift',
          moduleName: 'ManageShift',
          icon: Users2,
          roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
        },
        {
          path: '/shift-Categories',
          name: 'Manage Shift Categories',
          moduleName: 'ShiftCategories',
          icon: UserCog,
          roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
        },
        {
          path: '/shedule-polysies',
          name: 'Manage Schedule Policies',
          moduleName: 'SchedulePolicies',
          icon: UserPlus,
          roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
        },
      ],
    },
    {
      path: '/roleManagement',
      name: 'RoleManagement',
      moduleName: 'RoleManagement',
      icon: UserIcon,
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    },

    {
      path: '/bookings',
      name: 'Bookings',
      moduleName: 'Bookings',
      icon: Calendar,
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    },
    {
      path: '/users',
      name: 'Employes',
      moduleName: 'Users',
      icon: UserIcon,
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    },
    {
      path: '/drivers',
      name: 'Drivers',
      moduleName: 'Drivers',
      icon: CarTaxiFront,
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    },
    {
      path: '/routing',
      name: 'Routing',
      moduleName: 'Routing',
      icon: RouteIcon,
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    },
    {
      path: '/vendors',
      name: 'Vendors',
      moduleName: 'Vendors',
      icon: Building2,
      roles: [ROLES.SUPER_ADMIN],
    },
  ];
  
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
      {menuItems.map((item) => (
     hasModuleAccess(user, item.moduleName) && (
    <div key={item.path || item.name} className="relative">
      {item.subItems ? (
        <>
          <button
            onClick={() => toggleDropdown(item.name)}
            className={`flex items-center w-full px-4 py-2.5 rounded-lg transition-all duration-200 ${
              openDropdown[item.name] ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'
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
              {item.subItems.map((subItem) =>
                hasSubModuleAccess(user, subItem.moduleName) && (
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
                )
              )}
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
  )
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
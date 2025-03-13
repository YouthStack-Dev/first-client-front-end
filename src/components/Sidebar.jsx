import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../utils/auth';
import { ROLES } from '../utils/auth';
import { 
  Users, Truck, Calendar, Building2, 
  LayoutDashboard, LogOut, User as UserIcon, 
  ChevronDown, UserCog, UserPlus, Users2 
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState({}); // Object to track dropdown state

  if (!user) {
    return null;
  }

  const toggleDropdown = (menuName) => {
    setOpenDropdown((prev) => ({
      ...prev,
      [menuName]: !prev[menuName], // Toggle only the clicked dropdown
    }));
  };

  const menuItems = [
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: LayoutDashboard,
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.VENDOR]
    },
    {
      name: 'User Management',
      icon: UserIcon,
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
      subItems: [
        { path: '/clients', name: 'Clients', icon: Users2, roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
        { path: '/company-admins', name:'Company Admins', icon: UserCog, roles: [ROLES.SUPER_ADMIN] },
        { path: '/subadmins', name: 'Subadmins', icon: UserPlus, roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] }
      ]
    },
    {
      name: 'Manage Vehicles',
      icon: Truck,
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
      subItems: [
        { path: '/vehicles', name: 'Vehicles', icon: Users2, roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
        { path: '/vehicle-contract', name: 'Vehicle Contract', icon: UserCog, roles: [ROLES.SUPER_ADMIN] },
        { path: '/vehicle-group', name: 'Manage Vehicle Groups', icon: UserPlus, roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] }
      ]
    },
    {
      path: '/bookings',
      name: 'Bookings',
      icon: Calendar,
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN]
    },
    {
      path: '/vendors',
      name: 'Vendors',
      icon: Building2,
      roles: [ROLES.SUPER_ADMIN]
    }
  ];

  return (
    <aside className="h-screen w-64 bg-gray-800 text-white flex flex-col fixed left-0">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold">Fleet Management</h2>
        <p className="text-gray-400 text-sm mt-1">Welcome, {user.name}</p>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {menuItems.map((item) => (
          hasPermission(user.role, item.roles) && (
            <div key={item.path || item.name} className="relative">
              {item.subItems ? (
                <div>
                  <button
                    onClick={() => toggleDropdown(item.name)}
                    className={`flex items-center w-full px-4 py-2.5 rounded-lg transition-all duration-200 ${
                      openDropdown[item.name] ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="ml-3 flex-1">{item.name}</span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform duration-200 ${
                        openDropdown[item.name] ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  
                  {openDropdown[item.name] && (
                    <div className="mt-1 space-y-1 px-2">
                      {item.subItems.map((subItem) =>
                        hasPermission(user.role, subItem.roles) && (
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
                </div>
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-2.5 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="ml-3">{item.name}</span>
                </Link>
              )}
            </div>
          )
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="flex items-center justify-center w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="ml-2">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

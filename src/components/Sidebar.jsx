import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../utils/auth';
import { ROLES } from '../utils/auth';
import { 
  Users, Truck, Calendar, Building2, 
  LayoutDashboard, LogOut 
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: LayoutDashboard,
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.VENDOR]
    },
    {
      path: '/clients',
      name: 'Clients',
      icon: Users,
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN]
    },
    {
      path: '/vehicles',
      name: 'Vehicles',
      icon: Truck,
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.VENDOR]
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
    <div className="h-screen w-64 bg-gray-800 text-white p-4 fixed left-0">
      <div className="mb-8">
        <h2 className="text-xl font-bold">Fleet Management</h2>
        <p className="text-gray-400 text-sm">Welcome, {user.name}</p>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => (
          hasPermission(user.role, item.roles) && (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-700'
              }`}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </Link>
          )
        ))}
      </nav>

      <button
        onClick={logout}
        className="absolute bottom-4 left-4 right-4 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default Sidebar
import { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Car,
  PieChart,
  Briefcase,
  Tags,
  DollarSign,
  LayoutDashboard,
  Users2,
  ChevronDown,
  ChevronUp,
  X,
  Building2,
  UserCheck,
  IdCard,
  PersonStanding,
  NotebookText
} from 'lucide-react';
import { GlobalContext } from '../store/context';



const RoleBasedmenuItems = {
  super_admin: [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/' },
  {
    title: 'Users',
    icon: Users2,
    subItems: [
      { title: '  Drivers', path: '/drivers', icon:IdCard},
      { title: 'Admins', path: '/dmins', icon:UserCheck },
      { title: 'Client', path: '/Client', icon: Briefcase }, 
      { title: 'Customer', path: '/customer', icon: PersonStanding },
    ],
  },
  { title: 'Vehicle Contracts', icon: Car, path: '/vehicle-contracts' },
  { title: 'Cost Center', icon: DollarSign, path: '/cost-center' },
  { title: 'Manage New Contracts', icon: Briefcase, path: '/new-contracts' },
  { title: 'Manage Vehicles', icon: Car, path: '/vehicles' },
  { title: 'Manage Vehicle Types', icon: Tags, path: '/vehicle-types' },
  { title: 'Daily Audit Report', icon: PieChart, path: '/audit-report' },
  { title: 'Booking', icon:  NotebookText, path: '/Booking' },
]
,

sub_admin:[
  {
    title: 'Users',
    icon: Users2,
    subItems: [
      { title: '  Drivers', path: '/dashboard/drivers', icon:IdCard},
      { title: 'Admins', path: '/Admins', icon:UserCheck },
      { title: 'Client', path: '/Client', icon: Briefcase }, 
      { title: 'Customer', path: '/customer', icon: PersonStanding },
    ],
  },

]
}
const menuItems=RoleBasedmenuItems["sub_admin"]||[];
const Sidebar = () => {
  const [expandedItems, setExpandedItems] = useState({});
  const location = useLocation();
  const { isHovered, setIsHovered,userRole } = useContext(GlobalContext);

  const toggleSubMenu = (title) => {
    setExpandedItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <div
      className={`fixed z-50 bg-gray-800 h-screen transition-all duration-300 ease-in-out  ${
        isHovered ? 'w-64' : 'w-0 lg:w-20'
      } md:relative overflow-hidden ${
        isHovered ? 'lg:absolute' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="flex items-center p-4 border-b border-gray-700">
          <Building2 className="text-blue-500" size={24} />
          {isHovered && (
            <div className="ml-3 flex items-center justify-between w-full">
              <div>
                <h1 className="text-lg font-semibold text-white">FleetQuest</h1>
                <p className="text-xs text-gray-400">FleetQuestManagement System</p>
              </div>
              <button
                onClick={() => setIsHovered(false)}
                className=" xl:hidden text-gray-300 hover:text-white ml-auto "
                aria-label="Close Sidebar"
              >
                <X size={20} />
              </button>
            </div>
          )}
        </div>
        <div className='flex  items-center p-4 border-b border-gray-700 '>
          <h1 className='text-white'>
            {
            userRole
            }
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-1 px-2 py-4">
            {menuItems.map((item) => (
              <li key={item.title}>
                {item.subItems ? (
                  <div>
                    <button
                      onClick={() => toggleSubMenu(item.title)}
                      className={`w-full flex items-center p-2 text-gray-300 hover:bg-gray-700 rounded-lg ${
                        !isHovered && 'justify-center'
                      }`}
                    >
                      <item.icon size={20} />
                      {isHovered && (
                        <>
                          <span className="ml-3 flex-1">{item.title}</span>
                          {expandedItems[item.title] ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </>
                      )}
                    </button>
                    {isHovered && expandedItems[item.title] && (
                      <ul className="pl-4 mt-1 space-y-1">
                        {item.subItems.map((subItem) => (
                          <li key={subItem.title}>
                            <Link
                              to={subItem.path}
                              className={`flex items-center p-2 text-gray-300 hover:bg-gray-700 rounded-lg ${
                                location.pathname === subItem.path && 'bg-gray-700'
                              }`}
                            >
                              <subItem.icon size={18} />
                              <span className="ml-3">{subItem.title}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className={`flex items-center p-2 text-gray-300 hover:bg-gray-700 rounded-lg ${
                      !isHovered && 'justify-center'
                    } ${location.pathname === item.path && 'bg-gray-700'}`}
                  >
                    <item.icon size={20} />
                    {isHovered && <span className="ml-3">{item.title}</span>}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;

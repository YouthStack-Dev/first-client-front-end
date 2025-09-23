import React, { useState, useEffect } from "react";
import { 
  LogOut, 
  ChevronDown, 
  Pin, 
  PinOff,
  LayoutDashboard,
  Truck,
  Users,
  Route,
  MapPin,
  Calendar,
  FileText,
  BarChart3,
  Settings,
  Building2,
  UserPlus,
  Plus,
  Clock,
  CheckCircle,
  Car,
  UserCheck,
  TrendingUp,
  DollarSign,
  PersonStanding
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

// Static vendor data
const vendorData = {
  companyName: "Swift Transport Services",
  email: "admin@swifttransport.com",
  phone: "+1 (555) 123-4567",
  totalVehicles: 45,
  activeDrivers: 38,
  todayTrips: 12
};

// Static menu items for vendor
const vendorMenuItems = [
  {
    name: "Dashboard",
    path: "/vendor/dashboard",
    icon: LayoutDashboard
  },
  {
    name: "Vehicle Management",
    icon: Truck,
    subItems: [
      {
        name: "All Vehicles",
        path: "/vendor/vehicles",
        icon: Truck
      },
      {
        name: "Add Vehicle",
        path: "/vendor/vehicles/add",
        icon: Plus
      }
    ]
  },
  {
    name: "Driver Management",
    icon: Users,
    subItems: [
      {
        name: "All Drivers",
        path: "/vendor/drivers",
        icon: Users
      },
      {
        name: "Add Driver",
        path: "/vendor/drivers/add",
        icon: UserPlus
      }
    ]
  },
  {
    name: "Route Management",
    icon: Route,
    subItems: [
      {
        name: "All Routes",
        path: "/vendor/routes",
        icon: Route
      },
      {
        name: "Add Route",
        path: "/vendor/routes/add",
        icon: Plus
      }
    ]
  },
  {
    name: "Trip Management",
    icon: MapPin,
    subItems: [
      {
        name: "Active Trips",
        path: "/vendor/trips/active",
        icon: Clock
      },
      {
        name: "Completed Trips",
        path: "/vendor/trips/completed",
        icon: CheckCircle
      },
      {
        name: "All Trips",
        path: "/vendor/trips",
        icon: MapPin
      }
    ]
  },
  {
    name: "Booking Management",
    icon: Calendar,
    subItems: [
      {
        name: "Pending Bookings",
        path: "/vendor/bookings/pending",
        icon: PersonStanding
      },
      {
        name: "Confirmed Bookings",
        path: "/vendor/bookings/confirmed",
        icon: CheckCircle
      },
      {
        name: "All Bookings",
        path: "/vendor/bookings",
        icon: Calendar
      }
    ]
  },
  {
    name: "Document Management",
    icon: FileText,
    subItems: [
      {
        name: "Vehicle Documents",
        path: "/vendor/documents/vehicle",
        icon: Car
      },
      {
        name: "Driver Documents",
        path: "/vendor/documents/driver",
        icon: UserCheck
      },
      {
        name: "All Documents",
        path: "/vendor/documents",
        icon: FileText
      }
    ]
  },
  {
    name: "Reports & Analytics",
    icon: BarChart3,
    subItems: [
      {
        name: "Trip Reports",
        path: "/vendor/reports/trips",
        icon: TrendingUp
      },
      {
        name: "Revenue Reports",
        path: "/vendor/reports/revenue",
        icon: DollarSign
      },
      {
        name: "All Reports",
        path: "/vendor/reports",
        icon: BarChart3
      }
    ]
  },
  {
    name: "User Management",
    path: "/vendor/users",
    icon: UserPlus
  },
  {
    name: "Company Profile",
    path: "/vendor/profile",
    icon: Building2
  },
  {
    name: "Settings",
    path: "/vendor/settings",
    icon: Settings
  }
];

const VendorSidebar = ({ isOpen, setIsOpen, isPinned, setIsPinned }) => {
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setIsPinned(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [setIsPinned]);

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

  const handleLogout = () => {
    // Static logout - just redirect
    alert("Logging out...");
    window.location.href = '/vendor/login';
  };

  const sidebarWidth = isOpen ? "w-64" : "w-16";
  const sidebarClass = `h-screen ${sidebarWidth} bg-indigo-900 text-white flex flex-col fixed left-0 transition-all duration-300 ease-in-out z-50`;

  return (
    <aside
      className={`${sidebarClass} ${
        isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Header */}
      <div className="p-4 border-b border-indigo-800 flex items-center justify-between">
        {isOpen && (
          <>
            <div className="flex flex-col">
              <h2 className="text-lg font-bold text-white">{vendorData.companyName}</h2>
              <span className="text-xs text-indigo-300">Vendor Portal</span>
            </div>
            {!isMobile && (
              <button
                onClick={togglePin}
                className="text-indigo-400 hover:text-white transition-colors"
              >
                {isPinned ? (
                  <Pin className="w-4 h-4" />
                ) : (
                  <PinOff className="w-4 h-4" />
                )}
              </button>
            )}
          </>
        )}
        {!isOpen && (
          <div className="w-8 h-8 bg-indigo-700 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
        )}
      </div>



      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {vendorMenuItems.map((item) => (
          <div key={item.path || item.name} className="relative">
            {item.subItems && item.subItems.length > 0 ? (
              <>
                <button
                  onClick={() => toggleDropdown(item.name)}
                  className={`flex items-center w-full px-3 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                    openDropdown[item.name]
                      ? "bg-indigo-700 text-white"
                      : "hover:bg-indigo-800 text-indigo-100"
                  }`}
                >
                  <item.icon className="w-5 h-5 min-w-[1.25rem]" />
                  {isOpen && (
                    <>
                      <span className="ml-3 flex-1 text-left">{item.name}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          openDropdown[item.name] ? "rotate-180" : ""
                        }`}
                      />
                    </>
                  )}
                </button>

                {isOpen && openDropdown[item.name] && (
                  <div className="mt-1 space-y-1 pl-4">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.path}
                        to={subItem.path}
                        className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                          location.pathname === subItem.path
                            ? "bg-indigo-600 text-white"
                            : "text-indigo-200 hover:bg-indigo-800 hover:text-white"
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
                className={`flex items-center px-3 py-2.5 rounded-lg transition-colors text-sm ${
                  location.pathname === item.path
                    ? "bg-indigo-600 text-white"
                    : "hover:bg-indigo-800 text-indigo-100"
                }`}
              >
                <item.icon className="w-5 h-5 min-w-[1.25rem]" />
                {isOpen && <span className="ml-3">{item.name}</span>}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-indigo-800">
        
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          {isOpen && <span className="ml-2">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default React.memo(VendorSidebar);
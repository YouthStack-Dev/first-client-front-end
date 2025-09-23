import { LayoutDashboard, User, Users2,  UserCog, 
  UserPlus, Car, CarTaxiFront, Route, Building2, 
  Settings,
  Shield,
  MapPin,
  Briefcase,
  Clock,
  FileText,
  Layers,
  Target,
  BookOpen,
  Building,
  Truck
} from 'lucide-react';

export const menuItems = [
  // ================================
  // 📊 DASHBOARD SECTION
  // ================================
  { 
    path: '/admin_dashboard', 
    name: 'Admin Dashboard', 
    icon: LayoutDashboard, 
    permissionModule: 'admin_dashboard' 
  },
  { 
    path: '/company-dashboard', 
    name: 'Company Dashboard', 
    icon: LayoutDashboard, 
    permissionModule: 'company_dashboard' 
  },

  // ================================
  // 👥 USER MANAGEMENT SECTION
  // ================================
  { 
    name: 'User Management', 
    icon: User, 
    permissionModule: 'user_management', 
    subItems: [
      { 
        path: '/users', 
        name: 'Users', 
        icon: UserCog, 
        permissionModule: 'user_management' 
      },
      { 
        path: '/employees', 
        name: 'Employees', 
        icon: UserPlus, 
        permissionModule: 'employee_management' 
      }
    ]
  },

  // ================================
  // 🏢 ORGANIZATION MANAGEMENT
  // ================================
  { 
    path: '/departments', 
    name: 'Department Management', 
    icon: Building2, 
    permissionModule: 'department_management' 
  },
  
  { 
    path: '/groups', 
    name: 'Group Management', 
    icon: Users2, 
    permissionModule: 'group_management' 
  },

  { 
    path: '/mappings', 
    name: 'Mapping Management', 
    icon: MapPin, 
    permissionModule: 'mapping_management' 
  },

  // ================================
  // 🛡️ POLICY & SERVICE MANAGEMENT
  // ================================
  { 
    name: 'Policy Management', 
    icon: Shield, 
    permissionModule: 'policy_management',
    subItems: [
      { 
        path: '/policies', 
        name: 'Policies', 
        icon: FileText, 
        permissionModule: 'policy_management' 
      },
      { 
        path: '/policy-rules', 
        name: 'Policy Rules', 
        icon: Settings, 
        permissionModule: 'policy_management' 
      }
    ]
  },

  { 
    path: '/services', 
    name: 'Service Management', 
    icon: Settings, 
    permissionModule: 'service_management' 
  },

  { 
    path: '/tenants', 
    name: 'Tenant Management', 
    icon: Building, 
    permissionModule: 'tenant_management' 
  },

  // ================================
  // 🚗 FLEET MANAGEMENT
  // ================================
  { 
    name: 'Fleet Management', 
    icon: Car, 
    permissionModule: 'vehicle_management',
    subItems: [
      { 
        path: '/vehicles', 
        name: 'Vehicles', 
        icon: Car, 
        permissionModule: 'vehicle_management' 
      },
      { 
        path: '/vehicle-types', 
        name: 'Vehicle Types', 
        icon: Layers, 
        permissionModule: 'vehicle_type_management' 
      },
      { 
        path: '/drivers', 
        name: 'Drivers', 
        icon: CarTaxiFront, 
        permissionModule: 'driver_management' 
      }
    ]
  },

  // ================================
  // 🏪 VENDOR MANAGEMENT
  // ================================
  { 
    path: '/vendors', 
    name: 'Vendor Management', 
    icon: Briefcase, 
    permissionModule: 'vendor_management' 
  },

  // ================================
  // 🔄 OPERATIONS MANAGEMENT
  // ================================
  { 
    name: 'Operations', 
    icon: Route, 
    permissionModule: 'routing_management',
    subItems: [
      { 
        path: '/routing', 
        name: 'Routing Management', 
        icon: Route, 
        permissionModule: 'routing_management' 
      },
      { 
        path: '/tracking', 
        name: 'Tracking Management', 
        icon: MapPin, 
        permissionModule: 'tracking_management' 
      },
      { 
        path: '/bookings', 
        name: 'Booking Management', 
        icon: BookOpen, 
        permissionModule: 'booking_management' 
      }
    ]
  },

  // ================================
  // ⏰ SHIFT MANAGEMENT
  // ================================
  { 
    name: 'Shift Management', 
    icon: Clock, 
    permissionModule: 'shift_management',
    subItems: [
      { 
        path: '/manage-shift', 
        name: 'Manage Shifts', 
        icon: Clock, 
        permissionModule: 'shift_management' 
      },
      { 
        path: '/shift-categories', 
        name: 'Shift Categories', 
        icon: Layers, 
        permissionModule: 'shift_category' 
      },
      { 
        path: '/cutoff-settings', 
        name: 'Cutoff Settings', 
        icon: Target, 
        permissionModule: 'cutoff' 
      }
    ]
  }
];

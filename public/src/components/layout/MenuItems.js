import {
  LayoutDashboard,
  Users2,
  UserCog,
  Calendar,
  ClipboardList,
  CarTaxiFront,
  Building2,
  Route,
  MessageCircleCode
} from 'lucide-react';

// Module to menu item mapping
export const moduleMenuMap = {
  'admin_dashboard': { 
    path: '/dashboard', 
    name: 'Dashboard', 
    icon: LayoutDashboard 
  },
  'role_management': { 
    path: '/role-management', 
    name: 'Role Management', 
    icon: UserCog 
  },
  'scheduling_management': { 
    path: null, // Parent with children has no direct path
    name: 'Scheduling', 
    icon: Calendar 
  },
  'driver_management': { 
    path: '/manage-drivers', 
    name: 'Driver Management', 
    icon: CarTaxiFront 
  },
  'vendor_management': { 
    path: '/manage-vendors', 
    name: 'Vendor Management', 
    icon: Building2 
  },
  'routing': { 
    path: '/routing', 
    name: 'Routing', 
    icon: Route 
  },
  'tracking': { 
    path: '/tracking', 
    name: 'Tracking', 
    icon: MessageCircleCode 
  }
};

// Static menu items based on your modules
export const menuItems = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    icon: LayoutDashboard,
    permissionModule: 'admin_dashboard'
  },
  {
    path: '/role-management',
    name: 'Role Management',
    icon: UserCog,
    permissionModule: 'role_management'
  },
 {
        path: '/manage-shift',
        name: 'Scheduling',
        icon: Calendar,
        permissionModule: 'scheduling_management'
  },
  {
    path: '/manage-team',
    name: 'Department Management',
    icon: Calendar,
    permissionModule: 'department_management'
},
  {
    path: '/manage-drivers',
    name: 'Driver Management',
    icon: CarTaxiFront,
    permissionModule: 'driver_management'
  },
  {
    path: '/manage-vendors',
    name: 'Vendor Management',
    icon: Building2,
    permissionModule: 'vendor_management'
  },
  {
    path: '/routing',
    name: 'Routing',
    icon: Route,
    permissionModule: 'routing'
  },
  {
    path: '/tracking',
    name: 'Tracking',
    icon: MessageCircleCode,
    permissionModule: 'tracking'
  }
];

// For backward compatibility
export const generateMenuItems = () => {
  return menuItems;
};
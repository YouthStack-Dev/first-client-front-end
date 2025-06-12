import {
    LayoutDashboard,
    LogOut,
    User ,
    Users2,
    UserCog,
    UserPlus,
    Car,
    CarTaxiFront,
    Calendar,
    ClipboardList,
    Route ,
    Building2,
    ChevronDown,
    Pin,
    PinOff,
    MessageCircleCode
  } from 'lucide-react';
 
 export const menuItems = [
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: LayoutDashboard,
      permissionModule: 'Dashboard'
    },
    {
      name: 'User Management',
      icon: User,
      permissionModule: 'Manage Users',
      subItems: [
        {
          path: '/company-admins',
          name: 'Company Admins',
          icon: UserCog,
          permissionModule: 'Manage Company Admins'
        },
        {
          path: '/subadmins',
          name: 'Subadmins',
          icon: UserPlus,
          permissionModule: 'Manage Subadmins'
        }
      ]
    },
    {
      name: 'Manage Contracts',
      icon: ClipboardList,
      permissionModule: 'Manage Contracts',
      subItems: [
        {
          path: '/vehicle-contract',
          name: 'Vehicle Contract',
          icon: Car,
          permissionModule: 'Vehicle Contract'
        },
        {
          path: '/vendor-contract',
          name: 'Vendor Contract',
          icon: Building2,
          permissionModule: 'Vendor Contract'
        }
      ]
    },
    {
      name: 'Manage Vehicles',
      icon: Car,
      permissionModule: 'Manage Vehicles',
      subItems: [
        {
          path: '/vehicles',
          name: 'Vehicles',
          icon: CarTaxiFront,
          permissionModule: 'Vehicles'
        },
        {
          path: '/vehicle-group',
          name: 'Vehicle Type',
          icon: ClipboardList,
          permissionModule: 'Vehicle Type'
        }
      ]
    },
    {
      name: 'Scheduling Management',
      icon: Calendar,
      permissionModule: 'Scheduling Management',
      subItems: [
        {
          path: '/manage-shift',
          name: 'Manage Shift',
          icon: Calendar,
          permissionModule: 'Manage Shift'
        },
        {
          path: '/shift-categories',
          name: 'Manage Shift Categories',
          icon: ClipboardList,
          permissionModule: 'Manage Shift Categories'
        },
        {
          path: '/schedule-policies',
          name: 'Manage Schedule Policies',
          icon: ClipboardList,
          permissionModule: 'Manage Schedule Policies'
        }
      ]
    },
    {
      path: '/manage-team',
      name: 'Manage Team',
      icon: Users2,
      permissionModule: 'Manage Team'
    },
    {
      path: '/billings-dashbord',
      name: 'Manage Billing',
      icon: Users2,
      permissionModule: 'Manage Billing'
    },
    {
      path: '/role-management',
      name: 'Role Management',
      icon: Users2,
      permissionModule: 'Role Management'
    },
    {
      path: '/audit-report',
      name: 'Audit Report',
      icon: ClipboardList,
      permissionModule: 'Audit Report'
    },
    {
      path: '/drivers',
      name: 'Drivers',
      icon: CarTaxiFront,
      permissionModule: 'Manage Drivers'
    },
    {
      path: '/routing',
      name: 'Routing',
      icon: Route,
      permissionModule: 'Routing'
    },
    {
      path: '/vendors',
      name: 'Vendors',
      icon: Building2,
      permissionModule: 'Manage Vendors'
    },
    {
      path: '/bussiness-unit',
      name: 'Business Unit',
      icon: Building2,
      permissionModule: 'Manage Business Unit'
    },
    {
      path: '/staf-administration',
      name: 'Staff Administration',
      icon: Building2,
      permissionModule: 'Manage Staff'
    },
    {
      path: '/security-dashboard',
      name: 'Security Dashboard',
      icon: Building2,
      permissionModule: 'Security Dashboard'
    },
    {
      path: '/sms-config',
      name: 'SMS Config',
      icon: MessageCircleCode,
      permissionModule: 'SMS Config'
    }
  ];
  
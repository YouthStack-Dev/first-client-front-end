import {
  LayoutDashboard,
  User,
  Users2,
  UserCog,
  UserPlus,
  Car,
  CarTaxiFront,
  Calendar,
  ClipboardList,
  Route,
  Building2,

  MessageCircleCode
} from 'lucide-react';

export const menuItems = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    icon: LayoutDashboard,
    permissionModule: 'dashboard'
  },
  {
    name: 'User Management',
    icon: User,
    permissionModule: 'manageUsers',
    subItems: [
      {
        path: '/company-admins',
        name: 'Company Admins',
        icon: UserCog,
        permissionModule: 'companyAdmins'
      },
      {
        path: '/subadmins',
        name: 'Subadmins',
        icon: UserPlus,
        permissionModule: 'subadmins'
      }
    ]
  },
  {
    name: 'Manage Contracts',
    icon: ClipboardList,
    permissionModule: 'manageContracts',
    subItems: [
      {
        path: '/vehicle-contract',
        name: 'Vehicle Contract',
        icon: Car,
        permissionModule: 'vehicleContract'
      },
      {
        path: '/contracts',
        name: 'All Contracts',
        icon: Car,
        permissionModule: 'AllContracts' // ✅ Correct

      },

      // {
      //   path: '/vendor-contract',
      //   name: 'Vendor Contract',
      //   icon: Building2,
      //   permissionModule: 'vendorContract'
      // },
      {
        path: '/vehicle-contracts/adjustment-penalty',
        name: 'Adjustment & Penalty',
        icon: ClipboardList,
        permissionModule: 'adjustmentPenalty'
      },
      {
        path: '/vehicle-contracts/toll-management',
        name: 'Toll Management',
        icon: Route,
        permissionModule: 'tollManagement'
      },
      {
        path: '/vehicle-contracts/cost-center',
        name: 'Cost Center',
        icon: Building2,
        permissionModule: 'costCenter'
      },
      {
        path: '/vehicle-contracts/master-contracts',
        name: 'Master Contracts',
        icon: ClipboardList,
        permissionModule: 'showContractsInMaster'
      }
      
    ]
  },
  {
    name: 'Manage Vehicles',
    icon: Car,
    permissionModule: 'manageVehicles',
    subItems: [
      {
        path: '/vehicles',
        name: 'Vehicles',
        icon: CarTaxiFront,
        permissionModule: 'vehicles'
      },
      {
        path: '/vehicle-group',
        name: 'Vehicle Type',
        icon: ClipboardList,
        permissionModule: 'vehicleType'
      }
    ]
  },
  {
    name: 'Scheduling Management',
    icon: Calendar,
    permissionModule: 'SchedulingManagement',
    subItems: [
      {
        path: '/manage-shift',
        name: 'Manage Shift',
        icon: Calendar,
        permissionModule: 'manageShift'
      },
      {
        path: '/shift-categories',
        name: 'Manage Shift Categories',
        icon: ClipboardList,
        permissionModule: 'manageShiftCategories'
      },
      {
        path: '/schedule-policies',
        name: 'Manage Schedule Policies',
        icon: ClipboardList,
        permissionModule: 'manageSchedulePolicies'
      }
    ]
  },
  {
    path: '/manage-client',
    name: 'Manage Clients',
    icon: Users2,
    permissionModule: 'manageClients'
  },
  {
    path: '/manage-company',
    name: 'Manage Clients',
    icon: Users2,
    permissionModule: 'manageCompany'
  },
  {
    path: '/manage-team',
    name: 'Manage Team',
    icon: Users2,
    permissionModule: 'manageTeam'
  },
  {
    path: '/billings-dashboard',
    name: 'Manage Billing',
    icon: Users2,
    permissionModule: 'manageBilling'
  },
  {
    path: '/role-management',
    name: 'Role Management',
    icon: Users2,
    permissionModule: 'roleManagement'
  },
  {
    path: '/audit-report',
    name: 'Audit Report',
    icon: ClipboardList,
    permissionModule: 'auditReport'
  },
  {
    path: '/drivers',
    name: 'Drivers',
    icon: CarTaxiFront,
    permissionModule: 'drivers'
  },
  {
    path: '/routing',
    name: 'Routing',
    icon: Route,
    permissionModule: 'routing'
  },
  {
    path: '/vendors',
    name: 'Vendors',
    icon: Building2,
    permissionModule: 'vendors'
  },
  {
    path: '/business-unit',
    name: 'Business Unit',
    icon: Building2,
    permissionModule: 'businessUnit'
  },
  {
    path: '/staff-administration',
    name: 'Staff Administration',
    icon: Building2,
    permissionModule: 'staff'
  },
  {
    path: '/security-dashboard',
    name: 'Security Dashboard',
    icon: Building2,
    permissionModule: 'securityDashboard'
  },
  {
    path: '/sms-config',
    name: 'SMS Config',
    icon: MessageCircleCode,
    permissionModule: 'smsConfig'
  }
];
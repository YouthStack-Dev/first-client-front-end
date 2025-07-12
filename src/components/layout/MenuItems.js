import { LayoutDashboard, User, Users2, UserCog, UserPlus, Car, CarTaxiFront, Calendar, ClipboardList, Route, Building2, MessageCircleCode } from 'lucide-react';

export const menuItems = [
  { path: '/admin_dashboard', name: 'Dashboard', icon: LayoutDashboard, permissionModule: 'admin_dashboard' },
  { path: '/client_dashboard', name: 'Dashboard', icon: LayoutDashboard, permissionModule: 'client_dashboard' },
  { name: 'User Management', icon: User, permissionModule: 'manage-users', subItems: [
    { path: '/company-admins', name: 'Company Admins', icon: UserCog, permissionModule: 'company-admins' },
    { path: '/subadmins', name: 'Subadmins', icon: UserPlus, permissionModule: 'subadmins' }
  ]},
  { name: 'Manage Contracts', icon: ClipboardList, permissionModule: 'manage-contracts', subItems: [
    { path: '/vehicle-contract', name: 'Vehicle Contract', icon: Car, permissionModule: 'vehicle-contract' },
    { path: '/vendor-contract', name: 'Vendor Contract', icon: Building2, permissionModule: 'vendor-contract' },
    {
      path: '/vehicle-contracts/adjustment-penalty',
      name: 'Adjustment & Penalty',
      icon: ClipboardList,
      permissionModule: 'adjustment-penalty'
    },
    
    {
      path: '/vehicle-contracts/cost-center',
      name: 'Cost Center',
      icon: Building2,
      permissionModule: 'cost-center'
    },
    {
      path: '/vehicle-contracts/master-contracts',
      name: 'Master Contracts',
      icon: ClipboardList,
      permissionModule: 'show-contractsInMaster'
    }
  ]},
  { name: 'Scheduling Management', icon: Calendar, permissionModule: 'scheduling-management', subItems: [
   
  ]},
  { path: '/manage-client', name: 'Manage Clients', icon: Users2, permissionModule: 'manage-clients' },
  { path: '/manage-company', name: 'Manage Companies', icon: Users2, permissionModule: 'manage-company' },
  { path: '/manage-team', name: 'Manage Team', icon: Users2, permissionModule: 'department_management' },
  { path: '/bussiness-unit', name: 'Bussiness Unit', icon: Users2, permissionModule: 'bussiness-unit' },
  { path: '/billings-dashboard', name: 'Manage Billing', icon: Users2, permissionModule: 'manage-billing' },
  { path: '/role-management', name: 'Role Management', icon: Users2, permissionModule: 'role-management' },
  { path: '/audit-report', name: 'Audit Report', icon: ClipboardList, permissionModule: 'audit-report' },
  { path: '/drivers', name: 'Drivers', icon: CarTaxiFront, permissionModule: 'driver_management' },
  { path: '/routing', name: 'Routing', icon: Route, permissionModule: 'routing_management' },
  { path: '/tracking', name: 'Tracking', icon: Route, permissionModule: 'tracking_management' },
  { path: '/vendors', name: 'Vendors', icon: Building2, permissionModule: 'vendor_management' },
  { path: '/business-unit', name: 'Business Unit', icon: Building2, permissionModule: 'business-unit' },
  { path: '/staff-administration', name: 'Staff Administration', icon: Building2, permissionModule: 'staff' },
  { path: '/security-dashboard', name: 'Security Dashboard', icon: Building2, permissionModule: 'security-dashboard' },
  { path: '/sms-config', name: 'SMS Config', icon: MessageCircleCode, permissionModule: 'sms-config' },
  { path: '/vehicles', name: 'Vehicles', icon: CarTaxiFront, permissionModule: 'vehicle_management' },
  { path: '/vehicle-group', name: 'Vehicle Type', icon: ClipboardList, permissionModule: 'vehicle_type_management' },
  { path: '/manage-shift', name: 'Manage Shift', icon: Calendar, permissionModule: 'shift_management' },
  { path: '/shift-categories', name: 'Manage Shift Categories', icon: ClipboardList, permissionModule: 'shift_category' }
  
];

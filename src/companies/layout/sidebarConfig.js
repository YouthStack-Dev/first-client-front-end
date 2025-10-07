// sidebarConfig.js
import {
    Calendar,
    Users,
    UserCheck,
    MapPin,
    Route,
    Clock,
    Users2,
    Settings,
    Car,
    Truck,
    Store,
    UserCog,
    CalendarOff,
    Shield,
    FileText,
    Key
  } from 'lucide-react';
  
  // Base sidebar configuration
  export const baseSidebarConfig = [
    {
      title: 'Operations',
      items: [
        {
          title: 'Bookings',
          icon: Calendar,
           path: '/bookings',
           permission: 'booking.read',
           icon: Calendar
          
        },
        {
          title: 'Route Bookings',
          icon: Route,
          subItems: [
            { title: 'Route Booking List', path: '/route-bookings', permission: 'route-booking.read', icon: Route },
            { title: 'Create Route Booking', path: '/route-bookings/create', permission: 'route-booking.create', icon: Route }
          ]
        }
      ]
    },
    {
      title: 'Resources',
      items: [
        {
          title: 'Drivers',
          icon: Users,
          subItems: [
            { title: 'Driver List', path: '/drivers', permission: 'driver.read', icon: Users },
            { title: 'Add Driver', path: '/drivers/add', permission: 'driver.create', icon: Users }
          ]
        },
      
        {
          title: 'Vehicles',
          icon: Car,
          subItems: [
            { title: 'Vehicles', path: '/vehicles', permission: 'vehicle.read', icon: Car },
            // { title: 'Add Vehicle', path: '/vehicles/add', permission: 'vehicle.create', icon: Car }
          ]
        },
        {
          title: 'Vehicle Types',
          icon: Truck,
          subItems: [
            { title: 'Type List', path: '/vehicle-types', permission: 'vehicle-type.read', icon: Truck },
            { title: 'Add Type', path: '/vehicle-types/add', permission: 'vehicle-type.create', icon: Truck }
          ]
        }
      ]
    },
    {
      title: 'Management',
      items: [
        {
          title: 'Routes',
          icon: MapPin,
          subItems: [
            { title: 'Route Management', path: '/routes', permission: 'route.read', icon: MapPin },
            { title: 'Create Route', path: '/routes/create', permission: 'route.create', icon: MapPin }
          ]
        },
        {
          title: 'Shifts',
          icon: Clock,
          subItems: [
            { title: 'Shift Schedule', path: '/shifts', permission: 'shift.read', icon: Clock },
            // { title: 'Create Shift', path: '/shifts/create', permission: 'shift.create', icon: Clock }
          ]
        },
        
        {
          title: 'Teams',
          icon: Users2,
          path: '/departments', permission: 'team.read', icon: Users2,
        },
        {
          title: 'Vendors',
          icon: Store,
          subItems: [
            { title: 'Vendor List', path: '/vendors', permission: 'vendor.read', icon: Store },
            { title: 'Add Vendor', path: '/vendors/add', permission: 'vendor.create', icon: Store }
          ]
        },
        {
          title: 'Vendor Users',
          icon: UserCog,
          subItems: [
            { title: 'User List', path: '/vendor-users', permission: 'vendor-user.read', icon: UserCog },
            { title: 'Add User', path: '/vendor-users/add', permission: 'vendor-user.create', icon: UserCog }
          ]
        }
      ]
    },
    {
      title: 'Administration',
      items: [
        {
          title: 'Weekoff Config',
          icon: CalendarOff,
          subItems: [
            { title: 'Configuration', path: '/weekoff-config', permission: 'weekoff-config.read', icon: CalendarOff },
            { title: 'Manage Config', path: '/weekoff-config/manage', permission: 'weekoff-config.create', icon: CalendarOff }
          ]
        },
        {
          title: 'Permissions',
          icon: Key,
          subItems: [
            { title: 'Permission Matrix', path: '/permissions', permission: 'permissions.read', icon: Key },
            { title: 'Manage Permissions', path: '/permissions/manage', permission: 'permissions.create', icon: Key }
          ]
        },
        {
          title: 'Policies',
          icon: FileText,
          subItems: [
            { title: 'Policy List', path: '/policies', permission: 'policy.read', icon: FileText },
            { title: 'Create Policy', path: '/policies/create', permission: 'policy.create', icon: FileText }
          ]
        },
        {
          title: 'Roles',
          icon: Shield,
          subItems: [
            { title: 'Role Management', path: '/roles', permission: 'role.read', icon: Shield },
            { title: 'Create Role', path: '/roles/create', permission: 'role.create', icon: Shield }
          ]
        },
        {
          title: 'Tenant Settings',
          icon: Settings,
          subItems: [
            { title: 'Tenant Management', path: '/admin/tenant', permission: 'admin.tenant.read', icon: Settings },
            { title: 'Configure Tenant', path: '/admin/tenant/configure', permission: 'admin.tenant.create', icon: Settings }
          ]
        }
      ]
    }
  ];
  
  // Helper function to check if user has permission
  const hasPermission = (userPermissions, requiredPermission) => {
    if (!requiredPermission) return true; // No permission required
    
    const [module, action] = requiredPermission.split('.');
    const userModule = userPermissions.find(p => p.module === module);
    
    return userModule && userModule.action.includes(action);
  };
  
  // Filter sidebar based on user permissions
  export const getFilteredSidebar = (userPermissions) => {
    return baseSidebarConfig
      .map(group => ({
        ...group,
        items: group.items
          .map(item => ({
            ...item,
            subItems: item.subItems ? item.subItems.filter(subItem => 
              hasPermission(userPermissions, subItem.permission)
            ) : []
          }))
          .filter(item => item.subItems.length > 0 || (item.path && hasPermission(userPermissions, item.permission)))
      }))
      .filter(group => group.items.length > 0);
  };
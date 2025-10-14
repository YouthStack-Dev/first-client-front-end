// vendorSidebarConfig.js
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
  Key,
} from "lucide-react";

// Vendor-specific sidebar configuration
export const vendorSidebarConfig = [
  {
    title: "Operations",
    items: [
      {
        title: "Bookings",
        icon: Calendar,
        path: "/vendor/bookings",
        permission: "booking.read",
      },
      {
        title: "Route Bookings",
        icon: Route,
        subItems: [
          {
            title: "Route Booking List",
            path: "/vendor/route-bookings",
            permission: "route-booking.read",
            icon: Route,
          },
          {
            title: "Create Route Booking",
            path: "/vendor/route-bookings/create",
            permission: "route-booking.create",
            icon: Route,
          },
        ],
      },
    ],
  },
  {
    title: "Resources",
    items: [
      {
        title: "Manage Drivers",
        icon: Users,
        path: "/vendor/drivers",
        permission: "driver.read",
      },
      {
        title: "Vehicles",
        icon: Car,
        path: "/vendor/vehicles",
        permission: "vehicle.read",
      },
      {
        title: "Vehicle Types",
        icon: Truck,
        subItems: [
          {
            title: "Type List",
            path: "/vendor/vehicle-types",
            permission: "vehicle-type.read",
            icon: Truck,
          },
          {
            title: "Add Type",
            path: "/vendor/vehicle-types/add",
            permission: "vehicle-type.create",
            icon: Truck,
          },
        ],
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        title: "Routes",
        icon: MapPin,
        subItems: [
          {
            title: "Route Management",
            path: "/vendor/routing",
            permission: "route.read",
            icon: MapPin,
          },
          {
            title: "Create Route",
            path: "/vendor/routes/create",
            permission: "route.create",
            icon: MapPin,
          },
        ],
      },
      {
        title: "Shift Management",
        icon: Clock,
        path: "/vendor/shifts",
        permission: "shift.read",
      },
      {
        title: "Teams",
        icon: Users2,
        path: "/vendor/departments",
        permission: "team.read",
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        title: "Vendor Profile",
        icon: Store,
        subItems: [
          {
            title: "Profile Details",
            path: "/vendor/profile",
            permission: "vendor.read",
            icon: Store,
          },
          {
            title: "Update Profile",
            path: "/vendor/profile/update",
            permission: "vendor.update",
            icon: Store,
          },
        ],
      },
      {
        title: "Vendor Users",
        icon: UserCog,
        subItems: [
          {
            title: "User List",
            path: "/vendor/vendor-users",
            permission: "vendor-user.read",
            icon: UserCog,
          },
          {
            title: "Add User",
            path: "/vendor/vendor-users/add",
            permission: "vendor-user.create",
            icon: UserCog,
          },
        ],
      },
      {
        title: "Weekoff Config",
        icon: CalendarOff,
        subItems: [
          {
            title: "Configuration",
            path: "/vendor/weekoff-config",
            permission: "weekoff-config.read",
            icon: CalendarOff,
          },
          {
            title: "Manage Config",
            path: "/vendor/weekoff-config/manage",
            permission: "weekoff-config.create",
            icon: CalendarOff,
          },
        ],
      },
    ],
  },
];

// Helper function to check if user has permission
const hasPermission = (userPermissions, requiredPermission) => {
  if (!requiredPermission) return true; // No permission required

  const [module, action] = requiredPermission.split(".");
  const userModule = userPermissions.find((p) => p.module === module);

  return userModule && userModule.action.includes(action);
};

// Filter sidebar based on user permissions
export const getFilteredVendorSidebar = (userPermissions) => {
  return vendorSidebarConfig
    .map((group) => ({
      ...group,
      items: group.items
        .map((item) => ({
          ...item,
          subItems: item.subItems
            ? item.subItems.filter((subItem) =>
                hasPermission(userPermissions, subItem.permission)
              )
            : [],
        }))
        .filter(
          (item) =>
            item.subItems.length > 0 ||
            (item.path && hasPermission(userPermissions, item.permission))
        ),
    }))
    .filter((group) => group.items.length > 0);
};

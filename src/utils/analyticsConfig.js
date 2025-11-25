import {
  Calendar,
  Clock,
  MapPin,
  TrendingUp,
  Users,
  CheckCircle,
} from "lucide-react";

export const analyticsConfig = {
  bookings: {
    title: "Bookings Analytics",
    primaryColor: "from-blue-500 to-blue-600",
    metrics: [
      {
        key: "total_bookings",
        label: "Total Bookings",
        icon: Calendar,
        color: "blue",
      },
      {
        key: "completion_rate",
        label: "Completion Rate",
        icon: TrendingUp,
        color: "green",
        format: (value) => `${value}%`,
      },
      {
        key: "routing_summary.routing_percentage",
        label: "Routing Rate",
        icon: MapPin,
        color: "purple",
        format: (value) => `${value}%`,
      },
      {
        key: "total_shifts",
        label: "Total Shifts",
        icon: Clock,
        color: "orange",
      },
    ],
  },
  routes: {
    title: "Routes Analytics",
    primaryColor: "from-green-500 to-green-600",
    metrics: [
      {
        key: "routing_summary.routed",
        label: "Routed Bookings",
        icon: MapPin,
        color: "green",
      },
      {
        key: "completion_rate",
        label: "Completion Rate",
        icon: CheckCircle,
        color: "blue",
        format: (value) => `${value}%`,
      },
      {
        key: "assignment_summary.driver_assignment_percentage",
        label: "Driver Assignment %",
        icon: Users,
        color: "purple",
        format: (value) => `${value}%`,
      },
      {
        key: "assignment_summary.vendor_assignment_percentage",
        label: "Vendor Assignment %",
        icon: Users,
        color: "orange",
        format: (value) => `${value}%`,
      },
    ],
  },
  vendors: {
    title: "Vendors Analytics",
    primaryColor: "from-purple-500 to-purple-600",
    metrics: [
      {
        key: "assignment_summary.vendor_assigned",
        label: "Vendor Assigned",
        icon: Users,
        color: "purple",
      },
      {
        key: "assignment_summary.vendor_assignment_percentage",
        label: "Assignment Rate",
        icon: TrendingUp,
        color: "blue",
        format: (value) => `${value}%`,
      },
      {
        key: "routing_summary.routing_percentage",
        label: "Routing Success %",
        icon: MapPin,
        color: "green",
        format: (value) => `${value}%`,
      },
      {
        key: "completion_rate",
        label: "Completion Rate",
        icon: CheckCircle,
        color: "orange",
        format: (value) => `${value}%`,
      },
    ],
  },
  drivers: {
    title: "Drivers Analytics",
    primaryColor: "from-orange-500 to-orange-600",
    metrics: [
      {
        key: "assignment_summary.driver_assigned",
        label: "Driver Assigned",
        icon: Users,
        color: "orange",
      },
      {
        key: "assignment_summary.driver_assignment_percentage",
        label: "Assignment Rate",
        icon: TrendingUp,
        color: "blue",
        format: (value) => `${value}%`,
      },
      {
        key: "completion_rate",
        label: "Completion Rate",
        icon: CheckCircle,
        color: "green",
        format: (value) => `${value}%`,
      },
      {
        key: "total_bookings",
        label: "Total Bookings",
        icon: Calendar,
        color: "purple",
      },
    ],
  },
  shifts: {
    title: "Shifts Analytics",
    primaryColor: "from-indigo-500 to-indigo-600",
    metrics: [
      {
        key: "total_shifts",
        label: "Total Shifts",
        icon: Clock,
        color: "indigo",
      },
      {
        key: "total_bookings",
        label: "Total Bookings",
        icon: Calendar,
        color: "blue",
      },
      {
        key: "completion_rate",
        label: "Completion Rate",
        icon: CheckCircle,
        color: "green",
        format: (value) => `${value}%`,
      },
      {
        key: "routing_summary.routing_percentage",
        label: "Routing Rate",
        icon: MapPin,
        color: "purple",
        format: (value) => `${value}%`,
      },
    ],
  },
};

// Color configuration for different UI elements
export const colorConfig = {
  statCard: {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    red: "from-red-500 to-red-600",
    indigo: "from-indigo-500 to-indigo-600",
  },
  progressBar: {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
    red: "bg-red-500",
  },
  statusIndicator: {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
    red: "bg-red-500",
    yellow: "bg-yellow-500",
    indigo: "bg-indigo-500",
  },
};

// Status color mappings
export const statusColors = {
  booking_status_breakdown: {
    Request: "bg-blue-500",
    Scheduled: "bg-purple-500",
    Completed: "bg-green-500",
    Cancelled: "bg-red-500",
  },
  route_status_breakdown: {
    Pending: "bg-yellow-500",
    "In Progress": "bg-blue-500",
    Completed: "bg-green-500",
    Cancelled: "bg-red-500",
  },
};

// Helper function to get nested value from object
export const getNestedValue = (obj, path, defaultValue = 0) => {
  const keys = path.split(".");
  let value = obj;
  for (const key of keys) {
    value = value?.[key];
    if (value === undefined || value === null) return defaultValue;
  }
  return value;
};

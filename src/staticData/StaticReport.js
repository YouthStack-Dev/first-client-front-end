import { Calendar, MapPin, TrendingUp, Users } from "lucide-react";

export const reportModules = [
  {
    id: "bookings",
    title: "Booking Reports",
    description: "Track and analyze booking data",
    icon: Calendar,
    color: "blue",
  },
];

export const REPORT_TYPES = {
  BOOKING: "bookings",
  ROUTE: "route",
  VENDOR: "vendor",
  DRIVER: "driver",
};

export const BOOKING_STATUS_OPTIONS = [
  "Request",
  "Scheduled",
  "Confirmed",
  "Completed",
  "Cancelled",
];
export const ROUTE_STATUS_OPTIONS = [
  "Pending",
  "In Progress",
  "Completed",
  "Cancelled",
];

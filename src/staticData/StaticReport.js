import { Calendar, Clock, Truck } from "lucide-react";

export const reportModules = [
  {
    id: "bookings",
    title: "Booking Reports",
    description: "Track and analyze booking data",
    icon: Calendar,
    color: "blue",
    hasDownload: true,
    hasAnalytics: true,
  },
  {
    id: "delays",
    title: "Delay Reports",
    description: "Monitor OTD delays and root causes",
    icon: Clock,
    color: "orange",
    hasDownload: false,
    hasAnalytics: true,
  },
  {
    id: "driver-duty-hours",
    title: "Driver Duty Hours",
    description: "Track driver hours and rest violations",
    icon: Truck,
    color: "purple",
    hasDownload: false,
    hasAnalytics: true,
  },
];

export const REPORT_TYPES = {
  BOOKINGS: "bookings",
  DELAYS: "delays",
  DRIVER_DUTY: "driver-duty-hours",
};

export const BOOKING_STATUS_OPTIONS = [
  "Request",
  "Scheduled",
  "Ongoing",
  "Completed",
  "Cancelled",
  "No-Show",
  "Expired",
];

export const ROUTE_STATUS_OPTIONS = [
  "Planned",
  "Vendor Assigned",
  "Driver Assigned",
  "Ongoing",
  "Completed",
  "Cancelled",
];

export const DELAY_TYPE_OPTIONS = [
  "LATE",
  "EARLY",
  "ON_TIME",
];

export const DELAY_CATEGORY_OPTIONS = [
  "DRIVER_DELAY",
  "EMPLOYEE_DELAY",
  "TRAFFIC_DELAY",
  "NONE",
];
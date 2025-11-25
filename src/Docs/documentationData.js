import { Zap, Shield, MapPin } from "lucide-react";

export const documentationData = {
  routing: {
    title: "Routing Module",
    icon: MapPin,
    color: "purple",
    actions: {
      createRoute: {
        title: "Create New Route",
        description:
          "Learn how to create and configure new routes in the GoCab system. This comprehensive guide will walk you through the entire process of setting up efficient transportation routes.",
        overview:
          "The route creation feature allows you to design custom transportation routes with multiple stops, optimize travel time, and assign vehicles efficiently. This is essential for managing regular transportation schedules and ensuring timely pickups.",
        guidelines: [
          "Ensure all pickup and drop-off locations are accurately marked on the map",
          "Verify that the route doesn't exceed the maximum distance limit of 100km",
          "Add buffer time between stops to account for traffic conditions",
          "Assign appropriate vehicle types based on passenger capacity requirements",
          "Review and save route details before finalizing",
        ],
        steps: [
          "Click on 'Create New Route' button from the dashboard",
          "Enter route name and select the operational days",
          "Add pickup points by clicking on the map or entering addresses",
          "Set estimated time for each stop",
          "Assign vehicles and drivers to the route",
          "Preview the complete route and save",
        ],
        tips: [
          "Use the route optimization feature to minimize travel time",
          "Consider peak traffic hours when scheduling routes",
          "Always add 10-15% buffer time for unexpected delays",
        ],
        content: [
          {
            type: "supademo",
            title: "Route Creation Walkthrough",
            url: "https://app.supademo.com/embed/cmhxgtsie3e0817y0xv430j95?embed_v=2",
            description:
              "Step-by-step interactive guide to creating a new route",
          },
          {
            type: "image",
            title: "Route Dashboard Interface",
            url: "/docs/booking.jpg",
            description:
              "Overview of the route creation interface showing all key features",
          },
          {
            type: "supademo",
            title: "Adding Multiple Stops",
            url: "https://app.supademo.com/embed/cmhxgtsie3e0817y0xv430j95?embed_v=2",
            description:
              "How to add and manage multiple pickup/drop-off points",
          },
        ],
      },
      optimizeRoute: {
        title: "Optimize Route",
        description:
          "Optimize your existing routes for better efficiency, reduced travel time, and cost savings using AI-powered route optimization.",
        overview:
          "Route optimization analyzes your current routes and suggests improvements based on traffic patterns, distance, and time constraints. This feature can reduce fuel costs by up to 30% and improve on-time performance.",
        guidelines: [
          "Run optimization during off-peak hours for faster processing",
          "Review suggested changes before applying them",
          "Consider driver preferences and constraints",
          "Test optimized routes with a pilot group first",
        ],
        steps: [
          "Select the route you want to optimize",
          "Click on 'Optimize Route' button",
          "Review the optimization suggestions",
          "Apply changes or make manual adjustments",
          "Save the optimized route",
        ],
        tips: [
          "Optimization works best with routes having 5+ stops",
          "Run optimization weekly to adapt to changing traffic patterns",
        ],
        content: [
          {
            type: "supademo",
            title: "Route Optimization Demo",
            url: "https://app.supademo.com/embed/cmhxgtsie3e0817y0xv430j95?embed_v=2",
            description:
              "Complete walkthrough of the route optimization feature",
          },
          {
            type: "image",
            title: "Before and After Optimization",
            url: "/docs/booking.jpg",
            description: "Visual comparison showing route improvements",
          },
        ],
      },
    },
  },
  booking: {
    title: "Booking Module",
    icon: Zap,
    color: "blue",
    actions: {
      createBooking: {
        title: "Create Booking",
        description:
          "Create new cab bookings for customers with ease. This feature supports both immediate and scheduled bookings.",
        overview:
          "The booking system allows you to create reservations for customers, assign vehicles, and manage pickup/drop-off details efficiently.",
        guidelines: [
          "Verify customer contact information before confirming",
          "Check vehicle availability for the requested time slot",
          "Confirm pickup address accuracy with the customer",
          "Send booking confirmation via SMS and email",
        ],
        steps: [
          "Enter customer details and contact information",
          "Select pickup and drop-off locations",
          "Choose booking type (immediate or scheduled)",
          "Select vehicle type based on requirements",
          "Review booking details and confirm",
        ],
        tips: [
          "Use address autocomplete to avoid errors",
          "For corporate bookings, check if customer has active corporate account",
        ],
        content: [
          {
            type: "supademo",
            title: "Booking Process",
            url: "https://app.supademo.com/embed/cmhxgtsie3e0817y0xv430j95?embed_v=2",
            description: "Complete booking workflow demonstration",
          },
          {
            type: "image",
            title: "Booking Form",
            url: "/docs/booking.jpg",
            description: "Detailed view of the booking form interface",
          },
        ],
      },
    },
  },
  tracking: {
    title: "Tracking Module",
    icon: Shield,
    color: "green",
    actions: {
      liveTracking: {
        title: "Live Tracking",
        description: "Monitor vehicles in real-time",
        overview:
          "The tracking system provides real-time visibility of all active vehicles on the map.",
        guidelines: [
          "Ensure GPS is enabled on all vehicles",
          "Check connection status regularly",
        ],
        steps: [
          "Open tracking dashboard",
          "Select vehicle to track",
          "View real-time location",
        ],
        tips: ["Use filters to view specific routes or vehicles"],
        content: [
          {
            type: "supademo",
            title: "Real-time Tracking",
            url: "https://app.supademo.com/embed/cmhxgtsie3e0817y0xv430j95?embed_v=2",
            description: "Track all vehicles on the map",
          },
        ],
      },
    },
  },
};

export const colorClasses = {
  purple: {
    bg: "bg-purple-100",
    text: "text-purple-600",
    border: "border-purple-200",
    hover: "hover:bg-purple-50",
  },
  blue: {
    bg: "bg-blue-100",
    text: "text-blue-600",
    border: "border-blue-200",
    hover: "hover:bg-blue-50",
  },
  green: {
    bg: "bg-green-100",
    text: "text-green-600",
    border: "border-green-200",
    hover: "hover:bg-green-50",
  },
};

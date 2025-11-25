import { useCallback, useState } from "react";

export const useRouteDirections = () => {
  const getRouteColor = useCallback((routeIndex) => {
    const ROUTE_COLORS = [
      "#2563eb",
      "#dc2626",
      "#16a34a",
      "#9333ea",
      "#ea580c",
      "#0891b2",
      "#ca8a04",
      "#db2777",
    ];
    return ROUTE_COLORS[routeIndex % ROUTE_COLORS.length];
  }, []);

  const getBookingColor = useCallback((bookingIndex) => {
    const BOOKING_COLORS = ["#f59e0b", "#84cc16", "#06b6d4", "#8b5cf6"];
    return BOOKING_COLORS[bookingIndex % BOOKING_COLORS.length];
  }, []);

  return {
    getRouteColor,
    getBookingColor,
  };
};

export const useSelection = () => {
  const [selectedRoutes, setSelectedRoutes] = useState(new Set());
  const [selectedBookings, setSelectedBookings] = useState(new Set());

  const handleRouteSelect = useCallback((routeId) => {
    setSelectedRoutes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(routeId)) {
        newSet.delete(routeId);
      } else {
        newSet.add(routeId);
      }
      return newSet;
    });
  }, []);

  const handleBookingSelect = useCallback((bookingId) => {
    setSelectedBookings((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(bookingId)) newSet.delete(bookingId);
      else newSet.add(bookingId);
      return newSet;
    });
  }, []);

  const clearAllSelections = useCallback(() => {
    setSelectedRoutes(new Set());
    setSelectedBookings(new Set());
  }, []);

  return {
    selectedRoutes,
    selectedBookings,
    handleRouteSelect,
    handleBookingSelect,
    clearAllSelections,
  };
};

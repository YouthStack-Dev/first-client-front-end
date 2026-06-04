// src/hooks/useRouteWaypoints.js

import { useState, useEffect, useCallback } from "react";
import { API_CLIENT } from "../Api/API_Client";

/**
 * Hook to fetch and cache route waypoints from the backend
 * Returns { waypoints, loading, error }
 */
export const useRouteWaypoints = (routeId, tenantId) => {
  const [waypoints, setWaypoints] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!routeId || !tenantId) {
      setWaypoints(null);
      return;
    }

    const fetchWaypoints = async () => {
      setLoading(true);
      setError(null);
      try {
        // Adjust the endpoint based on your API
        const response = await API_CLIENT.get(`/routes/${routeId}`, {
          params: { tenant_id: tenantId },
        });

        // Expected response should have bookings or waypoints array
        // Adapt based on your actual API response structure
        const routeData = response?.data;
        
        if (routeData?.bookings) {
          // If API returns bookings, extract waypoints
          const wps = [];
          
          // Add pickup from first booking
          if (routeData.bookings[0]) {
            const first = routeData.bookings[0];
            if (first.pickup_latitude != null && first.pickup_longitude != null) {
              wps.push({
                lat: parseFloat(first.pickup_latitude),
                lng: parseFloat(first.pickup_longitude),
                type: "pickup",
                bookingId: first.booking_id,
                location: first.pickup_location,
              });
            }
          }

          // Add drops
          routeData.bookings.forEach((booking) => {
            if (booking.drop_latitude != null && booking.drop_longitude != null) {
              wps.push({
                lat: parseFloat(booking.drop_latitude),
                lng: parseFloat(booking.drop_longitude),
                type: "drop",
                bookingId: booking.booking_id,
                location: booking.drop_location,
              });
            }
          });

          setWaypoints(wps);
        } else if (routeData?.waypoints) {
          // If API returns waypoints directly
          setWaypoints(routeData.waypoints);
        }
      } catch (err) {
        console.error("[useRouteWaypoints]", err);
        setError(err?.message || "Failed to fetch route waypoints");
      } finally {
        setLoading(false);
      }
    };

    fetchWaypoints();
  }, [routeId, tenantId]);

  return { waypoints, loading, error };
};

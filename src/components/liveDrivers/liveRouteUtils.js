import { haversineKm } from "./liveDriverHelpers";

/**
 * Calculate minimum distance from point to line segment (in km)
 */
export const distanceToLineSegment = (point, segStart, segEnd) => {
  const { lat: px, lng: py } = point;
  const { lat: x1, lng: y1 } = segStart;
  const { lat: x2, lng: y2 } = segEnd;

  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;

  let param = -1;
  if (lenSq !== 0) param = dot / lenSq;

  let xx, yy;
  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = px - xx;
  const dy = py - yy;
  // Convert to km (rough approximation: 1 degree ≈ 111 km)
  return Math.sqrt(dx * dx + dy * dy) * 111;
};

/**
 * Check if driver is on assigned route.
 * Returns { isOnRoute, status, nearestStop, distanceToRoute }
 */
export const checkIfOnRoute = (
  driverLat,
  driverLng,
  routeWaypoints = [],
  onRouteThresholdKm = 2,
) => {
  if (!routeWaypoints || routeWaypoints.length === 0) {
    return {
      isOnRoute: null,
      status: "no-route",
      nearestStop: null,
      distanceToRoute: null,
    };
  }

  const driverPos = { lat: driverLat, lng: driverLng };

  // Find nearest waypoint
  let minDistToWaypoint = Infinity;
  let nearestStop = null;

  routeWaypoints.forEach((wp, idx) => {
    const dist = haversineKm(driverLat, driverLng, wp.lat, wp.lng);
    if (dist < minDistToWaypoint) {
      minDistToWaypoint = dist;
      nearestStop = { ...wp, index: idx, distance: dist };
    }
  });

  // Check distance to nearest line segment
  let minDistToLine = Infinity;
  for (let i = 0; i < routeWaypoints.length - 1; i++) {
    const dist = distanceToLineSegment(
      driverPos,
      routeWaypoints[i],
      routeWaypoints[i + 1],
    );
    minDistToLine = Math.min(minDistToLine, dist);
  }

  const isOnRoute = minDistToLine <= onRouteThresholdKm;
  const status = isOnRoute ? "on-route" : "off-route";

  return { isOnRoute, status, nearestStop, distanceToRoute: minDistToLine };
};

/**
 * Build waypoints array from route bookings.
 */
export const buildRouteWaypoints = (routeBookings = []) => {
  if (!Array.isArray(routeBookings) || routeBookings.length === 0) return [];

  const waypoints = [];
  const firstBooking = routeBookings[0];

  if (
    firstBooking?.pickup_latitude != null &&
    firstBooking?.pickup_longitude != null
  ) {
    waypoints.push({
      lat: parseFloat(firstBooking.pickup_latitude),
      lng: parseFloat(firstBooking.pickup_longitude),
      type: "pickup",
      bookingId: firstBooking.booking_id,
      location: firstBooking.pickup_location,
    });
  }

  routeBookings.forEach((booking) => {
    if (booking?.drop_latitude != null && booking?.drop_longitude != null) {
      waypoints.push({
        lat: parseFloat(booking.drop_latitude),
        lng: parseFloat(booking.drop_longitude),
        type: "drop",
        bookingId: booking.booking_id,
        location: booking.drop_location,
      });
    }
  });

  return waypoints;
};

/**
 * Color based on route status.
 */
export const routeStatusColor = (status) => {
  const colors = {
    "on-route": "#22c55e",
    "off-route": "#ef4444",
    "no-route": "#64748b",
  };
  return colors[status] || colors["no-route"];
};

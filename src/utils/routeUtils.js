export const getRouteCoordinates = (route, logType) => {
  const tenant = {
    lat: route.tenant.latitude,
    lng: route.tenant.longitude,
  };

  const waypoints = route.stops.map((stop) => ({
    lat: logType === "OUT" ? stop.drop_latitude : stop.pickup_latitude,
    lng: logType === "OUT" ? stop.drop_longitude : stop.pickup_longitude,
  }));

  const origin = logType === "OUT" ? tenant : waypoints[0] || tenant;
  const destination =
    logType === "OUT" ? waypoints[waypoints.length - 1] || tenant : tenant;

  return { origin, destination, waypoints };
};

export const findBookingById = (bookingId, unroutedBookings, routeData) => {
  return [...unroutedBookings, ...routeData.flatMap((r) => r.stops)].find(
    (b) => b.booking_id === bookingId
  );
};

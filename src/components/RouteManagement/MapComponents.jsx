import { Marker } from "@vis.gl/react-google-maps";
import DirectionsLayer from "./DirectionsLayer";

export const CompanyMarker = ({ position }) => (
  <Marker
    position={position}
    title="Company Location"
    icon={{
      url:
        "data:image/svg+xml;base64," +
        btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="15" fill="#1f2937" stroke="#ffffff" stroke-width="2"/>
          <text x="16" y="20" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="12">HQ</text>
        </svg>
      `),
    }}
  />
);

export const SelectionSummary = ({
  selectedRoutes,
  selectedBookings,
  onClearAll,
}) => {
  if (selectedRoutes.size === 0 && selectedBookings.size === 0) return null;

  return (
    <div className="flex items-center justify-between mb-2 p-3 bg-gray-50 rounded-lg">
      <div className="flex space-x-4">
        {selectedRoutes.size > 0 && (
          <span className="text-sm text-purple-600 font-bold px-3 py-1 bg-purple-50 rounded-full">
            {selectedRoutes.size} route{selectedRoutes.size > 1 ? "s" : ""}{" "}
            selected
          </span>
        )}
        {selectedBookings.size > 0 && (
          <span className="text-sm text-amber-600 font-bold px-3 py-1 bg-amber-50 rounded-full">
            {selectedBookings.size} booking
            {selectedBookings.size > 1 ? "s" : ""} selected
          </span>
        )}
      </div>
      <button
        onClick={onClearAll}
        className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1"
      >
        Clear All
      </button>
    </div>
  );
};

export const BookingDirections = ({ booking, color, bookingIndex }) => {
  if (!booking) return null;

  const origin = {
    lat: booking.pickup_latitude,
    lng: booking.pickup_longitude,
  };

  const destination = {
    lat: booking.drop_latitude,
    lng: booking.drop_longitude,
  };

  return (
    <DirectionsLayer
      key={`booking-${booking.booking_id}`}
      origin={origin}
      destination={destination}
      color={color}
      bookingId={booking.booking_id}
    />
  );
};

export const BookingMarkers = ({ booking, color, bookingIndex }) => {
  if (!booking) return null;

  return (
    <>
      <Marker
        key={`pickup-${booking.booking_id}`}
        position={{
          lat: booking.pickup_latitude,
          lng: booking.pickup_longitude,
        }}
        title={`Booking: ${booking.booking_id} | Pickup: ${booking.pickup_location}`}
        label={{
          text: "P",
          color: "#ffffff",
          fontWeight: "bold",
        }}
        icon={{
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        }}
      />
      <Marker
        key={`drop-${booking.booking_id}`}
        position={{
          lat: booking.drop_latitude,
          lng: booking.drop_longitude,
        }}
        title={`Booking: ${booking.booking_id} | Drop: ${booking.drop_location}`}
        label={{
          text: "D",
          color: "#ffffff",
          fontWeight: "bold",
        }}
        icon={{
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        }}
      />
    </>
  );
};

export const RouteDirections = ({ route, logType, color, routeIndex }) => {
  if (!route) return null;

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

  return (
    <DirectionsLayer
      key={`route-${route.route_id}`}
      origin={origin}
      destination={destination}
      waypoints={waypoints}
      color={color}
      routeId={route.route_id}
    />
  );
};

export const RouteMarkers = ({ route, logType, color, routeIndex }) => {
  if (!route) return null;

  const tenant = {
    lat: route.tenant.latitude,
    lng: route.tenant.longitude,
  };

  return (
    <>
      {/* Tenant marker */}
      <Marker
        key={`tenant-${route.route_id}`}
        position={tenant}
        title={`Route: ${route.route_id} | Tenant Location`}
        label={{
          text: "T",
          color: "#ffffff",
          fontWeight: "bold",
        }}
        icon={{
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        }}
      />

      {/* Route stops */}
      {route.stops.map((stop, index) => {
        const labelPrefix = logType === "OUT" ? "D" : "P";
        const labelText = `${labelPrefix}${index + 1}`;

        return (
          <Marker
            key={`stop-${route.route_id}-${stop.booking_id}`}
            position={{
              lat:
                logType === "OUT" ? stop.drop_latitude : stop.pickup_latitude,
              lng:
                logType === "OUT" ? stop.drop_longitude : stop.pickup_longitude,
            }}
            title={`Route: ${route.route_id} | Stop ${index + 1}: ${
              logType === "OUT" ? stop.drop_location : stop.pickup_location
            }`}
            label={{
              text: labelText,
              color: "#ffffff",
              fontWeight: "bold",
            }}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: color,
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            }}
          />
        );
      })}
    </>
  );
};

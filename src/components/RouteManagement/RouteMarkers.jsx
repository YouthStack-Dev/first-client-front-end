import React from "react";
import { Marker } from "@vis.gl/react-google-maps";
import { getRouteColor } from "./DirectionsRenderer";

const RouteMarkers = ({ routes = [], selectedRouteIds = new Set() }) => {
  if (!routes.length || selectedRouteIds.size === 0) return null;

  return (
    <>
      {routes
        .filter((route) => selectedRouteIds.has(route.route_id))
        .map((route) =>
          route.stops?.map((stop, index) => (
            <React.Fragment
              key={`${route.route_id}-${stop.booking_id}-${index}`}
            >
              {/* Pickup Marker */}
              <Marker
                position={{
                  lat: stop.pickup_latitude,
                  lng: stop.pickup_longitude,
                }}
                title={`Pickup: ${stop.pickup_location}`}
                icon={{
                  url:
                    "data:image/svg+xml;base64," +
                    btoa(`
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="10" cy="10" r="8" fill="${getRouteColor(
                        route.route_id
                      )}" stroke="white" stroke-width="2"/>
                    </svg>
                  `),
                  scaledSize: new window.google.maps.Size(20, 20),
                  anchor: new window.google.maps.Point(10, 10),
                }}
              />

              {/* Drop Marker */}
              <Marker
                position={{
                  lat: stop.drop_latitude,
                  lng: stop.drop_longitude,
                }}
                title={`Drop: ${stop.drop_location}`}
                icon={{
                  url:
                    "data:image/svg+xml;base64," +
                    btoa(`
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="${getRouteColor(
                        route.route_id
                      )}"/>
                      <circle cx="12" cy="9" r="1.5" fill="white"/>
                    </svg>
                  `),
                  scaledSize: new window.google.maps.Size(24, 24),
                  anchor: new window.google.maps.Point(12, 12),
                }}
              />
            </React.Fragment>
          ))
        )}
    </>
  );
};

export default RouteMarkers;

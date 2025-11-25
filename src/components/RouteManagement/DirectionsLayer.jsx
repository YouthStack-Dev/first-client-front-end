import { useEffect, useRef } from "react";
import { useMap } from "@vis.gl/react-google-maps";

export const DirectionsLayer = ({
  origin,
  destination,
  waypoints = [],
  color = "#2563eb",
  routeId,
  bookingId,
}) => {
  const map = useMap();
  const directionsRef = useRef(null);
  const infoWindowRef = useRef(null);

  useEffect(() => {
    if (!map || !window.google || !origin || !destination) return;

    if (!directionsRef.current) {
      directionsRef.current = new window.google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true,
        preserveViewport: true,
        polylineOptions: {
          strokeColor: color,
          strokeOpacity: 0.8,
          strokeWeight: 6,
        },
      });
    }

    const directionsService = new window.google.maps.DirectionsService();
    const request = {
      origin: new window.google.maps.LatLng(origin.lat, origin.lng),
      destination: new window.google.maps.LatLng(
        destination.lat,
        destination.lng
      ),
      waypoints: waypoints.map((wp) => ({
        location: new window.google.maps.LatLng(wp.lat, wp.lng),
        stopover: true,
      })),
      travelMode: window.google.maps.TravelMode.DRIVING,
      optimizeWaypoints: true,
    };

    directionsService.route(request, (result, status) => {
      if (
        status === window.google.maps.DirectionsStatus.OK &&
        directionsRef.current
      ) {
        directionsRef.current.setDirections(result);
        createRouteLabel(result, color, routeId, bookingId);
      } else {
        console.error("Directions request failed:", status);
      }
    });

    return () => {
      cleanupDirections();
    };
  }, [map, origin, destination, waypoints, color, routeId, bookingId]);

  const createRouteLabel = (result, color, routeId, bookingId) => {
    const route = result.routes[0];
    if (!route?.overview_path?.length) return;

    // Clean up previous info window
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }

    const middleIndex = Math.floor(route.overview_path.length / 2);
    const middlePoint = route.overview_path[middleIndex];

    // Shortened label text
    const labelText = routeId ? `R:${routeId}` : `B:${bookingId}`;

    infoWindowRef.current = new window.google.maps.InfoWindow({
      content: `
        <div style="
          color: ${color}; 
          background: white; 
          border: 1px solid ${color}; 
          border-radius: 3px; 
          padding: 2px 6px; 
          font-size: 10px; 
          font-weight: bold;
          white-space: nowrap;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        ">
          ${labelText}
        </div>
      `,
      position: middlePoint,
      pixelOffset: new window.google.maps.Size(0, -10), // Slightly offset from the line
    });

    infoWindowRef.current.open(map);
  };

  const cleanupDirections = () => {
    if (directionsRef.current) {
      directionsRef.current.setMap(null);
      directionsRef.current = null;
    }
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
      infoWindowRef.current = null;
    }
  };

  return null;
};

export default DirectionsLayer;

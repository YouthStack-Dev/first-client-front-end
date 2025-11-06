import { useEffect, useRef } from "react";
import { useMap } from "@vis.gl/react-google-maps";

const RouteRenderer = ({ routes, routeWidth, onRouteDistanceCalculated }) => {
  const map = useMap();
  const directionsRenderersRef = useRef([]);
  const directionsServiceRef = useRef(null);

  useEffect(() => {
    if (!directionsServiceRef.current && window.google?.maps) {
      directionsServiceRef.current = new google.maps.DirectionsService();
    }

    directionsRenderersRef.current.forEach((renderer) => {
      renderer.setMap(null);
    });
    directionsRenderersRef.current = [];

    if (
      !map ||
      !routes ||
      routes.length === 0 ||
      !directionsServiceRef.current
    ) {
      onRouteDistanceCalculated && onRouteDistanceCalculated(0);
      return;
    }

    const getStrokeWeight = () => {
      switch (routeWidth) {
        case "thin":
          return 4;
        case "medium":
          return 8;
        case "thick":
          return 12;
        default:
          return 8;
      }
    };

    const strokeWeight = getStrokeWeight();
    let totalDistance = 0;
    let completedRequests = 0;

    routes.forEach((route, index) => {
      if (!route.optimizedPath || route.optimizedPath.length < 2) {
        completedRequests++;
        return;
      }

      const origin = route.optimizedPath[0];
      const destination = route.optimizedPath[route.optimizedPath.length - 1];
      const waypoints = route.optimizedPath.slice(1, -1).map((location) => ({
        location: location,
        stopover: true,
      }));

      const request = {
        origin: origin,
        destination: destination,
        waypoints: waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: false,
      };

      directionsServiceRef.current.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          const directionsRenderer = new google.maps.DirectionsRenderer({
            map: map,
            directions: result,
            suppressMarkers: true,
            preserveViewport: true,
            polylineOptions: {
              strokeColor: route.color,
              strokeOpacity: route.isOptimized ? 1 : 0.8,
              strokeWeight: route.isOptimized ? strokeWeight + 2 : strokeWeight,
              zIndex: route.isOptimized ? 200 : 100 + index,
            },
          });

          directionsRenderersRef.current.push(directionsRenderer);

          let routeDistance = 0;
          result.routes[0].legs.forEach((leg) => {
            routeDistance += leg.distance.value;
          });
          totalDistance += routeDistance;
        }

        completedRequests++;
        if (completedRequests === routes.length) {
          onRouteDistanceCalculated &&
            onRouteDistanceCalculated(totalDistance / 1000);
        }
      });
    });

    return () => {
      directionsRenderersRef.current.forEach((renderer) => {
        renderer.setMap(null);
      });
      directionsRenderersRef.current = [];
    };
  }, [map, routes, routeWidth, onRouteDistanceCalculated]);

  return null;
};

export default RouteRenderer;

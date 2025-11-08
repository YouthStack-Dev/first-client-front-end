import { useEffect, useState } from "react";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
// DirectionsRenderer component (unchanged)
const DirectionsRenderer = ({ routes, showRoutes, onRouteCalculated }) => {
  const map = useMap();
  const routesLibrary = useMapsLibrary("routes");
  const [directionsRenderers, setDirectionsRenderers] = useState([]);
  const [directionsServices, setDirectionsServices] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (!routesLibrary) return;
    setDirectionsServices(new routesLibrary.DirectionsService());
  }, [routesLibrary]);

  useEffect(() => {
    if (
      !map ||
      !routesLibrary ||
      !directionsServices ||
      !showRoutes ||
      routes.length === 0
    ) {
      directionsRenderers.forEach((renderer) => renderer.setMap(null));
      setDirectionsRenderers([]);
      setIsCalculating(false);
      return;
    }

    directionsRenderers.forEach((renderer) => renderer.setMap(null));

    const newRenderers = [];
    let totalDistanceSum = 0;
    let totalDurationSum = 0;
    let completedRoutes = 0;

    setIsCalculating(true);

    routes.forEach((route, index) => {
      if (route.path.length < 2) {
        completedRoutes++;
        return;
      }

      const origin = route.path[0];
      const destination = route.path[route.path.length - 1];

      const waypoints = route.path.slice(1, -1).map((point) => ({
        location: new google.maps.LatLng(point.lat, point.lng),
        stopover: true,
      }));

      const renderer = new routesLibrary.DirectionsRenderer({
        map: map,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: route.color || "#3B82F6",
          strokeWeight: 4,
          strokeOpacity: 0.8,
        },
        preserveViewport: true,
      });

      directionsServices.route(
        {
          origin: new google.maps.LatLng(origin.lat, origin.lng),
          destination: new google.maps.LatLng(destination.lat, destination.lng),
          waypoints: waypoints,
          optimizeWaypoints: route.optimize || false,
          travelMode: google.maps.TravelMode.DRIVING,
          provideRouteAlternatives: false,
          avoidHighways: route.preferLocalRoads || false,
          avoidTolls: false,
          avoidFerries: false,
        },
        (result, status) => {
          completedRoutes++;

          if (status === google.maps.DirectionsStatus.OK) {
            renderer.setDirections(result);

            let totalDistance = 0;
            let totalDuration = 0;

            result.routes[0].legs.forEach((leg) => {
              totalDistance += leg.distance.value;
              totalDuration += leg.duration.value;
            });

            const distanceKm = (totalDistance / 1000).toFixed(2);
            const durationMin = Math.round(totalDuration / 60);

            totalDistanceSum += parseFloat(distanceKm);
            totalDurationSum += durationMin;

            if (completedRoutes === routes.length && onRouteCalculated) {
              onRouteCalculated({
                routeId: route.id,
                distance: distanceKm,
                duration: durationMin,
                totalDistance: totalDistanceSum,
                totalDuration: totalDurationSum,
                waypointOrder: result.routes[0].waypoint_order,
              });
              setIsCalculating(false);
            }
          } else {
            console.error(
              `❌ Directions request failed for route ${route.id}:`,
              status
            );
            if (completedRoutes === routes.length) {
              setIsCalculating(false);
            }
          }
        }
      );

      newRenderers.push(renderer);
    });

    setDirectionsRenderers(newRenderers);

    return () => {
      newRenderers.forEach((renderer) => renderer.setMap(null));
    };
  }, [map, routesLibrary, directionsServices, routes, showRoutes]);

  return null;
};

export default DirectionsRenderer;

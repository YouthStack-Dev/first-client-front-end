import React, { useEffect, useRef } from "react";
import { useMap } from "@vis.gl/react-google-maps";

// Helper functions for RouteRenderer
const getClusterColor = (clusterId) => {
  const colors = [
    "#3B82F6",
    "#EF4444",
    "#10B981",
    "#F59E0B",
    "#8B5CF6",
    "#EC4899",
    "#14B8A6",
    "#F97316",
    "#6366F1",
    "#84CC16",
    "#06B6D4",
    "#F43F5E",
  ];
  return colors[(clusterId - 1) % colors.length];
};

const getWidthSettings = (routeWidth) => {
  switch (routeWidth) {
    case "thin":
      return { optimized: 4, normal: 3 };
    case "medium":
      return { optimized: 8, normal: 6 };
    case "thick":
      return { optimized: 12, normal: 8 };
    case "very-thick":
      return { optimized: 16, normal: 12 };
    default:
      return { optimized: 8, normal: 6 };
  }
};

const RouteRenderer = ({ routes, showRoutes, routeWidth }) => {
  const map = useMap();
  const directionsRenderersRef = useRef([]);
  const directionsServiceRef = useRef(new google.maps.DirectionsService());

  useEffect(() => {
    // Clear existing directions renderers
    directionsRenderersRef.current.forEach((renderer) => {
      renderer.setMap(null);
    });
    directionsRenderersRef.current = [];

    if (!map || !showRoutes || routes.length === 0) return;

    // Get width settings
    const widths = getWidthSettings(routeWidth);

    // Create optimized routes for each cluster
    routes.forEach((clusterRoute) => {
      if (clusterRoute.optimizedPath && clusterRoute.optimizedPath.length > 1) {
        const waypoints = clusterRoute.optimizedPath
          .slice(1, -1)
          .map((location) => ({
            location: location,
            stopover: false,
          }));

        const request = {
          origin: clusterRoute.optimizedPath[0],
          destination:
            clusterRoute.optimizedPath[clusterRoute.optimizedPath.length - 1],
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
                strokeColor: getClusterColor(clusterRoute.clusterId),
                strokeOpacity: 0.9,
                strokeWeight: widths.optimized,
              },
            });

            directionsRenderersRef.current.push(directionsRenderer);
          } else {
            console.warn(
              `Directions request failed for cluster ${clusterRoute.clusterId}:`,
              status
            );

            // Fallback to polyline
            const polyline = new google.maps.Polyline({
              path: clusterRoute.optimizedPath,
              geodesic: true,
              strokeColor: getClusterColor(clusterRoute.clusterId),
              strokeOpacity: 0.9,
              strokeWeight: widths.optimized,
              map: map,
            });
          }
        });
      }
    });

    // Cleanup function
    return () => {
      directionsRenderersRef.current.forEach((renderer) => {
        renderer.setMap(null);
      });
      directionsRenderersRef.current = [];
    };
  }, [map, routes, showRoutes, routeWidth]);

  return null;
};

export default RouteRenderer;

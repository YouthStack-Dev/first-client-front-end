import React, { useEffect, useState, useCallback, useRef } from "react";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";

export const getRouteColor = (routeId) => {
  const colors = [
    "#1B2631",
    "#2E4053",
    "#154360",
    "#512E5F",
    "#784212",
    "#4A235A",
    "#1C2833",
    "#4D5656",
    "#424949",
    "#1F618D",
    "#7B241C",
    "#145A32",
    "#7D6608",
    "#633974",
    "#4A235A",
  ];
  return colors[Math.abs(routeId) % colors.length];
};

const DirectionsRenderer = ({
  routes = [],
  selectedRouteIds = new Set(),
  showRoutes = true,
  preferLocalRoads = false,
}) => {
  const map = useMap();
  const routesLibrary = useMapsLibrary("routes");
  const [directionsService, setDirectionsService] = useState(null);
  const directionsRenderersRef = useRef(new Map());
  const pickupMarkersRef = useRef(new Map());
  const fetchingRoutesRef = useRef(new Set());

  // Initialize DirectionsService
  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionsService(new routesLibrary.DirectionsService());
  }, [routesLibrary, map]);

  // Clear all routes and markers
  const clearAllDirections = useCallback(() => {
    directionsRenderersRef.current.forEach((renderer) => {
      if (renderer?.setMap) renderer.setMap(null);
    });
    pickupMarkersRef.current.forEach((markers) => {
      markers.forEach((m) => m.setMap(null));
    });
    directionsRenderersRef.current.clear();
    pickupMarkersRef.current.clear();
    fetchingRoutesRef.current.clear();
  }, []);

  // Show a single route
  const showRoute = useCallback(
    async (route) => {
      if (!directionsService || !map || !routesLibrary) return;

      const routeId = route.route_id;
      if (fetchingRoutesRef.current.has(routeId)) return;

      try {
        fetchingRoutesRef.current.add(routeId);

        // Filter valid stops
        const validStops =
          route.stops?.filter(
            (s) =>
              s.pickup_latitude &&
              s.pickup_longitude &&
              s.drop_latitude &&
              s.drop_longitude
          ) || [];

        if (validStops.length === 0) {
          console.warn(`No valid stops for route ${routeId}`);
          fetchingRoutesRef.current.delete(routeId);
          return;
        }

        // Create pickup/drop points
        const orderedPoints = [];
        validStops.forEach((stop) => {
          orderedPoints.push({
            lat: stop.pickup_latitude,
            lng: stop.pickup_longitude,
            type: "pickup",
          });
          orderedPoints.push({
            lat: stop.drop_latitude,
            lng: stop.drop_longitude,
            type: "drop",
          });
        });

        if (orderedPoints.length < 2) {
          fetchingRoutesRef.current.delete(routeId);
          return;
        }

        const origin = orderedPoints[0];
        const destination = orderedPoints[orderedPoints.length - 1];
        const waypoints = orderedPoints.slice(1, -1).map((p) => ({
          location: { lat: p.lat, lng: p.lng },
          stopover: true,
        }));

        // Build request
        const routeOptions = {
          origin,
          destination,
          waypoints: waypoints.length > 0 ? waypoints : undefined,
          travelMode: routesLibrary.TravelMode.DRIVING,
          provideRouteAlternatives: false, // Only one path
          optimizeWaypoints: false,
          avoidHighways: preferLocalRoads,
          avoidTolls: preferLocalRoads,
        };

        const response = await directionsService.route(routeOptions);
        if (!response.routes?.length) {
          fetchingRoutesRef.current.delete(routeId);
          return;
        }

        // Remove old renderer if any
        directionsRenderersRef.current.get(routeId)?.setMap(null);

        // Create renderer for only the first route
        const routeColor = getRouteColor(routeId);
        const renderer = new routesLibrary.DirectionsRenderer({
          map,
          directions: response,
          routeIndex: 0, // Always first
          preserveViewport: true,
          polylineOptions: {
            strokeColor: routeColor,
            strokeOpacity: 0.9,
            strokeWeight: 5,
            zIndex: 1000,
          },
          suppressMarkers: true,
        });

        directionsRenderersRef.current.set(routeId, renderer);

        // Remove old pickup markers if any
        const existingMarkers = pickupMarkersRef.current.get(routeId);
        existingMarkers?.forEach((m) => m.setMap(null));

        // Add pickup markers (P1, P2, ...)
        const newMarkers = validStops.map((stop, index) => {
          return new google.maps.Marker({
            position: {
              lat: stop.pickup_latitude,
              lng: stop.pickup_longitude,
            },
            map,
            label: {
              text: `P${index + 1}`,
              color: "#fff",
              fontWeight: "bold",
            },
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#28B463",
              fillOpacity: 1,
              strokeWeight: 1,
              strokeColor: "#fff",
            },
            title: `Pickup ${index + 1}`,
          });
        });

        pickupMarkersRef.current.set(routeId, newMarkers);

        console.log(
          `✅ Route ${routeId} rendered with ${newMarkers.length} pickups`
        );

        fetchingRoutesRef.current.delete(routeId);
      } catch (error) {
        console.error(`Error rendering route ${route.route_id}:`, error);
        fetchingRoutesRef.current.delete(route.route_id);
      }
    },
    [directionsService, map, routesLibrary, preferLocalRoads]
  );

  // Manage routes on prop change
  useEffect(() => {
    if (!directionsService || !map || !routesLibrary) return;

    if (!showRoutes || selectedRouteIds.size === 0) {
      clearAllDirections();
      return;
    }

    const selectedRoutes = routes.filter((r) =>
      selectedRouteIds.has(r.route_id)
    );

    // Remove unselected routes
    directionsRenderersRef.current.forEach((renderer, id) => {
      if (!selectedRouteIds.has(id)) {
        renderer.setMap(null);
        directionsRenderersRef.current.delete(id);
        pickupMarkersRef.current.get(id)?.forEach((m) => m.setMap(null));
        pickupMarkersRef.current.delete(id);
        fetchingRoutesRef.current.delete(id);
      }
    });

    // Show new routes
    selectedRoutes.forEach((route) => {
      if (!directionsRenderersRef.current.has(route.route_id)) {
        showRoute(route);
      }
    });
  }, [
    showRoutes,
    selectedRouteIds,
    routes,
    preferLocalRoads,
    directionsService,
    map,
    routesLibrary,
    showRoute,
    clearAllDirections,
  ]);

  // Cleanup
  useEffect(() => () => clearAllDirections(), [clearAllDirections]);

  return null;
};

export default DirectionsRenderer;

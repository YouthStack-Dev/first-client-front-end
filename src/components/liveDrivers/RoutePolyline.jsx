// src/components/liveDrivers/RoutePolyline.jsx

import React, { useEffect, useRef } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import { routeStatusColor } from "./liveRouteUtils";

export default function RoutePolyline({
  waypoints,
  status = "no-route",
  isVisible = true,
}) {
  const map = useMap();
  const polylineRef = useRef(null);

  useEffect(() => {
    if (!map || !isVisible || !waypoints || waypoints.length < 2) {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
      return;
    }

    // Clean up old polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    const path = waypoints.map((wp) => ({
      lat: wp.lat,
      lng: wp.lng,
    }));

    const polyline = new window.google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: routeStatusColor(status),
      strokeOpacity: 0.7,
      strokeWeight: 2.5,
      map,
      zIndex: 1,
    });

    polylineRef.current = polyline;

    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
    };
  }, [map, waypoints, status, isVisible]);

  return null; // This component only manages the polyline via useMap
}

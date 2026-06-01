// src/components/liveDrivers/TrailPolyline.jsx

import { useEffect, useRef } from "react";
import { useMap } from "@vis.gl/react-google-maps";

export default function TrailPolyline({
  trail = [],
  color = "#22c55e",
}) {
  const map = useMap();
  const polyRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    // Remove if insufficient points
    if (!trail || trail.length < 2) {
      if (polyRef.current) {
        polyRef.current.setMap(null);
        polyRef.current = null;
      }
      return;
    }

    const path = trail.map(([lat, lng]) => ({
      lat,
      lng,
    }));

    if (!polyRef.current) {
      polyRef.current =
        new window.google.maps.Polyline({
          path,
          geodesic: true,
          strokeColor: color,
          strokeOpacity: 0.8,
          strokeWeight: 3,
          clickable: false,
          map,
        });
    } else {
      polyRef.current.setPath(path);
      polyRef.current.setOptions({
        strokeColor: color,
      });
    }

    return () => {
      if (polyRef.current) {
        polyRef.current.setMap(null);
        polyRef.current = null;
      }
    };
  }, [map, trail, color]);

  return null;
}
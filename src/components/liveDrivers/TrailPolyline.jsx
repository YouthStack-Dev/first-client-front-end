// src/components/liveDrivers/TrailPolyline.jsx

import { useEffect, useRef } from "react";
import { useMap } from "@vis.gl/react-google-maps";

export default function TrailPolyline({ trail = [], color = "#22c55e" }) {
  const map     = useMap();
  const polyRef = useRef(null);

  // ── FIX Effect 1: Create polyline ONCE per map instance ──────────────────
  useEffect(() => {
    if (!map) return;

    polyRef.current = new window.google.maps.Polyline({
      geodesic:       true,
      strokeOpacity:  0.8,
      strokeWeight:   3,
      clickable:      false,
      map,
    });

    return () => {
      polyRef.current?.setMap(null);
      polyRef.current = null;
    };
  }, [map]);

  // ── FIX Effect 2: Update path + color in-place — no teardown ─────────────
  useEffect(() => {
    if (!polyRef.current) return;

    if (!trail || trail.length < 2) {
      polyRef.current.setPath([]);
      return;
    }

    polyRef.current.setPath(trail.map(([lat, lng]) => ({ lat, lng })));
    polyRef.current.setOptions({ strokeColor: color });
  }, [trail, color]);

  return null;
}
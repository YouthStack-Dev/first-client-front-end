// src/components/liveDrivers/LiveDriverMapCanvas.jsx

import React, {
  useEffect,
  useMemo,
  useRef,
} from "react";

import {
  APIProvider,
  Map as GoogleMap,
  useMap,
} from "@vis.gl/react-google-maps";

import DriverMarker from "./DriverMarker";

import {
  MAX_TRAIL,
  haversineKm,
} from "./liveDriverHelpers";

function MapInner({
  driverMap,
  visibleDrivers,
  fitKey,
  selectedDetail,
  handleMarkerClick,
}) {
  const map = useMap();
  const fitDoneRef = useRef(false);

  // Trail persistence
  const trailDataRef = useRef(new window.Map());
  const prevPositionsRef = useRef(new window.Map());

  // Reset fit trigger
  useEffect(() => {
    fitDoneRef.current = false;
  }, [fitKey]);

  // Auto-fit map to all drivers
  useEffect(() => {
    if (!map || fitDoneRef.current) return;

    const allPoints = Object.values(driverMap || {})
      .flatMap((vendorDrivers) => Object.values(vendorDrivers || {}))
      .filter((d) => d?.lat && d?.lng)
      .map((d) => ({ lat: d.lat, lng: d.lng }));

    if (!allPoints.length) return;

    fitDoneRef.current = true;

    if (allPoints.length === 1) {
      map.setCenter(allPoints[0]);
      map.setZoom(14);
      return;
    }

    const bounds = new window.google.maps.LatLngBounds();
    allPoints.forEach((p) => bounds.extend(p));
    map.fitBounds(bounds, 60);
  }, [map, driverMap, fitKey]);

  // Build drivers + maintain trail history
  const driversWithTrails = useMemo(() => {
    const result = [];
    const duplicatePositionGroups = {};

    visibleDrivers.forEach(({ vid, did, data }) => {
      if (!data?.lat || !data?.lng) return;
      const posKey = `${data.lat}:${data.lng}`;
      duplicatePositionGroups[posKey] = duplicatePositionGroups[posKey] || [];
      duplicatePositionGroups[posKey].push({ vid, did });
    });

    const offsetMap = new Map();
    Object.values(duplicatePositionGroups).forEach((group) => {
      if (group.length === 1) {
        const { vid, did } = group[0];
        offsetMap.set(`${vid}/${did}`, { x: 0, y: 0 });
        return;
      }

      const radius = 18;
      group.forEach(({ vid, did }, index) => {
        const angle = (index / group.length) * Math.PI * 2;
        offsetMap.set(`${vid}/${did}`, {
          x: Math.round(Math.cos(angle) * radius),
          y: Math.round(Math.sin(angle) * radius),
        });
      });
    });

    visibleDrivers.forEach(({ vid, did, data }) => {
      if (!data?.lat || !data?.lng) return;

      const key = `${vid}/${did}`;
      const currentPos = [data.lat, data.lng];
      const prevPos = prevPositionsRef.current.get(key);
      let trail = trailDataRef.current.get(key) || [];

      // Add point only on meaningful movement
      if (!prevPos || haversineKm(prevPos[0], prevPos[1], currentPos[0], currentPos[1]) > 0.008) {
        trail = [...trail, currentPos];
        if (trail.length > MAX_TRAIL) {
          trail = trail.slice(-MAX_TRAIL);
        }
        trailDataRef.current.set(key, trail);
        prevPositionsRef.current.set(key, currentPos);
      }

      result.push({
        vid,
        did,
        data,
        trail,
        offset: offsetMap.get(key) || { x: 0, y: 0 },
      });
    });

    // Cleanup trails for drivers no longer visible
    const activeKeys = new Set(visibleDrivers.map(({ vid, did }) => `${vid}/${did}`));
    for (const key of Array.from(trailDataRef.current.keys())) {
      if (!activeKeys.has(key)) {
        trailDataRef.current.delete(key);
        prevPositionsRef.current.delete(key);
      }
    }

    return result;
  }, [visibleDrivers]);

  return (
    <>
      {driversWithTrails.map(({ vid, did, data, trail, offset }) => (
        <DriverMarker
          key={`${vid}-${did}`}
          vid={vid}
          did={did}
          data={data}
          trail={trail}
          offset={offset}
          selected={
            selectedDetail?.vid === vid && selectedDetail?.did === did
          }
          onClick={handleMarkerClick}
        />
      ))}
    </>
  );
}

export default function LiveDriverMapCanvas({
  apiKey,
  driverMap,
  visibleDrivers = [],
  fitKey,
  selectedDetail,
  handleMarkerClick,
}) {
  return (
    <APIProvider apiKey={apiKey}>
      <div style={{ width: "100%", height: "100%" }}>
        <GoogleMap
          defaultCenter={{ lat: 12.9716, lng: 77.5946 }}
          defaultZoom={11}
          gestureHandling="greedy"
          fullscreenControl
          streetViewControl
          mapTypeControl
          zoomControl
          scaleControl
          rotateControl
          style={{ width: "100%", height: "100%" }}
        >
          <MapInner
            driverMap={driverMap}
            visibleDrivers={visibleDrivers}
            fitKey={fitKey}
            selectedDetail={selectedDetail}
            handleMarkerClick={handleMarkerClick}
          />
        </GoogleMap>
      </div>
    </APIProvider>
  );
}
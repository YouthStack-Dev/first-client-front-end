// src/components/liveDrivers/LiveDriverMapCanvas.jsx

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  APIProvider,
  Map as GoogleMap,
  useMap,
} from "@vis.gl/react-google-maps";

import DriverMarker from "./DriverMarker";
import { MAX_TRAIL, haversineKm } from "./liveDriverHelpers";

// ─── Map control toolbar ──────────────────────────────────────────────────────
function MapToolbar({ map, visibleDrivers }) {
  const [trafficOn, setTrafficOn] = useState(false);
  const [mapType, setMapType] = useState("roadmap");
  const [geoState, setGeoState] = useState("idle");
  const [fitFlash, setFitFlash] = useState(false);

  const trafficRef = useRef(null);
  const geoMarkerRef = useRef(null);
  const geoCircleRef = useRef(null);

  const toggleTraffic = useCallback(() => {
    if (!map) return;
    if (!trafficOn) {
      if (!trafficRef.current)
        trafficRef.current = new window.google.maps.TrafficLayer();
      trafficRef.current.setMap(map);
      setTrafficOn(true);
    } else {
      trafficRef.current?.setMap(null);
      setTrafficOn(false);
    }
  }, [map, trafficOn]);

  useEffect(
    () => () => {
      trafficRef.current?.setMap(null);
    },
    [],
  );

  const cycleMapType = useCallback(() => {
    if (!map) return;
    const next =
      mapType === "roadmap"
        ? "satellite"
        : mapType === "satellite"
          ? "hybrid"
          : "roadmap";
    map.setMapTypeId(next);
    setMapType(next);
  }, [map, mapType]);

  const clearGeoMarkers = useCallback(() => {
    geoMarkerRef.current?.setMap(null);
    geoMarkerRef.current = null;
    geoCircleRef.current?.setMap(null);
    geoCircleRef.current = null;
  }, []);

  const locateMe = useCallback(() => {
    if (!map) return;
    if (geoState === "found") {
      clearGeoMarkers();
      setGeoState("idle");
      return;
    }
    if (!navigator.geolocation) {
      alert("Geolocation not supported by your browser.");
      return;
    }

    setGeoState("locating");
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude: lat, longitude: lng, accuracy } }) => {
        const pos = { lat, lng };
        map.panTo(pos);
        map.setZoom(15);
        clearGeoMarkers();

        geoMarkerRef.current = new window.google.maps.Marker({
          position: pos,
          map,
          title: "Your location",
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#2563eb",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2.5,
          },
          zIndex: 999,
        });
        geoCircleRef.current = new window.google.maps.Circle({
          map,
          center: pos,
          radius: accuracy,
          strokeColor: "#2563eb",
          strokeOpacity: 0.25,
          strokeWeight: 1,
          fillColor: "#2563eb",
          fillOpacity: 0.08,
          clickable: false,
        });
        setGeoState("found");
      },
      (err) => {
        console.warn("[Geolocation]", err.message);
        setGeoState("denied");
        setTimeout(() => setGeoState("idle"), 3000);
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 30_000 },
    );
  }, [map, geoState, clearGeoMarkers]);

  useEffect(() => () => clearGeoMarkers(), [clearGeoMarkers]);

  const fitDrivers = useCallback(() => {
    if (!map) return;
    const pts = visibleDrivers
      .filter((d) => d?.data?.lat && d?.data?.lng)
      .map((d) => ({ lat: d.data.lat, lng: d.data.lng }));
    if (!pts.length) return;
    if (pts.length === 1) {
      map.panTo(pts[0]);
      map.setZoom(15);
    } else {
      const bounds = new window.google.maps.LatLngBounds();
      pts.forEach((p) => bounds.extend(p));
      map.fitBounds(bounds, { top: 80, bottom: 40, left: 280, right: 80 });
    }
    setFitFlash(true);
    setTimeout(() => setFitFlash(false), 600);
  }, [map, visibleDrivers]);

  const mapTypeLabel =
    mapType === "roadmap"
      ? "🗺️ Map"
      : mapType === "satellite"
        ? "🛰️ Sat"
        : "🌍 Hybrid";
  const geoIcon =
    geoState === "locating" ? "⏳" : geoState === "denied" ? "🚫" : "📍";
  const geoLabel =
    geoState === "locating"
      ? "Finding"
      : geoState === "denied"
        ? "Denied"
        : geoState === "found"
          ? "Clear"
          : "Find Me";
  const hasDrivers = visibleDrivers.some((d) => d?.data?.lat);

  return (
    <div style={TB.wrap}>
      <button
        title={trafficOn ? "Hide traffic" : "Show traffic"}
        style={{ ...TB.btn, ...(trafficOn ? TB.btnOn : {}) }}
        onClick={toggleTraffic}
      >
        <span style={TB.icon}>🚦</span>
        <span style={TB.label}>Traffic</span>
        {trafficOn && <span style={TB.dot} />}
      </button>

      <button
        title={`Switch map type (current: ${mapType})`}
        style={{ ...TB.btn, ...(mapType !== "roadmap" ? TB.btnOn : {}) }}
        onClick={cycleMapType}
      >
        <span style={TB.icon}>{mapTypeLabel.split(" ")[0]}</span>
        <span style={TB.label}>{mapTypeLabel.split(" ")[1]}</span>
      </button>

      <button
        title={
          geoState === "found"
            ? "Clear my location"
            : geoState === "locating"
              ? "Locating…"
              : geoState === "denied"
                ? "Location denied"
                : "Show my location"
        }
        style={{
          ...TB.btn,
          ...(geoState === "found" ? TB.btnOn : {}),
          ...(geoState === "denied" ? TB.btnDenied : {}),
          ...(geoState === "locating" ? TB.btnLoading : {}),
        }}
        onClick={locateMe}
        disabled={geoState === "locating"}
      >
        <span
          style={{
            ...TB.icon,
            ...(geoState === "locating"
              ? {
                  animation: "geo-spin 1s linear infinite",
                  display: "inline-block",
                }
              : {}),
          }}
        >
          {geoIcon}
        </span>
        <span style={TB.label}>{geoLabel}</span>
        {geoState === "found" && (
          <span style={{ ...TB.dot, background: "#2563eb" }} />
        )}
      </button>

      <button
        title={
          hasDrivers
            ? "Fit all visible drivers in view"
            : "No visible drivers to fit"
        }
        style={{
          ...TB.btn,
          ...(fitFlash ? TB.btnFit : {}),
          ...(!hasDrivers ? TB.btnDisabled : {}),
        }}
        onClick={fitDrivers}
        disabled={!hasDrivers}
      >
        <span style={TB.icon}>⊡</span>
        <span style={TB.label}>Fit All</span>
      </button>

      <style>{`
        @keyframes geo-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const TB = {
  wrap: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 1400,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  btn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: 52,
    height: 52,
    borderRadius: 12,
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 8px rgba(0,0,0,.12)",
    cursor: "pointer",
    gap: 2,
    position: "relative",
    transition: "all .15s",
  },
  btnOn: {
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    boxShadow: "0 2px 12px rgba(37,99,235,.2)",
  },
  btnDenied: { background: "#fff1f2", border: "1px solid #fecdd3" },
  btnLoading: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    cursor: "not-allowed",
    opacity: 0.7,
  },
  btnFit: {
    background: "#f0fdf4",
    border: "1px solid #86efac",
    boxShadow: "0 2px 12px rgba(34,197,94,.25)",
  },
  btnDisabled: { opacity: 0.4, cursor: "not-allowed" },
  icon: { fontSize: 18, lineHeight: 1 },
  label: {
    fontSize: 9,
    fontWeight: 700,
    color: "#475569",
    letterSpacing: ".03em",
    textTransform: "uppercase",
  },
  dot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#22c55e",
    border: "1.5px solid #fff",
  },
};

// ─── MapInner ─────────────────────────────────────────────────────────────────
function MapInner({
  driverMap,
  visibleDrivers,
  fitKey,
  selectedDetail,
  handleMarkerClick,
  onMapLoad,
}) {
  const map = useMap();
  const fitDoneRef = useRef(false);
  const trailDataRef = useRef(new window.Map());
  const prevPositionsRef = useRef(new window.Map());

  useEffect(() => {
    if (map && onMapLoad) onMapLoad(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  useEffect(() => {
    fitDoneRef.current = false;
  }, [fitKey]);

  // ── TEMP DEBUG — remove after fixing ──────────────────────────────────────
  useEffect(() => {
    // console.log("[DEBUG] visibleDrivers count:", visibleDrivers.length);
    visibleDrivers.forEach(({ vid, did, data }) => {
      // console.log(`[DEBUG] ${vid}/${did} → lat:${data?.lat} lng:${data?.lng} is_active:${data?.is_active}`);
    });
  }, [visibleDrivers]);
  // ──────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!map || fitDoneRef.current) return;
    const pts = Object.values(driverMap || {})
      .flatMap((vd) => Object.values(vd || {}))
      .filter((d) => d?.lat && d?.lng)
      .map((d) => ({ lat: d.lat, lng: d.lng }));
    if (!pts.length) return;
    fitDoneRef.current = true;
    if (pts.length === 1) {
      map.setCenter(pts[0]);
      map.setZoom(14);
      return;
    }
    const bounds = new window.google.maps.LatLngBounds();
    pts.forEach((p) => bounds.extend(p));
    map.fitBounds(bounds, { top: 80, bottom: 40, left: 280, right: 80 });
  }, [map, driverMap, fitKey]);

  useEffect(() => {
    if (!map || !selectedDetail) return;
    const d = visibleDrivers.find(
      ({ vid, did }) =>
        vid === selectedDetail.vid && did === selectedDetail.did,
    );
    if (!d?.data?.lat) return;
    map.panTo({ lat: d.data.lat, lng: d.data.lng });
    if (map.getZoom?.() < 14) map.setZoom(14);
  }, [map, selectedDetail, visibleDrivers]);

  const driversWithTrails = useMemo(() => {
    const result = [];
    const posGroups = {};

    visibleDrivers.forEach(({ vid, did, data }) => {
      if (!data?.lat || !data?.lng) return;
      const pk = `${data.lat}:${data.lng}`;
      posGroups[pk] = posGroups[pk] || [];
      posGroups[pk].push({ vid, did });
    });

    const offsetMap = new Map();
    Object.values(posGroups).forEach((group) => {
      if (group.length === 1) {
        offsetMap.set(`${group[0].vid}/${group[0].did}`, { x: 0, y: 0 });
        return;
      }
      const r = 18;
      group.forEach(({ vid, did }, i) => {
        const a = (i / group.length) * Math.PI * 2;
        offsetMap.set(`${vid}/${did}`, {
          x: Math.round(Math.cos(a) * r),
          y: Math.round(Math.sin(a) * r),
        });
      });
    });

    visibleDrivers.forEach(({ vid, did, data }) => {
      if (!data?.lat || !data?.lng) return;
      const key = `${vid}/${did}`;
      const cur = [data.lat, data.lng];
      const prev = prevPositionsRef.current.get(key);
      let trail = trailDataRef.current.get(key) || [];
      if (!prev || haversineKm(prev[0], prev[1], cur[0], cur[1]) > 0.008) {
        trail = [...trail, cur].slice(-MAX_TRAIL);
        trailDataRef.current.set(key, trail);
        prevPositionsRef.current.set(key, cur);
      }
      result.push({
        vid,
        did,
        data,
        trail,
        offset: offsetMap.get(key) || { x: 0, y: 0 },
      });
    });

    const active = new Set(
      visibleDrivers.map(({ vid, did }) => `${vid}/${did}`),
    );
    for (const k of Array.from(trailDataRef.current.keys())) {
      if (!active.has(k)) {
        trailDataRef.current.delete(k);
        prevPositionsRef.current.delete(k);
      }
    }

    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleDrivers]);

  return (
    <>
      <MapToolbar map={map} visibleDrivers={visibleDrivers} />
      {driversWithTrails.map(({ vid, did, data, trail, offset }) => (
        <DriverMarker
          key={`${vid}-${did}`}
          vid={vid}
          did={did}
          data={data}
          trail={trail}
          offset={offset}
          selected={selectedDetail?.vid === vid && selectedDetail?.did === did}
          onClick={handleMarkerClick}
        />
      ))}
    </>
  );
}

// ─── Canvas ───────────────────────────────────────────────────────────────────
export default function LiveDriverMapCanvas({
  apiKey,
  tenantId,
  driverMap,
  visibleDrivers = [],
  fitKey,
  selectedDetail,
  handleMarkerClick,
  onMapLoad,
}) {
  // Use visibleDrivers (already shaped as {vid,did,data}) — reliable across all driverMap structures
  const hasAnyDriver = visibleDrivers.some((d) => d?.data?.lat && d?.data?.lng);

  return (
    <APIProvider apiKey={apiKey}>
      <div style={{ width: "100%", height: "100%", position: "relative" }}>
        <GoogleMap
          defaultCenter={{ lat: 20.5937, lng: 78.9629 }}
          defaultZoom={5}
          gestureHandling="greedy"
          mapTypeControl={false}
          zoomControl
          scaleControl
          rotateControl
          fullscreenControl
          streetViewControl={true}
        >
          <MapInner
            driverMap={driverMap}
            visibleDrivers={visibleDrivers}
            fitKey={fitKey}
            selectedDetail={selectedDetail}
            handleMarkerClick={handleMarkerClick}
            onMapLoad={onMapLoad}
          />
        </GoogleMap>

        {/* Waiting overlay — tenant selected but no driver positions yet */}
        {tenantId && !hasAnyDriver && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,0.45)",
              zIndex: 1200,
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 14,
                padding: "18px 28px",
                boxShadow: "0 4px 20px rgba(0,0,0,.10)",
              }}
            >
              <svg
                style={{ animation: "canvas-spin 1s linear infinite" }}
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#e2e8f0"
                  strokeWidth="3"
                />
                <path
                  d="M12 2a10 10 0 0 1 10 10"
                  stroke="#94a3b8"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>
                Waiting for driver locations…
              </span>
            </div>
          </div>
        )}

        <style>{`
          @keyframes canvas-spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </APIProvider>
  );
}

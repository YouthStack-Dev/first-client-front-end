// src/components/liveDrivers/DriverMarker.jsx

import { useEffect, useRef } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import TrailPolyline from "./TrailPolyline";
import { markerColor, isStale } from "./liveDriverHelpers";
import { routeStatusColor } from "./liveRouteUtils";

function buildMarkerHtml(
  vid,
  did,
  color,
  active,
  stale,
  label,
  selected,
  data,
  routeStatus = "no-route",
) {
  const mc = !active ? "#64748b" : stale ? "#f59e0b" : color;
  const statusText = !data?.is_active ? "Offline" : stale ? "Stale" : "Active";
  const statusColor = !data?.is_active
    ? "#3f4452"
    : stale
      ? "#d97706"
      : "#22c55e";
  const updatedText = data?.updated_at
    ? new Date(data.updated_at).toLocaleString()
    : "Unknown";
  const speedText = data?.speed != null ? `${data.speed.toFixed(1)} km/h` : "—";
  const coordsText =
    data?.lat != null && data?.lng != null
      ? `${data.lat.toFixed(5)}, ${data.lng.toFixed(5)}`
      : "—";
  const routeText = data?.route_code
    ? `${data.route_code}${data.route_id ? ` (#${data.route_id})` : ""}`
    : data?.route_id
      ? `#${data.route_id}`
      : "—";
  const routeStatusText =
    routeStatus === "on-route"
      ? "✓ On Route"
      : routeStatus === "off-route"
        ? "⚠ Off Route"
        : "—";
  const routeStatusBgColor = routeStatusColor(routeStatus);
  const driverCodeText = data?.driver_code || "—";

  return `
    <div style="position:relative;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;cursor:pointer;">

      ${
        active
          ? `
        <div style="position:absolute;width:70px;height:70px;border-radius:50%;
          background:${mc}40;animation:dm-pulse 2s infinite;z-index:0;"></div>
      `
          : ""
      }

      <div style="width:52px;height:52px;border-radius:50%;background:${mc};
        display:flex;align-items:center;justify-content:center;font-size:28px;
        box-shadow:0 6px 16px rgba(0,0,0,.35);border:3px solid white;z-index:2;
        ${!active ? "opacity:.6;" : ""}">🚕</div>

      <div style="margin-top:4px;background:#111827;color:white;padding:3px 8px;
        border-radius:6px;font-size:11px;font-weight:700;white-space:nowrap;
        box-shadow:0 4px 12px rgba(0,0,0,.25);">${label}</div>

      ${
        selected
          ? `
        <div style="position:absolute;top:-260px;left:50%;transform:translateX(-50%);
          width:240px;background:rgba(15,23,42,0.96);border:1px solid rgba(148,163,184,0.22);
          border-radius:16px;padding:14px;color:#e5e7eb;font-family:system-ui,sans-serif;
          font-size:12px;box-shadow:0 22px 50px rgba(0,0,0,.35);z-index:4;
          backdrop-filter:blur(10px);">
          <div style="display:flex;justify-content:space-between;gap:10px;
            align-items:flex-start;margin-bottom:8px;">
            <div style="font-weight:800;font-size:14px;line-height:1.2;">
              ${data?.driver_name || data?.driver_code || did}
            </div>
            <div style="padding:3px 9px;border-radius:999px;font-size:10px;font-weight:700;
              text-transform:uppercase;background:${statusColor}22;color:${statusColor};">
              ${statusText}
            </div>
          </div>
          <div style="color:#94a3b8;font-size:11px;margin-bottom:12px;">Vendor ${vid}</div>
          ${
            routeStatus !== "no-route"
              ? `
            <div style="margin-bottom:10px;padding:6px 8px;border-radius:6px;
              background:${routeStatusBgColor}22;border-left:2px solid ${routeStatusBgColor};
              color:${routeStatusBgColor};font-size:11px;font-weight:600;">
              ${routeStatusText}
            </div>
          `
              : ""
          }
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <div><div style="color:#94a3b8;font-size:10px;margin-bottom:2px;">Driver ID</div><div style="color:#e5e7eb;font-size:12px;">${did}</div></div>
            <div><div style="color:#94a3b8;font-size:10px;margin-bottom:2px;">Driver Code</div><div style="color:#e5e7eb;font-size:12px;">${driverCodeText}</div></div>
            <div><div style="color:#94a3b8;font-size:10px;margin-bottom:2px;">Route</div><div style="color:#e5e7eb;font-size:12px;">${routeText}</div></div>
            <div><div style="color:#94a3b8;font-size:10px;margin-bottom:2px;">Speed</div><div style="color:#e5e7eb;font-size:12px;">${speedText}</div></div>
            <div><div style="color:#94a3b8;font-size:10px;margin-bottom:2px;">Last update</div><div style="color:#e5e7eb;font-size:12px;">${updatedText}</div></div>
            <div><div style="color:#94a3b8;font-size:10px;margin-bottom:2px;">Coordinates</div><div style="color:#e5e7eb;font-size:12px;">${coordsText}</div></div>
          </div>
        </div>
      `
          : ""
      }

    </div>
  `;
}

export default function DriverMarker({
  vid,
  did,
  data,
  trail = [],
  offset = { x: 0, y: 0 },
  selected = false,
  onClick,
  routeStatus = "no-route",
}) {
  const map = useMap();
  const overlayRef = useRef(null);
  const elRef = useRef(null);

  // Keep a ref of latest props so draw() always has fresh values
  const propsRef = useRef({
    vid,
    did,
    data,
    offset,
    selected,
    onClick,
    routeStatus,
  });
  useEffect(() => {
    propsRef.current = {
      vid,
      did,
      data,
      offset,
      selected,
      onClick,
      routeStatus,
    };
    // If overlay already exists, trigger a redraw with new props
    overlayRef.current?.draw();
  }, [vid, did, data, offset, selected, onClick, routeStatus]);

  useEffect(() => {
    if (!map) return;

    class HtmlMarker extends window.google.maps.OverlayView {
      onAdd() {
        const el = document.createElement("div");
        el.style.position = "absolute";
        el.style.zIndex = "9999";
        el.style.cursor = "pointer";
        elRef.current = el;
        this.getPanes().floatPane.appendChild(el);
      }

      draw() {
        const proj = this.getProjection();
        const el = elRef.current;
        if (!proj || !el) return;

        const { vid, did, data, offset, selected, onClick, routeStatus } =
          propsRef.current;
        if (!data?.lat || !data?.lng) return;

        // Position
        const pt = proj.fromLatLngToDivPixel(
          new window.google.maps.LatLng(data.lat, data.lng),
        );
        if (!pt) return;
        el.style.left = `${pt.x + (offset?.x || 0)}px`;
        el.style.top = `${pt.y + (offset?.y || 0)}px`;
        el.style.pointerEvents = "auto";

        // HTML — always render fresh from propsRef
        el.innerHTML = buildMarkerHtml(
          vid,
          did,
          markerColor(vid, data),
          data.is_active,
          isStale(data),
          data.driver_code || did,
          selected,
          data,
          routeStatus,
        );
        el.onclick = () => onClick?.(vid, did);
      }

      onRemove() {
        elRef.current?.parentNode?.removeChild(elRef.current);
        elRef.current = null;
      }
    }

    const marker = new HtmlMarker();
    marker.setMap(map);
    overlayRef.current = marker;

    return () => {
      marker.setMap(null);
      overlayRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  return trail?.length > 1 ? (
    <TrailPolyline trail={trail} color={markerColor(vid, data)} />
  ) : null;
}

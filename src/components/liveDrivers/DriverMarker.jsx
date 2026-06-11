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
    ? "#94a3b8"
    : stale
      ? "#d97706"
      : "#22c55e";
  const updatedText = data?.updated_at
    ? new Date(data.updated_at).toLocaleString()
    : "Unknown";
  const speedText =
    data?.speed != null ? `${Number(data.speed).toFixed(1)} km/h` : "—";
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

  const driverName   = data?.driver_name  || "—";
  const driverCode   = data?.driver_code  || "—";
  const driverId     = data?.driver_id    || did || "—";
  const vehicleRc    = data?.vehicle_rc_number || "—";
  const vehicleType  = data?.vehicle_type || "—";

  return `
    <div style="position:relative;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;cursor:pointer;">

      ${
        active
          ? `<div style="position:absolute;width:70px;height:70px;border-radius:50%;
              background:${mc}40;animation:dm-pulse 2s infinite;z-index:0;"></div>`
          : ""
      }

      <div style="width:52px;height:52px;border-radius:50%;background:${mc};
        display:flex;align-items:center;justify-content:center;font-size:28px;
        box-shadow:0 6px 16px rgba(0,0,0,.35);border:3px solid white;z-index:2;
        ${!active ? "opacity:.6;" : ""}">🚕</div>

      <!-- Vehicle RC number label below icon -->
      <div style="margin-top:4px;background:#111827;color:white;padding:3px 8px;
        border-radius:6px;font-size:11px;font-weight:700;white-space:nowrap;
        box-shadow:0 4px 12px rgba(0,0,0,.25);">${label}</div>

      ${
        selected
          ? `
        <div style="position:absolute;top:-320px;left:50%;transform:translateX(-50%);
          width:260px;background:rgba(15,23,42,0.97);border:1px solid rgba(148,163,184,0.2);
          border-radius:16px;padding:14px 16px;color:#e5e7eb;font-family:system-ui,sans-serif;
          font-size:12px;box-shadow:0 22px 50px rgba(0,0,0,.45);z-index:4;
          backdrop-filter:blur(10px);">

          <!-- Header: name + status badge -->
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px;">
            <div style="font-weight:800;font-size:14px;line-height:1.3;color:#f1f5f9;">
              ${driverName}
            </div>
            <div style="padding:3px 9px;border-radius:999px;font-size:10px;font-weight:700;
              text-transform:uppercase;background:${statusColor}22;color:${statusColor};flex-shrink:0;margin-left:8px;">
              ${statusText}
            </div>
          </div>

          <!-- Vendor sub-label -->
          <div style="color:#64748b;font-size:11px;margin-bottom:10px;">Vendor ${vid}</div>

          ${
            routeStatus !== "no-route"
              ? `<div style="margin-bottom:10px;padding:6px 8px;border-radius:6px;
                  background:${routeStatusBgColor}22;border-left:2px solid ${routeStatusBgColor};
                  color:${routeStatusBgColor};font-size:11px;font-weight:600;">
                  ${routeStatusText}
                </div>`
              : ""
          }

          <!-- Detail grid -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 12px;">

            <div>
              <div style="color:#64748b;font-size:10px;margin-bottom:2px;text-transform:uppercase;letter-spacing:.04em;">Driver ID</div>
              <div style="color:#f1f5f9;font-size:12px;font-weight:600;">${driverId}</div>
            </div>

            <div>
              <div style="color:#64748b;font-size:10px;margin-bottom:2px;text-transform:uppercase;letter-spacing:.04em;">Driver Code</div>
              <div style="color:#f1f5f9;font-size:12px;font-weight:600;">${driverCode}</div>
            </div>

            <div>
              <div style="color:#64748b;font-size:10px;margin-bottom:2px;text-transform:uppercase;letter-spacing:.04em;">Route</div>
              <div style="color:#f1f5f9;font-size:12px;font-weight:600;">${routeText}</div>
            </div>

            <div>
              <div style="color:#64748b;font-size:10px;margin-bottom:2px;text-transform:uppercase;letter-spacing:.04em;">Speed</div>
              <div style="color:#f1f5f9;font-size:12px;font-weight:600;">${speedText}</div>
            </div>

            <div style="grid-column:1/-1;">
              <div style="color:#64748b;font-size:10px;margin-bottom:2px;text-transform:uppercase;letter-spacing:.04em;">Vehicle RC</div>
              <div style="color:#f1f5f9;font-size:12px;font-weight:600;">${vehicleRc}</div>
            </div>

            <div style="grid-column:1/-1;">
              <div style="color:#64748b;font-size:10px;margin-bottom:2px;text-transform:uppercase;letter-spacing:.04em;">Vehicle Type</div>
              <div style="color:#f1f5f9;font-size:12px;font-weight:600;">${vehicleType}</div>
            </div>

            <div style="grid-column:1/-1;">
              <div style="color:#64748b;font-size:10px;margin-bottom:2px;text-transform:uppercase;letter-spacing:.04em;">Last Update</div>
              <div style="color:#f1f5f9;font-size:12px;font-weight:600;">${updatedText}</div>
            </div>

            <div style="grid-column:1/-1;">
              <div style="color:#64748b;font-size:10px;margin-bottom:2px;text-transform:uppercase;letter-spacing:.04em;">Coordinates</div>
              <div style="color:#94a3b8;font-size:11px;font-family:monospace;">${coordsText}</div>
            </div>

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
    propsRef.current = { vid, did, data, offset, selected, onClick, routeStatus };
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

        const pt = proj.fromLatLngToDivPixel(
          new window.google.maps.LatLng(data.lat, data.lng),
        );
        if (!pt) return;
        el.style.left = `${pt.x + (offset?.x || 0)}px`;
        el.style.top = `${pt.y + (offset?.y || 0)}px`;
        el.style.pointerEvents = "auto";

        el.innerHTML = buildMarkerHtml(
          vid,
          did,
          markerColor(vid, data),
          data.is_active,
          isStale(data),
          data.vehicle_rc_number || did,   // ← RC number as label
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
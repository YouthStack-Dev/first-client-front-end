// src/components/liveDrivers/DriverMarker.jsx

import { useEffect, useRef } from "react";
import { useMap } from "@vis.gl/react-google-maps";

import TrailPolyline from "./TrailPolyline";

import {
  markerColor,
  isStale,
} from "./liveDriverHelpers";

function buildMarkerHtml(vid, did, color, active, stale, label, selected, data) {
  const markerColorValue = !active
    ? "#64748b"
    : stale
    ? "#f59e0b"
    : color;

  const statusText = !data?.is_active
    ? "Offline"
    : stale
    ? "Stale"
    : "Active";

  const statusColor = !data?.is_active
    ? "#3f4452"
    : stale
    ? "#d97706"
    : "#22c55e";

  const updatedText = data?.updated_at
    ? new Date(data.updated_at).toLocaleString()
    : "Unknown";

  const speedText = data?.speed != null
    ? `${data.speed.toFixed(1)} km/h`
    : "—";

  const coordsText = data?.lat != null && data?.lng != null
    ? `${data.lat.toFixed(5)}, ${data.lng.toFixed(5)}`
    : "—";

  const routeText = data?.route_code
    ? `${data.route_code}${data.route_id ? ` (#${data.route_id})` : ""}`
    : data?.route_id
    ? `#${data.route_id}`
    : "—";

  return `
    <div
      style="
        position:relative;
        transform:translate(-50%,-50%);
        display:flex;
        flex-direction:column;
        align-items:center;
        cursor:pointer;
      "
    >

      ${
        active
          ? `
          <div
            style="
              position:absolute;
              width:70px;
              height:70px;
              border-radius:50%;
              background:${markerColorValue}40;
              animation:dm-pulse 2s infinite;
              z-index:0;
            "
          ></div>
        `
          : ""
      }

      <div
        style="
          width:52px;
          height:52px;
          border-radius:50%;
          background:${markerColorValue};
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:28px;
          box-shadow:0 6px 16px rgba(0,0,0,.35);
          border:3px solid white;
          z-index:2;
          ${!active ? "opacity:.6;" : ""}
        "
      >
        🚕
      </div>

      <div
        style="
          margin-top:4px;
          background:#111827;
          color:white;
          padding:3px 8px;
          border-radius:6px;
          font-size:11px;
          font-weight:700;
          white-space:nowrap;
          box-shadow:0 4px 12px rgba(0,0,0,.25);
        "
      >
        ${label}
      </div>

      ${selected ? `
        <div
          style="
            position:absolute;
            top:-240px;
            left:50%;
            transform:translateX(-50%);
            width:240px;
            background:rgba(15,23,42,0.96);
            border:1px solid rgba(148,163,184,0.22);
            border-radius:22px;
            padding:14px;
            color:#e5e7eb;
            font-family:system-ui, sans-serif;
            font-size:12px;
            box-shadow:0 22px 50px rgba(0,0,0,0.35);
            z-index:4;
            backdrop-filter:blur(10px);
          "
        >
          <div
            style="
              display:flex;
              justify-content:space-between;
              gap:10px;
              align-items:flex-start;
              margin-bottom:10px;
            "
          >
            <div style="font-weight:800; font-size:14px; line-height:1.2;">
              ${data?.driver_name || data?.driver_code || did}
            </div>
            <div
              style="
                padding:4px 9px;
                border-radius:999px;
                font-size:10px;
                font-weight:700;
                text-transform:uppercase;
                background:${statusColor}22;
                color:${statusColor};
              "
            >
              ${statusText}
            </div>
          </div>

          <div style="color:#94a3b8; font-size:11px; margin-bottom:12px;">
            Vendor ${vid}
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div>
              <div style="color:#94a3b8; font-size:10px; margin-bottom:2px;">Driver ID</div>
              <div style="color:#e5e7eb; font-size:12px;">${did}</div>
            </div>
            <div>
              <div style="color:#94a3b8; font-size:10px; margin-bottom:2px;">Last update</div>
              <div style="color:#e5e7eb; font-size:12px;">${updatedText}</div>
            </div>
            <div>
              <div style="color:#94a3b8; font-size:10px; margin-bottom:2px;">Route</div>
              <div style="color:#e5e7eb; font-size:12px;">${routeText}</div>
            </div>
            <div>
              <div style="color:#94a3b8; font-size:10px; margin-bottom:2px;">Speed</div>
              <div style="color:#e5e7eb; font-size:12px;">${speedText}</div>
            </div>
          </div>

          <div style="margin-top:12px; display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div>
              <div style="color:#94a3b8; font-size:10px; margin-bottom:2px;">Coordinates</div>
              <div style="color:#e5e7eb; font-size:12px;">${coordsText}</div>
            </div>
            <div>
              <div style="color:#94a3b8; font-size:10px; margin-bottom:2px;">Provider</div>
              <div style="color:#e5e7eb; font-size:12px;">${data?.provider || "—"}</div>
            </div>
          </div>
        </div>
      ` : ""}

    </div>
  `;
}

export default function DriverMarker({ vid, did, data, trail = [], offset = { x: 0, y: 0 }, selected = false, onClick }) {
  const map = useMap();
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    class HtmlMarker extends window.google.maps.OverlayView {
      constructor() {
        super();
        this.lat = data.lat;
        this.lng = data.lng;
        this.offset = offset;
      }

      onAdd() {
        this.el = document.createElement("div");
        this.el.style.position = "absolute";
        this.el.style.cursor = "pointer";

        this.el.innerHTML = buildMarkerHtml(
          vid,
          did,
          markerColor(vid, data),
          data.is_active,
          isStale(data),
          data.driver_code || did,
          selected,
          data
        );

        this.el.onclick = () => {
          onClick?.(vid, did);
        };

        this.getPanes().overlayMouseTarget.appendChild(this.el);
      }

      draw() {
        const proj = this.getProjection();
        if (!proj || !this.el) return;

        const pt = proj.fromLatLngToDivPixel(
          new window.google.maps.LatLng(this.lat, this.lng)
        );

        if (!pt) return;

        const offsetX = this.offset?.x || 0;
        const offsetY = this.offset?.y || 0;

        this.el.style.left = `${pt.x + offsetX}px`;
        this.el.style.top = `${pt.y + offsetY}px`;
        this.el.style.pointerEvents = "auto";
      }

      onRemove() {
        if (this.el && this.el.parentNode) {
          this.el.parentNode.removeChild(this.el);
        }
      }
    }

    const marker = new HtmlMarker();
    marker.setMap(map);
    overlayRef.current = marker;

    return () => {
      marker.setMap(null);
    };
  }, [map, vid, did, data, onClick, selected]);

  return (
    <>
      {trail?.length > 1 && (
        <TrailPolyline trail={trail} color={markerColor(vid, data)} />
      )}
    </>
  );
}
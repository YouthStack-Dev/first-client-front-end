// components/MapMarkers.jsx
import React from "react";
import { AdvancedMarker, Pin } from "@vis.gl/react-google-maps";

// ── SVG paths ──────────────────────────────────────────────────────────────
// Truck icon (top-down silhouette, fits 24x24 viewBox)
const TRUCK_PATH =
  "M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5S5.17 15.5 6 15.5s1.5.67 1.5 1.5S6.83 18.5 6 18.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z";

// Building / HQ icon
const HQ_PATH =
  "M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z";

// ── Marker Components ──────────────────────────────────────────────────────

const HQMarker = ({ position }) => (
  <AdvancedMarker position={position} title="Company HQ" zIndex={10}>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.35))",
      }}
    >
      {/* Icon bubble */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50% 50% 50% 0",
          transform: "rotate(-45deg)",
          background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
          border: "2.5px solid #fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(37,99,235,0.5)",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width={20}
          height={20}
          fill="white"
          style={{ transform: "rotate(45deg)" }}
        >
          <path d={HQ_PATH} />
        </svg>
      </div>
      {/* Stem */}
      <div
        style={{
          width: 3,
          height: 8,
          background: "#1D4ED8",
          borderRadius: "0 0 2px 2px",
        }}
      />
      {/* Label */}
      <div
        style={{
          marginTop: 3,
          background: "#1D4ED8",
          color: "#fff",
          fontSize: 10,
          fontWeight: 700,
          padding: "2px 6px",
          borderRadius: 4,
          letterSpacing: "0.05em",
          whiteSpace: "nowrap",
        }}
      >
        HQ
      </div>
    </div>
  </AdvancedMarker>
);

const VehicleMarker = ({ route, onMarkerClick }) => {
  const isDelayed = route.status === "Delayed";
  const isLoading = route.isLoading;
  const hasLive = route.hasLiveLocation;

  // Color scheme per state
  const colors = isLoading
    ? { bg: "#6B7280", border: "#9CA3AF", glow: "rgba(107,114,128,0.4)" }
    : isDelayed
    ? { bg: "#DC2626", border: "#FCA5A5", glow: "rgba(220,38,38,0.4)" }
    : hasLive
    ? { bg: "#059669", border: "#6EE7B7", glow: "rgba(5,150,105,0.4)" }
    : { bg: "#D97706", border: "#FCD34D", glow: "rgba(217,119,6,0.4)" };

  const label =
    route.vehicle?.rc_number?.slice(-6) ||
    route.driver?.name?.split(" ")[0] ||
    "Vehicle";

  return (
    <AdvancedMarker
      position={route.currentLocation}
      title={route.vehicle?.rc_number || "Vehicle"}
      onClick={() => onMarkerClick(route.route_id)}
      zIndex={5}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          cursor: "pointer",
          filter: `drop-shadow(0 2px 8px ${colors.glow})`,
        }}
      >
        {/* Live pulse ring (only when live) */}
        {hasLive && !isLoading && (
          <div
            style={{
              position: "absolute",
              width: 52,
              height: 52,
              borderRadius: "50%",
              border: `2px solid ${colors.bg}`,
              opacity: 0.4,
              animation: "ping 1.5s cubic-bezier(0,0,0.2,1) infinite",
              top: -6,
            }}
          />
        )}

        {/* Icon bubble */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50% 50% 50% 0",
            transform: "rotate(-45deg)",
            background: `linear-gradient(135deg, ${colors.bg}, ${colors.bg}dd)`,
            border: `2.5px solid ${colors.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {isLoading ? (
            // Spinner inside bubble
            <div
              style={{
                width: 18,
                height: 18,
                border: "2.5px solid rgba(255,255,255,0.3)",
                borderTop: "2.5px solid white",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                transform: "rotate(45deg)",
              }}
            />
          ) : (
            <svg
              viewBox="0 0 24 24"
              width={20}
              height={20}
              fill="white"
              style={{ transform: "rotate(45deg)" }}
            >
              <path d={TRUCK_PATH} />
            </svg>
          )}
        </div>

        {/* Stem */}
        <div
          style={{
            width: 3,
            height: 8,
            background: colors.bg,
            borderRadius: "0 0 2px 2px",
          }}
        />

        {/* Label chip */}
        <div
          style={{
            marginTop: 3,
            background: colors.bg,
            color: "#fff",
            fontSize: 10,
            fontWeight: 700,
            padding: "2px 6px",
            borderRadius: 4,
            letterSpacing: "0.04em",
            whiteSpace: "nowrap",
            maxWidth: 80,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {label}
        </div>
      </div>
    </AdvancedMarker>
  );
};

// ── Keyframes injected once ────────────────────────────────────────────────
const STYLES = `
  @keyframes ping {
    0%   { transform: scale(1); opacity: 0.4; }
    75%, 100% { transform: scale(1.8); opacity: 0; }
  }
  @keyframes spin {
    from { transform: rotate(45deg); }
    to   { transform: rotate(405deg); }
  }
`;

// ── Main export ────────────────────────────────────────────────────────────
const MapMarkers = ({ companyLocation, selectedRoutes, onMarkerClick }) => {
  return (
    <>
      <style>{STYLES}</style>

      <HQMarker position={companyLocation} />

      {selectedRoutes.map((route) => (
        <VehicleMarker
          key={route.route_id}
          route={route}
          onMarkerClick={onMarkerClick}
        />
      ))}
    </>
  );
};

export default MapMarkers;
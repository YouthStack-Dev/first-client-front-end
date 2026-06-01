// src/components/liveDrivers/liveDriverHelpers.js

export const STALE_MS = 5 * 60 * 1000; // 5 minutes
export const MAX_TRAIL = 20;
export const TICK_MS = 3000;

export const VENDOR_COLORS = [
  "#22c55e",
  "#f97316",
  "#38bdf8",
  "#c084fc",
  "#fb7185",
  "#fbbf24",
  "#34d399",
  "#818cf8",
];

let colorIndex = 0;
const vendorColorMap = {};

export const vendorColor = (vendorId) => {
  if (!vendorId) return "#38bdf8";

  if (!vendorColorMap[vendorId]) {
    vendorColorMap[vendorId] =
      VENDOR_COLORS[
        colorIndex++ % VENDOR_COLORS.length
      ];
  }

  return vendorColorMap[vendorId];
};

const parseUpdatedAt = (updatedAt) => {
  if (updatedAt == null) return null;
  if (typeof updatedAt === "number") return updatedAt;
  if (typeof updatedAt === "string") {
    const parsed = Date.parse(updatedAt);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
};

export const isStale = (driver) => {
  if (!driver?.is_active) return false;

  const updatedAt = parseUpdatedAt(driver.updated_at);
  if (!updatedAt) return false;

  return Date.now() - updatedAt > STALE_MS;
};

export const markerColor = (
  vendorId,
  driver
) => {
  if (!driver?.is_active) {
    return "#3f4452";
  }

  if (isStale(driver)) {
    return "#d97706";
  }

  return vendorColor(vendorId);
};

export const secAgo = (timestamp) => {
  if (timestamp == null) return 0;
  const parsed =
    typeof timestamp === "number"
      ? timestamp
      : typeof timestamp === "string"
      ? Date.parse(timestamp)
      : null;

  if (!parsed || Number.isNaN(parsed)) return 0;
  return Math.round((Date.now() - parsed) / 1000);
};

export const fmtAge = (seconds) => {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  if (seconds < 3600) {
    return `${Math.floor(
      seconds / 60
    )}m ${seconds % 60}s`;
  }

  return `${Math.floor(
    seconds / 3600
  )}h ${Math.floor(
    (seconds % 3600) / 60
  )}m`;
};

export function haversineKm(
  lat1,
  lng1,
  lat2,
  lng2
) {
  const R = 6371;
  const toRad = Math.PI / 180;

  const dLat =
    (lat2 - lat1) * toRad;

  const dLng =
    (lng2 - lng1) * toRad;

  const a =
    Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +
    Math.cos(lat1 * toRad) *
      Math.cos(lat2 * toRad) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  return (
    R *
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )
  );
}

export function estimateSpeed(
  trail,
  trailTs
) {
  const n = trail?.length || 0;

  if (n < 2) {
    return null;
  }

  const lastTime =
    trailTs[n - 1];

  const prevTime =
    trailTs[n - 2];

  const hours =
    (lastTime - prevTime) /
    3600000;

  if (hours <= 0 || hours > 0.1) {
    return null;
  }

  const [lat1, lng1] =
    trail[n - 2];

  const [lat2, lng2] =
    trail[n - 1];

  const distanceKm =
    haversineKm(
      lat1,
      lng1,
      lat2,
      lng2
    );

  return Math.round(
    distanceKm / hours
  );
}

export const getDriverStatus = (
  driver
) => {
  if (!driver?.is_active) {
    return "offline";
  }

  if (isStale(driver)) {
    return "stale";
  }

  return "active";
};

export const getStatusColor = (
  driver
) => {
  switch (
    getDriverStatus(driver)
  ) {
    case "active":
      return "#22c55e";

    case "stale":
      return "#d97706";

    case "offline":
      return "#3f4452";

    default:
      return "#64748b";
  }
};
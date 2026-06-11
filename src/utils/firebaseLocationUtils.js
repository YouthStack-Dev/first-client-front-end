// utils/firebaseLocationUtils.js
import {
  ref,
  onValue,
  off,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
} from "firebase/database";
import { database } from "./firebase";
import { logDebug } from "./logger";

// ─── YOUR EXISTING CODE — untouched ──────────────────────────────────────────

const getTenantId = () => {
  const tenant = JSON.parse(localStorage.getItem("tenant") || "null");
  return tenant?.tenant_id || "default_tenant";
};

export const subscribeToDriverLocation = (driverId, vendorId, onUpdate, onError) => {
  const tenant_id = getTenantId();

  if (!vendorId) {
    logDebug(`❌ No vendorId provided for driver ${driverId} — cannot subscribe`);
    onError?.(driverId, "Missing vendor ID");
    return () => {};
  }

  const path = `drivers/${tenant_id}/${vendorId}/${driverId}`;
  const driverLocationRef = ref(database, path);

  logDebug("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  logDebug("📡 Subscribing to Firebase path:", path);
  logDebug("📡 driverId:", driverId, "| vendorId:", vendorId, "| tenant:", tenant_id);
  logDebug("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const unsubscribe = onValue(
    driverLocationRef,
    (snapshot) => {
      logDebug("📥 Snapshot for driver:", driverId, "| exists:", snapshot.exists());
      logDebug("📥 val:", JSON.stringify(snapshot.val(), null, 2));

      if (snapshot.exists()) {
        const locationData = snapshot.val();
        const parsedLocation = parseLocationData(locationData, driverId);

        if (parsedLocation) {
          logDebug("✅ Location updated for driver:", driverId, parsedLocation);
          onUpdate(driverId, parsedLocation);
        } else {
          logDebug("❌ Invalid coordinates for driver:", driverId);
          onError?.(driverId, "Invalid coordinates");
        }
      } else {
        logDebug(`❌ No data at path: ${path}`);
        onError?.(driverId, "Location not available");
      }
    },
    (error) => {
      console.error(`🔥 Firebase ERROR for driver ${driverId}:`, error.message);
      onError?.(driverId, "Failed to fetch location");
    }
  );

  return () => {
    logDebug("🔌 Unsubscribing from path:", path);
    off(driverLocationRef, "value", unsubscribe);
  };
};

const normalizeTimestamp = (value) => {
  if (value == null) return null;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
};

const normalizeCoordinateValue = (value) => {
  if (value == null || value === "") return null;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const cleaned = value.trim();
    if (cleaned === "") return null;
    return parseFloat(cleaned.replace(/[^0-9+\-.eE]/g, ""));
  }
  return null;
};

const tryCoordinateObject = (candidate) => {
  if (!candidate || typeof candidate !== "object") return null;

  if (Array.isArray(candidate) && candidate.length >= 2) {
    const first = normalizeCoordinateValue(candidate[0]);
    const second = normalizeCoordinateValue(candidate[1]);
    if (first != null && second != null) {
      if (Math.abs(first) <= 90 && Math.abs(second) <= 180) {
        return { lat: first, lng: second };
      }
      if (Math.abs(second) <= 90 && Math.abs(first) <= 180) {
        return { lat: second, lng: first };
      }
    }
    return null;
  }

  const lat = candidate.latitude ?? candidate.lat ?? candidate.y ?? candidate.n ?? candidate["0"];
  const lng = candidate.longitude ?? candidate.lng ?? candidate.lon ?? candidate.long ?? candidate.x ?? candidate["1"];

  const latNum = normalizeCoordinateValue(lat);
  const lngNum = normalizeCoordinateValue(lng);

  if (latNum == null || lngNum == null) {
    return null;
  }

  return { lat: latNum, lng: lngNum };
};

const parseCoordinates = (raw) => {
  if (!raw) return null;

  if (typeof raw === "string") {
    const match = raw.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
    if (match) {
      return {
        lat: parseFloat(match[1]),
        lng: parseFloat(match[2]),
      };
    }
    return null;
  }

  const candidates = [
    raw.location,
    raw.coords,
    raw.coordinates,
    raw.geo,
    raw.geopoint,
    raw.geo_point,
    raw.position,
    raw.point,
    raw.gps,
    raw,
  ];

  for (const candidate of candidates) {
    const coords = tryCoordinateObject(candidate);
    if (coords) return coords;
  }

  return null;
};

const normalizeSpeed = (speed, provider) => {
  if (speed == null || speed === "") return null;

  const parsed = typeof speed === "number" ? speed : parseFloat(speed);
  if (Number.isNaN(parsed)) return null;

  const providerKey = String(provider || "").toLowerCase();
  if (providerKey.includes("geolocator")) {
    return Number((parsed * 3.6).toFixed(1));
  }

  return Number(parsed.toFixed(1));
};

const normalizeBoolean = (value, defaultValue = null) => {
  if (typeof value === "boolean") return value;
  if (value === "true" || value === "1") return true;
  if (value === "false" || value === "0") return false;
  return defaultValue;
};

const normalizeDriverNode = (raw, driverId) => {
  if (!raw || typeof raw !== "object") return null;

  const coords = parseCoordinates(raw);
  if (!coords) return null;

  const updatedAt =
    normalizeTimestamp(raw.updated_at) ||
    normalizeTimestamp(raw.updatedAt) ||
    normalizeTimestamp(raw.timestamp);

  const createdAt =
    normalizeTimestamp(raw.created_at) ||
    normalizeTimestamp(raw.createdAt);

  const clearedAt =
    normalizeTimestamp(raw.cleared_at) ||
    normalizeTimestamp(raw.clearedAt);

  const provider = raw.provider || raw.source || null;
  const speed = normalizeSpeed(raw.speed, provider);

  const rawIsActive = raw.is_active ?? raw.isActive;
  const isActive = normalizeBoolean(rawIsActive, rawIsActive == null ? true : false);

  return {
    ...coords,
    is_active:        isActive,
    updated_at:       updatedAt,
    updated_at_raw:   raw.updated_at,
    created_at:       createdAt,
    cleared_at:       clearedAt,
    timestamp:        normalizeTimestamp(raw.timestamp) || updatedAt || Date.now(),
    speed,
    accuracy:         raw.accuracy  ?? null,
    heading:          raw.heading   ?? null,
    provider,
    driver_name:      raw.driver_name  || raw.driverName  || raw.name || null,
    driver_code:      raw.driver_code  || raw.driverCode  || null,
    driver_id:        raw.driver_id    || raw.driverId    || driverId,
    route_id:         raw.route_id     ?? raw.routeId     ?? null,
    route_code:       raw.route_code   || raw.routeCode   || null,
    vendor_id:        raw.vendor_id    || raw.vendorId    || null,
    vehicle_rc_number: raw.vehicle_rc_number || raw.vehicleRcNumber || null,
    vehicle_type:     raw.vehicle_type || raw.vehicleType || null,
  };
};

export const parseLocationData = (locationData, driverId) => {
  return normalizeDriverNode(locationData, driverId);
};

export const subscribeToMultipleDrivers = (drivers, onUpdate, onError) => {
  const unsubscribes = drivers.map(({ driverId, vendorId }) =>
    subscribeToDriverLocation(driverId, vendorId, onUpdate, onError)
  );
  return () => unsubscribes.forEach((u) => u());
};

// ─── NEW: tenant-level subscription for LiveDriverMap ────────────────────────

/**
 * subscribeToTenantDrivers
 *
 * Listens at:
 *   drivers/{tenantId}            — all vendors (vendorId = null)
 *   drivers/{tenantId}/{vendorId} — single vendor
 *
 * Callbacks:
 *   onDriverUpdate(vendorId, driverId, { lat, lng, is_active, updated_at, ... })
 *   onDriverRemove(vendorId, driverId | null)   null = whole vendor removed
 *   onError(message)
 *
 * Returns unsubscribe().
 */
export const subscribeToTenantDrivers = (
  tenantId,
  vendorId = null,
  onDriverUpdate,
  onDriverRemove,
  onError
) => {
  if (!tenantId) {
    logDebug("❌ subscribeToTenantDrivers: tenantId is required");
    onError?.("Missing tenant ID");
    return () => {};
  }

  // ── Single vendor: children are driver nodes ──────────────────────────────
  if (vendorId) {
    const path  = `drivers/${tenantId}/${vendorId}`;
    const dbRef = ref(database, path);

    const pushUpdate = (snap) => {
      const raw = snap.val();
      if (!raw) return;
      const normalized = normalizeDriverNode(raw, snap.key);
      if (normalized) {
        onDriverUpdate(vendorId, snap.key, normalized);
      }
    };

    const addH = onChildAdded  (dbRef, pushUpdate);
    const chgH = onChildChanged(dbRef, pushUpdate);
    const remH = onChildRemoved(dbRef, (snap) => onDriverRemove(vendorId, snap.key));

    return () => {
      off(dbRef, "child_added",   addH);
      off(dbRef, "child_changed", chgH);
      off(dbRef, "child_removed", remH);
    };
  }

  // ── All vendors: children are vendor nodes ────────────────────────────────
  const path  = `drivers/${tenantId}`;
  const dbRef = ref(database, path);

  const processVendorSnap = (vendorKey, snapVal) => {
    if (!snapVal || typeof snapVal !== "object") return;
    Object.entries(snapVal).forEach(([driverId, raw]) => {
      if (!raw) return;
      const normalized = normalizeDriverNode(raw, driverId);
      if (normalized) {
        onDriverUpdate(vendorKey, driverId, normalized);
      }
    });
  };

  const addH = onChildAdded  (dbRef, (s) => processVendorSnap(s.key, s.val()));
  const chgH = onChildChanged(dbRef, (s) => processVendorSnap(s.key, s.val()));
  const remH = onChildRemoved(dbRef, (s) => onDriverRemove(s.key, null));

  return () => {
    off(dbRef, "child_added",   addH);
    off(dbRef, "child_changed", chgH);
    off(dbRef, "child_removed", remH);
  };
};
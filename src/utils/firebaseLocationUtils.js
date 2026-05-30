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

export const parseLocationData = (locationData, driverId) => {
  const data =
    locationData.location ||
    locationData.coords ||
    locationData.coordinates ||
    locationData;

  const lat = data.latitude ?? data.lat;
  const lng = data.longitude ?? data.lng ?? data.lon ?? data.long;

  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);

  if (!isNaN(latNum) && !isNaN(lngNum)) {
    return {
      lat: latNum,
      lng: lngNum,
      timestamp: data.timestamp || locationData.timestamp || Date.now(),
    };
  }

  console.warn(`⚠️ Invalid coordinates for driver ${driverId}:`, { lat, lng });
  return null;
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
 *   onDriverUpdate(vendorId, driverId, { lat, lng, is_active, updated_at })
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
    logDebug(`📡 [TenantDrivers] vendor scope → ${path}`);

    const pushUpdate = (snap) => {
      const raw = snap.val();
      if (!raw) return;
      const parsed = parseLocationData(raw, snap.key);
      if (parsed) {
        onDriverUpdate(vendorId, snap.key, {
          ...parsed,
          is_active:  raw.is_active,
          updated_at: raw.updated_at,
        });
      }
    };

    const addH = onChildAdded  (dbRef, pushUpdate);
    const chgH = onChildChanged(dbRef, pushUpdate);
    const remH = onChildRemoved(dbRef, (snap) => onDriverRemove(vendorId, snap.key));

    return () => {
      off(dbRef, "child_added",   addH);
      off(dbRef, "child_changed", chgH);
      off(dbRef, "child_removed", remH);
      logDebug(`🔌 [TenantDrivers] unsubscribed vendor scope → ${path}`);
    };
  }

  // ── All vendors: children are vendor nodes ────────────────────────────────
  const path  = `drivers/${tenantId}`;
  const dbRef = ref(database, path);
  logDebug(`📡 [TenantDrivers] all-vendor scope → ${path}`);

  const processVendorSnap = (vendorKey, snapVal) => {
    if (!snapVal || typeof snapVal !== "object") return;
    Object.entries(snapVal).forEach(([driverId, raw]) => {
      if (!raw) return;
      const parsed = parseLocationData(raw, driverId);
      if (parsed) {
        onDriverUpdate(vendorKey, driverId, {
          ...parsed,
          is_active:  raw.is_active,
          updated_at: raw.updated_at,
        });
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
    logDebug(`🔌 [TenantDrivers] unsubscribed all-vendor scope → ${path}`);
  };
};
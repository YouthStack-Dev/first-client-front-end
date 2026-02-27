// utils/firebaseLocationUtils.js
import { ref, onValue, off } from "firebase/database";
import { database } from "./firebase";
import { logDebug } from "./logger";

// ── FIX: Read tenant INSIDE function, not at module load time ─────────────────
// Old code ran at import time = before login = always got "default_tenant"
// Now reads fresh localStorage every time a subscription is created
const getTenantId = () => {
  const tenant = JSON.parse(localStorage.getItem("tenant") || "null");
  return tenant?.tenant_id || "default_tenant";
};

// vendorId is passed dynamically from route.vendor.id — no hardcoding
export const subscribeToDriverLocation = (driverId, vendorId, onUpdate, onError) => {
  const tenant_id = getTenantId(); // ← fresh read every subscription

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
// utils/firebaseLocationUtils.js
import { ref, onValue, off } from "firebase/database";
import { database } from "./firebase";
import { logDebug } from "./logger";

/**
 * Subscribe to real-time location updates for a driver
 * @param {string} driverId - The driver's unique ID
 * @param {function} onUpdate - Callback when location updates
 * @param {function} onError - Callback for errors
 * @returns {function} Unsubscribe function
 */

const tenant = JSON.parse(localStorage.getItem("tenant"));
logDebug("Firebase Tenant:", tenant?.tenant_id);
const tenant_id = tenant?.tenant_id || "default_tenant";
const vendor = 1; // You can modify this as needed
export const subscribeToDriverLocation = (driverId, onUpdate, onError) => {
  const driverLocationRef = ref(
    database,
    `drivers/${tenant_id}/${vendor}/${driverId}`
  );
  logDebug(
    " the firebase path is :",
    "drivers/" + tenant_id + "/" + vendor + "/" + driverId
  );
  const unsubscribe = onValue(
    driverLocationRef,
    (snapshot) => {
      logDebug("Firebase snapshot received for driver:", snapshot);
      if (snapshot.exists()) {
        const locationData = snapshot.val();
        const parsedLocation = parseLocationData(locationData, driverId);
        logDebug(" This is the parsed location data: ", parsedLocation);

        logDebug(" This is the parsed location data: ", parsedLocation);
        if (parsedLocation) {
          onUpdate(driverId, parsedLocation);
        } else {
          onError?.(driverId, "Invalid coordinates");
        }
      } else {
        logDebug(`No location data for driver ${driverId}`);
        onError?.(driverId, "Location not available");
      }
    },
    (error) => {
      console.error(`Firebase error for driver ${driverId}:`, error);
      onError?.(driverId, "Failed to fetch location");
    }
  );

  return () => off(driverLocationRef, "value", unsubscribe);
};

/**
 * Parse and validate location data from Firebase
 */
export const parseLocationData = (locationData, driverId) => {
  const lat = locationData.latitude || locationData.lat;
  const lng =
    locationData.longitude ||
    locationData.lng ||
    locationData.lon ||
    locationData.long;

  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);

  if (!isNaN(latNum) && !isNaN(lngNum)) {
    return {
      lat: latNum,
      lng: lngNum,
      timestamp: locationData.timestamp || Date.now(),
    };
  }

  console.warn(`Invalid coordinates for ${driverId}:`, { lat, lng });
  return null;
};

/**
 * Subscribe to multiple drivers at once
 */
export const subscribeToMultipleDrivers = (driverIds, onUpdate, onError) => {
  const unsubscribes = driverIds.map((driverId) =>
    subscribeToDriverLocation(driverId, onUpdate, onError)
  );

  return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
};

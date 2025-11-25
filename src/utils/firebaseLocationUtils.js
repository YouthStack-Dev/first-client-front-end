// utils/firebaseLocationUtils.js
import { ref, onValue, off } from "firebase/database";
import { database } from "./firebase";

/**
 * Subscribe to real-time location updates for a driver
 * @param {string} driverId - The driver's unique ID
 * @param {function} onUpdate - Callback when location updates
 * @param {function} onError - Callback for errors
 * @returns {function} Unsubscribe function
 */
export const subscribeToDriverLocation = (driverId, onUpdate, onError) => {
  const driverLocationRef = ref(database, `Driverlocations/${driverId}`);

  const unsubscribe = onValue(
    driverLocationRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const locationData = snapshot.val();
        const parsedLocation = parseLocationData(locationData, driverId);

        if (parsedLocation) {
          onUpdate(driverId, parsedLocation);
        } else {
          onError?.(driverId, "Invalid coordinates");
        }
      } else {
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

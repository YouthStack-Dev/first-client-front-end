// hooks/useDriverLocations.js
import { useState, useEffect, useCallback } from "react";
import { subscribeToDriverLocation } from "../utils/firebaseLocationUtils";

// trackedDrivers = [{ driverId: 19, vendorId: 9 }, ...]
export const useDriverLocations = (trackedDrivers = []) => {
  const [driverLocations, setDriverLocations] = useState({});
  const [loadingLocations, setLoadingLocations] = useState({});
  const [locationErrors, setLocationErrors] = useState({});

  // ── Stable string key — prevents re-subscribing on every render ────────────
  // Sort by driverId so array order changes don't trigger re-subscribe
  const driversKey = JSON.stringify(
    [...trackedDrivers].sort((a, b) =>
      String(a.driverId).localeCompare(String(b.driverId))
    )
  );

  const handleLocationUpdate = useCallback((driverId, location) => {
    setDriverLocations((prev) => ({ ...prev, [driverId]: location }));
    setLoadingLocations((prev) => ({ ...prev, [driverId]: false }));
    setLocationErrors((prev) => ({ ...prev, [driverId]: null }));
  }, []);

  const handleLocationError = useCallback((driverId, error) => {
    setLocationErrors((prev) => ({ ...prev, [driverId]: error }));
    setLoadingLocations((prev) => ({ ...prev, [driverId]: false }));
  }, []);

  useEffect(() => {
    const drivers = JSON.parse(driversKey);
    if (!drivers.length) return;

    const unsubscribes = [];

    drivers.forEach(({ driverId, vendorId }) => {
      if (driverId && vendorId) {
        setLoadingLocations((prev) => ({ ...prev, [driverId]: true }));

        const unsubscribe = subscribeToDriverLocation(
          driverId,
          vendorId,
          handleLocationUpdate,
          handleLocationError
        );

        unsubscribes.push(unsubscribe);
      }
    });

    return () => unsubscribes.forEach((u) => u());

  // driversKey is a stable string — only re-runs when drivers actually change
  }, [driversKey, handleLocationUpdate, handleLocationError]);

  return { driverLocations, loadingLocations, locationErrors };
};
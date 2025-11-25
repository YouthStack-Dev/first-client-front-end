// hooks/useDriverLocations.js
import { useState, useEffect, useCallback } from "react";
import { subscribeToDriverLocation } from "../utils/firebaseLocationUtils";

export const useDriverLocations = (trackedDriverIds = []) => {
  const [driverLocations, setDriverLocations] = useState({});
  const [loadingLocations, setLoadingLocations] = useState({});
  const [locationErrors, setLocationErrors] = useState({});

  const handleLocationUpdate = useCallback((driverId, location) => {
    setDriverLocations((prev) => ({
      ...prev,
      [driverId]: location,
    }));
    setLoadingLocations((prev) => ({ ...prev, [driverId]: false }));
    setLocationErrors((prev) => ({ ...prev, [driverId]: null }));
  }, []);

  const handleLocationError = useCallback((driverId, error) => {
    setLocationErrors((prev) => ({ ...prev, [driverId]: error }));
    setLoadingLocations((prev) => ({ ...prev, [driverId]: false }));
  }, []);

  useEffect(() => {
    const unsubscribes = [];

    trackedDriverIds.forEach((driverId) => {
      if (driverId) {
        setLoadingLocations((prev) => ({ ...prev, [driverId]: true }));

        const unsubscribe = subscribeToDriverLocation(
          driverId,
          handleLocationUpdate,
          handleLocationError
        );

        unsubscribes.push(unsubscribe);
      }
    });

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [trackedDriverIds, handleLocationUpdate, handleLocationError]);

  return {
    driverLocations,
    loadingLocations,
    locationErrors,
  };
};

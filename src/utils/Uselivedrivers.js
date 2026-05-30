// hooks/useLiveDrivers.js
import { useState, useEffect, useCallback } from "react";
import { subscribeToTenantDrivers } from "../utils/firebaseLocationUtils";

export const useLiveDrivers = ({ tenantId = null, vendorId = null } = {}) => {
  const [driverMap, setDriverMap] = useState({});
  const [status,    setStatus]    = useState("idle");
  const [error,     setError]     = useState(null);

  const handleDriverUpdate = useCallback((vid, did, data) => {
    // parseLocationData returns { lat, lng } — guard on lat not latitude
    if (!data || data.lat == null) return;
    setDriverMap((prev) => ({
      ...prev,
      [vid]: {
        ...(prev[vid] || {}),
        [did]: { ...data, vendorId: vid, driverId: did },
      },
    }));
  }, []);

  const handleDriverRemove = useCallback((vid, did) => {
    setDriverMap((prev) => {
      if (!prev[vid]) return prev;
      if (did === null) {
        const next = { ...prev };
        delete next[vid];
        return next;
      }
      const nextVendor = { ...prev[vid] };
      delete nextVendor[did];
      const next = { ...prev, [vid]: nextVendor };
      if (!Object.keys(nextVendor).length) delete next[vid];
      return next;
    });
  }, []);

  useEffect(() => {
    if (!tenantId) {
      setStatus("idle");
      setDriverMap({});
      return;
    }

    setStatus("connecting");
    setError(null);
    setDriverMap({});

    let unsubscribe;
    try {
      unsubscribe = subscribeToTenantDrivers(
        tenantId,
        vendorId,
        handleDriverUpdate,
        handleDriverRemove,
        (err) => {
          console.error("[useLiveDrivers]", err);
          setError(typeof err === "string" ? err : err?.message ?? "Unknown error");
          setStatus("error");
        }
      );
      setStatus("live");
    } catch (e) {
      console.error("[useLiveDrivers] subscribe failed:", e);
      setError(e.message);
      setStatus("error");
    }

    return () => { unsubscribe?.(); };
  }, [tenantId, vendorId, handleDriverUpdate, handleDriverRemove]);

  return { driverMap, status, error };
};
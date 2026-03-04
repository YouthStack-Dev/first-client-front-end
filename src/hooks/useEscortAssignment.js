import { useState, useCallback } from "react";
import { API_CLIENT } from "../../Api/API_Client";
import { logDebug, logError } from "../../utils/logger";

/**
 * Fetches available escorts for a given tenant and assigns one to a route.
 *
 * @param {string|null} tenantId  — pass tenant_id if your user is admin/superadmin;
 *                                  leave null for employee users (token carries it).
 */
export const useEscortAssignment = (tenantId = null) => {
  const [escorts, setEscorts] = useState([]);
  const [loadingEscorts, setLoadingEscorts] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState(null);

  /** Fetch the list of available escorts to populate the picker */
  const fetchEscorts = useCallback(async () => {
    setLoadingEscorts(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (tenantId) params.append("tenant_id", tenantId);
      const qs = params.toString();
      const response = await API_CLIENT.get(
        `/escorts/available/${qs ? `?${qs}` : ""}`
      );
      // Normalise: support both { data: [...] } and plain array responses
      const list = Array.isArray(response.data)
        ? response.data
        : response.data?.data ?? [];
      setEscorts(list);
      logDebug("[useEscortAssignment] escorts fetched", list.length);
      return list;
    } catch (err) {
      logError("[useEscortAssignment] fetchEscorts failed", err);
      setError("Failed to load escorts. Please try again.");
      return [];
    } finally {
      setLoadingEscorts(false);
    }
  }, [tenantId]);

  /** PUT /routes/{route_id}/assign-escort?escort_id=X[&tenant_id=Y] */
  const assignEscort = useCallback(async (routeId, escortId) => {
    setAssigning(true);
    setError(null);
    try {
      const params = new URLSearchParams({ escort_id: escortId });
      if (tenantId) params.append("tenant_id", tenantId);

      const response = await API_CLIENT.put(
        `/routes/${routeId}/assign-escort?${params.toString()}`
      );
      logDebug("[useEscortAssignment] escort assigned", response.data);
      return { success: true, data: response.data };
    } catch (err) {
      logError("[useEscortAssignment] assignEscort failed", err);
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Failed to assign escort. Please try again.";
      setError(message);
      return { success: false, message };
    } finally {
      setAssigning(false);
    }
  }, [tenantId]);

  const clearError = () => setError(null);

  return {
    escorts,
    loadingEscorts,
    assigning,
    error,
    fetchEscorts,
    assignEscort,
    clearError,
  };
};

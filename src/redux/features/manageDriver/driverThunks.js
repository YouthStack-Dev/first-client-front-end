// src/redux/features/manageDriver/driverThunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";

// Helpers
const safeGetTenantId = (user) =>
  user?.tenant?.tenant_id || user?.tenant_id || user?.vendor_user?.tenant_id || null;

const safeGetVendorId = (user, selectedVendor) => {
  // selectedVendor may be an id or an object { vendor_id }
  if (!selectedVendor) return null;
  if (typeof selectedVendor === "string" || typeof selectedVendor === "number") {
    return selectedVendor;
  }
  if (selectedVendor.vendor_id) return selectedVendor.vendor_id;
  return null;
};

const ensureResponseItems = (response) => response?.data?.data?.items || [];

/**
 * Fetch drivers:
 * - Vendor login → drivers of that vendor using login token
 * - Tenant login  → drivers of selected vendor (from dropdown)
 */
export const fetchDriversThunk = createAsyncThunk(
  "drivers/fetchAll",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth: { user }, drivers } = getState();

      const isVendorSide = !!user?.vendor_user;

      // Normalize selected vendor id (state may store id or object)
      const selectedVendor = drivers.selectedVendor;
      const selectedVendorId = safeGetVendorId(user, selectedVendor);

      if (isVendorSide) {
        const response = await API_CLIENT.get("/v1/drivers/vendor");
        return ensureResponseItems(response);
      }

      // Tenant side: require a selected vendor (non-all)
      if (!selectedVendorId || String(selectedVendorId).toLowerCase() === "all") {
        return rejectWithValue("Please select a vendor to load drivers for this tenant.");
      }

      const response = await API_CLIENT.get(`/v1/drivers/vendor?vendor_id=${selectedVendorId}`);
      return ensureResponseItems(response);
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || err?.response?.data || err?.message || "Failed to fetch drivers"
      );
    }
  }
);

// --- Thunk for creating a driver ---
export const createDriverThunk = createAsyncThunk(
  "driver/createDriver",
  async (formDataInput, { getState, rejectWithValue }) => {
    try {
      const { auth: { user }, drivers } = getState();

      const isVendorSide = !!user?.vendor_user;

      const tenantId = safeGetTenantId(user);
      const vendorIdFromLogin = user?.vendor_user?.vendor_id || user?.vendor_id || null;
      const selectedVendor = drivers.selectedVendor;
      const selectedVendorId = safeGetVendorId(user, selectedVendor);

      const vendorIdForPayload = isVendorSide ? vendorIdFromLogin : selectedVendorId;

      // Normalize payload into FormData
      let payload;
      if (formDataInput instanceof FormData) {
        payload = formDataInput;
      } else {
        payload = new FormData();
        Object.entries(formDataInput || {}).forEach(([k, v]) => {
          if (v !== undefined && v !== null) payload.append(k, v);
        });
      }

      if (tenantId) {
        payload.delete("tenant_id");
        payload.append("tenant_id", tenantId);
      }

      if (!vendorIdForPayload) {
        return rejectWithValue({ message: "Vendor could not be resolved from login/selection. Please select a vendor." });
      }

      payload.delete("vendor_id");
      payload.append("vendor_id", vendorIdForPayload);

      const response = await API_CLIENT.post("/v1/drivers/create", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return response?.data?.data?.driver || response?.data;
    } catch (err) {
      console.error("Create driver error:", err?.response?.data || err?.message || err);
      return rejectWithValue(err?.response?.data || { message: "Something went wrong" });
    }
  }
);

/**
 * Update an existing driver
 */
export const updateDriverThunk = createAsyncThunk(
  "driver/updateDriver",
  async ({ driverId, formData }, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.put(
        `/v1/drivers/update?driver_id=${driverId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      return response?.data?.data?.driver || response?.data;
    } catch (err) {
      console.error("Error updating driver:", err?.response?.data || err);
      return rejectWithValue(err?.response?.data || { message: "Something went wrong while updating the driver." });
    }
  }
);

/**
 * Toggle driver active/inactive status
 */
export const toggleDriverStatusThunk = createAsyncThunk(
  "driver/toggleDriver",
  async (driver_id, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.patch(
        `/v1/drivers/${driver_id}/toggle-active`,
        {},
        { headers: { "Content-Type": "application/json" } }
      );

      return response?.data?.data || response?.data;
    } catch (err) {
      console.error("[Thunk] Failed to toggle driver status:", err?.response?.data || err);
      return rejectWithValue(err?.response?.data || { message: "Something went wrong" });
    }
  }
);

// Fetch drivers by vendor (explicit vendor filter – used by tenant VendorSelector)
export const fetchDriversByVendorThunk = createAsyncThunk(
  "drivers/fetchDriversByVendor",
  async (vendorId, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.get(`/v1/drivers/vendor?vendor_id=${vendorId}`);
      return { vendorId, items: ensureResponseItems(response) };
    } catch (err) {
      return rejectWithValue(err?.response?.data || "Failed to fetch vendor drivers");
    }
  }
);

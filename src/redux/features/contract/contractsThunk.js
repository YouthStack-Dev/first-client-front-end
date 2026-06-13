import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";
import endpoint from "../../../Api/Endpoints";

// ---------------------------------------------------------------------
// Contracts
// ---------------------------------------------------------------------

// Fetch contracts with optional query params (search, vendor_id, etc.)
export const fetchContractsThunk = createAsyncThunk(
  "contracts/fetchContracts",
  async (queryParams = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          queryString.append(key, value);
        }
      });

      const url = `/contracts/${
        queryString.toString() ? `?${queryString.toString()}` : ""
      }`;

      const response = await API_CLIENT.get(url);

      if (response.data.success) {
        const contracts = response.data.data.items || [];
        return { contracts };
      } else {
        return rejectWithValue(
          response.data.message || "Failed to fetch contracts"
        );
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Network error"
      );
    }
  }
);

export const createContractThunk = createAsyncThunk(
  "contracts/createContract",
  async (contractData, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.post("/contracts/", contractData);
      if (response.status === 201) {
        return response.data.data?.contract || response.data.data || response.data;
      } else {
        return rejectWithValue("Failed to create contract");
      }
    } catch (error) {
      const apiDetail = error.response?.data?.detail;
      const msg = Array.isArray(apiDetail)
        ? apiDetail.map((e) => e.msg || JSON.stringify(e)).join(", ")
        : typeof apiDetail === "string"
        ? apiDetail
        : error.message || "Failed to create contract";
      return rejectWithValue(msg);
    }
  }
);

export const updateContractThunk = createAsyncThunk(
  "contracts/updateContract",
  async ({ contractId, contractData }, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.put(
        `/contracts/${contractId}`,
        contractData
      );
      if (response.status === 200) {
        return response.data.data?.contract || response.data.data || response.data;
      } else {
        return rejectWithValue("Failed to update contract");
      }
    } catch (error) {
      const apiDetail = error.response?.data?.detail;
      const msg = Array.isArray(apiDetail)
        ? apiDetail.map((e) => e.msg || JSON.stringify(e)).join(", ")
        : typeof apiDetail === "string"
        ? apiDetail
        : error.message || "Failed to update contract";
      return rejectWithValue(msg);
    }
  }
);


export const deleteContractThunk = createAsyncThunk(
  "contracts/deleteContract",
  async ({ contractId, force = false }, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.delete(
        `/contracts/${contractId}?force=${force}`
      );
      if (response.status === 200 || response.status === 204) {
        return { contractId };
      }
      return rejectWithValue({ type: "UNKNOWN", message: "Failed to delete contract" });
    } catch (error) {
      const detail = error?.response?.data?.detail;
      const message =
        detail?.message ||
        error?.response?.data?.message ||
        detail?.error_code ||
        error.message ||
        "Failed to delete contract";

      const isVehicleConflict =
        typeof message === "string" &&
        (message.toLowerCase().includes("assigned") ||
         message.toLowerCase().includes("vehicle") ||
         message.includes("force=true"));

      return rejectWithValue({
        type: isVehicleConflict ? "VEHICLE_CONFLICT" : "ERROR",
        message,
      });
    }
  }
);

export const toggleContractStatusThunk = createAsyncThunk(
  "contracts/toggleContractStatus",
  async ({ contractId, isActive }, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.patch(
        `/contracts/${contractId}/toggle-status`
      );

      return {
        contractId,
        isActive,
        data: response.data,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Failed to toggle contract status"
      );
    }
  }
);

// ---------------------------------------------------------------------
// Slabs
// ---------------------------------------------------------------------

export const createSlabThunk = createAsyncThunk(
  "contracts/createSlab",
  async ({ contractId, slabData }, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.post(
        `/contracts/${contractId}/slabs`,
        slabData
      );
      if (response.status === 201) {
      const slab =
        response.data?.data?.slab ??
        response.data?.slab ??
        response.data;

        return {
        contractId,
        slab,
        };
      } else {
        return rejectWithValue("Failed to create slab");
      }
    } catch (error) {
      const apiDetail = error.response?.data?.detail;
      const msg = Array.isArray(apiDetail)
        ? apiDetail.map((e) => e.msg || JSON.stringify(e)).join(", ")
        : typeof apiDetail === "string"
        ? apiDetail
        : error.message || "Failed to create slab";
      return rejectWithValue(msg);
    }
  }
);

export const updateSlabThunk = createAsyncThunk(
  "contracts/updateSlab",
  async ({ contractId, slabId, slabData }, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.put(
        `/contracts/${contractId}/slabs/${slabId}`,
        slabData
      );
      if (response.status === 200) {
        const slab =
            response.data?.data?.slab ??
            response.data?.slab ??
            response.data;

        return {
            contractId,
            slabId,
            slab,
         };
      } else {
        return rejectWithValue("Failed to update slab");
      }
    } catch (error) {
      const apiDetail = error.response?.data?.detail;
      const msg = Array.isArray(apiDetail)
        ? apiDetail.map((e) => e.msg || JSON.stringify(e)).join(", ")
        : typeof apiDetail === "string"
        ? apiDetail
        : error.message || "Failed to update slab";
      return rejectWithValue(msg);
    }
  }
);

export const deleteSlabThunk = createAsyncThunk(
  "contracts/deleteSlab",
  async ({ contractId, slabId }, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.delete(
        `/contracts/${contractId}/slabs/${slabId}`
      );

      if (response.status === 200 || response.status === 204) {
        return {
          contractId,
          slabId,
        };
      }

      return rejectWithValue("Failed to delete slab");
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.detail ||
          error.message
      );
    }
  }
);

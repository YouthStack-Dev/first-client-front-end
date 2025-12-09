import { API_CLIENT } from "../Api/API_Client";

const apiHandler = async (apiCall) => {
  try {
    const res = await apiCall();
    return {
      success: true,
      data: res.data,
    };
  } catch (err) {
    return {
      success: false,
      message: err?.response?.data?.message || "Something went wrong",
      status: err?.response?.status || 500,
    };
  }
};

/* -------------------------
   VENDOR USERS
-------------------------- */

export const createVendorUser = async (payload) =>
  apiHandler(() => API_CLIENT.post("/v1/vendor-users", payload));

export const updateVendorUser = async (id, payload) =>
  apiHandler(() => API_CLIENT.put(`/v1/vendor-users/${id}`, payload));

export const getVendorUsers = async () =>
  apiHandler(() => API_CLIENT.get("/v1/vendor-users"));

export const getVendorUserById = async (id) =>
  apiHandler(() => API_CLIENT.get(`/v1/vendor-users/${id}`));

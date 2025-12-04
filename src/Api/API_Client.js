import axios from "axios";
import Cookies from "js-cookie";
import { logDebug } from "../utils/logger";

// Read the environment variable
const baseURL = import.meta.env.VITE_API_URL;

// Create Axios instance
export const API_CLIENT = axios.create({
  baseURL: "https://api.gocab.tech/api",
});

// ───────────────────────────────────
// 🔼 REQUEST INTERCEPTOR
// ───────────────────────────────────
API_CLIENT.interceptors.request.use(
  (config) => {
    const token = Cookies.get("auth_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    logDebug("🔼 Request:", {
      url: `${config.baseURL}${config.url}`,
      method: config.method,
      headers: config.headers,
      data: config.data,
      params: config.params,
    });

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// ───────────────────────────────────
// 🔽 RESPONSE INTERCEPTOR
// ───────────────────────────────────
API_CLIENT.interceptors.response.use(
  (response) => {
    console.log("✅ Response:", {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },

  (error) => {
    // ────────────────────────────────
    // 📌 NEW: Log full error response
    // ────────────────────────────────
    console.error("❌ API Error Response:", {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data, // <-- Backend validation errors here
      method: error.config?.method,
      payload: error.config?.data,
    });

    // ────────────────────────────────
    // 1. Detect Session Expired Error
    // ────────────────────────────────
    const errData = error?.response?.data?.detail;

    const isSessionExpired =
      errData?.error_code === "SESSION_EXPIRED" ||
      errData?.message?.toLowerCase()?.includes("session expired");

    if (isSessionExpired) {
      console.warn("⚠️ Session expired — auto logout");

      alert("Your session expired. Please login again.");

      Cookies.remove("auth_token");
      sessionStorage.clear();
      localStorage.clear();

      window.location.href = "/";
      return;
    }

    // ────────────────────────────────
    // 2. Detect Server Down
    // ────────────────────────────────
    if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
      window.dispatchEvent(new Event("server-down"));
    }

    return Promise.reject(error);
  }
);

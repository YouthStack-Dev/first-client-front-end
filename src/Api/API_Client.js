// import axios from "axios";
// import Cookies from "js-cookie";
// import { logDebug } from "../utils/logger";

// // Read the environment variable
// const baseURL = import.meta.env.VITE_API_URL;

// // Create Axios instance
// export const API_CLIENT = axios.create({
//   baseURL: "https://api.mltcorporate.com/api/v1",
// });

// // ───────────────────────────────────
// // 🔼 REQUEST INTERCEPTOR
// // ───────────────────────────────────
// API_CLIENT.interceptors.request.use(
//   (config) => {
//     const token = Cookies.get("auth_token");

//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     logDebug("🔼 Request:", {
//       url: `${config.baseURL}${config.url}`,
//       method: config.method,
//       headers: config.headers,
//       data: config.data,
//       params: config.params,
//     });

//     return config;
//   },
//   (error) => {
//     console.error("❌ Request Error:", error);
//     return Promise.reject(error);
//   }
// );

// // ───────────────────────────────────
// // 🔽 RESPONSE INTERCEPTOR
// // ───────────────────────────────────
// API_CLIENT.interceptors.response.use(
//   (response) => {
//     console.log("✅ Response:", {
//       url: response.config.url,
//       status: response.status,
//       data: response.data,
//     });
//     return response;
//   },

//   (error) => {
//     // ────────────────────────────────
//     // 📌 NEW: Log full error response
//     // ────────────────────────────────
//     console.error("❌ API Error Response:", {
//       url: error.config?.url,
//       status: error.response?.status,
//       data: error.response?.data, // <-- Backend validation errors here
//       method: error.config?.method,
//       payload: error.config?.data,
//     });

//     // ────────────────────────────────
//     // 1. Detect Session Expired Error
//     // ────────────────────────────────
//     const errData = error?.response?.data?.detail;

//     const isSessionExpired =
//       errData?.error_code === "SESSION_EXPIRED" ||
//       errData?.message?.toLowerCase()?.includes("session expired");

//     if (isSessionExpired) {
//       console.warn("⚠️ Session expired — auto logout");

//       alert("Your session expired. Please login again.");

//       Cookies.remove("auth_token");
//       sessionStorage.clear();
//       localStorage.clear();

//       window.location.href = "/";
//       return;
//     }

//     // ────────────────────────────────
//     // 2. Detect Server Down
//     // ────────────────────────────────
//     if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
//       window.dispatchEvent(new Event("server-down"));
//     }

//     return Promise.reject(error);
//   }
// );


import axios from "axios";
import Cookies from "js-cookie";
import { logDebug } from "../utils/logger";

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  "https://api.mltcorporate.com/api/v1";

// ───────────────────────────────────
// Store injection to avoid circular deps
// ───────────────────────────────────
let _store = null;
export const injectStore = (store) => {
  _store = store;
};

// Create Axios instance
export const API_CLIENT = axios.create({
  baseURL: API_BASE_URL,
});

// ───────────────────────────────────
// Token refresh queue
// ───────────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const handleLogout = () => {
  Cookies.remove("auth_token", { path: "/" });
  Cookies.remove("refresh_token", { path: "/" });
  sessionStorage.clear();
  localStorage.clear();
  window.location.href = "/";
};

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

  async (error) => {
    const originalRequest = error.config;

    console.error("❌ API Error Response:", {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      method: error.config?.method,
      payload: error.config?.data,
    });

    // ────────────────────────────────
    // 1. Handle 401 — Try Token Refresh
    // ────────────────────────────────
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = Cookies.get("refresh_token");

      if (!refreshToken) {
        handleLogout();
        return Promise.reject(error);
      }

      // If a refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return API_CLIENT(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          { refresh_token: refreshToken }
        );

        const { access_token, refresh_token: newRefreshToken } = data.data;

        // Persist new tokens
        Cookies.set("auth_token", access_token, {
          path: "/",
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
        Cookies.set("refresh_token", newRefreshToken, {
          path: "/",
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });

        // Update Authorization header for future requests
        API_CLIENT.defaults.headers.common.Authorization = `Bearer ${access_token}`;
        originalRequest.headers.Authorization = `Bearer ${access_token}`;

        // Fetch full user details (tenant_id, permissions etc.) from /auth/me
        if (_store) {
          const { fetchUserFromToken } = await import(
            "../redux/features/auth/authTrunk"
          );
          _store.dispatch(fetchUserFromToken());
        }

        processQueue(null, access_token);
        return API_CLIENT(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        alert("Your session has expired. Please log in again.");
        handleLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ────────────────────────────────
    // 2. Detect explicit Session Expired signal
    // ────────────────────────────────
    const errData = error?.response?.data?.detail;
    const isSessionExpired =
      errData?.error_code === "SESSION_EXPIRED" ||
      errData?.message?.toLowerCase()?.includes("session expired");

    if (isSessionExpired) {
      console.warn("⚠️ Session expired — logging out");
      handleLogout();
      return Promise.reject(error);
    }

    // ────────────────────────────────
    // 3. Detect Server Down
    // ────────────────────────────────
    if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
      window.dispatchEvent(new Event("server-down"));
    }

    return Promise.reject(error);
  }
);

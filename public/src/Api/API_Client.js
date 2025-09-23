import axios from "axios";
import Cookies from "js-cookie";

// Read the environment variable
const baseURL = import.meta.env.VITE_API_URL;

// Create Axios instance
export const API_CLIENT = axios.create({
  baseURL,
});

// Add request interceptor

API_CLIENT.interceptors.request.use(
  
  (config) => {
    const token = Cookies.get("auth_token"); // Replace with your actual cookie name

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("🔼 Request:", {
      url: config.url,
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


// Add response interceptor
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
    if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
      window.dispatchEvent(new Event("server-down"));
    }
    return Promise.reject(error);
  }
);

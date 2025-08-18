// src/Api/API_Client.js
import axios from "axios";
import Cookies from "js-cookie";

const baseURL = import.meta.env.VITE_API_URL;

// Create instance
export const API_CLIENT = axios.create({
  baseURL,
});

// Request interceptor
API_CLIENT.interceptors.request.use(
  (config) => {
    const token = Cookies.get("access_token"); // ✅ get token from cookies

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log the request details
    console.log("[API Request] 📡", {
      url: `${config.baseURL}${config.url}`,
      method: config.method,
      headers: config.headers,
      params: config.params,
      data: config.data,
    });

    return config;
  },
  (error) => {
    console.error("[API Request Error] ❌", error);
    return Promise.reject(error);
  }
);

// Response interceptor
API_CLIENT.interceptors.response.use(
  (response) => {
    console.log("[API Response] ✅", {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    if (error.response) {
      console.error("[API Response Error] ❌", {
        url: error.response.config.url,
        status: error.response.status,
        data: error.response.data,
      });
    } else {
      console.error("[API Error] 🚨", error.message);
    }
    return Promise.reject(error);
  }
);

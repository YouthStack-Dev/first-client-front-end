// src/Api/API_Client.js
import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;

// Create instance
export const API_CLIENT = axios.create({
  baseURL,
});

// Add a request interceptor
API_CLIENT.interceptors.request.use(
  (config) => {
    // Get token from localStorage (or Cookies if you prefer)
    const token = localStorage.getItem("access_token");

    if (token) {
      // Attach the token in Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);

import axios from "axios";

// Create instance
export const LocalClient = axios.create({
  baseURL: "http://tenant1.fleetquest:3000/api/",
});

// Add a request interceptor
LocalClient.interceptors.request.use(
  (config) => {
    const token =  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiJhZG1pbjEiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NDQ2MzcxNDcsImV4cCI6MTc0NDcyMzU0N30.gQHOkKaDF7izRsY9Gd1Lv8s1IXA68lfwE-2VHPh7jBg"
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

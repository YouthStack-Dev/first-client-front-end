import axios from "axios";
import Cookies from "js-cookie";

export const axiosClient = axios.create({
  baseURL: "http://localhost:3000/api/",
});

axiosClient.interceptors.request.use(
  (config) => {
    // Extract the endpoint from the URL
    const endpoint = config.url;

    // Check if the endpoint is "/login" (ignoring case)
    if (endpoint === "/login" || endpoint === "login") {
      return config; // Skip the token check and proceed with the request
    }

    // Default behavior: check for the token and add it to the headers
    const token = Cookies.get("authtoken");

     console.log("the token" ,token);
  
    if (!token) {
        // Replace the current history entry with the login page
        window.history.replaceState(null, "", "/login");
      
        // Redirect to login if no token is present
        window.location.href = "/login";
      return Promise.reject(new Error("No token found"));
    }

    // Add the Authorization header if token is present
    config.headers["Authorization"] = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

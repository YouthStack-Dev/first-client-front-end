import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client"; 
import { logDebug } from "../../../utils/logger";
import axios from "axios";


export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ formData, endpoint }, { rejectWithValue }) => {
    console.log("Login endpoint:", endpoint, formData);

    try {
      // Send login request
      const response = await API_CLIENT.post(endpoint, formData);
      logDebug("Login response data:", response.data.data);

      // Destructure tokens and user
      const { access_token:token, refresh_token, user } = response.data.data;

      // Extract permissions from user
      const allowedModules = user?.permissions || [];

      logDebug("Extracted token:", token);
      logDebug("Allowed modules:", allowedModules);

   
      return {
        user,
        token,
        refresh_token,
        allowedModules
      };
    } catch (error) {
      logDebug("Login error details:", error);

      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data ||
        'Login failed'
      );
    }
  }
);


export const fetchUserFromTokenaxios = async () => {
  console.log("[fetchUserFromToken] 🔄 Starting request to /v1/auth/me/");

  try {
    const response = await axios.get("https://api.gocab.tech/api/v1/auth/me/", {
      withCredentials: true, // includes cookies if needed
    });

    console.log("[fetchUserFromToken] ✅ Response received:", {
      status: response.status,
      data: response.data,
    });

    return response.data;
  } catch (error) {
    console.error("[fetchUserFromToken] ❌ Error occurred:", error);

    let message = "Something went wrong";

    if (error.response) {
      console.error("[fetchUserFromToken] Server responded with error:", {
        status: error.response.status,
        data: error.response.data,
      });
      message = error.response.data?.message || "Token verification failed";
    } else if (error.request) {
      console.error("[fetchUserFromToken] No response from server.");
      message = "No response from server";
    } else {
      console.error("[fetchUserFromToken] Request setup error:", error.message);
      message = error.message;
    }

    throw new Error(message); // throw error instead of rejectWithValue
  }
};



export const fetchUserFromToken = createAsyncThunk(
  "auth/fetchUserFromToken",
  async (_, { rejectWithValue }) => {
    console.log("[fetchUserFromToken] 🔄 Starting request to /v1/auth/me/");
    try {
      const response = await API_CLIENT.get("/v1/auth/me");

      console.log("[fetchUserFromToken] ✅ Response received:", {
        status: response.status,
        data: response.data.data,
      });

      return response.data.data;
    } catch (error) {
      console.error("[fetchUserFromToken] ❌ Error occurred:", error);

      let message = "Something went wrong";

      if (error.response) {
        console.error("[fetchUserFromToken] Server responded with error:", {
          status: error.response.status,
          data: error.response.data,
        });
        message = error.response.data?.message || "Token verification failed";
      } else if (error.request) {
        console.error("[fetchUserFromToken] No response from server.");
        message = "No response from server";
      } else {
        console.error("[fetchUserFromToken] Request setup error:", error.message);
        message = error.message;
      }

      return rejectWithValue(message);
    }
  }
);

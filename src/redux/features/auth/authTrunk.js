import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";

  export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async ({ username, password }, { rejectWithValue }) => {
      try {
        const formData = new FormData();
        formData.append("username", username);
        formData.append("password", password);
        formData.append("grant_type", "password");
  
        const response = await API_CLIENT.post(
          `/auth/login`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
  
        return response.data;
      } catch (err) {
        return rejectWithValue(err?.response?.data?.message || "Login failed");
      }
    }
  );
  

  export const logoutUser = createAsyncThunk("auth/logoutUser", async (_, thunkAPI) => {
    localStorage.removeItem("access_token");
    return true;
  });
  
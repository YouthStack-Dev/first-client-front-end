import axios from "axios";

// Read the env variable
const baseURL = import.meta.env.VITE_API_URL;

// Create instance
export const API_CLIENT = axios.create({
  baseURL,
});


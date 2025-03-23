import axios from "axios";

export const LocalClient = axios.create({
  baseURL: "http://localhost:3000/api/",
});


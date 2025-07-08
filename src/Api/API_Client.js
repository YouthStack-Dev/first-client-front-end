import axios from "axios";

const API_CLIENT = axios.create({
  baseURL: "https://api.gocab.tech/api",
});

export { API_CLIENT };
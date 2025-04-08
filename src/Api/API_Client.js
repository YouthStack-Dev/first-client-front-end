import axios from "axios";

 export const LocalClient = axios.create({
  baseURL: "http://tenant1.fleetquest:3000/api/",
  // withCredentials: true,
  // headers: {
  //   "Content-Type": "application/json",
  // },
});

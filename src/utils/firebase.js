// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyDRhMUSq90rbZLw3NarPYSrz4JJwHiriSc",
//   authDomain: "mlt-database.firebaseapp.com",
//   databaseURL: "https://mlt-database-default-rtdb.firebaseio.com",
//   projectId: "mlt-database",
//   storageBucket: "mlt-database.firebasestorage.app",
//   messagingSenderId: "247664392683",
//   appId: "1:247664392683:web:f2152e10f28843587941ae",
//   measurementId: "G-EHQPYQE4VJ",
// };

const firebaseConfig = {
  apiKey: "AIzaSyC118UFn4Gz7cfu7Rx9QhWceEsa6fmyzRI",
  authDomain: "ets-1-ccb71.firebaseapp.com",
  databaseURL: "https://ets-1-ccb71-default-rtdb.firebaseio.com",
  projectId: "ets-1-ccb71",
  storageBucket: "ets-1-ccb71.firebasestorage.app",
  messagingSenderId: "570547490090",
  appId: "1:570547490090:web:5d452a942dd42d98246253",
  measurementId: "G-0VX91ZYR8Z",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

export { database };

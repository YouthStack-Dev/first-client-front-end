// // src/firebase.js
// import { initializeApp } from "firebase/app";
// import { getDatabase } from "firebase/database";

// const firebaseConfig = {
//   apiKey: "YOUR_API_KEY",
//   authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
//   databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
//   projectId: "YOUR_PROJECT_ID",
//   storageBucket: "YOUR_PROJECT_ID.appspot.com",
//   messagingSenderId: "SENDER_ID",
//   appId: "APP_ID"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// // Get a reference to the Realtime Database
// export const database = getDatabase(app);



// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA-77DgsTC59ePvqLass19BGuUxoa3Se1A",
  authDomain: "rider-6a75a.firebaseapp.com",
  databaseURL: "https://rider-6a75a-default-rtdb.firebaseio.com",
  projectId: "rider-6a75a",
  storageBucket: "rider-6a75a.appspot.com",
  messagingSenderId: "1083413254246",
  appId: "1:1083413254246:web:9897b1f5241c424f385da7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
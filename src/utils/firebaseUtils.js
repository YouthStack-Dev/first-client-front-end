import { ref, onValue, off } from "firebase/database";
import { database } from "../firebase";

/**
 * Listen to changes on a specific node
 * @param {string} nodePath - Path to the node (e.g., "bookings/123")
 * @param {function} callback - Function to call when data changes
 * @returns {function} unsubscribe - Call this to stop listening
 */
export const listenToNode = (nodePath, callback) => {
  const nodeRef = ref(database, nodePath);

  // Start listening
  const unsubscribe = onValue(
    nodeRef,
    (snapshot) => {
      const data = snapshot.val();
      callback(data);
    },
    (error) => {
      console.error("Firebase read failed:", error);
    }
  );

  // Return unsubscribe function
  return () => off(nodeRef);
};

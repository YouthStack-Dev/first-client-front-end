// src/utils/downloadFile.js
import axios from "axios";

/**
 * Get a cookie value by name
 * @param {string} name - cookie name
 * @returns {string|null} cookie value or null if not found
 */
const getCookie = (name) => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) return match[2];
  return null;
};

/**
 * Download a file from the backend
 * @param {string} filePath - Path of the file on the server
 * @param {string} fileName - Optional filename for download
 * @param {function} onSuccess - Optional callback after successful download
 * @param {function} onError - Optional callback if download fails
 */
export const downloadFile = async (filePath, fileName = "", onSuccess, onError) => {
  if (!filePath) {
    console.error("No file path provided for download.");
    onError?.("No file path provided.");
    return;
  }

  try {
    // Base URL from env or fallback
    const baseURL = import.meta.env.VITE_API_URL
      ? `${import.meta.env.VITE_API_URL}/v1`
      : "https://api.gocab.tech/api/v1";

    // Construct full URL safely
    const url = `${baseURL}/vehicles/files/${encodeURIComponent(filePath)}?download=true`;

    // Get token from localStorage, sessionStorage, or cookie
    const token =
      localStorage.getItem("auth_token") ||
      sessionStorage.getItem("auth_token") ||
      getCookie("auth_token");

    if (!token) {
      alert("You are not authenticated. Please log in again.");
      onError?.("No auth token found.");
      return;
    }

    // Fetch file as blob
    const response = await axios.get(url, {
      responseType: "blob",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "*/*",
      },
    });

    // Determine download file name
    const finalFileName = fileName || filePath.split("/").pop() || "downloaded_file";

    // Create blob and trigger download
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = finalFileName;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    onSuccess?.(`File downloaded: ${finalFileName}`);
  } catch (error) {
    console.error("❌ File download failed:", error);
    alert("Failed to download file. Please check file path or permissions.");
    onError?.(error);
  }
};

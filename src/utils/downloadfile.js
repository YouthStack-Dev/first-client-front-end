// src/utils/downloadFile.js
import axios from "axios";

/**
 * Get a cookie value by name
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value or null if not found
 */
const getCookie = (name) => {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
};

/**
 * Universal File Downloader
 *
 * Handles downloading files securely from any backend module:
 * vehicles, drivers, vendors, etc.
 *
 * @param {string} filePath - Relative or full file path from backend.
 * @param {string} [fileName] - Optional: Name for downloaded file.
 * @param {string} [module="vehicles"] - Module name for path building (vehicles, drivers, etc.)
 * @param {function} [onSuccess] - Optional callback on success.
 * @param {function} [onError] - Optional callback on error.
 */
export const downloadFile = async (
  filePath,
  fileName = "",
  module = "vehicles",
  onSuccess,
  onError
) => {
  if (!filePath) {
    console.error("No file path provided for download.");
    onError?.("No file path provided.");
    return;
  }

  try {
    // ✅ Use environment API base URL if available
    const baseURL =
      import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "https://api.gocab.tech/api";

    // ✅ If filePath is absolute (e.g., http...), use it directly
    let url = filePath.startsWith("http")
      ? filePath
      : `${baseURL}/v1/${module}/files/${encodeURIComponent(filePath)}?download=true`;

    // ✅ Get token (localStorage → sessionStorage → cookie)
    const token =
      localStorage.getItem("auth_token") ||
      sessionStorage.getItem("auth_token") ||
      getCookie("auth_token");

    if (!token) {
      alert("You are not authenticated. Please log in again.");
      onError?.("No auth token found.");
      return;
    }

    // ✅ Fetch the file as Blob
    const response = await axios.get(url, {
      responseType: "blob",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "*/*",
      },
    });

    // ✅ Extract filename from header if provided
    const contentDisposition = response.headers["content-disposition"];
    const suggestedFileName = contentDisposition
      ? decodeURIComponent(
          contentDisposition.split("filename=")[1]?.replace(/['"]/g, "") || ""
        )
      : "";

    const finalFileName =
      fileName || suggestedFileName || filePath.split("/").pop() || "downloaded_file";

    // ✅ Trigger download
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = finalFileName;
    document.body.appendChild(link);
    link.click();

    // ✅ Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    onSuccess?.(`File downloaded: ${finalFileName}`);
  } catch (error) {
    console.error("❌ File download failed:", error);
    alert("Failed to download file. Please check file path or permissions.");
    onError?.(error);
  }
};

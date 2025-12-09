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
 * Get authentication token
 * @returns {string|null} Token or null if not found
 */
const getAuthToken = () => {
  return (
    localStorage.getItem("auth_token") ||
    sessionStorage.getItem("auth_token") ||
    getCookie("auth_token")
  );
};

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
    const baseURL =
      import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
      "https://api.gocab.tech/api";

    let url = filePath.startsWith("http")
      ? filePath
      : `${baseURL}/v1/${module}/files/${encodeURIComponent(
          filePath
        )}?download=true`;

    const token = getAuthToken();

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

    const contentDisposition = response.headers["content-disposition"];
    const suggestedFileName = contentDisposition
      ? decodeURIComponent(
          contentDisposition.split("filename=")[1]?.replace(/['"]/g, "") || ""
        )
      : "";

    const finalFileName =
      fileName ||
      suggestedFileName ||
      filePath.split("/").pop() ||
      "downloaded_file";

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = finalFileName;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    onSuccess?.(`File downloaded: ${finalFileName}`);
  } catch (error) {
    console.error("❌ File download failed:", error);
    alert("Failed to download file. Please check file path or permissions.");
    onError?.(error);
  }
};

/**
 * Fetch file and return a preview URL for <img> or <object> display
 */
export const previewFile = async (filePath, module = "vehicles") => {
  if (!filePath) return null;

  try {
    const baseURL =
      import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
      "https://api.gocab.tech/api";

    let url;
    if (filePath.startsWith("http")) {
      url = filePath;
    } else {
      const parts = filePath.split("/").map(encodeURIComponent);
      url = `${baseURL}/v1/${module}/files/${parts.join("/")}`;
    }

    const token = getAuthToken();

    if (!token) throw new Error("Auth token not found");

    // ✅ Fetch the file as Blob
    const response = await axios.get(url, {
      responseType: "blob",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "*/*",
      },
    });

    if (response.status !== 200) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    const blob = new Blob([response.data]);
    return URL.createObjectURL(blob);
  } catch (err) {
    console.error("❌ File preview failed:", err);
    return null;
  }
};

/**
 * Open file in a new tab for viewing
 * Uses the same axios approach as downloadFile but opens in new tab
 */
export const viewFileInNewTab = async (
  filePath,
  fileName = "",
  module = "vehicles",
  onSuccess,
  onError
) => {
  if (!filePath) {
    console.error("No file path provided for viewing.");
    onError?.("No file path provided.");
    return;
  }

  try {
    const baseURL =
      import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
      "https://api.gocab.tech/api";

    // Remove ?download=true for viewing
    let url = filePath.startsWith("http")
      ? filePath
      : `${baseURL}/v1/${module}/files/${encodeURIComponent(filePath)}`;

    const token = getAuthToken();

    if (!token) {
      alert("You are not authenticated. Please log in again.");
      onError?.("No auth token found.");
      return;
    }

    // ✅ Fetch the file as Blob (same as downloadFile)
    const response = await axios.get(url, {
      responseType: "blob",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "*/*",
      },
    });

    // Check if response is valid
    if (!response.data || response.data.size === 0) {
      throw new Error("Received empty file");
    }

    // Determine file type from response
    const contentType = response.headers["content-type"] || "";
    const contentDisposition = response.headers["content-disposition"];
    const suggestedFileName = contentDisposition
      ? decodeURIComponent(
          contentDisposition.split("filename=")[1]?.replace(/['"]/g, "") || ""
        )
      : "";

    const finalFileName =
      fileName ||
      suggestedFileName ||
      filePath.split("/").pop() ||
      "viewed_file";

    // Create blob with correct MIME type
    const blob = new Blob([response.data], { type: contentType });
    const blobUrl = URL.createObjectURL(blob);

    // Determine how to open based on file type
    const fileExtension = finalFileName.split(".").pop().toLowerCase();

    if (["pdf"].includes(fileExtension) || contentType.includes("pdf")) {
      // For PDFs, open in new tab
      const newTab = window.open(blobUrl, "_blank");
      if (!newTab) {
        // Popup blocked, open in iframe modal
        openInModal(blobUrl, finalFileName, "pdf");
      }
    } else if (
      ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(fileExtension) ||
      contentType.startsWith("image/")
    ) {
      // For images, open in new tab
      const newTab = window.open(blobUrl, "_blank");
      if (!newTab) {
        openInModal(blobUrl, finalFileName, "image");
      }
    } else if (
      ["txt", "csv", "json", "xml", "html"].includes(fileExtension) ||
      contentType.startsWith("text/")
    ) {
      // For text files, try to open in new tab
      const newTab = window.open(blobUrl, "_blank");
      if (!newTab) {
        openInModal(blobUrl, finalFileName, "text");
      }
    } else {
      // For other file types, show download option
      openDownloadModal(blob, finalFileName);
    }

    // Clean up blob URL after some time
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 60000); // Clean up after 1 minute

    onSuccess?.(`File opened: ${finalFileName}`);
  } catch (error) {
    console.error("❌ Failed to open file:", error);
    alert("Failed to open file. Please check file path or permissions.");
    onError?.(error);
  }
};

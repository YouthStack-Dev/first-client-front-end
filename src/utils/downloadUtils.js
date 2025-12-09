// utils/downloadUtils.js

/**
 * Download a local file (File object selected from input)
 */
export const downloadLocalFile = (file, filename) => {
  if (!(file instanceof File)) return;

  const url = URL.createObjectURL(file);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename || file.name || "download";
  a.click();

  URL.revokeObjectURL(url);
};

/**
 * Extract a filename from the Content-Disposition header
 */
export const extractFilename = (headers, fallback = "download") => {
  const contentDisposition = headers["content-disposition"];
  if (!contentDisposition) return fallback;

  const match = contentDisposition.match(/filename="?(.+?)"?$/);
  return match ? match[1] : fallback;
};

/**
 * Download a blob response as a file
 */
export const downloadBlobFile = (blob, filename) => {
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);

  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Download a remote file using an API call
 * Generic for all modules
 */
export const downloadRemoteFile = async ({
  apiClient,
  filePath,
  filename,
  setLoading,
  setError,
  apiUrlPrefix = "/v1",
}) => {
  try {
    setLoading?.(true);
    setError?.(null);

    // GET API
    const response = await apiClient.get(
      `${apiUrlPrefix}/files/${filePath}?download=true`,
      {
        responseType: "blob",
      }
    );

    // Auto-detect filename
    const finalName =
      filename ||
      extractFilename(response.headers, "document") ||
      filePath.split("/").pop();

    const blob = new Blob([response.data], {
      type: response.headers["content-type"],
    });

    downloadBlobFile(blob, finalName);
  } catch (err) {
    console.error("Download Error:", err);
    setError?.("Failed to download file");
  } finally {
    setLoading?.(false);
  }
};

/**
 * UNIVERSAL DOWNLOAD FUNCTION
 * Automatically decides: Local file or Remote file
 */
export const downloadFile = async ({
  file,
  filename,
  apiClient,
  setLoading,
  setError,
  apiUrlPrefix,
}) => {
  // 1️⃣ local file (File object)
  if (file instanceof File) {
    return downloadLocalFile(file, filename);
  }

  // 2️⃣ remote file (from backend)
  if (file?.path) {
    return downloadRemoteFile({
      apiClient,
      filePath: file.path,
      filename,
      setLoading,
      setError,
      apiUrlPrefix,
    });
  }

  console.warn("Unknown file type:", file);
};

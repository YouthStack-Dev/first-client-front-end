// utils/fileViewUtils.js

/**
 * View a local file (from File input)
 */
export const viewLocalFile = (file, setPreviewDoc, setPreviewContentType) => {
  if (!(file instanceof File)) return;

  const url = URL.createObjectURL(file);

  setPreviewDoc(url);
  setPreviewContentType(file.type || "application/octet-stream");

  return url;
};

/**
 * View a remote file using API
 */
export const viewRemoteFile = async ({
  filePath,
  apiClient,
  setPreviewDoc,
  setPreviewContentType,
  setLoading,
  setError,
  apiUrlPrefix = "/v1",
}) => {
  try {
    setLoading?.(true);
    setError?.(null);

    // API request
    const response = await apiClient.get(`${apiUrlPrefix}/files/${filePath}`, {
      responseType: "blob",
    });

    // Content type
    const contentType =
      response.headers["content-type"] || "application/octet-stream";

    // Create blob URL
    const blob = new Blob([response.data], { type: contentType });
    const url = URL.createObjectURL(blob);

    setPreviewDoc(url);
    setPreviewContentType(contentType);

    return url;
  } catch (err) {
    console.error("View File Error:", err);
    setError?.("Failed to load document. Please try again.");
  } finally {
    setLoading?.(false);
  }
};

/**
 * UNIVERSAL FILE VIEWER
 * Auto-detects local vs remote file
 */
export const viewFile = async ({
  file,
  apiClient,
  setPreviewDoc,
  setPreviewContentType,
  setLoading,
  setError,
  apiUrlPrefix,
}) => {
  // 1️⃣ Local file (File input)
  if (file instanceof File) {
    return viewLocalFile(file, setPreviewDoc, setPreviewContentType);
  }

  // 2️⃣ Remote file (from API with path)
  if (file?.path) {
    return viewRemoteFile({
      filePath: file.path,
      apiClient,
      setPreviewDoc,
      setPreviewContentType,
      setLoading,
      setError,
      apiUrlPrefix,
    });
  }

  console.warn("Unknown file type:", file);
  setError?.("Unknown file type");
};

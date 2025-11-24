import { API_CLIENT } from "../Api/API_Client";

export const reportService = {
  /**
   * Fetch analytics data
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} Analytics data
   */
  getAnalytics: async (params) => {
    try {
      const response = await API_CLIENT.get(
        `/v1/reports/${params.report_type}/analytics`,
        {
          params: {
            start_date: params.start_date,
            end_date: params.end_date,
            ...(params.tenant_id && { tenant_id: params.tenant_id }),
            ...(params.shift_id && { shift_id: params.shift_id }),
          },
        }
      );
      return response.data;
    } catch (error) {
      const backendMessage = await extractBackendMessage(error);
      throw new Error(
        backendMessage || `Failed to fetch analytics: ${error.message}`
      );
    }
  },

  /**
   * Download report as Excel file
   * @param {Object} params - Download parameters
   * @returns {Promise<Object>} Download result
   */
  downloadReport: async (params) => {
    try {
      console.log("Download params:", params);

      // Build query parameters
      const queryParams = new URLSearchParams();

      // Required parameters
      queryParams.append("start_date", params.start_date);
      queryParams.append("end_date", params.end_date);

      // Optional parameters
      if (params.tenant_id) {
        queryParams.append("tenant_id", params.tenant_id);
      }
      if (params.shift_id) {
        queryParams.append("shift_id", params.shift_id);
      }
      if (params.vendor_id) {
        queryParams.append("vendor_id", params.vendor_id);
      }

      // Array parameters
      if (params.booking_status?.length > 0) {
        params.booking_status.forEach((status) => {
          queryParams.append("booking_status", status);
        });
      }

      if (params.route_status?.length > 0) {
        params.route_status.forEach((status) => {
          queryParams.append("route_status", status);
        });
      }

      // Include unrouted parameter (default to false)
      const includeUnrouted = params.include_unrouted ?? false;
      queryParams.append("include_unrouted", includeUnrouted.toString());

      // Module-specific parameters
      if (params.module) {
        queryParams.append("module", params.module);
      }
      if (params.driver_id) {
        queryParams.append("driver_id", params.driver_id);
      }
      if (params.vehicle_type) {
        queryParams.append("vehicle_type", params.vehicle_type);
      }
      if (params.include_performance_metrics !== undefined) {
        queryParams.append(
          "include_performance_metrics",
          params.include_performance_metrics.toString()
        );
      }
      if (params.include_route_optimization !== undefined) {
        queryParams.append(
          "include_route_optimization",
          params.include_route_optimization.toString()
        );
      }

      // Try multiple endpoint variations
      const endpoints = [
        `/v1/reports/bookings/export?${queryParams.toString()}`,
        `/v1/reports/export?${queryParams.toString()}`,
        `/v1/reports/${params.report_type}/export?${queryParams.toString()}`,
      ];

      let response;
      let lastError;

      // Try each endpoint until one works
      for (const endpoint of endpoints) {
        try {
          console.log("Trying endpoint:", endpoint);
          response = await API_CLIENT.get(endpoint, {
            responseType: "arraybuffer",
            timeout: 30000,
            headers: {
              Accept:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            },
          });
          console.log("Success with endpoint:", endpoint);
          break;
        } catch (err) {
          lastError = err;
          console.log(`Endpoint ${endpoint} failed:`, err.response?.status);
          continue;
        }
      }

      // If all endpoints failed
      if (!response) {
        throw lastError || new Error("All report endpoints failed");
      }

      console.log("Download response received:", response.status);

      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers["content-disposition"];
      let filename = "bookings_report.xlsx";

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+?)"/);
        if (filenameMatch?.[1]) {
          filename = filenameMatch[1];
        }
      }

      console.log("Extracted filename:", filename);

      // Create blob and trigger download
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      console.log(`File downloaded successfully: ${filename}`);
      return { success: true, filename };
    } catch (error) {
      console.error("Download error details:", error);

      const backendMessage = await extractBackendMessage(error);
      const errorMessage =
        backendMessage || `Download failed: ${error.message}`;

      throw new Error(errorMessage);
    }
  },
};

/**
 * Extracts meaningful error messages from various backend error formats
 * @param {Error} error - The caught error
 * @returns {Promise<string>} Extracted error message
 */
const extractBackendMessage = async (error) => {
  try {
    // If no response data exists
    if (!error.response?.data) {
      return error.response?.statusText || error.message;
    }

    const responseData = error.response.data;

    // Handle ArrayBuffer response
    if (responseData instanceof ArrayBuffer) {
      return await handleArrayBufferResponse(responseData);
    }

    // Handle Blob response
    if (responseData instanceof Blob) {
      return await handleBlobResponse(responseData);
    }

    // Handle object response (your specific format)
    if (typeof responseData === "object") {
      return handleObjectResponse(responseData);
    }

    // Handle string response
    if (typeof responseData === "string") {
      return handleStringResponse(responseData);
    }

    // Fallback
    return error.response.statusText || error.message;
  } catch (parseError) {
    console.error("Error parsing backend response:", parseError);
    return error.message;
  }
};

/**
 * Handles ArrayBuffer error responses
 * @param {ArrayBuffer} responseData
 * @returns {string} Extracted message
 */
const handleArrayBufferResponse = async (responseData) => {
  try {
    const decoder = new TextDecoder("utf-8");
    const errorText = decoder.decode(responseData);
    const errorData = JSON.parse(errorText);
    return extractMessageFromObject(errorData);
  } catch {
    return "Unknown server error (ArrayBuffer)";
  }
};

/**
 * Handles Blob error responses
 * @param {Blob} responseData
 * @returns {Promise<string>} Extracted message
 */
const handleBlobResponse = async (responseData) => {
  try {
    const errorText = await responseData.text();
    const errorData = JSON.parse(errorText);
    return extractMessageFromObject(errorData);
  } catch {
    return "Unknown server error (Blob)";
  }
};

/**
 * Handles object error responses
 * @param {Object} responseData
 * @returns {string} Extracted message
 */
const handleObjectResponse = (responseData) => {
  // Your specific error format: { detail: { message: "...", error_code: "..." } }
  if (responseData.detail) {
    const detail = responseData.detail;

    // Handle nested detail object
    if (typeof detail === "object" && detail !== null) {
      // Priority: message -> error_code -> stringified detail
      if (detail.message) {
        return detail.message;
      }
      if (detail.error_code) {
        return `Error: ${detail.error_code}`;
      }
      return JSON.stringify(detail);
    }

    // Handle string detail
    if (typeof detail === "string") {
      return detail;
    }
  }

  // Fallback to common error object structures
  return extractMessageFromObject(responseData);
};

/**
 * Handles string error responses
 * @param {string} responseData
 * @returns {string} Extracted message
 */
const handleStringResponse = (responseData) => {
  try {
    const errorData = JSON.parse(responseData);
    return extractMessageFromObject(errorData);
  } catch {
    return responseData || "Unknown server error";
  }
};

/**
 * Extracts message from common error object structures
 * @param {Object} errorObject
 * @returns {string} Extracted message
 */
const extractMessageFromObject = (errorObject) => {
  if (!errorObject || typeof errorObject !== "object") {
    return "Unknown error format";
  }

  // Check various common error message locations
  return (
    errorObject.detail?.message || // Your nested format
    errorObject.message || // Standard error format
    errorObject.error || // Alternative error field
    errorObject.detail || // Direct detail field
    errorObject.error_code || // Error code as fallback
    errorObject.status || // Status message
    JSON.stringify(errorObject) // Final fallback
  );
};

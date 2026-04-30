import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";

/* ── Constants ──────────────────────────────────────────── */
const BULK_UPLOAD_URL = "/employees/bulk-upload";
const UPLOAD_TIMEOUT_MS = 60_000;

const ERROR_MESSAGES = {
  NO_FILE: "No file selected",
  TIMEOUT: "Upload timeout. Please try again or use a smaller file.",
  NETWORK: "Network error. Please check your connection.",
  INVALID_FILE: "Invalid file format or data",
  FILE_TOO_LARGE: "File is too large. Maximum allowed size is 5MB.",
  VALIDATION_FAILED: "Validation failed",
  SERVER_ERROR: "Server error. Please try again later.",
  UNKNOWN: "Upload failed. Please try again.",
};

const ERROR_CODES = {
  VALIDATION_FAILED: "VALIDATION_FAILED",
};

/* ── Helper: extract row-level errors from 400 response ── */
const extractValidationResult = (data) => {
  const detail = data?.detail;
  if (
    detail?.error_code === ERROR_CODES.VALIDATION_FAILED &&
    detail?.details?.failed_employees
  ) {
    return {
      success: true,
      data: {
        failed_employees: detail.details.failed_employees,
        successful: detail.details.valid_rows || 0,
        message: detail.message,
      },
    };
  }
  return null;
};

/* ── Thunk ──────────────────────────────────────────────── */
export const bulkUploadEmployees = createAsyncThunk(
  "employee/bulkUpload",
  async (file, { rejectWithValue }) => {
    if (!file) {
      return rejectWithValue({ message: ERROR_MESSAGES.NO_FILE });
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await API_CLIENT.post(BULK_UPLOAD_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: UPLOAD_TIMEOUT_MS,
      });

      return res.data;
    } catch (err) {
      // Timeout
      if (err.code === "ECONNABORTED") {
        return rejectWithValue({ message: ERROR_MESSAGES.TIMEOUT });
      }

      // Network
      if (err.code === "ERR_NETWORK") {
        return rejectWithValue({ message: ERROR_MESSAGES.NETWORK });
      }

      // Backend errors
      if (err.response) {
        const { status, data } = err.response;

        if (status === 400) {
          // Row-level validation errors → show in error modal
          const validationResult = extractValidationResult(data);
          if (validationResult) return validationResult;

          // Other 400 (e.g. MISSING_COLUMNS)
          return rejectWithValue(
            data || { message: ERROR_MESSAGES.INVALID_FILE }
          );
        }

        const statusMessages = {
          413: { message: ERROR_MESSAGES.FILE_TOO_LARGE },
          422: data || { message: ERROR_MESSAGES.VALIDATION_FAILED },
          500: { message: ERROR_MESSAGES.SERVER_ERROR },
        };

        return rejectWithValue(
          statusMessages[status] ?? data ?? { message: ERROR_MESSAGES.UNKNOWN }
        );
      }

      return rejectWithValue({
        message: err.message || ERROR_MESSAGES.UNKNOWN,
      });
    }
  }
);
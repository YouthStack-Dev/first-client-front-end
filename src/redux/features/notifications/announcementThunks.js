/**
 * announcementThunks.js
 *
 * All async operations for the announcements feature.
 * Each thunk follows the same contract:
 *   fulfilled → returns the useful payload (data object or bare id)
 *   rejected  → rejectWithValue({ message, status?, code? })
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAnnouncementsApi,
  getAnnouncementByIdApi,
  createAnnouncementApi,
  updateAnnouncementApi,
  publishAnnouncementApi,
  deleteAnnouncementApi,
  getAnnouncementRecipientsApi,
} from "./announcementApi";

// ─── Shared error normalizer ──────────────────────────────────────────────────
/**
 * Produces a consistent error shape from any axios error.
 * UI code can always read .message and optionally .status / .code.
 *
 * @param {unknown} error
 * @returns {{ message: string, status?: number, code?: string }}
 */
function normalizeError(error) {
  if (error?.response) {
    const { data, status } = error.response;
    return {
      message: data?.message ?? data?.detail ?? `Request failed (${status})`,
      status,
      code: data?.code,
    };
  }
  // Network error, timeout, CORS, cancelled request, etc.
  return { message: error?.message ?? "Network error. Please try again." };
}

// ─── FormData builder ─────────────────────────────────────────────────────────
/**
 * Converts a plain payload object to FormData when a media_file is present.
 * Arrays are appended as repeated keys so the server receives them correctly.
 * Null / undefined values are skipped — the server should treat absence as
 * "no change" rather than receiving an explicit null.
 *
 * Axios detects FormData automatically and sets multipart/form-data;
 * no manual Content-Type header is needed.
 *
 * @param {Object} data
 * @returns {FormData}
 */
function toFormData(data) {
  const fd = new FormData();
  Object.entries(data).forEach(([key, val]) => {
    if (val == null) return;
    if (Array.isArray(val)) {
      val.forEach((v) => fd.append(key, v));
    } else {
      fd.append(key, val);
    }
  });
  return fd;
}

// ─── Typedefs ─────────────────────────────────────────────────────────────────
/**
 * @typedef {Object} CreateAnnouncementPayload
 * @property {string}    title
 * @property {string}    body
 * @property {string}    target_type
 * @property {number[]}  [target_ids]
 * @property {string}    [content_type]     default: "text"
 * @property {string}    [media_url]
 * @property {File}      [media_file]       – if present, payload is sent as multipart
 * @property {string[]}  [channels]         default: ["push", "in_app"]
 */

// ─── FETCH LIST ───────────────────────────────────────────────────────────────
export const fetchAnnouncements = createAsyncThunk(
  "announcements/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const response = await getAnnouncementsApi(params);
      return response.data; // { status, message, data: Announcement[] }
    } catch (error) {
      return rejectWithValue(normalizeError(error));
    }
  }
);

// ─── FETCH SINGLE ─────────────────────────────────────────────────────────────
export const fetchAnnouncementById = createAsyncThunk(
  "announcements/fetchById",
  async (/** @type {number} */ id, { rejectWithValue }) => {
    try {
      const response = await getAnnouncementByIdApi(id);
      return response.data; // { status, message, data: Announcement }
    } catch (error) {
      return rejectWithValue(normalizeError(error));
    }
  }
);

// ─── CREATE ───────────────────────────────────────────────────────────────────
export const createAnnouncement = createAsyncThunk(
  "announcements/create",
  async (/** @type {CreateAnnouncementPayload} */ data, { rejectWithValue }) => {
    try {
      // Fix: if a File is attached, serialize as multipart so the upload
      // reaches the server correctly. Passing a raw File in a JSON body
      // silently sends "[object Object]".
      const payload  = data.media_file ? toFormData(data) : data;
      const response = await createAnnouncementApi(payload);
      return response.data; // { status, message, data: Announcement }
    } catch (error) {
      return rejectWithValue(normalizeError(error));
    }
  }
);

// ─── UPDATE ───────────────────────────────────────────────────────────────────
export const updateAnnouncement = createAsyncThunk(
  "announcements/update",
  async (
    /** @type {{ id: number, data: Partial<CreateAnnouncementPayload> }} */
    { id, data },
    { rejectWithValue }
  ) => {
    try {
      // Fix: same multipart handling as createAnnouncement
      const payload  = data.media_file ? toFormData(data) : data;
      const response = await updateAnnouncementApi(id, payload);
      return response.data; // { status, message, data: Announcement }
    } catch (error) {
      return rejectWithValue(normalizeError(error));
    }
  }
);

// ─── PUBLISH ──────────────────────────────────────────────────────────────────
export const publishAnnouncement = createAsyncThunk(
  "announcements/publish",
  async (/** @type {number} */ id, { rejectWithValue }) => {
    try {
      const response = await publishAnnouncementApi(id);
      return response.data; // { status, message, data: Announcement }
    } catch (error) {
      return rejectWithValue(normalizeError(error));
    }
  }
);

// ─── DELETE ───────────────────────────────────────────────────────────────────
export const deleteAnnouncement = createAsyncThunk(
  "announcements/delete",
  async (/** @type {number} */ id, { rejectWithValue }) => {
    try {
      await deleteAnnouncementApi(id);
      // Return the id so the slice can remove it from state without a re-fetch
      return id;
    } catch (error) {
      return rejectWithValue(normalizeError(error));
    }
  }
);

// ─── FETCH RECIPIENTS ─────────────────────────────────────────────────────────
export const fetchAnnouncementRecipients = createAsyncThunk(
  "announcements/fetchRecipients",
  async (
    /** @type {{ id: number, params?: Object }} */
    { id, params },
    { rejectWithValue }
  ) => {
    try {
      const response = await getAnnouncementRecipientsApi(id, params);
      return response.data; // { status, message, data: Recipient[] }
    } catch (error) {
      return rejectWithValue(normalizeError(error));
    }
  }
);
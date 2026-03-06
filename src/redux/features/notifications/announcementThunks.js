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

// ─── Typedefs ─────────────────────────────────────────────────────────────────
/**
 * @typedef {Object} CreateAnnouncementPayload
 * @property {string}    title
 * @property {string}    body
 * @property {string}    target_type
 * @property {number[]}  [target_ids]
 * @property {string}    [content_type]     default: "text"
 * @property {string}    [media_url]
 * @property {string}    [media_filename]
 * @property {number}    [media_size_bytes]
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
      const response = await createAnnouncementApi(data);
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
      const response = await updateAnnouncementApi(id, data);
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
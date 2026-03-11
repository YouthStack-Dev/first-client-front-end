/**
 * announcementApi.js
 *
 * All announcement API calls go through API_CLIENT (axios instance).
 * Token injection and base URL are handled by the axios interceptor —
 * no auth logic lives here.
 */

import { API_CLIENT } from "../../../Api/API_Client";

// ─── GET /announcements ───────────────────────────────────────────────────────
/**
 * Fetch a paginated / filtered list of announcements.
 *
 * @param {Object} [params]
 * @param {number} [params.page]
 * @param {number} [params.page_size]
 * @param {string} [params.status]        – Filter by announcement status enum
 * @param {string} [params.target_type]   – Filter by target_type enum
 */
export const getAnnouncementsApi = (params) => {
  return API_CLIENT.get("/announcements", { params });
  //  ▲ Bug fix: params was accepted but never forwarded in the original
};

// ─── GET /announcements/:id ───────────────────────────────────────────────────
/**
 * Fetch a single announcement by ID.
 *
 * @param {number} id – announcement_id
 */
export const getAnnouncementByIdApi = (id) => {
  return API_CLIENT.get(`/announcements/${id}`);
};

// ─── POST /announcements ──────────────────────────────────────────────────────
/**
 * Create a new announcement draft.
 *
 * @param {import("./announcementThunks").CreateAnnouncementPayload} data
 */
export const createAnnouncementApi = (data) => {
  return API_CLIENT.post("/announcements", data);
};

// ─── PUT /announcements/:id ───────────────────────────────────────────────────
/**
 * Update a draft announcement. Published announcements cannot be edited.
 *
 * @param {number} id
 * @param {Partial<import("./announcementThunks").CreateAnnouncementPayload>} data
 */
export const updateAnnouncementApi = (id, data) => {
  return API_CLIENT.put(`/announcements/${id}`, data);
};

// ─── POST /announcements/:id/publish ─────────────────────────────────────────
/**
 * Publish a draft announcement.
 * Triggers audience resolution + push/sms/email dispatch on the server.
 *
 * @param {number} id
 */
export const publishAnnouncementApi = (id) => {
  return API_CLIENT.post(`/announcements/${id}/publish`);
};

// ─── DELETE /announcements/:id ────────────────────────────────────────────────
/**
 * Soft-delete an announcement (sets is_active=false).
 * DRAFT  → status becomes "cancelled"
 * PUBLISHED → stays "published" but is hidden from recipients
 *
 * @param {number} id
 */
export const deleteAnnouncementApi = (id) => {
  return API_CLIENT.delete(`/announcements/${id}`);
};

// ─── GET /announcements/:id/recipients ───────────────────────────────────────
/**
 * Fetch the per-recipient delivery report for a published announcement.
 *
 * @param {number} id
 * @param {Object} [params]
 * @param {number} [params.page]
 * @param {number} [params.page_size]
 * @param {string} [params.delivery_status]  – Filter by delivery_status enum
 */
export const getAnnouncementRecipientsApi = (id, params) => {
  return API_CLIENT.get(`/announcements/${id}/recipients`, { params });
};
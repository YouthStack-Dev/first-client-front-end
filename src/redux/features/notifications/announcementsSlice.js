/**
 * announcementSlice.js
 *
 * Fixes vs original:
 * 1. updateAnnouncement.rejected was missing → updating flag stuck forever on failure
 * 2. fetchAnnouncementById had no pending/rejected → no loading/error state for detail view
 * 3. publishAnnouncement had no pending/rejected → no loading state during publish
 * 4. deleteAnnouncement had no pending/rejected → no loading state / silent failures
 * 5. fetchAnnouncementRecipients had no pending/rejected → no loading state for recipients
 * 6. error only tracked for fetchAll → all other failures were invisible to the UI
 * 7. Added per-operation error keys so the UI knows exactly which action failed
 * 8. Added clearError action so UI can dismiss error banners
 */

import { createSlice } from "@reduxjs/toolkit";
import {
  fetchAnnouncements,
  fetchAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  publishAnnouncement,
  deleteAnnouncement,
  fetchAnnouncementRecipients,
} from "./announcementThunks";

// ─── Initial state ────────────────────────────────────────────────────────────
const initialState = {
  // Data
  announcements:       [],
  selectedAnnouncement: null,
  recipients:          [],

  // Per-operation loading flags
  // (granular flags let different parts of the UI respond independently)
  loadingList:       false,
  loadingDetail:     false,
  creating:          false,
  updating:          false,
  publishing:        false,
  deleting:          false,
  loadingRecipients: false,

  // Per-operation errors
  // Shape: { message: string, status?: number, code?: string } | null
  listError:        null,
  detailError:      null,
  createError:      null,
  updateError:      null,
  publishError:     null,
  deleteError:      null,
  recipientsError:  null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────
const announcementSlice = createSlice({
  name: "announcements",
  initialState,

  reducers: {
    /** Clear the detail view when navigating away */
    clearSelectedAnnouncement(state) {
      state.selectedAnnouncement = null;
      state.detailError          = null;
    },

    /** Clear the recipients list when closing the recipients panel */
    clearRecipients(state) {
      state.recipients       = [];
      state.recipientsError  = null;
    },

    /**
     * Dismiss a specific error banner from the UI.
     * @param {{ payload: keyof Pick<typeof initialState, `${string}Error`> }} action
     */
    clearError(state, action) {
      const key = action.payload;
      if (key in state) state[key] = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ── FETCH LIST ──────────────────────────────────────────────────────────
      .addCase(fetchAnnouncements.pending, (state) => {
        state.loadingList = true;
        state.listError   = null;
      })
      .addCase(fetchAnnouncements.fulfilled, (state, action) => {
        state.loadingList   = false;
        state.announcements = action.payload.data ?? [];
      })
      .addCase(fetchAnnouncements.rejected, (state, action) => {
        state.loadingList = false;
        state.listError   = action.payload;
      })

      // ── FETCH SINGLE ────────────────────────────────────────────────────────
      .addCase(fetchAnnouncementById.pending, (state) => {
        state.loadingDetail  = true;
        state.detailError    = null;
      })
      .addCase(fetchAnnouncementById.fulfilled, (state, action) => {
        state.loadingDetail       = false;
        state.selectedAnnouncement = action.payload.data;
      })
      .addCase(fetchAnnouncementById.rejected, (state, action) => {
        state.loadingDetail = false;
        state.detailError   = action.payload;
      })

      // ── CREATE ──────────────────────────────────────────────────────────────
      .addCase(createAnnouncement.pending, (state) => {
        state.creating    = true;
        state.createError = null;
      })
      .addCase(createAnnouncement.fulfilled, (state, action) => {
        state.creating = false;
        // Prepend so the new draft appears at the top of the list
        state.announcements.unshift(action.payload.data);
      })
      .addCase(createAnnouncement.rejected, (state, action) => {
        state.creating    = false;
        state.createError = action.payload;
      })

      // ── UPDATE ──────────────────────────────────────────────────────────────
      .addCase(updateAnnouncement.pending, (state) => {
        state.updating    = true;
        state.updateError = null;
      })
      .addCase(updateAnnouncement.fulfilled, (state, action) => {
        state.updating = false;
        const updated  = action.payload.data;
        const index    = state.announcements.findIndex(
          (item) => item.announcement_id === updated.announcement_id
        );
        if (index !== -1) state.announcements[index] = updated;

        // Keep selectedAnnouncement in sync if it's open in a detail panel
        if (state.selectedAnnouncement?.announcement_id === updated.announcement_id) {
          state.selectedAnnouncement = updated;
        }
      })
      .addCase(updateAnnouncement.rejected, (state, action) => {
        // ▲ Bug fix: was missing — updating flag was stuck true on failure
        state.updating    = false;
        state.updateError = action.payload;
      })

      // ── PUBLISH ─────────────────────────────────────────────────────────────
      .addCase(publishAnnouncement.pending, (state) => {
        state.publishing  = true;
        state.publishError = null;
      })
      .addCase(publishAnnouncement.fulfilled, (state, action) => {
        state.publishing = false;
        const published  = action.payload.data;
        const index      = state.announcements.findIndex(
          (item) => item.announcement_id === published.announcement_id
        );
        if (index !== -1) state.announcements[index] = published;

        if (state.selectedAnnouncement?.announcement_id === published.announcement_id) {
          state.selectedAnnouncement = published;
        }
      })
      .addCase(publishAnnouncement.rejected, (state, action) => {
        state.publishing   = false;
        state.publishError = action.payload;
      })

      // ── DELETE ──────────────────────────────────────────────────────────────
      .addCase(deleteAnnouncement.pending, (state) => {
        state.deleting    = true;
        state.deleteError = null;
      })
      .addCase(deleteAnnouncement.fulfilled, (state, action) => {
        state.deleting      = false;
        // action.payload is the bare announcement_id returned by the thunk
        state.announcements = state.announcements.filter(
          (item) => item.announcement_id !== action.payload
        );
        // Clear detail view if the deleted item was open
        if (state.selectedAnnouncement?.announcement_id === action.payload) {
          state.selectedAnnouncement = null;
        }
      })
      .addCase(deleteAnnouncement.rejected, (state, action) => {
        state.deleting    = false;
        state.deleteError = action.payload;
      })

      // ── FETCH RECIPIENTS ────────────────────────────────────────────────────
      .addCase(fetchAnnouncementRecipients.pending, (state) => {
        state.loadingRecipients = true;
        state.recipientsError   = null;
      })
      .addCase(fetchAnnouncementRecipients.fulfilled, (state, action) => {
        state.loadingRecipients = false;
        state.recipients        = action.payload.data ?? [];
      })
      .addCase(fetchAnnouncementRecipients.rejected, (state, action) => {
        state.loadingRecipients = false;
        state.recipientsError   = action.payload;
      });
  },
});

// ─── Actions ──────────────────────────────────────────────────────────────────
export const {
  clearSelectedAnnouncement,
  clearRecipients,
  clearError,
} = announcementSlice.actions;

export default announcementSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────────
// Keep selectors co-located with the slice so consumers never access state shape directly

export const selectAnnouncements       = (state) => state.announcements.announcements;
export const selectSelectedAnnouncement = (state) => state.announcements.selectedAnnouncement;
export const selectRecipients          = (state) => state.announcements.recipients;

// Loading flags
export const selectLoadingList         = (state) => state.announcements.loadingList;
export const selectLoadingDetail       = (state) => state.announcements.loadingDetail;
export const selectIsCreating          = (state) => state.announcements.creating;
export const selectIsUpdating          = (state) => state.announcements.updating;
export const selectIsPublishing        = (state) => state.announcements.publishing;
export const selectIsDeleting          = (state) => state.announcements.deleting;
export const selectLoadingRecipients   = (state) => state.announcements.loadingRecipients;

// Error selectors
export const selectListError           = (state) => state.announcements.listError;
export const selectDetailError         = (state) => state.announcements.detailError;
export const selectCreateError         = (state) => state.announcements.createError;
export const selectUpdateError         = (state) => state.announcements.updateError;
export const selectPublishError        = (state) => state.announcements.publishError;
export const selectDeleteError         = (state) => state.announcements.deleteError;
export const selectRecipientsError     = (state) => state.announcements.recipientsError;
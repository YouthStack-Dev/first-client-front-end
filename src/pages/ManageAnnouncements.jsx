import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchAnnouncements }        from "../redux/features/notifications/announcementThunks";
import {
  selectAnnouncements,
  selectLoadingList,
  selectListError,
  clearError,
} from "../redux/features/notifications/announcementsSlice";

import AnnouncementTable      from "../components/announcements/AnnouncementTable";
import AnnouncementForm       from "../components/announcements/AnnouncementForm";
import AnnouncementRecipients from "../components/announcements/AnnouncementRecipients";

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 20;

/** Which panel (modal/drawer) is currently visible */
const PANEL = {
  NONE:       "NONE",
  FORM:       "FORM",       // create or edit
  RECIPIENTS: "RECIPIENTS", // delivery report
};

// ─── Component ────────────────────────────────────────────────────────────────
const ManageAnnouncements = () => {
  const dispatch = useDispatch();

  // ── Selectors (never access state.announcements.* directly) ────────────────
  const announcements = useSelector(selectAnnouncements);
  const loading       = useSelector(selectLoadingList);
  const listError     = useSelector(selectListError);

  // ── Local UI state ─────────────────────────────────────────────────────────
  const [activePanel,          setActivePanel]          = useState(PANEL.NONE);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [page,                 setPage]                 = useState(1);

  // ── Data fetching ───────────────────────────────────────────────────────────
  const loadAnnouncements = useCallback(() => {
    dispatch(fetchAnnouncements({ page, page_size: PAGE_SIZE }));
  }, [dispatch, page]);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  // Clear list error on unmount so it doesn't flash on the next visit
  useEffect(() => {
    return () => {
      dispatch(clearError("listError"));
    };
  }, [dispatch]);

  // ── Panel helpers ───────────────────────────────────────────────────────────
  const openCreateForm = useCallback(() => {
    setSelectedAnnouncement(null);
    setActivePanel(PANEL.FORM);
  }, []);

  const openEditForm = useCallback((announcement) => {
    setSelectedAnnouncement(announcement);
    setActivePanel(PANEL.FORM);
  }, []);

  const openRecipients = useCallback((announcement) => {
    setSelectedAnnouncement(announcement);
    setActivePanel(PANEL.RECIPIENTS);
  }, []);

  const closePanel = useCallback(() => {
    setActivePanel(PANEL.NONE);
    setSelectedAnnouncement(null);
  }, []);

  /**
   * Called by AnnouncementForm after a successful create or edit.
   * Re-fetches the list so the new/updated row appears without a manual refresh.
   */
  const handleMutationSuccess = useCallback(() => {
    closePanel();
    loadAnnouncements();
  }, [closePanel, loadAnnouncements]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="p-6">

      {/* List-level error banner */}
      {listError && (
        <div
          role="alert"
          className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <span>⚠ {listError.message}</span>
          <button
            onClick={() => dispatch(clearError("listError"))}
            aria-label="Dismiss error"
            className="ml-4 text-red-500 hover:text-red-700 font-bold"
          >
            ×
          </button>
        </div>
      )}

      <AnnouncementTable
        data={announcements}
        loading={loading}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        onCreate={openCreateForm}
        onEdit={openEditForm}
        onRecipients={openRecipients}
        // Let the table trigger a re-fetch after inline delete
        onDeleteSuccess={loadAnnouncements}
      />

      {/* Create / Edit form — mutually exclusive with Recipients panel */}
      {activePanel === PANEL.FORM && (
        <AnnouncementForm
          announcement={selectedAnnouncement}   // null → create mode
          onClose={closePanel}
          onSuccess={handleMutationSuccess}     // re-fetches list on save
        />
      )}

      {/* Delivery report panel */}
      {activePanel === PANEL.RECIPIENTS && (
        <AnnouncementRecipients
          announcement={selectedAnnouncement}
          onClose={closePanel}
        />
      )}

    </div>
  );
};

export default ManageAnnouncements;
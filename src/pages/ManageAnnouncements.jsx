import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector }                 from "react-redux";

import { fetchAnnouncements }  from "../redux/features/notifications/announcementThunks";
import {
  selectAnnouncements,
  selectLoadingList,
  selectListError,
  clearError,
}                              from "../redux/features/notifications/announcementsSlice";

import AnnouncementList       from "../components/announcements/Announcementlist";
import AnnouncementForm       from "../components/announcements/AnnouncementForm";
import AnnouncementRecipients from "../components/announcements/AnnouncementRecipients";

const PAGE_SIZE = 8;

const PANEL = {
  NONE:       "NONE",
  FORM:       "FORM",
  RECIPIENTS: "RECIPIENTS",
};

const ManageAnnouncements = () => {
  const dispatch = useDispatch();

  const announcements = useSelector(selectAnnouncements);
  const loading       = useSelector(selectLoadingList);
  const listError     = useSelector(selectListError);

  const [activePanel,          setActivePanel]          = useState(PANEL.NONE);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [page,                 setPage]                 = useState(1);

  const loadAnnouncements = useCallback(() => {
    dispatch(fetchAnnouncements({ page, page_size: PAGE_SIZE }));
  }, [dispatch, page]);

  useEffect(() => {
    loadAnnouncements();
    return () => { dispatch(clearError("listError")); };
  }, [loadAnnouncements, dispatch]);

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

  const handleMutationSuccess = useCallback(() => {
    closePanel();
    if (page !== 1) {
      setPage(1);
    } else {
      loadAnnouncements();
    }
  }, [closePanel, loadAnnouncements, page]);

  return (
    <div className="p-6">

      {listError && (
        <div
          role="alert"
          className="mb-4 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
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

      <AnnouncementList
        data={announcements}
        loading={loading}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        onCreate={openCreateForm}
        onEdit={openEditForm}
        onRecipients={openRecipients}
        onMutationSuccess={loadAnnouncements}
      />

      {activePanel === PANEL.FORM && (
        <AnnouncementForm
          announcement={selectedAnnouncement}
          onClose={closePanel}
          onSuccess={handleMutationSuccess}
        />
      )}

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
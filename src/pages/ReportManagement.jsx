import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ReportCard } from "../components/Reports/ReportCard";
import { reportModules, REPORT_TYPES } from "../staticData/StaticReport";
import ConfigModal from "../components/Reports/ConfigModal";
import BookingAnalyticsView from "../components/Reports/views/BookingAnalyticsView";
import DelayReportView from "../components/Reports/views/DelayReportView";
import DriverDutyView from "../components/Reports/views/DriverDutyView";
import BookingPreviewView from "../components/Reports/views/BookingPreviewview";  // ← NEW
import { logDebug } from "../utils/logger";
import { useReportsModal } from "../hooks/useReportsModal";

import {
  fetchBookingAnalytics,
  fetchDelayReport,
  fetchDelayDetail,
  fetchDriverDutyHours,
  downloadBookingsReport,
  previewBookingsReport,
} from "../redux/features/reports/reportsTrunk";

import {
  selectBookingAnalytics,
  selectDelays,
  selectDelayDetail,
  selectDriverDutyHours,
  selectDownload,
  selectBookingPreview,
  clearBookingAnalytics,
  clearDelays,
  clearDelayDetail,
  clearDriverDutyHours,
  clearDownloadStatus,
  clearBookingPreview,
} from "../redux/features/reports/reportsSlice";

const ReportsManagement = () => {
  const dispatch = useDispatch();

  // ── Modal state ─────────────────────────────────────────────────────────────
  const { configModal, openAnalytics, openDownload, openPreview, closeModal } =
    useReportsModal();                                // openPreview ← NEW

  // ── Redux state ──────────────────────────────────────────────────────────────
  const bookingAnalytics = useSelector(selectBookingAnalytics);
  const delays           = useSelector(selectDelays);
  const delayDetail      = useSelector(selectDelayDetail);
  const driverDutyHours  = useSelector(selectDriverDutyHours);
  const download         = useSelector(selectDownload);
  const bookingPreview   = useSelector(selectBookingPreview);

  // ── Clear download status after 3s ──────────────────────────────────────────
  useEffect(() => {
    if (download.success) {
      const t = setTimeout(() => dispatch(clearDownloadStatus()), 3000);
      return () => clearTimeout(t);
    }
  }, [download.success, dispatch]);

  // ── Submit handler ───────────────────────────────────────────────────────────
  const handleConfigSubmit = (formData) => {
    const { type, config } = configModal;
    logDebug("Config submit:", { type, config, formData });

    if (config === "download") {
      dispatch(downloadBookingsReport(formData));
      return;
    }

    // ── Preview — routes to the same thunk as analytics per type ── NEW
    if (config === "preview") {
      if (type === REPORT_TYPES.BOOKINGS)         dispatch(previewBookingsReport(formData));
      else if (type === REPORT_TYPES.DELAYS)      dispatch(fetchDelayReport(formData));
      else if (type === REPORT_TYPES.DRIVER_DUTY) dispatch(fetchDriverDutyHours(formData));
      closeModal();
      return;
    }

    // ── Analytics / view ──────────────────────────────────────────
    if (type === REPORT_TYPES.BOOKINGS)     dispatch(fetchBookingAnalytics(formData));
    else if (type === REPORT_TYPES.DELAYS)  dispatch(fetchDelayReport(formData));
    else if (type === REPORT_TYPES.DRIVER_DUTY) dispatch(fetchDriverDutyHours(formData));

    closeModal();
  };

  const getActiveState = () => {
    if (configModal.config === "download") return download;
    // preview uses the same slice state as analytics per type
    if (configModal.config === "preview" || configModal.config === "analytics") {
      if (configModal.type === REPORT_TYPES.BOOKINGS)    return configModal.config === "preview" ? bookingPreview : bookingAnalytics;
      if (configModal.type === REPORT_TYPES.DELAYS)      return delays;
      if (configModal.type === REPORT_TYPES.DRIVER_DUTY) return driverDutyHours;
    }
    if (configModal.type === REPORT_TYPES.BOOKINGS)    return bookingAnalytics;
    if (configModal.type === REPORT_TYPES.DELAYS)      return delays;
    if (configModal.type === REPORT_TYPES.DRIVER_DUTY) return driverDutyHours;
    return { loading: false, error: null };
  };

  const activeState = getActiveState();

  // ── Keep modal open on 4xx errors ────────────────────────────────────────────
  useEffect(() => {
    if (!activeState.error) return;
    const keepOpen = ["400", "403", "404", "422"].some((c) =>
      activeState.error?.includes(c)
    );
    if (!keepOpen) closeModal();
  }, [activeState.error]);

  // ── Close modal on download success ──────────────────────────────────────────
  useEffect(() => {
    if (download.success) closeModal();
  }, [download.success]);

  return (
    <div className="bg-gradient-to-br p-6">
      <div className="mx-auto">

        {/* ── Error display ─────────────────────────────────────────────────── */}
        {activeState.error && !configModal.isOpen && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <span>⚠️</span>
              <span className="whitespace-pre-line">{activeState.error}</span>
            </div>
            <button
              onClick={() => {
                dispatch(clearBookingAnalytics());
                dispatch(clearDelays());
                dispatch(clearDriverDutyHours());
                dispatch(clearDownloadStatus());
                dispatch(clearBookingPreview());
              }}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ── Report Cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {reportModules.map((module) => (
            <ReportCard
              key={module.id}
              title={module.title}
              description={module.description}
              icon={module.icon}
              color={module.color}
              onAnalytics={
                module.hasAnalytics ? () => openAnalytics(module.id) : undefined
              }
              onDownload={
                module.hasDownload ? () => openDownload(module.id) : undefined
              }
              onPreview={
                module.hasPreview ? () => openPreview(module.id) : undefined  // ← NEW
              }
            />
          ))}
        </div>

        {/* ── Analytics / Detail Views ──────────────────────────────────────── */}
        {bookingAnalytics.data && (
          <BookingAnalyticsView
            data={bookingAnalytics.data}
            loading={bookingAnalytics.loading}
            onClose={() => dispatch(clearBookingAnalytics())}
          />
        )}

        {delays.data && (
          <DelayReportView
            data={delays.data}
            loading={delays.loading}
            onClose={() => {
              dispatch(clearDelays());
              dispatch(clearDelayDetail());
            }}
            onRouteClick={(routeId) =>
              dispatch(fetchDelayDetail({ route_id: routeId, tenant_id: delays.data?.tenant_id }))
            }
            detailData={delayDetail}
          />
        )}

        {driverDutyHours.data && (
          <DriverDutyView
            data={driverDutyHours.data}
            loading={driverDutyHours.loading}
            onClose={() => dispatch(clearDriverDutyHours())}
          />
        )}

        {/* ── Booking Preview Table — NEW ───────────────────────────────────── */}
        {(bookingPreview.loading || bookingPreview.rows?.length > 0 || bookingPreview.error) && (
          <BookingPreviewView
            data={bookingPreview}
            onClose={() => dispatch(clearBookingPreview())}
          />
        )}

      </div>

      {/* ── Config Modal ──────────────────────────────────────────────────────── */}
      <ConfigModal
        isOpen={configModal.isOpen}
        onClose={closeModal}
        config={configModal.config}
        type={configModal.type}
        onSubmit={handleConfigSubmit}
        loading={activeState.loading}
        error={activeState.error}
      />

      {/* ── Download success toast ────────────────────────────────────────────── */}
      {download.success && (
        <div className="fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg z-50">
          <div className="flex items-center gap-3">
            <div className="text-green-500">✓</div>
            <div>
              <p className="text-green-700 font-medium text-sm">Download Complete</p>
              <p className="text-green-600 text-xs">
                {download.filename} downloaded successfully
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsManagement;
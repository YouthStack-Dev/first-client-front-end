import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ReportCard } from "../components/Reports/ReportCard";
import { reportModules, REPORT_TYPES } from "../staticData/StaticReport";
import ConfigModal from "../components/Reports/ConfigModal";
import BookingAnalyticsView from "../components/Reports/views/BookingAnalyticsView";
import DelayReportView from "../components/Reports/views/DelayReportView";
import DriverDutyView from "../components/Reports/views/DriverDutyView";
import { logDebug } from "../utils/logger";
import { useReportsModal } from "../hooks/useReportsModal";

import {
  fetchBookingAnalytics,
  fetchDelayReport,
  fetchDriverDutyHours,
  downloadBookingsReport,
} from "../redux/features/reports/reportsTrunk";

import {
  selectBookingAnalytics,
  selectDelays,
  selectDriverDutyHours,
  selectDownload,
  clearBookingAnalytics,
  clearDelays,
  clearDriverDutyHours,
  clearDownloadStatus,
} from "../redux/features/reports/reportsSlice";

const ReportsManagement = () => {
  const dispatch = useDispatch();

  // ─── Modal state (custom hook) ────────────────────────────────────────────
  const { configModal, openAnalytics, openDownload, closeModal } =
    useReportsModal();

  // ─── Redux state ──────────────────────────────────────────────────────────
  const bookingAnalytics = useSelector(selectBookingAnalytics);
  const delays = useSelector(selectDelays);
  const driverDutyHours = useSelector(selectDriverDutyHours);
  const download = useSelector(selectDownload);

  // ─── Clear download status after 3s on success ────────────────────────────
  useEffect(() => {
    if (download.success) {
      const timer = setTimeout(() => {
        dispatch(clearDownloadStatus());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [download.success, dispatch]);

  // ─── Submit handler ───────────────────────────────────────────────────────
  const handleConfigSubmit = (formData) => {
    const { type, config } = configModal;
    const isDownload = config === "download";

    logDebug("Config submit:", { type, config, formData });

    if (isDownload) {
      dispatch(downloadBookingsReport(formData));
      return;
    }

    // Analytics / view
    if (type === REPORT_TYPES.BOOKINGS) {
      dispatch(fetchBookingAnalytics(formData));
    } else if (type === REPORT_TYPES.DELAYS) {
      dispatch(fetchDelayReport(formData));
    } else if (type === REPORT_TYPES.DRIVER_DUTY) {
      dispatch(fetchDriverDutyHours(formData));
    }

    closeModal();
  };

  // ─── Derive loading/error for the active modal ────────────────────────────
  const getActiveState = () => {
    if (configModal.config === "download") return download;
    if (configModal.type === REPORT_TYPES.BOOKINGS) return bookingAnalytics;
    if (configModal.type === REPORT_TYPES.DELAYS) return delays;
    if (configModal.type === REPORT_TYPES.DRIVER_DUTY) return driverDutyHours;
    return { loading: false, error: null };
  };

  const activeState = getActiveState();

  // ─── Keep modal open on 400/403/404/422, close otherwise ─────────────────
  useEffect(() => {
    if (!activeState.error) return;
    const keepOpen = ["400", "403", "404", "422"].some((code) =>
      activeState.error?.includes(code)
    );
    if (!keepOpen) closeModal();
  }, [activeState.error]);

  // ─── Close modal and clear data on download success ───────────────────────
  useEffect(() => {
    if (download.success) closeModal();
  }, [download.success]);

  return (
    <div className="bg-gradient-to-br p-6">
      <div className="mx-auto">

        {/* Error Display */}
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
              }}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Report Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {reportModules.map((module) => (
            <ReportCard
              key={module.id}
              title={module.title}
              description={module.description}
              icon={module.icon}
              color={module.color}
              onAnalytics={
                module.hasAnalytics
                  ? () => openAnalytics(module.id)
                  : undefined
              }
              onDownload={
                module.hasDownload
                  ? () => openDownload(module.id)
                  : undefined
              }
            />
          ))}
        </div>

        {/* Report Views */}
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
            onClose={() => dispatch(clearDelays())}
          />
        )}

        {driverDutyHours.data && (
          <DriverDutyView
            data={driverDutyHours.data}
            loading={driverDutyHours.loading}
            onClose={() => dispatch(clearDriverDutyHours())}
          />
        )}
      </div>

      {/* Config Modal */}
      <ConfigModal
        isOpen={configModal.isOpen}
        onClose={closeModal}
        config={configModal.config}
        type={configModal.type}
        onSubmit={handleConfigSubmit}
        loading={activeState.loading}
        error={activeState.error}
      />

      {/* Download Success Toast */}
      {download.success && (
        <div className="fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg z-50">
          <div className="flex items-center gap-3">
            <div className="text-green-500">✓</div>
            <div>
              <p className="text-green-700 font-medium text-sm">
                Download Complete
              </p>
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
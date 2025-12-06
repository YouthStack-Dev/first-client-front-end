import React, { useState } from "react";
import { ReportCard } from "../components/Reports/ReportCard";
import { AnalyticsDisplay } from "../components/Reports/AnalyticsDisplay";
import { reportModules } from "../staticData/StaticReport";
import ConfigModal from "../components/Reports/ConfigModal";
import { reportService } from "../utils/reportService";
import { logDebug } from "../utils/logger";

// Main Reports Container
const ReportsManagement = () => {
  const [configModal, setConfigModal] = useState({
    isOpen: false,
    type: null,
    config: null,
  });
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloadStatus, setDownloadStatus] = useState({
    isDownloading: false,
    success: false,
    message: "",
  });

  const handleAnalyticsClick = (moduleId) => {
    logDebug("Analytics button clicked for module:", moduleId);
    setConfigModal({ isOpen: true, type: moduleId, config: "analytics" });
    setError(null);
  };

  const handleDownloadClick = (moduleId) => {
    setConfigModal({ isOpen: true, type: moduleId, config: "download" });
    setError(null);
  };

  const handleConfigSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    setDownloadStatus({ isDownloading: false, success: false, message: "" });

    try {
      if (configModal.config === "analytics") {
        const analyticsParams = {
          ...formData,
          report_type: configModal.type,
          // Include module information if available
          ...(formData.module && { module: formData.module }),
        };
        const response = await reportService.getAnalytics(analyticsParams);
        if (response.success) {
          setAnalyticsData(response);
          setConfigModal({ isOpen: false, type: null, config: null });
        } else {
          throw new Error(response.message || "Failed to fetch analytics");
        }
      } else {
        setDownloadStatus({
          isDownloading: true,
          success: false,
          message: "Preparing download...",
        });

        const downloadParams = {
          ...formData,
          report_type: configModal.type,
          // Include all module-specific parameters
          module: formData.module,
          driver_id: formData.driver_id,
          vehicle_type: formData.vehicle_type,
        };

        const result = await reportService.downloadReport(downloadParams);

        setDownloadStatus({
          isDownloading: false,
          success: true,
          message: `Report "${result.filename}" downloaded successfully!`,
        });

        setTimeout(() => {
          setConfigModal({ isOpen: false, type: null, config: null });
          setDownloadStatus({
            isDownloading: false,
            success: false,
            message: "",
          });
        }, 2000);
      }
    } catch (error) {
      console.error("Error in handleConfigSubmit:", error);

      // Use the actual backend error message directly
      // No more custom filtering for specific error types
      setError(error.message);
      setDownloadStatus({
        isDownloading: false,
        success: false,
        message: "",
      });

      // Only close modal for non-validation errors (422 is validation error)
      // Keep modal open for validation errors so user can adjust parameters
      if (error.message && !error.message.includes("422")) {
        setConfigModal({ isOpen: false, type: null, config: null });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setConfigModal({ isOpen: false, type: null, config: null });
    setError(null);
    setDownloadStatus({ isDownloading: false, success: false, message: "" });
  };

  return (
    <div className="bg-gradient-to-br p-6">
      <div className="mx-auto">
        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                <span className="text-gray-700">
                  {configModal.config === "analytics"
                    ? "Loading analytics..."
                    : "Preparing download..."}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <span>⚠️</span>
              <span className="whitespace-pre-line">{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
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
              onAnalytics={() => handleAnalyticsClick(module.id)}
              onDownload={() => handleDownloadClick(module.id)}
            />
          ))}
        </div>
      </div>

      {/* Configuration Modal */}
      <ConfigModal
        isOpen={configModal.isOpen}
        onClose={handleCloseModal}
        config={configModal.config}
        type={configModal.type}
        onSubmit={handleConfigSubmit}
        loading={loading}
        error={error}
      />

      {/* Analytics Display */}
      {analyticsData && (
        <AnalyticsDisplay
          data={analyticsData}
          onClose={() => setAnalyticsData(null)}
          reportType={configModal.type}
        />
      )}

      {/* Download Success Toast */}
      {downloadStatus.success && (
        <div className="fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg z-50">
          <div className="flex items-center gap-3">
            <div className="text-green-500">✓</div>
            <div>
              <p className="text-green-700 font-medium text-sm">
                Download Complete
              </p>
              <p className="text-green-600 text-xs">{downloadStatus.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsManagement;

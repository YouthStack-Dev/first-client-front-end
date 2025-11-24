import React, { useState } from "react";
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  Users,
  MapPin,
  Clock,
} from "lucide-react";

// Types
const REPORT_TYPES = {
  BOOKING: "booking",
  ROUTE: "route",
  VENDOR: "vendor",
  DRIVER: "driver",
};

const BOOKING_STATUS_OPTIONS = [
  "Request",
  "Scheduled",
  "Confirmed",
  "Completed",
  "Cancelled",
];
const ROUTE_STATUS_OPTIONS = [
  "Pending",
  "In Progress",
  "Completed",
  "Cancelled",
];

// Reusable Report Card Component
const ReportCard = ({
  title,
  icon: Icon,
  description,
  onAnalytics,
  onDownload,
  color = "blue",
}) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
    green:
      "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
    purple:
      "from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
    orange:
      "from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700",
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      <div className={`bg-gradient-to-r ${colorClasses[color]} p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="text-sm text-white/80 mt-1">{description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex gap-3">
          <button
            onClick={onAnalytics}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            <BarChart3 className="w-4 h-4" />
            View Analytics
          </button>
          <button
            onClick={onDownload}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            <Download className="w-4 h-4" />
            Download Excel
          </button>
        </div>
      </div>
    </div>
  );
};

// Configuration Modal
const ConfigModal = ({ isOpen, onClose, config, onSubmit, type }) => {
  const [formData, setFormData] = useState({
    start_date: "",
    end_date: "",
    tenant_id: "",
    shift_id: "",
    booking_status: [],
    route_status: [],
    vendor_id: "",
    include_unrouted: true,
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayValue = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  const isDownload = config === "download";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold">
            {isDownload
              ? "Download Report Configuration"
              : "Analytics Configuration"}
          </h2>
          <p className="text-indigo-100 mt-1">
            Configure parameters for your report
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => handleChange("start_date", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.end_date}
                onChange={(e) => handleChange("end_date", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Tenant ID & Shift ID */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tenant ID{" "}
                <span className="text-gray-400 text-xs">(Admin only)</span>
              </label>
              <input
                type="text"
                value={formData.tenant_id}
                onChange={(e) => handleChange("tenant_id", e.target.value)}
                placeholder="e.g., SAM001"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Shift ID
              </label>
              <input
                type="number"
                value={formData.shift_id}
                onChange={(e) => handleChange("shift_id", e.target.value)}
                placeholder="e.g., 1"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Download-specific fields */}
          {isDownload && (
            <>
              {/* Booking Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Booking Status
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {BOOKING_STATUS_OPTIONS.map((status) => (
                    <label
                      key={status}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.booking_status.includes(status)}
                        onChange={() =>
                          toggleArrayValue("booking_status", status)
                        }
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Route Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Route Status
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {ROUTE_STATUS_OPTIONS.map((status) => (
                    <label
                      key={status}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.route_status.includes(status)}
                        onChange={() =>
                          toggleArrayValue("route_status", status)
                        }
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Vendor ID & Include Unrouted */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Vendor ID
                  </label>
                  <input
                    type="number"
                    value={formData.vendor_id}
                    onChange={(e) => handleChange("vendor_id", e.target.value)}
                    placeholder="e.g., 5"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.include_unrouted}
                      onChange={(e) =>
                        handleChange("include_unrouted", e.target.checked)
                      }
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Include Unrouted Bookings
                    </span>
                  </label>
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {isDownload ? "Download Report" : "View Analytics"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Analytics Display Component
const AnalyticsDisplay = ({ data, onClose }) => {
  if (!data) return null;

  const StatCard = ({ label, value, icon: Icon, color = "blue" }) => {
    const colorClasses = {
      blue: "from-blue-500 to-blue-600",
      green: "from-green-500 to-green-600",
      purple: "from-purple-500 to-purple-600",
      orange: "from-orange-500 to-orange-600",
    };

    return (
      <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
          </div>
          <div
            className={`bg-gradient-to-r ${colorClasses[color]} p-3 rounded-lg`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-50 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-purple-100 mt-1">
            {data.date_range.start_date} to {data.date_range.end_date}
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Bookings"
              value={data.total_bookings}
              icon={Calendar}
              color="blue"
            />
            <StatCard
              label="Total Shifts"
              value={data.total_shifts}
              icon={Clock}
              color="green"
            />
            <StatCard
              label="Routing Rate"
              value={`${data.routing_summary.routing_percentage}%`}
              icon={MapPin}
              color="purple"
            />
            <StatCard
              label="Completion Rate"
              value={`${data.completion_rate}%`}
              icon={TrendingUp}
              color="orange"
            />
          </div>

          {/* Routing Summary */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Routing Summary
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-sm text-green-700 mb-1">Routed</p>
                <p className="text-3xl font-bold text-green-600">
                  {data.routing_summary.routed}
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <p className="text-sm text-orange-700 mb-1">Unrouted</p>
                <p className="text-3xl font-bold text-orange-600">
                  {data.routing_summary.unrouted}
                </p>
              </div>
            </div>
          </div>

          {/* Assignment Summary */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Assignment Summary
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-xs text-blue-700 mb-1">Vendor Assigned</p>
                <p className="text-2xl font-bold text-blue-600">
                  {data.assignment_summary.vendor_assigned}
                </p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                <p className="text-xs text-indigo-700 mb-1">Driver Assigned</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {data.assignment_summary.driver_assigned}
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-xs text-blue-700 mb-1">
                  Vendor Assignment %
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {data.assignment_summary.vendor_assignment_percentage}%
                </p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                <p className="text-xs text-indigo-700 mb-1">
                  Driver Assignment %
                </p>
                <p className="text-2xl font-bold text-indigo-600">
                  {data.assignment_summary.driver_assignment_percentage}%
                </p>
              </div>
            </div>
          </div>

          {/* Status Breakdowns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.keys(data.booking_status_breakdown).length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Booking Status
                </h3>
                <div className="space-y-2">
                  {Object.entries(data.booking_status_breakdown).map(
                    ([status, count]) => (
                      <div
                        key={status}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="text-sm font-medium text-gray-700">
                          {status}
                        </span>
                        <span className="text-lg font-bold text-gray-800">
                          {count}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {Object.keys(data.route_status_breakdown).length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Route Status
                </h3>
                <div className="space-y-2">
                  {Object.entries(data.route_status_breakdown).map(
                    ([status, count]) => (
                      <div
                        key={status}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="text-sm font-medium text-gray-700">
                          {status}
                        </span>
                        <span className="text-lg font-bold text-gray-800">
                          {count}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold rounded-lg transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Reports Container
const ReportsModule = () => {
  const [configModal, setConfigModal] = useState({
    isOpen: false,
    type: null,
    config: null,
  });
  const [analyticsData, setAnalyticsData] = useState(null);

  const reportModules = [
    {
      id: "booking",
      title: "Booking Reports",
      description: "Track and analyze booking data",
      icon: Calendar,
      color: "blue",
    },
    {
      id: "route",
      title: "Route Reports",
      description: "Monitor route performance",
      icon: MapPin,
      color: "green",
    },
    {
      id: "vendor",
      title: "Vendor Reports",
      description: "Vendor analytics and metrics",
      icon: Users,
      color: "purple",
    },
    {
      id: "driver",
      title: "Driver Reports",
      description: "Driver performance tracking",
      icon: TrendingUp,
      color: "orange",
    },
  ];

  const handleAnalyticsClick = (moduleId) => {
    setConfigModal({ isOpen: true, type: moduleId, config: "analytics" });
  };

  const handleDownloadClick = (moduleId) => {
    setConfigModal({ isOpen: true, type: moduleId, config: "download" });
  };

  const handleConfigSubmit = async (formData) => {
    if (configModal.config === "analytics") {
      // API call for analytics
      try {
        // const response = await fetch('/api/analytics?' + new URLSearchParams({
        //   start_date: formData.start_date,
        //   end_date: formData.end_date,
        //   ...(formData.tenant_id && { tenant_id: formData.tenant_id }),
        //   ...(formData.shift_id && { shift_id: formData.shift_id })
        // }));
        // const data = await response.json();

        // Mock response for demo
        const mockData = {
          date_range: {
            start_date: formData.start_date,
            end_date: formData.end_date,
          },
          total_bookings: 156,
          total_shifts: 12,
          booking_status_breakdown: {
            Request: 23,
            Scheduled: 45,
            Completed: 78,
            Cancelled: 10,
          },
          routing_summary: {
            routed: 142,
            unrouted: 14,
            routing_percentage: 91,
          },
          assignment_summary: {
            vendor_assigned: 138,
            driver_assigned: 125,
            vendor_assignment_percentage: 88,
            driver_assignment_percentage: 80,
          },
          route_status_breakdown: {
            Pending: 12,
            "In Progress": 18,
            Completed: 112,
            Cancelled: 14,
          },
          completion_rate: 72,
          daily_breakdown: {},
        };

        setAnalyticsData(mockData);
        setConfigModal({ isOpen: false, type: null, config: null });
      } catch (error) {
        console.error("Error fetching analytics:", error);
      }
    } else {
      // API call for download
      try {
        const params = {
          start_date: formData.start_date,
          end_date: formData.end_date,
          ...(formData.tenant_id && { tenant_id: formData.tenant_id }),
          ...(formData.shift_id && { shift_id: formData.shift_id }),
          ...(formData.booking_status.length && {
            booking_status: JSON.stringify(formData.booking_status),
          }),
          ...(formData.route_status.length && {
            route_status: JSON.stringify(formData.route_status),
          }),
          ...(formData.vendor_id && { vendor_id: formData.vendor_id }),
          include_unrouted: formData.include_unrouted,
        };

        // window.location.href = '/api/download/excel?' + new URLSearchParams(params);
        console.log("Downloading with params:", params);
        alert("Download started! Check your downloads folder.");
        setConfigModal({ isOpen: false, type: null, config: null });
      } catch (error) {
        console.error("Error downloading report:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
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
        onClose={() =>
          setConfigModal({ isOpen: false, type: null, config: null })
        }
        config={configModal.config}
        type={configModal.type}
        onSubmit={handleConfigSubmit}
      />

      {/* Analytics Display */}
      {analyticsData && (
        <AnalyticsDisplay
          data={analyticsData}
          onClose={() => setAnalyticsData(null)}
        />
      )}
    </div>
  );
};

export default ReportsModule;

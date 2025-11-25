import {
  getNestedValue,
  analyticsConfig,
  statusColors,
} from "../../utils/analyticsConfig";
import { logDebug } from "../../utils/logger";
import {
  StatCard,
  ProgressBar,
  StatusBreakdown,
  SummarySection,
} from "../AnalyticsComponents";

export const AnalyticsDisplay = ({
  data,
  onClose,
  reportType = "bookings",
}) => {
  if (!data || !data.data) return null;
  logDebug("AnalyticsDisplay data:", data);
  // Extract the actual analytics data from the response
  const analyticsData = data.data;
  const config = analyticsConfig[reportType] || analyticsConfig.bookings;

  // Helper function to get metric value with formatting
  // Helper function to get metric value with formatting
  const getMetricValue = (metric) => {
    const value = getNestedValue(analyticsData, metric.key);

    // 🛑 Prevent React child error
    if (value && typeof value === "object") {
      console.warn("Invalid metric value (object):", metric.key, value);
      return "--"; // or return JSON.stringify(value) if you want to show it
    }

    return metric.format ? metric.format(value) : value ?? "--";
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-50 rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div
          className={`sticky top-0 bg-gradient-to-r ${config.primaryColor} text-white p-6 rounded-t-2xl`}
        >
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{config.title}</h2>
              <p className="text-white/80 mt-1">
                {analyticsData.date_range?.start_date} to{" "}
                {analyticsData.date_range?.end_date}
              </p>
              {data.timestamp && (
                <p className="text-white/60 text-sm mt-1">
                  Generated: {new Date(data.timestamp).toLocaleString()}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl font-light transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {config.metrics.map((metric) => (
              <StatCard
                key={metric.key}
                label={metric.label}
                value={getMetricValue(metric)}
                icon={metric.icon}
                color={metric.color}
              />
            ))}
          </div>

          {/* Dynamic Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Breakdowns */}
            <StatusBreakdown
              title="Booking Status Breakdown"
              data={analyticsData.booking_status_breakdown}
              colors={statusColors.booking_status_breakdown}
            />

            <StatusBreakdown
              title="Route Status Breakdown"
              data={analyticsData.route_status_breakdown}
              colors={statusColors.route_status_breakdown}
            />

            {/* Routing Summary */}
            <SummarySection title="Routing Summary">
              <div className="space-y-4">
                <ProgressBar
                  label="Routed Bookings"
                  value={analyticsData.routing_summary.routed || 0}
                  max={
                    (analyticsData.routing_summary.routed || 0) +
                    (analyticsData.routing_summary.unrouted || 0)
                  }
                  color="green"
                />
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {analyticsData.routing_summary.routed}
                    </p>
                    <p className="text-sm text-gray-600">Routed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {analyticsData.routing_summary.unrouted}
                    </p>
                    <p className="text-sm text-gray-600">Unrouted</p>
                  </div>
                </div>
              </div>
            </SummarySection>

            {/* Assignment Summary */}
            <SummarySection title="Assignment Summary">
              <div className="space-y-4">
                <ProgressBar
                  label="Vendor Assignment"
                  value={analyticsData.assignment_summary.vendor_assigned || 0}
                  max={
                    analyticsData.routing_summary?.routed ||
                    analyticsData.total_bookings ||
                    1
                  }
                  color="blue"
                />
                <ProgressBar
                  label="Driver Assignment"
                  value={analyticsData.assignment_summary.driver_assigned || 0}
                  max={
                    analyticsData.assignment_summary.vendor_assigned ||
                    analyticsData.routing_summary?.routed ||
                    1
                  }
                  color="purple"
                />
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-600">
                      {
                        analyticsData.assignment_summary
                          .vendor_assignment_percentage
                      }
                      %
                    </p>
                    <p className="text-sm text-gray-600">Vendor Assignment %</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-purple-600">
                      {
                        analyticsData.assignment_summary
                          .driver_assignment_percentage
                      }
                      %
                    </p>
                    <p className="text-sm text-gray-600">Driver Assignment %</p>
                  </div>
                </div>
              </div>
            </SummarySection>
          </div>

          {/* Additional Data Sections */}
          {analyticsData.daily_breakdown &&
            Object.keys(analyticsData.daily_breakdown).length > 0 && (
              <SummarySection title="Daily Breakdown">
                <div className="space-y-3">
                  {Object.entries(analyticsData.daily_breakdown).map(
                    ([date, item]) => (
                      <div
                        key={date}
                        className="p-4 bg-white rounded-lg shadow-sm border border-gray-200"
                      >
                        {/* DATE */}
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                          {date}
                        </p>

                        {/* CASE 1: item is a NUMBER */}
                        {typeof item === "number" ? (
                          <p className="text-lg font-bold text-gray-900">
                            {item}
                          </p>
                        ) : (
                          /* CASE 2: item is an OBJECT */
                          <div className="space-y-2">
                            {/* Booking Status Breakdown */}
                            {item.booking_status && (
                              <div>
                                <p className="text-xs font-semibold text-gray-500">
                                  Booking Status
                                </p>
                                {Object.entries(item.booking_status).map(
                                  ([status, value]) => (
                                    <p
                                      key={status}
                                      className="text-sm text-gray-700 flex justify-between"
                                    >
                                      <span>{status}</span>
                                      <span className="font-semibold">
                                        {value}
                                      </span>
                                    </p>
                                  )
                                )}
                              </div>
                            )}

                            {/* Vendor Assigned */}
                            {"vendor_assigned" in item && (
                              <p className="text-sm flex justify-between text-gray-700">
                                <span>Vendor Assigned</span>
                                <span className="font-semibold">
                                  {item.vendor_assigned}
                                </span>
                              </p>
                            )}

                            {/* Driver Assigned */}
                            {"driver_assigned" in item && (
                              <p className="text-sm flex justify-between text-gray-700">
                                <span>Driver Assigned</span>
                                <span className="font-semibold">
                                  {item.driver_assigned}
                                </span>
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </SummarySection>
            )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Close Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

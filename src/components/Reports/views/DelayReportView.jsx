import { AlertTriangle, CheckCircle, Clock, TrendingUp, X } from "lucide-react";

const StatCard = ({ label, value, color = "gray" }) => {
  const colors = {
    gray: "bg-gray-50 border-gray-200 text-gray-700",
    red: "bg-red-50 border-red-200 text-red-700",
    green: "bg-green-50 border-green-200 text-green-700",
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    orange: "bg-orange-50 border-orange-200 text-orange-700",
  };

  return (
    <div className={`border rounded-xl p-4 ${colors[color]}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-70">
        {label}
      </p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
};

const DelayReportView = ({ data, loading, onClose }) => {
  if (loading) {
    return (
      <div className="mt-6 p-6 bg-white rounded-xl border border-gray-200 flex items-center gap-3">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500" />
        <span className="text-gray-600">Loading delay report...</span>
      </div>
    );
  }

  const { summary, routes = [] } = data || {};
  const hasData = routes.length > 0;

  return (
    <div className="mt-6 bg-white rounded-xl border border-gray-200 overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b bg-orange-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Delay Report</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              OTD delay summary for selected date range
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-orange-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="p-6 space-y-6">

        {/* Summary Stats */}
        {summary && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label="Total Routes Tagged"
                value={summary.total_routes_tagged}
                color="gray"
              />
              <StatCard
                label="Late"
                value={summary.late}
                color="red"
              />
              <StatCard
                label="Early"
                value={summary.early}
                color="blue"
              />
              <StatCard
                label="On Time"
                value={summary.on_time}
                color="green"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard
                label="Avg Delay (minutes)"
                value={summary.average_delay_minutes ?? 0}
                color="orange"
              />
            </div>

            {/* By Category */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Delay by Category
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(summary.by_category || {}).map(
                  ([category, count]) => (
                    <div
                      key={category}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center"
                    >
                      <p className="text-xs text-gray-500 font-medium">
                        {category.replace(/_/g, " ")}
                      </p>
                      <p className="text-xl font-bold text-gray-800 mt-1">
                        {count}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          </>
        )}

        {/* Routes Table or Empty State */}
        {hasData ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-3">Route</th>
                  <th className="px-4 py-3">Delay Type</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Delay (min)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {routes.map((route, index) => (
                  <tr
                    key={route.route_id ?? index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {route.route_code || route.route_id || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        route.delay_type === "LATE"
                          ? "bg-red-100 text-red-700"
                          : route.delay_type === "EARLY"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}>
                        {route.delay_type || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {route.delay_category?.replace(/_/g, " ") || "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700 font-medium">
                      {route.delay_minutes ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 bg-green-50 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-gray-700 font-medium">No delays found</p>
            <p className="text-gray-400 text-sm mt-1">
              No delay-tagged routes in the selected date range
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DelayReportView;
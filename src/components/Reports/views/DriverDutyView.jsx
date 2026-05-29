import { CheckCircle, Truck, X, AlertTriangle } from "lucide-react";

const StatCard = ({ label, value, color = "gray" }) => {
  const colors = {
    gray: "bg-gray-50 border-gray-200 text-gray-700",
    red: "bg-red-50 border-red-200 text-red-700",
    green: "bg-green-50 border-green-200 text-green-700",
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
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

const DriverDutyView = ({ data, loading, onClose }) => {
  if (loading) {
    return (
      <div className="mt-6 p-6 bg-white rounded-xl border border-gray-200 flex items-center gap-3">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500" />
        <span className="text-gray-600">Loading driver duty hours...</span>
      </div>
    );
  }

  const { drivers = [], summary } = data || {};
  const hasData = drivers.length > 0;

  return (
    <div className="mt-6 bg-white rounded-xl border border-gray-200 overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b bg-purple-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Truck className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Driver Duty Hours</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Hours driven and rest violations per driver
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="p-6 space-y-6">

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Total Drivers"
              value={summary.total_drivers}
              color="purple"
            />
            <StatCard
              label="Total Routes"
              value={summary.total_routes}
              color="blue"
            />
            <StatCard
              label="Rest Violations"
              value={summary.total_violations}
              color={summary.total_violations > 0 ? "red" : "green"}
            />
            <StatCard
              label="Max Duty (min)"
              value={summary.driver_max_duty_minutes}
              color="gray"
            />
          </div>
        )}

        {/* Drivers Table or Empty State */}
        {hasData ? (
          <div className="space-y-4">
            {drivers.map((driver) => (
              <div
                key={driver.driver_id}
                className="border border-gray-200 rounded-xl overflow-hidden"
              >
                {/* Driver Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Truck className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {driver.driver_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {driver.total_routes} routes ·{" "}
                        {Math.round(driver.total_duty_minutes / 60)}h{" "}
                        {driver.total_duty_minutes % 60}m total
                      </p>
                    </div>
                  </div>
                  {driver.rest_violations > 0 && (
                    <div className="flex items-center gap-1 bg-red-50 border border-red-200 rounded-lg px-3 py-1">
                      <AlertTriangle className="w-3 h-3 text-red-500" />
                      <span className="text-xs text-red-600 font-medium">
                        {driver.rest_violations} violation
                        {driver.rest_violations > 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </div>

                {/* Routes Table */}
                <table className="min-w-full text-sm">
                  <thead className="bg-white border-b border-gray-100">
                    <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      <th className="px-4 py-2">Route</th>
                      <th className="px-4 py-2">Start</th>
                      <th className="px-4 py-2">End</th>
                      <th className="px-4 py-2 text-right">Duty (min)</th>
                      <th className="px-4 py-2 text-right">Rest Gap (min)</th>
                      <th className="px-4 py-2 text-center">Rest OK</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {driver.routes?.map((route) => (
                      <tr
                        key={route.route_id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-2 font-medium text-gray-800">
                          {route.route_code || route.route_id}
                        </td>
                        <td className="px-4 py-2 text-gray-500 text-xs">
                          {route.actual_start
                            ? new Date(route.actual_start).toLocaleString()
                            : "—"}
                        </td>
                        <td className="px-4 py-2 text-gray-500 text-xs">
                          {route.actual_end
                            ? new Date(route.actual_end).toLocaleString()
                            : "—"}
                        </td>
                        <td className="px-4 py-2 text-right text-gray-700">
                          {route.duty_minutes}
                        </td>
                        <td className="px-4 py-2 text-right text-gray-700">
                          {route.rest_gap_minutes}
                        </td>
                        <td className="px-4 py-2 text-center">
                          {route.rest_ok ? (
                            <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
                              <CheckCircle className="w-3 h-3" /> OK
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-600 text-xs font-medium">
                              <AlertTriangle className="w-3 h-3" /> Violation
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 bg-purple-50 rounded-full mb-4">
              <Truck className="w-8 h-8 text-purple-400" />
            </div>
            <p className="text-gray-700 font-medium">No driver data found</p>
            <p className="text-gray-400 text-sm mt-1">
              No completed routes found for the selected date range
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDutyView;
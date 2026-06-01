import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AlertTriangle, CheckCircle, X, ChevronRight, ArrowLeft } from "lucide-react";
import { fetchDelayDetail } from "../../../redux/features/reports/reportsTrunk";
import {
  selectDelayDetail,
  clearDelayDetail,
} from "../../../redux/features/reports/reportsSlice";
import { selectCurrentUser } from "../../../redux/features/auth/authSlice";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const StatCard = ({ label, value, color = "gray" }) => {
  const colors = {
    gray:   "bg-gray-50 border-gray-200 text-gray-700",
    red:    "bg-red-50 border-red-200 text-red-700",
    green:  "bg-green-50 border-green-200 text-green-700",
    blue:   "bg-blue-50 border-blue-200 text-blue-700",
    orange: "bg-orange-50 border-orange-200 text-orange-700",
  };
  return (
    <div className={`border rounded-xl p-4 ${colors[color]}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
};

function formatDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ---------------------------------------------------------------------------
// Detail Panel — shown when a route row is clicked
// ---------------------------------------------------------------------------
function RouteDetailPanel({ onBack }) {
  const dispatch    = useDispatch();
  const detailState = useSelector(selectDelayDetail);
  const { data, loading, error } = detailState;

  const handleClose = () => {
    dispatch(clearDelayDetail());
    onBack();
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-3">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500" />
        <span className="text-gray-600 text-sm">Loading route detail...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-sm text-red-500">{error}</div>
    );
  }

  if (!data) return null;

  const { delay_summary = {}, events = [] } = data;

  return (
    <div className="p-6 space-y-5">

      {/* Back button */}
      <button
        onClick={handleClose}
        className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 font-medium"
      >
        <ArrowLeft size={15} /> Back to list
      </button>

      {/* Route info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Route ID"       value={data.route_id ?? "—"}                    color="gray" />
        <StatCard label="Status"         value={data.status ?? "—"}                      color="blue" />
        <StatCard label="Est. Time (min)" value={data.estimated_total_time_min ?? "—"}   color="gray" />
        <StatCard
          label="Delay Type"
          value={delay_summary.delay_type ?? "None"}
          color={delay_summary.delay_type === "LATE" ? "red" : delay_summary.delay_type === "EARLY" ? "blue" : "green"}
        />
      </div>

      {/* Times */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Actual Start</p>
          <p className="text-sm font-semibold text-gray-800 mt-1">{formatDateTime(data.actual_start_time)}</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Actual End</p>
          <p className="text-sm font-semibold text-gray-800 mt-1">{formatDateTime(data.actual_end_time)}</p>
        </div>
      </div>

      {/* Delay summary */}
      {delay_summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard
            label="Delay (min)"
            value={delay_summary.delay_minutes ?? 0}
            color={delay_summary.delay_minutes > 0 ? "orange" : "green"}
          />
          <StatCard label="OTA Grace (min)" value={delay_summary.ota_grace_minutes ?? 0} color="gray" />
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Tagged At</p>
            <p className="text-sm font-semibold text-gray-800 mt-1">
              {formatDateTime(delay_summary.delay_tagged_at)}
            </p>
          </div>
        </div>
      )}

      {/* Events table */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Delay Events {events.length > 0 ? `(${events.length})` : ""}
        </h3>

        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-xl border border-gray-200">
            <CheckCircle className="w-6 h-6 text-green-400 mb-2" />
            <p className="text-sm text-gray-500">No delay events recorded for this route</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {Object.keys(events[0]).map((key) => (
                    <th key={key} className="px-4 py-3">
                      {key.replace(/_/g, " ")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {events.map((event, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    {Object.values(event).map((val, i) => (
                      <td key={i} className="px-4 py-3 text-gray-700">
                        {val == null ? "—" : String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
const DelayReportView = ({ data, loading, onClose }) => {
  const dispatch  = useDispatch();
  const user      = useSelector(selectCurrentUser);
  const tenantId  = user?.employee?.tenant_id || user?.tenant_id;
  const [showDetail, setShowDetail] = useState(false);

  const handleRowClick = (route) => {
    dispatch(fetchDelayDetail({
      route_id:  route.route_id,
      tenant_id: tenantId,
    }));
    setShowDetail(true);
  };

  const handleBack = () => setShowDetail(false);

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
              {showDetail ? "Route detail — click Back to return to list" : "Click a route row to see full detail"}
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

      {/* ── Detail panel ── */}
      {showDetail ? (
        <RouteDetailPanel onBack={handleBack} />
      ) : (
        <div className="p-6 space-y-6">

          {/* Summary Stats */}
          {summary && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Routes Tagged" value={summary.total_routes_tagged} color="gray" />
                <StatCard label="Late"                value={summary.late}                color="red" />
                <StatCard label="Early"               value={summary.early}               color="blue" />
                <StatCard label="On Time"             value={summary.on_time}             color="green" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatCard label="Avg Delay (minutes)" value={summary.average_delay_minutes ?? 0} color="orange" />
              </div>

              {/* By Category */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Delay by Category</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(summary.by_category || {}).map(([category, count]) => (
                    <div key={category} className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500 font-medium">{category.replace(/_/g, " ")}</p>
                      <p className="text-xl font-bold text-gray-800 mt-1">{count}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Routes Table */}
          {hasData ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <th className="px-4 py-3">Route</th>
                    <th className="px-4 py-3">Delay Type</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3 text-right">Delay (min)</th>
                    <th className="px-4 py-3 text-center">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {routes.map((route, index) => (
                    <tr
                      key={route.route_id ?? index}
                      className="hover:bg-orange-50 cursor-pointer transition-colors"
                      onClick={() => handleRowClick(route)}
                    >
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {route.route_code || `#${route.route_id}` || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          route.delay_type === "LATE"    ? "bg-red-100 text-red-700" :
                          route.delay_type === "EARLY"   ? "bg-blue-100 text-blue-700" :
                                                           "bg-green-100 text-green-700"
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
                      <td className="px-4 py-3 text-center">
                        <ChevronRight size={16} className="text-orange-400 inline" />
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
      )}
    </div>
  );
};

export default DelayReportView;
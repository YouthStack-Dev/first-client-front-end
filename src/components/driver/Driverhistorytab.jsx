import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDriverHistoryReport } from "../../redux/features/manageDriver/Driverhistorythunks";
import {
  clearDriverHistory,
  selectDriverHistoryRoutes,
  selectDriverHistoryLoading,
  selectDriverHistoryError,
  selectDriverHistorySummary,
} from "../../redux/features/manageDriver/Driverhistoryslice ";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const today = () => new Date().toISOString().split("T")[0];
const thirtyDaysAgo = () => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().split("T")[0];
};

const STATUS_STYLES = {
  COMPLETED:       "bg-green-100 text-green-700",
  CANCELLED:       "bg-red-100 text-red-600",
  ONGOING:         "bg-blue-100 text-blue-700",
  DRIVER_ASSIGNED: "bg-yellow-100 text-yellow-700",
  PLANNED:         "bg-gray-100 text-gray-600",
};

function StatusBadge({ status }) {
  const cls = STATUS_STYLES[status] ?? "bg-gray-100 text-gray-500";
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {status ?? "—"}
    </span>
  );
}

function formatTime(isoString) {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function durationLabel(start, end) {
  if (!start || !end) return "—";
  const diff = Math.round((new Date(end) - new Date(start)) / 60000);
  if (diff <= 0) return "—";
  if (diff < 60) return `${diff} min`;
  return `${Math.floor(diff / 60)}h ${diff % 60}m`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function SummaryCard({ label, value, sub, colorClass = "text-gray-800" }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col gap-1">
      <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
        {label}
      </span>
      <span className={`text-2xl font-bold ${colorClass}`}>{value}</span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3 bg-gray-200 rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// Props:
//   driverId  — number | string  (required) — the driver whose history to show
// ---------------------------------------------------------------------------
export default function DriverHistoryTab({ driverId }) {
  const dispatch = useDispatch();

  const routes  = useSelector(selectDriverHistoryRoutes);
  const loading = useSelector(selectDriverHistoryLoading);
  const error   = useSelector(selectDriverHistoryError);
  const summary = useSelector(selectDriverHistorySummary);

  const [fromDate, setFromDate] = useState(thirtyDaysAgo);
  const [toDate,   setToDate]   = useState(today);
  const [expandedRouteId, setExpandedRouteId] = useState(null);

  const load = useCallback(() => {
    if (!driverId) return;
    dispatch(
      fetchDriverHistoryReport({
        driver_id: driverId,
        from_date: fromDate,
        to_date:   toDate,
      })
    );
  }, [dispatch, driverId, fromDate, toDate]);

  // Fetch on mount and when driverId changes
  useEffect(() => {
    load();
    return () => dispatch(clearDriverHistory());
  }, [driverId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  // ---------------------------------------------------------------------------
  return (
    <div className="flex flex-col gap-6 py-4">

      {/* ── Date Filter ─────────────────────────────────────────────────── */}
      <form
        onSubmit={handleSearch}
        className="flex flex-wrap items-end gap-3 bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">From</label>
          <input
            type="date"
            value={fromDate}
            max={toDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">To</label>
          <input
            type="date"
            value={toDate}
            min={fromDate}
            max={today()}
            onChange={(e) => setToDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
        >
          {loading ? "Loading…" : "Search"}
        </button>
      </form>

      {/* ── Summary Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard
          label="Total Routes"
          value={summary.total}
          sub="in selected range"
        />
        <SummaryCard
          label="Completed"
          value={summary.completed}
          colorClass="text-green-600"
        />
        <SummaryCard
          label="Cancelled"
          value={summary.cancelled}
          colorClass="text-red-500"
        />
        <SummaryCard
          label="Distance Driven"
          value={`${summary.totalDist.toFixed(1)} km`}
          sub="completed routes only"
          colorClass="text-blue-600"
        />
      </div>

      {/* ── Error Banner ────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* ── Route Table ─────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Route History</h3>
          {!loading && (
            <span className="text-xs text-gray-400">
              {summary.total} route{summary.total !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3 text-left">Route Code</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-center">Stops</th>
                <th className="px-4 py-3 text-right">Distance (km)</th>
                <th className="px-4 py-3 text-center">Duty Time</th>
                <th className="px-4 py-3 text-center">Duration</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {/* Loading skeletons */}
              {loading &&
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

              {/* Empty state */}
              {!loading && routes.length === 0 && !error && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-gray-400 text-sm"
                  >
                    No routes found for the selected date range.
                  </td>
                </tr>
              )}

              {/* Route rows */}
              {!loading &&
                routes.map((route) => {
                  const isExpanded = expandedRouteId === route.route_id;
                  return (
                    <React.Fragment key={route.route_id}>
                      <tr
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() =>
                          setExpandedRouteId(isExpanded ? null : route.route_id)
                        }
                      >
                        {/* Route Code */}
                        <td className="px-4 py-3 font-medium text-gray-800">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-gray-400 text-xs transition-transform duration-200 inline-block ${
                                isExpanded ? "rotate-90" : ""
                              }`}
                            >
                              ▶
                            </span>
                            {route.route_code ?? `#${route.route_id}`}
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3 text-gray-600">
                          {formatDate(route.date)}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <StatusBadge status={route.status} />
                        </td>

                        {/* Stops */}
                        <td className="px-4 py-3 text-center text-gray-600">
                          {route.total_stops ?? route.bookings?.length ?? "—"}
                        </td>

                        {/* Distance */}
                        <td className="px-4 py-3 text-right font-mono text-gray-700">
                          {parseFloat(route.actual_total_distance) > 0 ? (
                            parseFloat(route.actual_total_distance).toFixed(2)
                          ) : (
                            <span className="text-gray-400 text-xs">N/A</span>
                          )}
                        </td>

                        {/* Duty Time */}
                        <td className="px-4 py-3 text-center text-gray-500 text-xs whitespace-nowrap">
                          {formatTime(route.duty_start_time)} –{" "}
                          {formatTime(route.duty_end_time)}
                        </td>

                        {/* Duration */}
                        <td className="px-4 py-3 text-center text-gray-500 text-xs">
                          {durationLabel(route.duty_start_time, route.duty_end_time)}
                        </td>
                      </tr>

                      {/* Expanded: bookings inside this route */}
                      {isExpanded && (
                        <tr className="bg-blue-50">
                          <td colSpan={7} className="px-8 py-3">
                            {!route.bookings || route.bookings.length === 0 ? (
                              <p className="text-xs text-gray-400 italic">
                                No booking details available for this route.
                              </p>
                            ) : (
                              <table className="min-w-full text-xs">
                                <thead>
                                  <tr className="text-gray-500 uppercase tracking-wide">
                                    <th className="pr-6 py-1 text-left">Booking ID</th>
                                    <th className="pr-6 py-1 text-left">Employee</th>
                                    <th className="pr-6 py-1 text-left">Pickup</th>
                                    <th className="pr-6 py-1 text-left">Status</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-blue-100">
                                  {route.bookings.map((b) => (
                                    <tr key={b.booking_id}>
                                      <td className="pr-6 py-1.5 text-gray-500">
                                        #{b.booking_id}
                                      </td>
                                      <td className="pr-6 py-1.5 text-gray-700 font-medium">
                                        {b.employee_name ?? "—"}
                                      </td>
                                      <td className="pr-6 py-1.5 text-gray-500">
                                        {b.pickup_location ?? "—"}
                                      </td>
                                      <td className="pr-6 py-1.5">
                                        <StatusBadge status={b.status} />
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
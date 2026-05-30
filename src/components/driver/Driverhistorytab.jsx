import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDriverHistoryReport } from "../../redux/features/manageDriver/Driverhistorythunks";
import {
  clearDriverHistory,
  selectDriverHistoryRoutes,
  selectDriverHistoryLoading,
  selectDriverHistoryError,
  selectDriverHistorySummary,
} from "../../redux/features/manageDriver/Driverhistoryslice";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const today         = () => new Date().toISOString().split("T")[0];
const thirtyDaysAgo = () => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().split("T")[0];
};

const STATUS_STYLES = {
  completed:       "bg-green-100 text-green-700",
  cancelled:       "bg-red-100 text-red-600",
  ongoing:         "bg-blue-100 text-blue-700",
  driver_assigned: "bg-yellow-100 text-yellow-700",
  vendor_assigned: "bg-orange-100 text-orange-700",
  planned:         "bg-gray-100 text-gray-600",
  no_show:         "bg-orange-100 text-orange-600",
};

function StatusBadge({ status }) {
  const key = status?.toLowerCase().replace(/[\s-]+/g, "_") ?? "";
  const cls = STATUS_STYLES[key] ?? "bg-gray-100 text-gray-500";
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {status ?? "—"}
    </span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Group flat bookings array → { route_id → { routeInfo, bookings[] } }
// API returns flat bookings with route fields embedded in each row
// ---------------------------------------------------------------------------
function groupByRoute(bookings = []) {
  const map = new Map();
  bookings.forEach((b) => {
    if (!map.has(b.route_id)) {
      map.set(b.route_id, {
        route_id:                    b.route_id,
        route_code:                  b.route_code,
        route_status:                b.route_status,
        booking_date:                b.booking_date,
        estimated_total_distance_km: b.estimated_total_distance_km,
        actual_total_distance_km:    b.actual_total_distance_km,
        bookings: [],
      });
    }
    map.get(b.route_id).bookings.push(b);
  });
  return Array.from(map.values());
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function SummaryCard({ label, value, sub, colorClass = "text-gray-800" }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col gap-1">
      <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</span>
      <span className={`text-2xl font-bold ${colorClass}`}>{value}</span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3 bg-gray-200 rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export default function DriverHistoryTab({ driverId }) {
  const dispatch = useDispatch();

  const bookings = useSelector(selectDriverHistoryRoutes);  // flat bookings array
  const loading  = useSelector(selectDriverHistoryLoading);
  const error    = useSelector(selectDriverHistoryError);
  const summary  = useSelector(selectDriverHistorySummary);

  const [fromDate, setFromDate]        = useState(thirtyDaysAgo);
  const [toDate,   setToDate]          = useState(today);
  const [expandedRouteId, setExpanded] = useState(null);

  // Group flat bookings into routes on the frontend
  const routes = useMemo(() => groupByRoute(bookings), [bookings]);

  const load = useCallback(() => {
    if (!driverId) return;
    dispatch(fetchDriverHistoryReport({
      driver_id: driverId,
      from_date: fromDate,
      to_date:   toDate,
    }));
  }, [dispatch, driverId, fromDate, toDate]);

  useEffect(() => {
    load();
    return () => dispatch(clearDriverHistory());
  }, [driverId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => { e.preventDefault(); load(); };

  // ---------------------------------------------------------------------------
  return (
    <div className="flex flex-col gap-6 py-4">

      {/* ── Date Filter ─────────────────────────────────────────────── */}
      <form
        onSubmit={handleSearch}
        className="flex flex-wrap items-end gap-3 bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">From</label>
          <input
            type="date" value={fromDate} max={toDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">To</label>
          <input
            type="date" value={toDate} min={fromDate} max={today()}
            onChange={(e) => setToDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit" disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
        >
          {loading ? "Loading…" : "Search"}
        </button>
      </form>

      {/* ── Summary Cards ───────────────────────────────────────────── */}
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
          label="Total Bookings"
          value={bookings.length}
          colorClass="text-blue-600"
        />
        <SummaryCard
          label="Distance Driven"
          value={`${summary.totalDist.toFixed(1)} km`}
          sub="actual recorded only"
          colorClass="text-indigo-600"
        />
      </div>

      {/* ── Error ───────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* ── Route Table ─────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Route History</h3>
          {!loading && (
            <span className="text-xs text-gray-400">
              {routes.length} route{routes.length !== 1 ? "s" : ""} · {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3 text-left">Route ID / Employees</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Route Status</th>
                <th className="px-4 py-3 text-center">Bookings</th>
                <th className="px-4 py-3 text-right">Est. Distance</th>
                <th className="px-4 py-3 text-right">Actual Distance</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading && Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}

              {!loading && routes.length === 0 && !error && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">
                    No routes found for the selected date range.
                  </td>
                </tr>
              )}

              {!loading && routes.map((route) => {
                const isExpanded = expandedRouteId === route.route_id;
                return (
                  <React.Fragment key={route.route_id}>  {/* ← unique route_id after grouping */}

                    {/* ── Route Row ── */}
                    <tr
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setExpanded(isExpanded ? null : route.route_id)}
                    >
                      {/* Route ID + employee names summary */}
                      <td className="px-4 py-3 font-medium text-gray-800">
                        <div className="flex items-center gap-2">
                          <span className={`text-gray-400 text-xs inline-block transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}>
                            ▶
                          </span>
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-800">
                              Route #{route.route_id}
                            </span>
                            <span className="text-xs text-gray-400 truncate max-w-[200px]">
                              {route.bookings.map((b) => b.employee_name).filter(Boolean).join(", ") || "—"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {formatDate(route.booking_date)}
                      </td>

                      {/* Route status */}
                      <td className="px-4 py-3">
                        <StatusBadge status={route.route_status} />
                      </td>

                      {/* Booking count */}
                      <td className="px-4 py-3 text-center text-gray-600">
                        {route.bookings.length}
                      </td>

                      {/* Estimated distance */}
                      <td className="px-4 py-3 text-right font-mono text-gray-500 text-xs">
                        {route.estimated_total_distance_km != null
                          ? `${parseFloat(route.estimated_total_distance_km).toFixed(2)} km`
                          : "—"}
                      </td>

                      {/* Actual distance */}
                      <td className="px-4 py-3 text-right font-mono text-gray-700">
                        {route.actual_total_distance_km == null ? (
                          <span className="text-gray-400 text-xs">N/A</span>
                        ) : parseFloat(route.actual_total_distance_km) === 0 ? (
                          <span className="text-gray-400 text-xs">0.00 km</span>
                        ) : (
                          `${parseFloat(route.actual_total_distance_km).toFixed(2)} km`
                        )}
                      </td>
                    </tr>

                    {/* ── Expanded: individual bookings ── */}
                    {isExpanded && (
                      <tr className="bg-blue-50">
                        <td colSpan={6} className="px-8 py-3">
                          <table className="min-w-full text-xs">
                            <thead>
                              <tr className="text-gray-500 uppercase tracking-wide">
                                <th className="pr-4 py-1 text-left">Booking ID</th>
                                <th className="pr-4 py-1 text-left">Employee</th>
                                <th className="pr-4 py-1 text-left">Pickup</th>
                                <th className="pr-4 py-1 text-left">Drop</th>
                                <th className="pr-4 py-1 text-left">Pickup Time</th>
                                <th className="pr-4 py-1 text-left">Drop Time</th>
                                <th className="pr-4 py-1 text-left">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-blue-100">
                              {route.bookings.map((b) => (
                                <tr key={b.booking_id}>  {/* ← unique booking_id */}
                                  <td className="pr-4 py-2 text-gray-500">#{b.booking_id}</td>
                                  <td className="pr-4 py-2 text-gray-700 font-medium">
                                    {b.employee_name ?? "—"}
                                    {b.employee_code && (
                                      <span className="ml-1 text-gray-400">({b.employee_code})</span>
                                    )}
                                  </td>
                                  <td className="pr-4 py-2 text-gray-500 max-w-[180px] truncate" title={b.pickup_location}>
                                    {b.pickup_location ?? "—"}
                                  </td>
                                  <td className="pr-4 py-2 text-gray-500 max-w-[180px] truncate" title={b.drop_location}>
                                    {b.drop_location ?? "—"}
                                  </td>
                                  <td className="pr-4 py-2 text-gray-500">
                                    {b.actual_pickup_time ?? b.estimated_pickup_time ?? "—"}
                                  </td>
                                  <td className="pr-4 py-2 text-gray-500">
                                    {b.actual_drop_time ?? b.estimated_drop_time ?? "—"}
                                  </td>
                                  <td className="pr-4 py-2">
                                    <StatusBadge status={b.booking_status} />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
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
import React, { useMemo } from "react";
import {
  X, TrendingUp, Calendar, Layers, CheckCircle,
  BarChart2, Navigation, UserCheck, AlertCircle,
} from "lucide-react";

// ─── Color Registry ───────────────────────────────────────────────────────────
const STATUS_PALETTE = {
  Completed:        { bar: "bg-emerald-500", text: "text-emerald-700", light: "bg-emerald-50", hex: "#10b981" },
  Scheduled:        { bar: "bg-blue-500",    text: "text-blue-700",    light: "bg-blue-50",    hex: "#3b82f6" },
  Request:          { bar: "bg-violet-500",  text: "text-violet-700",  light: "bg-violet-50",  hex: "#8b5cf6" },
  Cancelled:        { bar: "bg-red-400",     text: "text-red-600",     light: "bg-red-50",     hex: "#f87171" },
  "No-Show":        { bar: "bg-orange-400",  text: "text-orange-600",  light: "bg-orange-50",  hex: "#fb923c" },
  Planned:          { bar: "bg-indigo-400",  text: "text-indigo-700",  light: "bg-indigo-50",  hex: "#818cf8" },
  "Driver Assigned":{ bar: "bg-teal-500",    text: "text-teal-700",    light: "bg-teal-50",    hex: "#14b8a6" },
  Ongoing:          { bar: "bg-sky-500",     text: "text-sky-700",     light: "bg-sky-50",     hex: "#0ea5e9" },
};
const DEFAULT_PALETTE = { bar: "bg-gray-400", text: "text-gray-600", light: "bg-gray-50", hex: "#9ca3af" };
const palette = (key) => STATUS_PALETTE[key] ?? DEFAULT_PALETTE;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n, dec = 1) => (n == null ? "—" : Number(n).toFixed(dec));
const pct  = (n) => `${fmt(n)}%`;

function formatAxisDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, sub, accent }) {
  const accents = {
    blue:    { ring: "ring-blue-100",    icon: "bg-blue-50 text-blue-600",    val: "text-blue-700"    },
    emerald: { ring: "ring-emerald-100", icon: "bg-emerald-50 text-emerald-600", val: "text-emerald-700" },
    violet:  { ring: "ring-violet-100",  icon: "bg-violet-50 text-violet-600", val: "text-violet-700"  },
    orange:  { ring: "ring-orange-100",  icon: "bg-orange-50 text-orange-600", val: "text-orange-700"  },
  };
  const a = accents[accent] ?? accents.blue;
  return (
    <div className={`bg-white rounded-xl p-4 ring-1 ${a.ring} flex items-start gap-3`}>
      <div className={`p-2 rounded-lg ${a.icon} flex-shrink-0`}>
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 font-medium leading-none mb-1">{label}</p>
        <p className={`text-2xl font-bold leading-none ${a.val}`}>{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1 leading-snug">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Horizontal Status Bars ───────────────────────────────────────────────────
function StatusBars({ title, breakdown, total }) {
  const entries = Object.entries(breakdown ?? {}).sort((a, b) => b[1] - a[1]);
  return (
    <div className="bg-white rounded-xl ring-1 ring-gray-100 p-4">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{title}</p>
      <div className="space-y-3">
        {entries.map(([key, count]) => {
          const p = total ? ((count / total) * 100).toFixed(1) : 0;
          const c = palette(key);
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${c.bar}`} />
                  <span className="text-xs font-medium text-gray-700">{key}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{p}%</span>
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${c.light} ${c.text}`}>{count}</span>
                </div>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${c.bar} transition-all duration-700`}
                  style={{ width: `${p}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Donut Ring ───────────────────────────────────────────────────────────────
function DonutRing({ percentage, label, color, size = 80, stroke = 8 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash  = (percentage / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f3f4f6" strokeWidth={stroke} />
        <circle
          cx={size/2} cy={size/2} r={r}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: "stroke-dasharray 0.7s ease" }}
        />
        <text x={size/2} y={size/2 + 1} textAnchor="middle" dominantBaseline="middle"
          fontSize="11" fontWeight="700" fill="#374151">
          {fmt(percentage)}%
        </text>
      </svg>
      <span className="text-xs text-gray-500 text-center leading-tight">{label}</span>
    </div>
  );
}

// ─── Progress Stat Row ────────────────────────────────────────────────────────
function ProgressRow({ label, value, total, color }) {
  const p = total ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600">{label}</span>
        <span className="text-xs font-bold text-gray-700">{value} <span className="text-gray-400 font-normal">/ {total}</span></span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${p}%`, background: color }} />
      </div>
    </div>
  );
}

// ─── Daily Bar Chart (pure SVG) ───────────────────────────────────────────────
function DailyChart({ dailyBreakdown }) {
  const chartData = useMemo(() => {
    return Object.entries(dailyBreakdown ?? {})
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, day]) => {
        const total = Object.values(day.booking_status ?? {}).reduce((s, v) => s + v, 0);
        return { date, total, statuses: day.booking_status ?? {}, vendorAssigned: day.vendor_assigned, driverAssigned: day.driver_assigned };
      });
  }, [dailyBreakdown]);

  const maxVal = Math.max(...chartData.map((d) => d.total), 1);
  const W = 680, H = 140, PAD_L = 28, PAD_B = 30, PAD_T = 10;
  const chartW = W - PAD_L;
  const chartH = H - PAD_B - PAD_T;
  const barW   = Math.min(28, (chartW / chartData.length) * 0.55);
  const gap    = chartW / chartData.length;

  // Y grid lines
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(f * maxVal));

  return (
    <div className="bg-white rounded-xl ring-1 ring-gray-100 p-4">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Daily Booking Activity</p>
      <div className="overflow-x-auto">
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMinYMid meet">
          {/* Grid lines */}
          {gridLines.map((v) => {
            const y = PAD_T + chartH - (v / maxVal) * chartH;
            return (
              <g key={v}>
                <line x1={PAD_L} y1={y} x2={W} y2={y} stroke="#f3f4f6" strokeWidth="1" />
                <text x={PAD_L - 4} y={y + 1} textAnchor="end" fontSize="8" fill="#9ca3af" dominantBaseline="middle">{v}</text>
              </g>
            );
          })}

          {/* Bars */}
          {chartData.map((d, i) => {
            const cx  = PAD_L + gap * i + gap / 2;
            const barH = (d.total / maxVal) * chartH;
            const barY = PAD_T + chartH - barH;

            // Stacked segments
            let yOffset = PAD_T + chartH;
            const segments = Object.entries(d.statuses).map(([key, count]) => {
              const segH = (count / maxVal) * chartH;
              yOffset -= segH;
              return { key, segH, y: yOffset };
            });

            return (
              <g key={d.date}>
                {segments.map(({ key, segH, y }) => (
                  <rect
                    key={key}
                    x={cx - barW / 2}
                    y={y}
                    width={barW}
                    height={segH}
                    fill={palette(key).hex}
                    rx={i === 0 || segments[0].key === key ? 3 : 0}
                  />
                ))}
                {/* Total label above bar */}
                {d.total > 0 && (
                  <text x={cx} y={barY - 3} textAnchor="middle" fontSize="8" fill="#6b7280" fontWeight="600">
                    {d.total}
                  </text>
                )}
                {/* Date label */}
                <text
                  x={cx} y={H - 6}
                  textAnchor="middle" fontSize="7.5" fill="#9ca3af"
                  transform={`rotate(-35, ${cx}, ${H - 6})`}
                >
                  {formatAxisDate(d.date)}
                </text>
              </g>
            );
          })}

          {/* X axis */}
          <line x1={PAD_L} y1={PAD_T + chartH} x2={W} y2={PAD_T + chartH} stroke="#e5e7eb" strokeWidth="1" />
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-2">
        {Object.keys(STATUS_PALETTE).filter((k) =>
          Object.values(dailyBreakdown ?? {}).some((d) => d.booking_status?.[k])
        ).map((key) => (
          <div key={key} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm" style={{ background: palette(key).hex }} />
            <span className="text-xs text-gray-500">{key}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BookingAnalyticsView({ data, loading, onClose }) {
  if (!data && !loading) return null;

  const {
    date_range, total_bookings, total_shifts, completion_rate,
    booking_status_breakdown, routing_summary, assignment_summary,
    route_status_breakdown, daily_breakdown,
  } = data ?? {};

  return (
    <div className="mt-6 bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden shadow-sm">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-white px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-800 tracking-tight">Booking Analytics</h3>
          {date_range && (
            <p className="text-xs text-gray-400 mt-0.5">
              {date_range.start_date} → {date_range.end_date}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={15} />
        </button>
      </div>

      {/* ── Loading ─────────────────────────────────────────────────────────── */}
      {loading && (
        <div className="p-6 grid grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={`h-24 bg-gray-200 rounded-xl animate-pulse ${i >= 4 ? "col-span-2" : ""}`} />
          ))}
        </div>
      )}

      {!loading && data && (
        <div className="p-5 space-y-4">

          {/* ── KPI Row ───────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard
              icon={BarChart2}  accent="blue"
              label="Total Bookings" value={total_bookings ?? "—"}
              sub={`${total_shifts ?? "—"} shifts`}
            />
            <KpiCard
              icon={CheckCircle} accent="emerald"
              label="Completion Rate" value={pct(completion_rate)}
              sub={`${booking_status_breakdown?.Completed ?? 0} completed`}
            />
            <KpiCard
              icon={Navigation}  accent="violet"
              label="Routing Coverage" value={pct(routing_summary?.routing_percentage)}
              sub={`${routing_summary?.routed ?? 0} routed · ${routing_summary?.unrouted ?? 0} unrouted`}
            />
            <KpiCard
              icon={UserCheck}   accent="orange"
              label="Driver Assigned" value={pct(assignment_summary?.driver_assignment_percentage)}
              sub={`${assignment_summary?.driver_assigned ?? 0} of ${total_bookings ?? 0}`}
            />
          </div>

          {/* ── Middle Row: Status Bars + Donuts ─────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

            {/* Booking Status Breakdown */}
            <StatusBars
              title="Booking Status"
              breakdown={booking_status_breakdown}
              total={total_bookings}
            />

            {/* Route Status Breakdown */}
            <StatusBars
              title="Route Status"
              breakdown={route_status_breakdown}
              total={Object.values(route_status_breakdown ?? {}).reduce((s, v) => s + v, 0)}
            />

            {/* Routing & Assignment Summary */}
            <div className="bg-white rounded-xl ring-1 ring-gray-100 p-4 space-y-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Coverage</p>

              {/* Donut rings */}
              <div className="flex justify-around">
                <DonutRing
                  percentage={routing_summary?.routing_percentage ?? 0}
                  label="Routed"
                  color="#8b5cf6"
                />
                <DonutRing
                  percentage={assignment_summary?.vendor_assignment_percentage ?? 0}
                  label="Vendor Assigned"
                  color="#3b82f6"
                />
                <DonutRing
                  percentage={assignment_summary?.driver_assignment_percentage ?? 0}
                  label="Driver Assigned"
                  color="#14b8a6"
                />
              </div>

              {/* Progress rows */}
              <div className="space-y-2.5 pt-1 border-t border-gray-50">
                <ProgressRow
                  label="Routed bookings"
                  value={routing_summary?.routed ?? 0}
                  total={total_bookings}
                  color="#8b5cf6"
                />
                <ProgressRow
                  label="Vendor assigned"
                  value={assignment_summary?.vendor_assigned ?? 0}
                  total={total_bookings}
                  color="#3b82f6"
                />
                <ProgressRow
                  label="Driver assigned"
                  value={assignment_summary?.driver_assigned ?? 0}
                  total={total_bookings}
                  color="#14b8a6"
                />
              </div>
            </div>
          </div>

          {/* ── Daily Chart ───────────────────────────────────────────────── */}
          {daily_breakdown && <DailyChart dailyBreakdown={daily_breakdown} />}

        </div>
      )}
    </div>
  );
}
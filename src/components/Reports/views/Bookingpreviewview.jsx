import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight, MapPin, TrendingUp, Users, Route, CheckCircle } from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 10;

const BOOKING_STATUS_STYLES = {
  completed:  "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  ongoing:    "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  cancelled:  "bg-red-50 text-red-600 ring-1 ring-red-200",
  scheduled:  "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  request:    "bg-purple-50 text-purple-700 ring-1 ring-purple-200",
  no_show:    "bg-orange-50 text-orange-600 ring-1 ring-orange-200",
  expired:    "bg-gray-100 text-gray-500 ring-1 ring-gray-200",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(val) {
  if (!val) return "—";
  const d = new Date(val);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function shortenLocation(loc) {
  if (!loc) return "—";
  // Take up to the first comma-separated segment that looks like a meaningful place
  const parts = loc.split(",");
  return parts.slice(0, 3).join(",").trim();
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatusBadge({ value }) {
  if (!value) return <span className="text-gray-400 text-xs">—</span>;
  const key = String(value).toLowerCase().replace(/[\s-]/g, "_");
  const cls  = BOOKING_STATUS_STYLES[key] ?? "bg-gray-100 text-gray-600 ring-1 ring-gray-200";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {value}
    </span>
  );
}

function LocationCell({ value }) {
  const short = shortenLocation(value);
  return (
    <div title={value} className="max-w-[180px]">
      <div className="flex items-start gap-1">
        <MapPin size={11} className="text-gray-400 mt-0.5 flex-shrink-0" />
        <span className="text-xs text-gray-700 leading-relaxed line-clamp-2">{short}</span>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg bg-white border ${color}`}>
      <div className={`p-1.5 rounded-md ${color.replace("border-", "bg-").replace("-200", "-50")}`}>
        <Icon size={14} className={color.replace("border-", "text-").replace("-200", "-600")} />
      </div>
      <div>
        <p className="text-xs text-gray-500 leading-none mb-0.5">{label}</p>
        <p className="text-sm font-bold text-gray-800">{value ?? "—"}</p>
      </div>
    </div>
  );
}

function SkeletonTable() {
  return (
    <div className="p-5 space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-3">
          {Array.from({ length: 6 }).map((_, j) => (
            <div
              key={j}
              className="h-9 bg-gray-100 rounded-md animate-pulse"
              style={{ flex: [0.3, 1.2, 0.8, 1, 1, 1][j] ?? 1 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Column definitions ────────────────────────────────────────────────────────
const COLUMNS = [
  {
    key: "booking_id",
    label: "Booking",
    minWidth: "100px",
    render: (_, row) => (
      <div>
        <span className="font-mono font-bold text-blue-700 text-xs">#{row.booking_id}</span>
        <div className="text-xs text-gray-400 mt-0.5">{formatDate(row.booking_date)}</div>
      </div>
    ),
  },
  {
    key: "booking_status",
    label: "Status",
    minWidth: "110px",
    render: (v, row) => (
      <div className="space-y-1">
        <StatusBadge value={row.booking_status} />
        {row.route_status && row.route_status !== row.booking_status && (
          <div>
            <StatusBadge value={row.route_status} />
          </div>
        )}
      </div>
    ),
  },
  {
    key: "employee_name",
    label: "Employee",
    minWidth: "160px",
    render: (v, row) => (
      <div>
        <div className="font-medium text-gray-800 text-sm">{v || "—"}</div>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-xs text-gray-400">{row.employee_code}</span>
          {row.employee_gender && (
            <span className="text-xs text-gray-300">· {row.employee_gender}</span>
          )}
        </div>
      </div>
    ),
  },
  {
    key: "shift_code",
    label: "Shift",
    minWidth: "140px",
    render: (v, row) => (
      <div>
        <div className="font-medium text-gray-800 text-sm">{v || "—"}</div>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-xs text-gray-400">{row.shift_time}</span>
          {row.shift_type && (
            <span className={`text-xs font-semibold px-1.5 py-0 rounded ${
              row.shift_type === "OUT"
                ? "bg-violet-50 text-violet-600"
                : "bg-teal-50 text-teal-600"
            }`}>
              {row.shift_type}
            </span>
          )}
        </div>
      </div>
    ),
  },
  {
    key: "driver_name",
    label: "Driver & Vehicle",
    minWidth: "160px",
    render: (v, row) => (
      <div>
        <div className="font-medium text-gray-800 text-sm">{v || "—"}</div>
        {row.vehicle_number && (
          <div className="text-xs text-gray-400 font-mono mt-0.5 bg-gray-50 inline-block px-1.5 py-0.5 rounded border border-gray-200">
            {row.vehicle_number}
          </div>
        )}
      </div>
    ),
  },
  {
    key: "pickup_location",
    label: "Pickup",
    minWidth: "180px",
    render: (v) => <LocationCell value={v} />,
  },
  {
    key: "drop_location",
    label: "Drop",
    minWidth: "180px",
    render: (v) => <LocationCell value={v} />,
  },
  {
    key: "actual_total_distance_km",
    label: "Distance",
    minWidth: "100px",
    render: (v, row) => (
      <div>
        <div className="font-semibold text-gray-800 text-sm">
          {v != null ? `${Number(v).toFixed(1)} km` : "—"}
        </div>
        {row.estimated_distance_km != null && (
          <div className="text-xs text-gray-400 mt-0.5">
            Est: {row.estimated_distance_km} km
          </div>
        )}
      </div>
    ),
  },
];

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, totalRows, onPageChange }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce((acc, p, idx, arr) => {
      if (idx > 0 && p - arr[idx - 1] > 1) acc.push("…");
      acc.push(p);
      return acc;
    }, []);

  return (
    <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
      <span className="text-xs text-gray-400">
        Showing{" "}
        <span className="font-medium text-gray-600">
          {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, totalRows)}
        </span>{" "}
        of <span className="font-medium text-gray-600">{totalRows}</span> records
      </span>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-white hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all border border-transparent hover:border-gray-200"
        >
          <ChevronLeft size={13} /> Prev
        </button>

        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`d${i}`} className="px-1 text-gray-300 text-xs select-none">⋯</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                page === p
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                  : "text-gray-500 hover:bg-white hover:shadow-sm hover:border-gray-200 border border-transparent"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-white hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all border border-transparent hover:border-gray-200"
        >
          Next <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BookingPreviewView({ data, onClose }) {
  const { rows = [], meta, summary, loading, error } = data;
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(rows.length / ITEMS_PER_PAGE));
  const pagedRows  = rows.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  if (!loading && rows.length === 0 && !error) return null;

  return (
    <div className="mt-6 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-800 tracking-tight">
            Booking Report Preview
          </h3>
          {meta && (
            <p className="text-xs text-gray-400 mt-0.5">
              {meta.tenant_name} · {meta.start_date} → {meta.end_date}
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

      {/* ── Summary Cards ────────────────────────────────────────────────────── */}
      {!loading && summary && (
        <div className="px-5 py-3 border-b border-gray-100 flex flex-wrap gap-2">
          <SummaryCard
            icon={CheckCircle}
            label="Total Bookings"
            value={summary.total_bookings}
            color="border-blue-200"
          />
          <SummaryCard
            icon={Route}
            label="Routed"
            value={summary.routed_bookings}
            color="border-emerald-200"
          />
          {summary.status_breakdown && Object.entries(summary.status_breakdown).map(([key, val]) => (
            <SummaryCard
              key={key}
              icon={TrendingUp}
              label={key.replace(/_/g, " ")}
              value={val}
              color="border-violet-200"
            />
          ))}
        </div>
      )}

      {/* ── Loading ──────────────────────────────────────────────────────────── */}
      {loading && <SkeletonTable />}

      {/* ── Error ────────────────────────────────────────────────────────────── */}
      {!loading && error && (
        <div className="px-5 py-12 text-center">
          <div className="text-2xl mb-2">⚠️</div>
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* ── Table ────────────────────────────────────────────────────────────── */}
      {!loading && !error && rows.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="pl-5 pr-3 py-3 text-left">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">#</span>
                  </th>
                  {COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      className="px-4 py-3 text-left"
                      style={{ minWidth: col.minWidth }}
                    >
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                        {col.label}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((row, idx) => (
                  <tr
                    key={row.booking_id ?? idx}
                    className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="pl-5 pr-3 py-3.5 text-xs text-gray-300 font-medium">
                      {(page - 1) * ITEMS_PER_PAGE + idx + 1}
                    </td>
                    {COLUMNS.map((col) => (
                      <td key={col.key} className="px-4 py-3.5 align-top">
                        {col.render(row[col.key], row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ────────────────────────────────────────────────────── */}
          <Pagination
            page={page}
            totalPages={totalPages}
            totalRows={rows.length}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
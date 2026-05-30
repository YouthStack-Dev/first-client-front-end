import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const ITEMS_PER_PAGE = 15;

function humaniseKey(key) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatCell(val) {
  if (val === null || val === undefined || val === "") return "—";
  if (typeof val === "boolean") return val ? "Yes" : "No";
  if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}T/.test(val))
    return new Date(val).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}$/.test(val))
    return new Date(val).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  return String(val);
}

const STATUS_COLORS = {
  completed:  "bg-green-100 text-green-700",
  ongoing:    "bg-blue-100 text-blue-700",
  cancelled:  "bg-red-100 text-red-600",
  scheduled:  "bg-yellow-100 text-yellow-700",
  request:    "bg-purple-100 text-purple-700",
  no_show:    "bg-orange-100 text-orange-600",
  no_show:    "bg-orange-100 text-orange-600",
  expired:    "bg-gray-100 text-gray-500",
};

const STATUS_KEYS = new Set(["status", "booking_status", "route_status"]);

function StatusBadge({ value }) {
  const cls = STATUS_COLORS[String(value).toLowerCase().replace(/[\s-]/g, "_")] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {value}
    </span>
  );
}

function SkeletonTable() {
  return (
    <div className="p-6 flex flex-col gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-200 rounded animate-pulse w-full" />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// BookingPreviewView
// Props:
//   data    — { rows: [], loading: bool, error: string|null }
//   onClose — callback to clear preview
// ---------------------------------------------------------------------------
export default function BookingPreviewView({ data, onClose }) {
  const { rows = [], loading, error } = data;
  const [page, setPage] = useState(1);

  const columns    = rows.length > 0 ? Object.keys(rows[0]) : [];
  const totalPages = Math.ceil(rows.length / ITEMS_PER_PAGE);
  const pagedRows  = rows.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Page buttons with ellipsis
  const pageButtons = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce((acc, p, idx, arr) => {
      if (idx > 0 && p - arr[idx - 1] > 1) acc.push("…");
      acc.push(p);
      return acc;
    }, []);

  if (!loading && rows.length === 0 && !error) return null;

  return (
    <div className="mt-6 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">Booking Report Preview</h3>
          {!loading && rows.length > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">
              {rows.length} record{rows.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          title="Close preview"
        >
          <X size={16} />
        </button>
      </div>

      {/* ── Loading ─────────────────────────────────────────────────── */}
      {loading && <SkeletonTable />}

      {/* ── Error ───────────────────────────────────────────────────── */}
      {!loading && error && (
        <div className="px-5 py-10 text-center text-sm text-red-500">{error}</div>
      )}

      {/* ── Table ───────────────────────────────────────────────────── */}
      {!loading && !error && rows.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-3 text-left whitespace-nowrap">#</th>
                  {columns.map((col) => (
                    <th key={col} className="px-4 py-3 text-left whitespace-nowrap">
                      {humaniseKey(col)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pagedRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {(page - 1) * ITEMS_PER_PAGE + idx + 1}
                    </td>
                    {columns.map((col) => (
                      <td key={col} className="px-4 py-3 text-gray-700 whitespace-nowrap">
                        {STATUS_KEYS.has(col)
                          ? <StatusBadge value={row[col]} />
                          : formatCell(row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ────────────────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                Page {page} of {totalPages} · {rows.length} total rows
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                {pageButtons.map((p, i) =>
                  p === "…" ? (
                    <span key={`d${i}`} className="px-1 text-gray-400 text-xs">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                        page === p
                          ? "bg-blue-600 text-white"
                          : "hover:bg-gray-100 text-gray-600"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
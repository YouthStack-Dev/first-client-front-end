// reviewShared.jsx
// All shared atoms, layout shells, and reusable components.
// Import from this file in every tab component.

import React from "react";
import Select from "react-select";
import { Star } from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const today = () => new Date().toISOString().split("T")[0];

// ─── Star Rating ─────────────────────────────────────────────────────────────

export const StarRating = ({ value = 0, size = 14 }) => (
  <span className="inline-flex gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} size={size}
        className={i <= value ? "text-amber-400 fill-amber-400" : "text-zinc-200 fill-zinc-200"} />
    ))}
  </span>
);

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_STYLE = {
  Completed: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  Ongoing:   "bg-sky-50     text-sky-700     ring-1 ring-sky-200",
  Scheduled: "bg-zinc-100   text-zinc-500    ring-1 ring-zinc-200",
  Cancelled: "bg-red-50     text-red-600     ring-1 ring-red-200",
  Request:   "bg-blue-50    text-blue-600    ring-1 ring-blue-200",
};

export const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${STATUS_STYLE[status] || STATUS_STYLE.Scheduled}`}>
    {status}
  </span>
);

// ─── Tag ─────────────────────────────────────────────────────────────────────

const VARIANT_STYLE = {
  default: "bg-zinc-100   text-zinc-600",
  blue:    "bg-blue-50    text-blue-700",
  purple:  "bg-violet-50  text-violet-700",
  green:   "bg-emerald-50 text-emerald-700",
  amber:   "bg-amber-50   text-amber-700",
  red:     "bg-red-50     text-red-600",
};

export const Tag = ({ label, variant = "default" }) => (
  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${VARIANT_STYLE[variant] || VARIANT_STYLE.default}`}>
    {label}
  </span>
);

// ─── Spinner ─────────────────────────────────────────────────────────────────

export const Spinner = () => (
  <div className="flex justify-center items-center py-12">
    <span className="w-6 h-6 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin block" />
  </div>
);

// ─── Empty Well ──────────────────────────────────────────────────────────────

export const EmptyWell = ({ icon, title, sub }) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[180px] gap-2 text-center px-6">
    <span className="text-3xl opacity-25">{icon}</span>
    <p className="text-sm font-semibold text-zinc-500">{title}</p>
    {sub && <p className="text-xs text-zinc-400 max-w-[180px] leading-relaxed">{sub}</p>}
  </div>
);

// ─── Section Label ───────────────────────────────────────────────────────────

export const SectionLabel = ({ children }) => (
  <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-zinc-400 mb-1">{children}</p>
);

// ─── Detail Card ─────────────────────────────────────────────────────────────

export const DetailCard = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl border border-zinc-100 shadow-sm ${className}`}>{children}</div>
);

// ─── Left Pane (40%) ─────────────────────────────────────────────────────────

export const LeftPane = ({ header, children }) => (
  <div className="w-[40%] flex-shrink-0 flex flex-col bg-white border-r border-zinc-100 overflow-hidden">
    {header && (
      <div className="px-4 py-3.5 border-b border-zinc-100 bg-white flex flex-col gap-3">
        {header}
      </div>
    )}
    <div className="flex-1 overflow-y-auto">{children}</div>
  </div>
);

// ─── Right Pane (60%) ────────────────────────────────────────────────────────

export const RightPane = ({ children }) => (
  <div className="flex-1 overflow-y-auto bg-gray-50 px-6 py-6">{children}</div>
);

// ─── Center Prompt ───────────────────────────────────────────────────────────

export const CenterPrompt = ({ icon, title, sub }) => (
  <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
    <span className="text-5xl opacity-10">{icon}</span>
    <div>
      <p className="text-sm font-bold text-zinc-500">{title}</p>
      {sub && <p className="text-xs text-zinc-400 mt-0.5 max-w-[220px] mx-auto">{sub}</p>}
    </div>
  </div>
);

// ─── Stats Row ───────────────────────────────────────────────────────────────

export const StatsRow = ({ items }) => (
  <div className="grid border-b border-zinc-100 bg-white"
    style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
    {items.map(({ l, v, color = "text-zinc-800" }) => (
      <div key={l} className="flex flex-col items-center py-3 border-r border-zinc-100 last:border-r-0">
        <span className={`text-xl font-black tabular-nums ${color}`}>{v}</span>
        <span className="text-[9px] font-bold tracking-[0.1em] uppercase text-zinc-400 mt-0.5">{l}</span>
      </div>
    ))}
  </div>
);

// ─── Date Range Filter ───────────────────────────────────────────────────────

export const DateRangeFilter = ({ sd, ed, setSd, setEd, onApply, onClear }) => (
  <div className="flex flex-col gap-2">
    <SectionLabel>Review Period</SectionLabel>
    <div className="flex gap-1.5 items-center">
      <input type="date" value={sd} onChange={e => setSd(e.target.value)}
        className="flex-1 min-w-0 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
      <span className="text-zinc-300 text-xs">—</span>
      <input type="date" value={ed} onChange={e => setEd(e.target.value)}
        className="flex-1 min-w-0 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
    </div>
    <div className="flex gap-2">
      <button onClick={onApply}
        className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold tracking-wide hover:bg-blue-700 active:scale-[0.97] transition-all">
        Apply
      </button>
      {(sd || ed) && (
        <button onClick={onClear}
          className="px-3 py-1.5 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-500 hover:border-red-300 hover:text-red-500 transition">
          Clear
        </button>
      )}
    </div>
  </div>
);

// ─── Vendor Select ───────────────────────────────────────────────────────────

export const VendorSelect = ({ options, value, onChange, onLoad }) => (
  <div className="flex flex-col gap-2">
    <SectionLabel>Vendor</SectionLabel>
    <div className="flex gap-2">
      <div className="flex-1">
        <Select options={options} value={value} onChange={onChange}
          placeholder="Select vendor…" isClearable isSearchable
          className="react-select-container text-xs" classNamePrefix="react-select"
          menuPortalTarget={document.body}
          styles={{
            menuPortal:     b => ({ ...b, zIndex: 9999 }),
            control:        b => ({ ...b, minHeight: 34, fontSize: 12, borderColor: "#e4e4e7", borderRadius: 8, boxShadow: "none" }),
            valueContainer: b => ({ ...b, padding: "0 8px" }),
          }} />
      </div>
      <button onClick={onLoad} disabled={!value}
        className="px-4 h-[34px] bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95">
        Load
      </button>
    </div>
  </div>
);

// ─── Review Summary ──────────────────────────────────────────────────────────

export const ReviewSummary = ({ summary }) => {
  if (!summary) return null;
  const avg         = summary.average_rating ?? null;
  const total       = summary.total_reviews  ?? 0;
  const maxTag      = Math.max(...Object.values(summary.tag_counts || {}), 1);
  const ratingColor = avg === null ? "text-zinc-400" : avg >= 4 ? "text-emerald-600" : avg >= 3 ? "text-amber-500" : "text-red-500";

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <DetailCard className="p-4 text-center">
          <div className={`text-4xl font-black tabular-nums leading-none ${ratingColor}`}>
            {avg !== null ? avg.toFixed(1) : "—"}
          </div>
          <div className="mt-1.5 mb-1.5">
            {avg !== null && <StarRating value={Math.round(avg)} size={11} />}
          </div>
          <SectionLabel>Avg Rating</SectionLabel>
        </DetailCard>
        <DetailCard className="p-4 text-center">
          <div className="text-4xl font-black tabular-nums leading-none text-blue-600">{total}</div>
          <div className="mt-3" />
          <SectionLabel>Total Reviews</SectionLabel>
        </DetailCard>
      </div>

      {Object.keys(summary.tag_counts || {}).length > 0 && (
        <DetailCard className="p-4">
          <SectionLabel>Tag Frequency</SectionLabel>
          <div className="flex flex-col gap-2.5">
            {Object.entries(summary.tag_counts).map(([t, c]) => (
              <div key={t}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-zinc-600 font-medium">{t}</span>
                  <span className="text-xs font-bold text-zinc-400 tabular-nums">{c}</span>
                </div>
                <div className="h-1 bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.round((c / maxTag) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </DetailCard>
      )}

      {summary.recent_comments?.length > 0 && (
        <DetailCard className="p-4">
          <SectionLabel>Recent Comments</SectionLabel>
          <div className="flex flex-col divide-y divide-zinc-50">
            {summary.recent_comments.map((c, i) => (
              <p key={i} className="text-xs text-zinc-500 italic leading-relaxed py-2.5 first:pt-0 last:pb-0">
                "{c}"
              </p>
            ))}
          </div>
        </DetailCard>
      )}
    </div>
  );
};

// ─── Review List ─────────────────────────────────────────────────────────────

export const ReviewList = ({ reviews, type, pagination, page, onPage }) => (
  <DetailCard className="overflow-hidden">
    <div className="flex justify-between items-center px-4 py-3 border-b border-zinc-100">
      <SectionLabel>Reviews</SectionLabel>
      <span className="text-xs text-zinc-400 font-medium">{pagination?.total ?? 0} total</span>
    </div>
    <div className="divide-y divide-zinc-50">
      {reviews.map(r => {
        const rating  = type === "driver" ? r.driver_rating  : r.vehicle_rating;
        const tags    = type === "driver" ? r.driver_tags    : r.vehicle_tags;
        const comment = type === "driver" ? r.driver_comment : r.vehicle_comment;
        return (
          <div key={r.review_id} className="px-4 py-3.5">
            <div className="flex items-center justify-between mb-2">
              <StarRating value={rating} size={13} />
              <span className="text-[11px] text-zinc-400 font-medium tabular-nums">
                {new Date(r.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
              </span>
            </div>
            {tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-1.5">
                {tags.map(t => <Tag key={t} label={t} variant={type === "driver" ? "purple" : "green"} />)}
              </div>
            )}
            {comment && <p className="text-xs text-zinc-500 italic leading-relaxed">"{comment}"</p>}
          </div>
        );
      })}
    </div>
    {pagination?.pages > 1 && (
      <div className="flex justify-between items-center px-4 py-2.5 border-t border-zinc-100 bg-zinc-50/60">
        <span className="text-xs text-zinc-400 tabular-nums">Page {page} / {pagination.pages}</span>
        <div className="flex gap-1">
          {[["←", page - 1, page <= 1], ["→", page + 1, page >= pagination.pages]].map(([l, np, dis]) => (
            <button key={l} onClick={() => !dis && onPage(np)} disabled={dis}
              className="w-7 h-7 rounded-lg border border-zinc-200 text-sm text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition font-bold flex items-center justify-center">
              {l}
            </button>
          ))}
        </div>
      </div>
    )}
  </DetailCard>
);

// ─── No Reviews Inline ───────────────────────────────────────────────────────
// Use this INSIDE an existing DetailCard (after a <div className="border-t" />).
// It renders flush with no extra card border or shadow — eliminates the double-
// border / extra-whitespace problem when nesting inside a unified card layout.

export const NoReviewsInline = ({ name, type, hint }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-10 px-6 text-center">
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none"
      className="text-zinc-300" stroke="currentColor" strokeWidth="1.4"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-6l-2 3H10l-2-3H2" />
      <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
    </svg>
    <div>
      <p className="text-sm font-bold text-zinc-500">No reviews yet</p>
      <p className="text-xs text-zinc-400 mt-1 max-w-[210px] mx-auto leading-relaxed">
        {type === "booking"
          ? "Employee hasn't rated this ride yet. Review will appear here once submitted."
          : type === "driver"
          ? `${name} hasn't received any reviews in the selected period.`
          : `Vehicle ${name} hasn't received any reviews in the selected period.`}
      </p>
    </div>
    <span className="inline-flex items-center gap-1.5 bg-zinc-50 border border-zinc-200
      text-zinc-400 text-[11px] font-semibold px-3 py-1 rounded-full">
      {hint ?? "0 reviews · Try a wider date range"}
    </span>
  </div>
);

// ─── No Reviews Card ─────────────────────────────────────────────────────────
// Standalone card — use when you need the review section as its OWN card,
// not nested inside a DetailCard. Kept for backwards compatibility.

export const NoReviewsCard = ({ name, type }) => (
  <DetailCard className="py-14 flex flex-col items-center justify-center text-center gap-3">
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
      className="text-zinc-300" stroke="currentColor" strokeWidth="1.4"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-6l-2 3H10l-2-3H2" />
      <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
    </svg>
    <div>
      <p className="text-sm font-bold text-zinc-500">No reviews yet</p>
      <p className="text-xs text-zinc-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
        {type === "driver"
          ? `${name} hasn't received any reviews in the selected period.`
          : `Vehicle ${name} hasn't received any reviews in the selected period.`}
      </p>
    </div>
    <span className="inline-flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 text-zinc-400 text-[11px] font-semibold px-3 py-1 rounded-full">
      0 reviews · Try a wider date range
    </span>
  </DetailCard>
);
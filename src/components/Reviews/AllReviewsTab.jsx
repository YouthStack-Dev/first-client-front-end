// AllReviewsTab.jsx

import React, { useState, useCallback } from "react";
import { useDispatch, useSelector }     from "react-redux";

import { fetchAllReviewsThunk } from "../../redux/features/reviews/Reviewthunk";
import { resetAllReviews }      from "../../redux/features/reviews/Reviewslice";
import {
  selectAllReviewsData,
  selectAllReviewsLoading,
  selectAllReviewsPage,
} from "../../redux/features/reviews/Reviewselector";

import SelectField from "../ui/SelectField";

import {
  StarRating,
  Tag,
  Spinner,
  SectionLabel,
  DetailCard,
  CenterPrompt,
} from "./reviewShared";

// ─────────────────────────────────────────────────────────────────────────────

const BLANK = {
  from_date: "", to_date: "", driver_id: "",
  employee_id: "", route_id: "", min_rating: "", max_rating: "",
};

const AllReviewsTab = () => {
  const dispatch = useDispatch();
  const result   = useSelector(selectAllReviewsData);
  const loading  = useSelector(selectAllReviewsLoading);
  const page     = useSelector(selectAllReviewsPage);

  const [filters, setFilters] = useState(BLANK);
  const update  = (k, v) => setFilters(f => ({ ...f, [k]: v }));
  const active  = Object.entries(filters).filter(([, v]) => v !== "");

  // Normalise nested API shape: data.data / data.meta
  const rows      = result?.data?.data ?? result?.data ?? [];
  const meta      = result?.data?.meta ?? result?.meta ?? {};
  const hasNoRows = !!result && rows.length === 0;

  const search = useCallback((p = 1) => {
    dispatch(fetchAllReviewsThunk({ page: p, ...filters }));
  }, [dispatch, filters]);

  const ratingOpts = ["", "1", "2", "3", "4", "5"].map(v => ({
    value: v,
    label: v ? "★".repeat(+v) + ` (${v})` : "Any",
  }));

  const computedAvg = rows.filter(r => r.overall_rating).length
    ? (rows.reduce((s, r) => s + (r.overall_rating || 0), 0) /
       rows.filter(r => r.overall_rating).length).toFixed(1)
    : "—";

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Filter bar ── */}
      <div className="bg-white border-b border-zinc-100 px-5 py-4 flex-shrink-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">

          {/* Date + ID inputs */}
          {[
            ["From Date",   "from_date",   "date"],
            ["To Date",     "to_date",     "date"],
            ["Driver ID",   "driver_id",   "number"],
            ["Employee ID", "employee_id", "number"],
            ["Route ID",    "route_id",    "number"],
          ].map(([label, key, type]) => (
            <div key={key}>
              <SectionLabel>{label}</SectionLabel>
              <input
                type={type}
                placeholder={type === "number" ? "ID" : undefined}
                value={filters[key]}
                onChange={e => update(key, e.target.value)}
                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-700
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          ))}

          {/* Rating selects */}
          <div>
            <SectionLabel>Min Rating</SectionLabel>
            <SelectField
              value={filters.min_rating}
              onChange={v => update("min_rating", v)}
              options={ratingOpts}
              className="w-full"
            />
          </div>
          <div>
            <SectionLabel>Max Rating</SectionLabel>
            <SelectField
              value={filters.max_rating}
              onChange={v => update("max_rating", v)}
              options={ratingOpts}
              className="w-full"
            />
          </div>

          {/* Search + Clear */}
          <div className="flex gap-2 items-end">
            <button
              onClick={() => search(1)}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold
                         hover:bg-blue-700 active:scale-95 transition-all">
              Search
            </button>
            <button
              onClick={() => { setFilters(BLANK); dispatch(resetAllReviews()); }}
              className="px-3 py-2 border border-zinc-200 text-zinc-500 rounded-lg text-sm
                         font-semibold hover:bg-zinc-50 transition">
              Clear
            </button>
          </div>
        </div>

        {/* Active filter chips */}
        {active.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {active.map(([k, v]) => (
              <span key={k}
                className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200
                           rounded-full px-2.5 py-1 text-xs font-semibold">
                {k.replace(/_/g, " ")}: {v}
                <button
                  onClick={() => update(k, "")}
                  className="hover:text-blue-900 leading-none font-bold">
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Results ── */}
      <div className="flex-1 overflow-y-auto p-5 bg-zinc-50">

        {/* Initial prompt */}
        {!result && !loading && (
          <CenterPrompt icon="🔍" title="Search reviews" sub="Set filters above and click Search" />
        )}

        {loading && <Spinner />}

        {result && !loading && (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              {[
                { l: "Total",    v: meta?.total ?? rows.length,                          c: "text-zinc-800"    },
                { l: "Avg",      v: computedAvg,                                          c: "text-amber-500"   },
                { l: "Low ≤ 2",  v: rows.filter(r => r.overall_rating <= 2).length,      c: "text-red-500"     },
                { l: "Good ≥ 4", v: rows.filter(r => r.overall_rating >= 4).length,      c: "text-emerald-600" },
              ].map(({ l, v, c }) => (
                <DetailCard key={l} className="p-4 text-center">
                  <div className={`text-2xl font-black tabular-nums ${c}`}>{v}</div>
                  <p className="text-[9px] font-bold tracking-[0.1em] uppercase text-zinc-400 mt-1">{l}</p>
                </DetailCard>
              ))}
            </div>

            {/* Zero results empty state */}
            {hasNoRows ? (
              <DetailCard className="py-14 flex flex-col items-center justify-center text-center gap-3">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
                  className="text-zinc-300" stroke="currentColor" strokeWidth="1.4"
                  strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <div>
                  <p className="text-sm font-bold text-zinc-500">No reviews found</p>
                  <p className="text-xs text-zinc-400 mt-1 max-w-[220px] mx-auto leading-relaxed">
                    No reviews match your filters. Try adjusting the date range or clearing some filters.
                  </p>
                </div>
                <button
                  onClick={() => { setFilters(BLANK); dispatch(resetAllReviews()); }}
                  className="mt-1 inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200
                             text-blue-600 text-xs font-semibold px-4 py-1.5 rounded-full
                             hover:bg-blue-100 transition">
                  Clear filters
                </button>
              </DetailCard>
            ) : (
              <>
                {/* Review cards */}
                <div className="flex flex-col gap-2.5">
                  {rows.map(r => (
                    <DetailCard
                      key={r.review_id}
                      className={`p-4 ${r.overall_rating <= 2 ? "border-red-100" : ""}`}>

                      <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <StarRating value={r.overall_rating} size={14} />
                          <span className="text-sm font-bold text-zinc-800">
                            {r.driver_name || `Driver #${r.driver_id}`}
                          </span>
                          <Tag label={`🚗 ${r.vehicle_number}`} variant="blue" />
                          {r.route_id && <Tag label={`Route #${r.route_id}`} />}
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] text-zinc-400 font-medium">
                            Booking #{r.booking_id} · Emp #{r.employee_id}
                          </p>
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            {new Date(r.created_at).toLocaleString("en-IN", {
                              day: "2-digit", month: "short", year: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        {[
                          { label: "👨‍✈️ Driver", rating: r.driver_rating,  tags: r.driver_tags,  comment: r.driver_comment,  variant: "purple", bg: "bg-violet-50/60 border-violet-100"   },
                          { label: "🚗 Vehicle",  rating: r.vehicle_rating, tags: r.vehicle_tags, comment: r.vehicle_comment, variant: "green",  bg: "bg-emerald-50/60 border-emerald-100" },
                        ].map(({ label, rating, tags, comment, variant, bg }) => (
                          <div key={label} className={`rounded-xl p-3 border ${bg}`}>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-bold text-zinc-600">{label}</span>
                              <StarRating value={rating} size={11} />
                            </div>
                            {tags?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-1.5">
                                {tags.map(t => <Tag key={t} label={t} variant={variant} />)}
                              </div>
                            )}
                            {comment && (
                              <p className="text-xs text-zinc-500 italic leading-relaxed">"{comment}"</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </DetailCard>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-5 pt-4 border-t border-zinc-200">
                  <span className="text-sm text-zinc-500 font-medium tabular-nums">
                    Page {page} of {meta?.total_pages ?? 1} · {meta?.total ?? rows.length} total
                  </span>
                  <div className="flex gap-2">
                    {[
                      ["← Prev", page - 1, page <= 1],
                      ["Next →", page + 1, page >= (meta?.total_pages ?? 1)],
                    ].map(([l, np, dis]) => (
                      <button key={l} onClick={() => !dis && search(np)} disabled={dis}
                        className="px-4 py-2 border border-zinc-200 bg-white rounded-lg text-sm
                                   text-zinc-600 hover:bg-zinc-50 disabled:opacity-30
                                   disabled:cursor-not-allowed font-semibold transition">
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AllReviewsTab;
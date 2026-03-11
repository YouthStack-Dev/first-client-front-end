import React, { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import { ChevronDown, ChevronRight, AlertTriangle, Wrench, Star } from "lucide-react";

import {
  fetchBookingsByDateThunk, fetchBookingReviewThunk,
  fetchDriverReviewsThunk,  fetchVehicleReviewsThunk, fetchAllReviewsThunk,
} from "../../redux/features/reviews/Reviewthunk";

import {
  resetDriverReviews, resetVehicleReviews, resetAllReviews,
  setDriverReviewPage, setVehicleReviewPage,
} from "../../redux/features/reviews/Reviewslice";

import {
  selectBookingShifts, selectBookingsLoading,
  selectBookingReviewCache, selectBookingReviewLoading,
  selectDriverReviewData, selectDriverReviewLoading, selectDriverReviewPage,
  selectVehicleReviewData, selectVehicleReviewLoading, selectVehicleReviewPage,
  selectAllReviewsData, selectAllReviewsLoading, selectAllReviewsPage,
} from "../../redux/features/reviews/Reviewselector";

import { NewfetchDriversThunk, driversSelectors } from "../../redux/features/manageDriver/newDriverSlice";
import { fetchVehiclesThunk } from "../../redux/features/manageVehicles/vehicleThunk";
import { selectVehicles }     from "../../redux/features/manageVehicles/vehicleSelectors";
import SelectField            from "../ui/SelectField";

// ─── Design tokens ────────────────────────────────────────────────────────────
// Left panel  : 40%  (2/5)
// Right panel : 60%  (3/5)
// Palette     : neutral-900 text, zinc-50 bg, blue-600 accent
// Typography  : tight tracking, weight contrast (400/700/900)
// ─────────────────────────────────────────────────────────────────────────────

const today = () => new Date().toISOString().split("T")[0];

// ─────────────────────────────────────────────────────────────────────────────
// ATOMS
// ─────────────────────────────────────────────────────────────────────────────

const StarRating = ({ value = 0, size = 14 }) => (
  <span className="inline-flex gap-0.5">
    {[1,2,3,4,5].map(i => (
      <Star key={i} size={size}
        className={i <= value ? "text-amber-400 fill-amber-400" : "text-zinc-200 fill-zinc-200"} />
    ))}
  </span>
);

const STATUS_STYLE = {
  Completed: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  Ongoing:   "bg-sky-50    text-sky-700    ring-1 ring-sky-200",
  Scheduled: "bg-zinc-100  text-zinc-500   ring-1 ring-zinc-200",
  Cancelled: "bg-red-50    text-red-600    ring-1 ring-red-200",
};
const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide ${STATUS_STYLE[status] || STATUS_STYLE.Scheduled}`}>
    {status}
  </span>
);

const VARIANT_STYLE = {
  default: "bg-zinc-100 text-zinc-600",
  blue:    "bg-blue-50  text-blue-700",
  purple:  "bg-violet-50 text-violet-700",
  green:   "bg-emerald-50 text-emerald-700",
  amber:   "bg-amber-50  text-amber-700",
  red:     "bg-red-50    text-red-600",
};
const Tag = ({ label, variant = "default" }) => (
  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${VARIANT_STYLE[variant] || VARIANT_STYLE.default}`}>
    {label}
  </span>
);

const Spinner = () => (
  <div className="flex justify-center items-center py-12">
    <span className="w-6 h-6 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin block" />
  </div>
);

const EmptyWell = ({ icon, title, sub }) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[180px] gap-2 text-center px-6">
    <span className="text-3xl opacity-25">{icon}</span>
    <p className="text-sm font-semibold text-zinc-500">{title}</p>
    {sub && <p className="text-xs text-zinc-400 max-w-[180px] leading-relaxed">{sub}</p>}
  </div>
);

// Divider with label
const SectionLabel = ({ children }) => (
  <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-zinc-400 mb-2">{children}</p>
);

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT SHELLS
// ─────────────────────────────────────────────────────────────────────────────

/** 40% left panel */
const LeftPane = ({ header, children }) => (
  <div className="w-[40%] flex-shrink-0 flex flex-col bg-white border-r border-zinc-100 overflow-hidden">
    {header && (
      <div className="px-4 py-3.5 border-b border-zinc-100 bg-zinc-50/60 flex flex-col gap-3">
        {header}
      </div>
    )}
    <div className="flex-1 overflow-y-auto">{children}</div>
  </div>
);

/** 60% right panel */
const RightPane = ({ children }) => (
  <div className="flex-1 overflow-y-auto bg-zinc-50 px-8 py-6">{children}</div>
);

const CenterPrompt = ({ icon, title, sub }) => (
  <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
    <span className="text-5xl opacity-10">{icon}</span>
    <div>
      <p className="text-sm font-bold text-zinc-500">{title}</p>
      {sub && <p className="text-xs text-zinc-400 mt-0.5 max-w-[220px] mx-auto">{sub}</p>}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// DETAIL CARD WRAPPER
// ─────────────────────────────────────────────────────────────────────────────

const DetailCard = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl border border-zinc-100 ${className}`}>{children}</div>
);

// ─────────────────────────────────────────────────────────────────────────────
// DATE RANGE FILTER
// ─────────────────────────────────────────────────────────────────────────────

const DateRangeFilter = ({ sd, ed, setSd, setEd, onApply, onClear }) => (
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

// ─────────────────────────────────────────────────────────────────────────────
// VENDOR SELECTOR
// ─────────────────────────────────────────────────────────────────────────────

const VendorSelect = ({ options, value, onChange, onLoad }) => (
  <div className="flex flex-col gap-2">
    <SectionLabel>Vendor</SectionLabel>
    <div className="flex gap-2">
      <div className="flex-1">
        <Select options={options} value={value} onChange={onChange}
          placeholder="Select vendor…" isClearable isSearchable
          className="react-select-container text-xs" classNamePrefix="react-select"
          menuPortalTarget={document.body}
          styles={{
            menuPortal: b => ({ ...b, zIndex: 9999 }),
            control: b => ({ ...b, minHeight: 34, fontSize: 12, borderColor: "#e4e4e7", borderRadius: 8, boxShadow: "none" }),
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

// ─────────────────────────────────────────────────────────────────────────────
// STATS ROW
// ─────────────────────────────────────────────────────────────────────────────

const StatsRow = ({ items }) => (
  <div className="grid border-b border-zinc-100" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
    {items.map(({ l, v, color = "text-zinc-800" }) => (
      <div key={l} className="flex flex-col items-center py-3 border-r border-zinc-100 last:border-r-0">
        <span className={`text-xl font-black tabular-nums ${color}`}>{v}</span>
        <span className="text-[9px] font-bold tracking-[0.1em] uppercase text-zinc-400 mt-0.5">{l}</span>
      </div>
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// REVIEW SUMMARY (Driver / Vehicle tabs)
// ─────────────────────────────────────────────────────────────────────────────

const ReviewSummary = ({ summary }) => {
  if (!summary) return null;
  const avg    = summary.average_rating ?? null;
  const total  = summary.total_reviews  ?? 0;
  const maxTag = Math.max(...Object.values(summary.tag_counts || {}), 1);
  const ratingColor = avg === null ? "text-zinc-400" : avg >= 4 ? "text-emerald-600" : avg >= 3 ? "text-amber-500" : "text-red-500";

  return (
    <div className="flex flex-col gap-4">
      {/* Stat cards */}
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

      {/* Tag frequency */}
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

      {/* Recent comments */}
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

// ─────────────────────────────────────────────────────────────────────────────
// REVIEW LIST (Driver / Vehicle tabs)
// ─────────────────────────────────────────────────────────────────────────────

const ReviewList = ({ reviews, type, pagination, page, onPage }) => (
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

// ─────────────────────────────────────────────────────────────────────────────
// TAB: BOOKINGS
// ─────────────────────────────────────────────────────────────────────────────

const BookingsTab = ({ tenantId }) => {
  const dispatch      = useDispatch();
  const shifts        = useSelector(selectBookingShifts);
  const loading       = useSelector(selectBookingsLoading);
  const reviewCache   = useSelector(selectBookingReviewCache);
  const reviewLoading = useSelector(selectBookingReviewLoading);

  const [date,           setDate]          = useState(today());
  const [sd,             setSd]            = useState("");
  const [ed,             setEd]            = useState("");
  const [openShifts,     setOpenShifts]    = useState({});
  const [sel,            setSel]           = useState(null);

  const load = useCallback(() => {
    if (!date) return;
    setSel(null);
    dispatch(fetchBookingsByDateThunk({ tenantId, bookingDate: date, fromDate: sd, toDate: ed }));
  }, [dispatch, tenantId, date, sd, ed]);

  const pick = useCallback((b) => {
    setSel(b);
    if (reviewCache[b.booking_id] === undefined)
      dispatch(fetchBookingReviewThunk({ bookingId: b.booking_id }));
  }, [dispatch, reviewCache]);

  React.useEffect(() => {
    if (shifts?.shifts) {
      const o = {};
      shifts.shifts.forEach(s => { o[s.shift_id] = true; });
      setOpenShifts(o);
    }
  }, [shifts]);

  const all      = shifts?.shifts?.flatMap(s => s.bookings) || [];
  const reviewed = all.filter(b => reviewCache[b.booking_id] != null).length;
  const review   = sel ? reviewCache[sel.booking_id] : undefined;

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── 40% LEFT ── */}
      <LeftPane header={
        <>
          {/* Date + Load */}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <SectionLabel>Booking Date</SectionLabel>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <button onClick={load}
              className="h-[38px] px-5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 active:scale-95 transition-all">
              Load
            </button>
          </div>
          <DateRangeFilter sd={sd} ed={ed} setSd={setSd} setEd={setEd}
            onApply={load} onClear={() => { setSd(""); setEd(""); }} />
        </>
      }>
        {/* Stats */}
        {shifts && !loading && (
          <StatsRow items={[
            { l: "Total",     v: all.length,                                      },
            { l: "Scheduled", v: all.filter(b => b.status === "Scheduled").length, color: "text-blue-600" },
            { l: "Reviewed",  v: reviewed,                                          color: "text-emerald-600" },
          ]} />
        )}

        {loading && <Spinner />}
        {!loading && !shifts && <EmptyWell icon="📅" title="No data" sub="Pick a date and click Load" />}

        {!loading && shifts && shifts.shifts.map(shift => (
          <div key={shift.shift_id}>
            {/* Shift header */}
            <button
              onClick={() => setOpenShifts(o => ({ ...o, [shift.shift_id]: !o[shift.shift_id] }))}
              className="w-full flex justify-between items-center px-4 py-2.5 bg-zinc-50 border-b border-zinc-100 hover:bg-zinc-100 transition-colors sticky top-0 z-10"
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${shift.log_type === "IN" ? "bg-emerald-500" : "bg-orange-400"}`} />
                <span className="text-xs font-bold text-zinc-700 tracking-tight">{shift.shift_code}</span>
                <span className="text-xs text-zinc-400">{shift.shift_time}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${shift.log_type === "IN" ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"}`}>
                  {shift.log_type}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-zinc-400 bg-zinc-200 rounded-full w-5 h-5 flex items-center justify-center">
                  {shift.bookings?.length || 0}
                </span>
                {openShifts[shift.shift_id]
                  ? <ChevronDown size={12} className="text-zinc-400" />
                  : <ChevronRight size={12} className="text-zinc-400" />}
              </div>
            </button>

            {openShifts[shift.shift_id] && (shift.bookings || []).map(b => {
              const hasReview = reviewCache[b.booking_id] != null;
              const active    = sel?.booking_id === b.booking_id;
              return (
                <button key={b.booking_id} onClick={() => pick(b)}
                  className={`w-full text-left px-4 py-3 border-b border-zinc-50 transition-all group
                    ${active
                      ? "bg-blue-50 border-l-2 border-l-blue-500"
                      : "border-l-2 border-l-transparent hover:bg-zinc-50 hover:border-l-zinc-200"
                    }`}
                >
                  {/* Row 1 */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`text-sm font-bold truncate ${active ? "text-blue-700" : "text-zinc-800"}`}>
                        {b.employee_code || `#${b.employee_id}`}
                      </span>
                      <StatusBadge status={b.status} />
                      {hasReview && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 ring-1 ring-emerald-200 px-1.5 py-0.5 rounded-full">
                          ✓
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-zinc-400 font-mono flex-shrink-0">#{b.booking_id}</span>
                  </div>
                  {/* Route dots */}
                  <div className="flex items-start gap-1.5 mb-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 mt-[5px]" />
                    <span className="text-[11px] text-zinc-500 truncate leading-snug">{b.pickup_location || "—"}</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0 mt-[5px]" />
                    <span className="text-[11px] text-zinc-500 truncate leading-snug">{b.drop_location || "—"}</span>
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </LeftPane>

      {/* ── 60% RIGHT ── */}
      <RightPane>
        {!sel && <CenterPrompt icon="📋" title="Select a booking" sub="Click any booking on the left to view its review" />}

        {sel && (
          <div className="max-w-2xl flex flex-col gap-4">

            {/* Booking header card */}
            <DetailCard className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-zinc-400 mb-1">
                    Booking #{sel.booking_id}
                  </p>
                  <h2 className="text-2xl font-black text-zinc-900 tracking-tight">
                    {sel.employee_code || `Employee #${sel.employee_id}`}
                  </h2>
                </div>
                <StatusBadge status={sel.status} />
              </div>

              {/* Route timeline */}
              <div className="rounded-lg bg-zinc-50 border border-zinc-100 p-3.5 mb-4">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center mt-1 flex-shrink-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 block" />
                    <span className="w-px flex-1 min-h-[20px] bg-zinc-200 block my-1" />
                    <span className="w-2 h-2 rounded-full bg-red-500 block" />
                  </div>
                  <div className="flex flex-col justify-between min-w-0 gap-3">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-zinc-400">Pickup</p>
                      <p className="text-sm text-zinc-700 leading-snug">{sel.pickup_location || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-zinc-400">Drop</p>
                      <p className="text-sm text-zinc-700 leading-snug">{sel.drop_location || "—"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Meta tags */}
              <div className="flex gap-1.5 flex-wrap">
                <Tag label={`📅 ${sel.booking_date}`} />
                <Tag label={sel.booking_type} />
                {sel.route_details?.driver_name && <Tag label={`👨‍✈️ ${sel.route_details.driver_name}`} variant="purple" />}
                {sel.route_details?.vehicle_number && <Tag label={`🚗 ${sel.route_details.vehicle_number}`} variant="blue" />}
              </div>
            </DetailCard>

            {/* Review */}
            {reviewLoading && <Spinner />}

            {!reviewLoading && review === null && (
              <DetailCard className="py-10 text-center">
                <span className="text-3xl block mb-2 opacity-20">📭</span>
                <p className="text-sm font-bold text-zinc-500">No review submitted</p>
                <p className="text-xs text-zinc-400 mt-1">Employee hasn't rated this ride yet</p>
              </DetailCard>
            )}

            {!reviewLoading && review && (
              <>
                <DetailCard className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <SectionLabel>Overall Rating</SectionLabel>
                      <StarRating value={review.overall_rating} size={20} />
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-zinc-400 font-medium">Review #{review.review_id}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {new Date(review.created_at).toLocaleString("en-IN", {
                          day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </DetailCard>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Driver Review",  icon: "👨‍✈️", rating: review.driver_rating,  tags: review.driver_tags,  comment: review.driver_comment,  bg: "bg-violet-50", border: "border-violet-100", variant: "purple" },
                    { label: "Vehicle Review", icon: "🚗",   rating: review.vehicle_rating, tags: review.vehicle_tags, comment: review.vehicle_comment, bg: "bg-emerald-50", border: "border-emerald-100", variant: "green" },
                  ].map(({ label, icon, rating, tags, comment, bg, border, variant }) => (
                    <div key={label} className={`rounded-xl border ${border} ${bg} p-4`}>
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-xs font-bold text-zinc-700">{icon} {label}</span>
                        <StarRating value={rating} size={11} />
                      </div>
                      {tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {tags.map(t => <Tag key={t} label={t} variant={variant} />)}
                        </div>
                      )}
                      <p className="text-xs text-zinc-500 italic leading-relaxed">
                        {comment ? `"${comment}"` : "No comment left."}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </RightPane>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TAB: DRIVERS
// ─────────────────────────────────────────────────────────────────────────────

const DriversTab = ({ isVendorUser, vendorId, vendorOptions }) => {
  const dispatch      = useDispatch();
  const drivers       = useSelector(driversSelectors.selectAll);
  const reviewData    = useSelector(selectDriverReviewData);
  const reviewLoading = useSelector(selectDriverReviewLoading);
  const page          = useSelector(selectDriverReviewPage);

  const [selVendor, setSelVendor] = useState(isVendorUser ? { value: vendorId } : null);
  const [selDriver, setSelDriver] = useState(null);
  const [sd, setSd] = useState("");
  const [ed, setEd] = useState("");

  const summary    = reviewData?.summary    ?? reviewData?.data?.summary    ?? null;
  const reviews    = reviewData?.reviews    ?? reviewData?.data?.reviews    ?? [];
  const pagination = reviewData?.pagination ?? reviewData?.data?.pagination ?? { total: 0, pages: 1 };
  const isLow      = summary && (summary.average_rating ?? 0) < 3 && (summary.total_reviews ?? 0) >= 3;

  const loadDrivers = useCallback(() => {
    const vid = isVendorUser ? vendorId : selVendor?.value;
    if (!vid) return;
    dispatch(NewfetchDriversThunk({ vendor_id: vid }));
    setSelDriver(null);
    dispatch(resetDriverReviews());
  }, [dispatch, isVendorUser, vendorId, selVendor]);

  const pickDriver = useCallback((d) => {
    setSelDriver(d);
    dispatch(fetchDriverReviewsThunk({ driverId: d.driver_id, page: 1, startDate: sd, endDate: ed }));
  }, [dispatch, sd, ed]);

  const applyDates = useCallback(() => {
    if (!selDriver) return;
    dispatch(fetchDriverReviewsThunk({ driverId: selDriver.driver_id, page: 1, startDate: sd, endDate: ed }));
  }, [dispatch, selDriver, sd, ed]);

  React.useEffect(() => {
    if (isVendorUser && vendorId) loadDrivers();
    return () => { dispatch(resetDriverReviews()); };
  }, []); // eslint-disable-line

  return (
    <div className="flex h-full overflow-hidden">
      <LeftPane header={
        <>
          {!isVendorUser && <VendorSelect options={vendorOptions} value={selVendor} onChange={setSelVendor} onLoad={loadDrivers} />}
          <DateRangeFilter sd={sd} ed={ed} setSd={setSd} setEd={setEd} onApply={applyDates}
            onClear={() => { setSd(""); setEd(""); if (selDriver) dispatch(fetchDriverReviewsThunk({ driverId: selDriver.driver_id, page: 1, startDate: "", endDate: "" })); }} />
        </>
      }>
        {!selVendor && !isVendorUser
          ? <EmptyWell icon="🏢" title="Pick a vendor" sub="Select a vendor first" />
          : drivers.map(d => {
              const active  = selDriver?.driver_id === d.driver_id;
              const expiring = new Date(d.license_expiry_date) < new Date(Date.now() + 60 * 864e5);
              return (
                <button key={d.driver_id} onClick={() => pickDriver(d)}
                  className={`w-full text-left px-4 py-3 border-b border-zinc-50 transition-all
                    ${active ? "bg-blue-50 border-l-2 border-l-blue-500" : "border-l-2 border-l-transparent hover:bg-zinc-50 hover:border-l-zinc-200"}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-sm font-bold ${active ? "text-blue-700" : "text-zinc-800"}`}>{d.name}</span>
                        <span className="text-[10px] font-mono bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded">{d.code}</span>
                        {!d.is_active && <Tag label="Inactive" variant="red" />}
                      </div>
                      <p className="text-[11px] text-zinc-500 mb-0.5">📞 {d.phone || "—"}</p>
                      <p className={`text-[11px] font-medium ${expiring ? "text-amber-500" : "text-zinc-400"}`}>
                        {expiring ? "⚠ " : ""}License · {d.license_expiry_date || "—"}
                      </p>
                    </div>
                    <ChevronRight size={13} className={`flex-shrink-0 mt-1 ${active ? "text-blue-500" : "text-zinc-300"}`} />
                  </div>
                </button>
              );
            })
        }
      </LeftPane>

      <RightPane>
        {!selDriver
          ? <CenterPrompt icon="👤" title="Select a driver" sub="Choose a driver to view their review performance" />
          : (
            <div className="max-w-2xl flex flex-col gap-4">
              <DetailCard className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-zinc-400 mb-1">
                      Driver · {selDriver.code}
                    </p>
                    <h2 className="text-2xl font-black text-zinc-900 tracking-tight">{selDriver.name}</h2>
                  </div>
                  <Tag label={selDriver.is_active ? "Active" : "Inactive"} variant={selDriver.is_active ? "green" : "red"} />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Tag label={`📞 ${selDriver.phone || "—"}`} />
                  <Tag label={`BGV: ${selDriver.bg_verify_status}`} variant={selDriver.bg_verify_status === "Verified" ? "green" : "amber"} />
                </div>
              </DetailCard>

              {reviewLoading && <Spinner />}

              {!reviewLoading && !reviewData && (
                <DetailCard className="py-10 text-center">
                  <span className="text-3xl block mb-2 opacity-20">📭</span>
                  <p className="text-sm font-bold text-zinc-500">No reviews found</p>
                </DetailCard>
              )}

              {!reviewLoading && reviewData && (
                <>
                  {isLow && (
                    <div className="flex gap-3 items-start bg-red-50 border border-red-100 rounded-xl p-4">
                      <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">
                        <strong>Low Rating Alert</strong> — Avg {(summary.average_rating ?? 0).toFixed(1)} · Consider a coaching session.
                      </p>
                    </div>
                  )}
                  <ReviewSummary summary={summary} />
                  {reviews.length > 0 && <ReviewList reviews={reviews} type="driver" pagination={pagination} page={page} onPage={p => { dispatch(setDriverReviewPage(p)); dispatch(fetchDriverReviewsThunk({ driverId: selDriver.driver_id, page: p, startDate: sd, endDate: ed })); }} />}
                </>
              )}
            </div>
          )
        }
      </RightPane>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TAB: VEHICLES
// ─────────────────────────────────────────────────────────────────────────────

const VehiclesTab = ({ isVendorUser, vendorId, vendorOptions }) => {
  const dispatch      = useDispatch();
  const vehicles      = useSelector(selectVehicles);
  const reviewData    = useSelector(selectVehicleReviewData);
  const reviewLoading = useSelector(selectVehicleReviewLoading);
  const page          = useSelector(selectVehicleReviewPage);

  const [selVendor,  setSelVendor]  = useState(isVendorUser ? { value: vendorId } : null);
  const [selVehicle, setSelVehicle] = useState(null);
  const [sd, setSd] = useState("");
  const [ed, setEd] = useState("");

  const summary    = reviewData?.summary    ?? reviewData?.data?.summary    ?? null;
  const reviews    = reviewData?.reviews    ?? reviewData?.data?.reviews    ?? [];
  const pagination = reviewData?.pagination ?? reviewData?.data?.pagination ?? { total: 0, pages: 1 };
  const isMaint    = summary && (summary.average_rating ?? 0) < 3 && (summary.total_reviews ?? 0) > 5;
  const insExp     = selVehicle && new Date(selVehicle.insurance_expiry_date) < new Date(Date.now() + 30 * 864e5);

  const loadVehicles = useCallback(() => {
    const vid = isVendorUser ? vendorId : selVendor?.value;
    if (!vid) return;
    dispatch(fetchVehiclesThunk({ vendor_id: vid, skip: 0, limit: 100 }));
    setSelVehicle(null);
    dispatch(resetVehicleReviews());
  }, [dispatch, isVendorUser, vendorId, selVendor]);

  const pickVehicle = useCallback((v) => {
    setSelVehicle(v);
    dispatch(fetchVehicleReviewsThunk({ vehicleId: v.vehicle_id, page: 1, startDate: sd, endDate: ed }));
  }, [dispatch, sd, ed]);

  const applyDates = useCallback(() => {
    if (!selVehicle) return;
    dispatch(fetchVehicleReviewsThunk({ vehicleId: selVehicle.vehicle_id, page: 1, startDate: sd, endDate: ed }));
  }, [dispatch, selVehicle, sd, ed]);

  React.useEffect(() => {
    if (isVendorUser && vendorId) loadVehicles();
    return () => { dispatch(resetVehicleReviews()); };
  }, []); // eslint-disable-line

  return (
    <div className="flex h-full overflow-hidden">
      <LeftPane header={
        <>
          {!isVendorUser && <VendorSelect options={vendorOptions} value={selVendor} onChange={setSelVendor} onLoad={loadVehicles} />}
          <DateRangeFilter sd={sd} ed={ed} setSd={setSd} setEd={setEd} onApply={applyDates}
            onClear={() => { setSd(""); setEd(""); if (selVehicle) dispatch(fetchVehicleReviewsThunk({ vehicleId: selVehicle.vehicle_id, page: 1, startDate: "", endDate: "" })); }} />
        </>
      }>
        {!selVendor && !isVendorUser
          ? <EmptyWell icon="🏢" title="Pick a vendor" sub="Select a vendor first" />
          : vehicles.map(v => {
              const active = selVehicle?.vehicle_id === v.vehicle_id;
              const ins    = new Date(v.insurance_expiry_date) < new Date(Date.now() + 30 * 864e5);
              return (
                <button key={v.vehicle_id} onClick={() => pickVehicle(v)}
                  className={`w-full text-left px-4 py-3 border-b border-zinc-50 transition-all
                    ${active ? "bg-blue-50 border-l-2 border-l-blue-500" : "border-l-2 border-l-transparent hover:bg-zinc-50 hover:border-l-zinc-200"}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-sm font-bold font-mono ${active ? "text-blue-700" : "text-zinc-800"}`}>{v.rc_number}</span>
                        <Tag label={v.vehicle_type_name} variant="blue" />
                        {!v.is_active && <Tag label="Inactive" variant="red" />}
                      </div>
                      <p className="text-[11px] text-zinc-500 mb-0.5">👨‍✈️ {v.driver_name || "—"}</p>
                      <p className={`text-[11px] font-medium ${ins ? "text-amber-500" : "text-zinc-400"}`}>
                        {ins ? "⚠ Expiring · " : "Insurance · "}{v.insurance_expiry_date || "—"}
                      </p>
                    </div>
                    <ChevronRight size={13} className={`flex-shrink-0 mt-1 ${active ? "text-blue-500" : "text-zinc-300"}`} />
                  </div>
                </button>
              );
            })
        }
      </LeftPane>

      <RightPane>
        {!selVehicle
          ? <CenterPrompt icon="🚗" title="Select a vehicle" sub="Choose a vehicle to view its condition reviews" />
          : (
            <div className="max-w-2xl flex flex-col gap-4">
              <DetailCard className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-zinc-400 mb-1">{selVehicle.vehicle_type_name}</p>
                    <h2 className="text-2xl font-black font-mono text-zinc-900 tracking-tight">{selVehicle.rc_number}</h2>
                  </div>
                  <Tag label={selVehicle.is_active ? "Active" : "Inactive"} variant={selVehicle.is_active ? "green" : "red"} />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Tag label={`👨‍✈️ ${selVehicle.driver_name || "—"}`} />
                  {insExp && <Tag label="⚠ Insurance Expiring" variant="amber" />}
                </div>
              </DetailCard>

              {reviewLoading && <Spinner />}

              {!reviewLoading && !reviewData && (
                <DetailCard className="py-10 text-center">
                  <span className="text-3xl block mb-2 opacity-20">📭</span>
                  <p className="text-sm font-bold text-zinc-500">No reviews found</p>
                </DetailCard>
              )}

              {!reviewLoading && reviewData && (
                <>
                  {isMaint && (
                    <div className="flex gap-3 items-start bg-amber-50 border border-amber-100 rounded-xl p-4">
                      <Wrench size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-700">
                        <strong>Maintenance Alert</strong> — Avg {(summary.average_rating ?? 0).toFixed(1)} · Schedule a service check.
                      </p>
                    </div>
                  )}
                  <ReviewSummary summary={summary} />
                  {reviews.length > 0 && <ReviewList reviews={reviews} type="vehicle" pagination={pagination} page={page} onPage={p => { dispatch(setVehicleReviewPage(p)); dispatch(fetchVehicleReviewsThunk({ vehicleId: selVehicle.vehicle_id, page: p, startDate: sd, endDate: ed })); }} />}
                </>
              )}
            </div>
          )
        }
      </RightPane>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TAB: ALL REVIEWS
// ─────────────────────────────────────────────────────────────────────────────

const AllReviewsTab = () => {
  const dispatch = useDispatch();
  const result   = useSelector(selectAllReviewsData);
  const loading  = useSelector(selectAllReviewsLoading);
  const page     = useSelector(selectAllReviewsPage);

  const blank = { from_date: "", to_date: "", driver_id: "", employee_id: "", route_id: "", min_rating: "", max_rating: "" };
  const [filters, setFilters] = useState(blank);
  const update = (k, v) => setFilters(f => ({ ...f, [k]: v }));
  const active = Object.entries(filters).filter(([, v]) => v !== "");

  const search = useCallback((p = 1) => {
    dispatch(fetchAllReviewsThunk({ page: p, ...filters }));
  }, [dispatch, filters]);

  const avg = result?.data?.filter(r => r.overall_rating).length
    ? (result.data.reduce((s, r) => s + (r.overall_rating || 0), 0) / result.data.filter(r => r.overall_rating).length).toFixed(1)
    : "—";

  const ratingOpts = ["","1","2","3","4","5"].map(v => ({ value: v, label: v ? "★".repeat(+v)+` (${v})` : "Any" }));

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Filter bar */}
      <div className="bg-white border-b border-zinc-100 px-5 py-4 flex-shrink-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          {[["From Date","from_date","date"],["To Date","to_date","date"],["Driver ID","driver_id","number"],["Employee ID","employee_id","number"],["Route ID","route_id","number"]].map(([label,key,type]) => (
            <div key={key}>
              <SectionLabel>{label}</SectionLabel>
              <input type={type} placeholder={type==="number"?"ID":undefined} value={filters[key]} onChange={e=>update(key,e.target.value)}
                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          ))}
          <div>
            <SectionLabel>Min Rating</SectionLabel>
            <SelectField value={filters.min_rating} onChange={v=>update("min_rating",v)} options={ratingOpts} className="w-full" />
          </div>
          <div>
            <SectionLabel>Max Rating</SectionLabel>
            <SelectField value={filters.max_rating} onChange={v=>update("max_rating",v)} options={ratingOpts} className="w-full" />
          </div>
          <div className="flex gap-2 items-end">
            <button onClick={()=>search(1)}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 active:scale-95 transition-all">
              Search
            </button>
            <button onClick={()=>{setFilters(blank);dispatch(resetAllReviews());}}
              className="px-3 py-2 border border-zinc-200 text-zinc-500 rounded-lg text-sm font-semibold hover:bg-zinc-50 transition">
              Clear
            </button>
          </div>
        </div>

        {active.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {active.map(([k,v]) => (
              <span key={k} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2.5 py-1 text-xs font-semibold">
                {k.replace(/_/g," ")}: {v}
                <button onClick={()=>update(k,"")} className="hover:text-blue-900 leading-none font-bold">×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-5 bg-zinc-50">
        {!result && !loading && (
          <CenterPrompt icon="🔍" title="Search reviews" sub="Set filters above and click Search" />
        )}
        {loading && <Spinner />}

        {result && !loading && (
          <>
            {/* Summary stats */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              {[
                {l:"Total",    v:result.meta?.total,                                        c:"text-zinc-800"},
                {l:"Avg",      v:avg,                                                        c:"text-amber-500"},
                {l:"Low ≤ 2",  v:result.data.filter(r=>r.overall_rating<=2).length,         c:"text-red-500"},
                {l:"Good ≥ 4", v:result.data.filter(r=>r.overall_rating>=4).length,         c:"text-emerald-600"},
              ].map(({l,v,c}) => (
                <DetailCard key={l} className="p-4 text-center">
                  <div className={`text-2xl font-black tabular-nums ${c}`}>{v}</div>
                  <p className="text-[9px] font-bold tracking-[0.1em] uppercase text-zinc-400 mt-1">{l}</p>
                </DetailCard>
              ))}
            </div>

            {/* Review cards */}
            <div className="flex flex-col gap-2.5">
              {result.data.map(r => (
                <DetailCard key={r.review_id} className={`p-4 ${r.overall_rating<=2 ? "border-red-100" : ""}`}>
                  <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <StarRating value={r.overall_rating} size={14} />
                      <span className="text-sm font-bold text-zinc-800">{r.driver_name||`Driver #${r.driver_id}`}</span>
                      <Tag label={`🚗 ${r.vehicle_number}`} variant="blue" />
                      {r.route_id && <Tag label={`Route #${r.route_id}`} />}
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-zinc-400 font-medium">Booking #{r.booking_id} · Emp #{r.employee_id}</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        {new Date(r.created_at).toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      {label:"👨‍✈️ Driver", rating:r.driver_rating,  tags:r.driver_tags,  comment:r.driver_comment,  variant:"purple", bg:"bg-violet-50/60 border-violet-100"},
                      {label:"🚗 Vehicle",  rating:r.vehicle_rating, tags:r.vehicle_tags, comment:r.vehicle_comment, variant:"green",  bg:"bg-emerald-50/60 border-emerald-100"},
                    ].map(({label,rating,tags,comment,variant,bg}) => (
                      <div key={label} className={`rounded-xl p-3 border ${bg}`}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-zinc-600">{label}</span>
                          <StarRating value={rating} size={11} />
                        </div>
                        {tags?.length>0 && <div className="flex flex-wrap gap-1 mb-1.5">{tags.map(t=><Tag key={t} label={t} variant={variant}/>)}</div>}
                        {comment && <p className="text-xs text-zinc-500 italic leading-relaxed">"{comment}"</p>}
                      </div>
                    ))}
                  </div>
                </DetailCard>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-5 pt-4 border-t border-zinc-200">
              <span className="text-sm text-zinc-500 font-medium tabular-nums">
                Page {page} of {result.meta?.total_pages} · {result.meta?.total} total
              </span>
              <div className="flex gap-2">
                {[["← Prev",page-1,page<=1],["Next →",page+1,page>=result.meta?.total_pages]].map(([l,np,dis]) => (
                  <button key={l} onClick={()=>!dis&&search(np)} disabled={dis}
                    className="px-4 py-2 border border-zinc-200 bg-white rounded-lg text-sm text-zinc-600 hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed font-semibold transition">
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────────────────────────────────────

const UnifiedReviewPanel = ({ activeTab, tenantId, isVendorUser, vendorId, vendorOptions }) => (
  <div className="h-full overflow-hidden">
    {activeTab === "bookings"   && <BookingsTab   tenantId={tenantId} />}
    {activeTab === "drivers"    && <DriversTab    isVendorUser={isVendorUser} vendorId={vendorId} vendorOptions={vendorOptions} />}
    {activeTab === "vehicles"   && <VehiclesTab   isVendorUser={isVendorUser} vendorId={vendorId} vendorOptions={vendorOptions} />}
    {activeTab === "allreviews" && <AllReviewsTab />}
  </div>
);

export default UnifiedReviewPanel;
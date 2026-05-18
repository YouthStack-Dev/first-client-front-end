// BookingsTab.jsx

import React, { useState, useCallback } from "react";
import { useDispatch, useSelector }     from "react-redux";
import { ChevronDown, ChevronRight }    from "lucide-react";

import {
  fetchBookingsByDateThunk,
  fetchBookingReviewThunk,
} from "../../redux/features/reviews/Reviewthunk";

import {
  selectBookingShifts,
  selectBookingsLoading,
  selectBookingReviewCache,
  selectBookingReviewLoading,
} from "../../redux/features/reviews/Reviewselector";

import {
  today,
  StarRating,
  StatusBadge,
  Tag,
  Spinner,
  EmptyWell,
  SectionLabel,
  DetailCard,
  LeftPane,
  RightPane,
  CenterPrompt,
  StatsRow,
  DateRangeFilter,
  NoReviewsInline,
} from "./reviewShared";

// ─────────────────────────────────────────────────────────────────────────────

const BookingsTab = ({ tenantId }) => {
  const dispatch      = useDispatch();
  const shifts        = useSelector(selectBookingShifts);
  const loading       = useSelector(selectBookingsLoading);
  const reviewCache   = useSelector(selectBookingReviewCache);
  const reviewLoading = useSelector(selectBookingReviewLoading);

  const [date,       setDate]       = useState(today());
  const [sd,         setSd]         = useState("");
  const [ed,         setEd]         = useState("");
  const [openShifts, setOpenShifts] = useState({});
  const [sel,        setSel]        = useState(null);

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

  // reviewCache[id] === undefined → not fetched yet
  // reviewCache[id] === null      → fetched, REVIEW_NOT_FOUND (404)
  // reviewCache[id] === {...}     → has review data
  const reviewEntry = sel ? reviewCache[sel.booking_id] : undefined;
  const review      = reviewEntry ?? null;
  const noReview    = sel && !reviewLoading && reviewEntry === null;
  const hasReview   = sel && !reviewLoading && reviewEntry != null;

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── 40% LEFT ── */}
      <LeftPane header={
        <>
          <div className="flex flex-col gap-1.5">
            <SectionLabel>Booking Date</SectionLabel>
            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="flex-1 border border-zinc-300 rounded-lg px-3 py-2 text-sm font-semibold
                           text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500
                           focus:border-transparent"
              />
              <button
                onClick={load}
                className="h-[38px] px-5 bg-blue-600 text-white rounded-lg text-sm font-bold
                           hover:bg-blue-700 active:scale-95 transition-all flex-shrink-0"
              >
                Load
              </button>
            </div>
          </div>

          <DateRangeFilter
            sd={sd} ed={ed} setSd={setSd} setEd={setEd}
            onApply={load}
            onClear={() => { setSd(""); setEd(""); }}
          />
        </>
      }>

        {shifts && !loading && (
          <StatsRow items={[
            { l: "Total",     v: all.length },
            { l: "Scheduled", v: all.filter(b => b.status === "Scheduled").length, color: "text-blue-600"   },
            { l: "Reviewed",  v: reviewed,                                          color: "text-emerald-600" },
          ]} />
        )}

        {loading && <Spinner />}
        {!loading && !shifts && (
          <EmptyWell icon="📅" title="No data" sub="Pick a date and click Load" />
        )}

        {!loading && shifts && shifts.shifts.map(shift => (
          <div key={shift.shift_id}>

            {/* Shift header */}
            <button
              onClick={() => setOpenShifts(o => ({ ...o, [shift.shift_id]: !o[shift.shift_id] }))}
              className="w-full flex justify-between items-center px-4 py-3 bg-zinc-100 border-b
                         border-zinc-200 hover:bg-zinc-200 transition-colors sticky top-0 z-10"
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-2 h-2 rounded-full flex-shrink-0
                  ${shift.log_type === "IN" ? "bg-emerald-500" : "bg-orange-400"}`}
                />
                <span className="text-sm font-extrabold text-zinc-800 tracking-tight">
                  {shift.shift_code}
                </span>
                <span className="text-xs font-semibold text-zinc-500">{shift.shift_time}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                  ${shift.log_type === "IN"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-orange-100 text-orange-700"}`}
                >
                  {shift.log_type}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-600 bg-zinc-300 rounded-full w-5 h-5
                                 flex items-center justify-center">
                  {shift.bookings?.length || 0}
                </span>
                {openShifts[shift.shift_id]
                  ? <ChevronDown  size={14} className="text-zinc-500" />
                  : <ChevronRight size={14} className="text-zinc-500" />}
              </div>
            </button>

            {openShifts[shift.shift_id] && (shift.bookings || []).map(b => {
              const bHasReview = reviewCache[b.booking_id] != null;
              const active     = sel?.booking_id === b.booking_id;
              return (
                <button key={b.booking_id} onClick={() => pick(b)}
                  className={`w-full text-left px-4 py-3.5 border-b border-zinc-100 transition-all
                    ${active
                      ? "bg-blue-50 border-l-[3px] border-l-blue-500"
                      : "border-l-[3px] border-l-transparent hover:bg-zinc-50 hover:border-l-zinc-300"
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`text-sm font-extrabold truncate
                        ${active ? "text-blue-700" : "text-zinc-900"}`}>
                        {b.employee_code || `#${b.employee_id}`}
                      </span>
                      <StatusBadge status={b.status || "Request"} />
                      {bHasReview && (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50
                                         ring-1 ring-emerald-300 px-1.5 py-0.5 rounded-full">
                          ✓
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-zinc-500 font-mono flex-shrink-0">
                      #{b.booking_id}
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 mt-[5px]" />
                    <span className="text-xs font-semibold text-zinc-600 truncate leading-snug">
                      {b.pickup_location || "—"}
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0 mt-[5px]" />
                    <span className="text-xs font-semibold text-zinc-600 truncate leading-snug">
                      {b.drop_location || "—"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </LeftPane>

      {/* ── 60% RIGHT ── */}
      <RightPane>
        {!sel && (
          <CenterPrompt
            icon="📋"
            title="Select a booking"
            sub="Click any booking on the left to view its review"
          />
        )}

        {sel && (
          <DetailCard className="flex flex-row h-full overflow-hidden">

            {/* ── LEFT COLUMN: booking info (fixed 240px) ── */}
            <div className="w-60 flex-shrink-0 border-r border-zinc-200 flex flex-col overflow-y-auto">

              {/* Header */}
              <div className="px-5 pt-5 pb-4 border-b border-zinc-200">
                <p className="text-xs font-extrabold text-zinc-400 mb-1.5 uppercase tracking-widest">
                  Booking #{sel.booking_id}
                </p>
                <h2 className="text-xl font-extrabold text-zinc-900 tracking-tight leading-tight">
                  {sel.employee_code || `Employee #${sel.employee_id}`}
                </h2>
                <div className="mt-2.5">
                  <StatusBadge status={sel.status || "Request"} />
                </div>
              </div>

              {/* Route */}
              <div className="px-5 py-4 border-b border-zinc-200">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center mt-1 flex-shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block" />
                    <span className="w-px flex-1 min-h-[28px] bg-zinc-300 block my-1" />
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 block" />
                  </div>
                  <div className="flex flex-col gap-3.5 min-w-0 flex-1">
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 mb-1">
                        Pickup
                      </p>
                      <p className="text-sm font-semibold text-zinc-800 leading-snug">
                        {sel.pickup_location || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 mb-1">
                        Drop
                      </p>
                      <p className="text-sm font-semibold text-zinc-800 leading-snug">
                        {sel.drop_location || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Meta */}
              <div className="px-5 py-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">📅</span>
                  <span className="text-sm font-semibold text-zinc-700">{sel.booking_date}</span>
                </div>
                {sel.booking_type && (
                  <div className="flex items-center gap-2">
                    <span className="text-base">🏷</span>
                    <span className="text-sm font-semibold text-zinc-700">{sel.booking_type}</span>
                  </div>
                )}
                {sel.route_details?.driver_name && (
                  <div className="flex items-center gap-2">
                    <span className="text-base">👨‍✈️</span>
                    <span className="text-sm font-semibold text-zinc-700">
                      {sel.route_details.driver_name}
                    </span>
                  </div>
                )}
                {sel.route_details?.vehicle_number && (
                  <div className="flex items-center gap-2">
                    <span className="text-base">🚗</span>
                    <span className="text-sm font-semibold text-zinc-700">
                      {sel.route_details.vehicle_number}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* ── RIGHT COLUMN: review content ── */}
            <div className="flex-1 flex flex-col overflow-y-auto">

              {reviewLoading && (
                <div className="flex-1 flex items-center justify-center">
                  <Spinner />
                </div>
              )}

              {noReview && (
                <div className="flex-1 flex items-center justify-center">
                  <NoReviewsInline type="booking" hint="Awaiting employee feedback" />
                </div>
              )}

              {hasReview && (
                <div className="p-6 flex flex-col gap-5">

                  {/* Overall rating */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 mb-2">
                        Overall Rating
                      </p>
                      {/* size={26} → stars render at 26px */}
                      <StarRating value={review.overall_rating} size={26} />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-zinc-700">Review #{review.review_id}</p>
                      <p className="text-xs font-semibold text-zinc-400 mt-0.5">
                        {new Date(review.created_at).toLocaleString("en-IN", {
                          day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-zinc-200" />

                  {/* Driver + Vehicle review cards */}
                  <div className="flex flex-col gap-4">
                    {[
                      {
                        label:   "Driver Review",
                        icon:    "👨‍✈️",
                        rating:  review.driver_rating,
                        tags:    review.driver_tags,
                        comment: review.driver_comment,
                        bg:      "bg-violet-50",
                        border:  "border-violet-200",
                        variant: "purple",
                      },
                      {
                        label:   "Vehicle Review",
                        icon:    "🚗",
                        rating:  review.vehicle_rating,
                        tags:    review.vehicle_tags,
                        comment: review.vehicle_comment,
                        bg:      "bg-emerald-50",
                        border:  "border-emerald-200",
                        variant: "green",
                      },
                    ].map(({ label, icon, rating, tags, comment, bg, border, variant }) => (
                      <div key={label} className={`rounded-xl border-2 ${border} ${bg} p-4`}>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-extrabold text-zinc-800">{icon} {label}</span>
                          {/* size={16} → per-card stars at 16px */}
                          <StarRating value={rating} size={16} />
                        </div>
                        {tags?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {tags.map(t => <Tag key={t} label={t} variant={variant} />)}
                          </div>
                        )}
                        <p className="text-sm font-medium text-zinc-600 italic leading-relaxed">
                          {comment ? `"${comment}"` : "No comment left."}
                        </p>
                      </div>
                    ))}
                  </div>

                </div>
              )}
            </div>

          </DetailCard>
        )}
      </RightPane>
    </div>
  );
};

export default BookingsTab;
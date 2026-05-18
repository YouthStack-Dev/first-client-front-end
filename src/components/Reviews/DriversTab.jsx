// DriversTab.jsx

import React, { useState, useCallback } from "react";
import { useDispatch, useSelector }     from "react-redux";
import { ChevronRight, AlertTriangle }  from "lucide-react";

import {
  fetchDriverReviewsThunk,
} from "../../redux/features/reviews/Reviewthunk";

import {
  resetDriverReviews,
  setDriverReviewPage,
} from "../../redux/features/reviews/Reviewslice";

import {
  selectDriverReviewData,
  selectDriverReviewLoading,
  selectDriverReviewPage,
} from "../../redux/features/reviews/Reviewselector";

import {
  NewfetchDriversThunk,
  driversSelectors,
} from "../../redux/features/manageDriver/newDriverSlice";

import {
  Tag,
  Spinner,
  EmptyWell,
  StarRating,
  DetailCard,
  LeftPane,
  RightPane,
  CenterPrompt,
  DateRangeFilter,
  VendorSelect,
  ReviewSummary,
  ReviewList,
} from "./reviewShared";

// ─────────────────────────────────────────────────────────────────────────────

const DriversTab = ({ isVendorUser, vendorId, vendorOptions }) => {
  const dispatch      = useDispatch();
  const drivers       = useSelector(driversSelectors.selectAll);
  const reviewData    = useSelector(selectDriverReviewData);
  const reviewLoading = useSelector(selectDriverReviewLoading);
  const page          = useSelector(selectDriverReviewPage);

  const [selVendor, setSelVendor] = useState(isVendorUser ? { value: vendorId } : null);
  const [selDriver, setSelDriver] = useState(null);
  const [sd,        setSd]        = useState("");
  const [ed,        setEd]        = useState("");

  const summary    = reviewData?.summary    ?? reviewData?.data?.summary    ?? null;
  const reviews    = reviewData?.reviews    ?? reviewData?.data?.reviews    ?? [];
  const pagination = reviewData?.pagination ?? reviewData?.data?.pagination ?? { total: 0, pages: 1 };
  const hasNoData  = !!reviewData && reviews.length === 0 && (summary?.total_reviews ?? 0) === 0;
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

  const expiring = selDriver && new Date(selDriver.license_expiry_date) < new Date(Date.now() + 60 * 864e5);

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── 40% LEFT ── */}
      <LeftPane header={
        <>
          {!isVendorUser && (
            <VendorSelect
              options={vendorOptions}
              value={selVendor}
              onChange={setSelVendor}
              onLoad={loadDrivers}
            />
          )}
          <DateRangeFilter
            sd={sd} ed={ed} setSd={setSd} setEd={setEd}
            onApply={applyDates}
            onClear={() => {
              setSd(""); setEd("");
              if (selDriver)
                dispatch(fetchDriverReviewsThunk({
                  driverId: selDriver.driver_id, page: 1, startDate: "", endDate: "",
                }));
            }}
          />
        </>
      }>
        {!selVendor && !isVendorUser
          ? <EmptyWell icon="🏢" title="Pick a vendor" sub="Select a vendor first" />
          : drivers.map(d => {
              const active   = selDriver?.driver_id === d.driver_id;
              const exp      = new Date(d.license_expiry_date) < new Date(Date.now() + 60 * 864e5);
              return (
                <button key={d.driver_id} onClick={() => pickDriver(d)}
                  className={`w-full text-left px-4 py-3.5 border-b border-zinc-100 transition-all
                    ${active
                      ? "bg-blue-50 border-l-[3px] border-l-blue-500"
                      : "border-l-[3px] border-l-transparent hover:bg-zinc-50 hover:border-l-zinc-300"
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={`text-sm font-extrabold ${active ? "text-blue-700" : "text-zinc-900"}`}>
                          {d.name}
                        </span>
                        <span className="text-xs font-bold font-mono bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded">
                          {d.code}
                        </span>
                        {!d.is_active && <Tag label="Inactive" variant="red" />}
                      </div>
                      <p className="text-xs font-semibold text-zinc-600 mb-0.5">📞 {d.phone || "—"}</p>
                      <p className={`text-xs font-semibold ${exp ? "text-amber-600" : "text-zinc-400"}`}>
                        {exp ? "⚠ " : ""}License · {d.license_expiry_date || "—"}
                      </p>
                    </div>
                    <ChevronRight size={15} className={`flex-shrink-0 mt-1 ${active ? "text-blue-500" : "text-zinc-400"}`} />
                  </div>
                </button>
              );
            })
        }
      </LeftPane>

      {/* ── 60% RIGHT ── */}
      <RightPane>
        {!selDriver ? (
          <CenterPrompt
            icon="👤"
            title="Select a driver"
            sub="Choose a driver to view their review performance"
          />
        ) : (
          <div className="max-w-2xl flex flex-col gap-4">

            {/* ── Sticky identity header ── */}
            <DetailCard className="overflow-hidden sticky top-0 z-10">
              <div className="flex items-center justify-between px-5 py-4">

                {/* Left: name + badges */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Avatar circle */}
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center
                                  justify-center text-sm font-extrabold flex-shrink-0">
                    {selDriver.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base font-extrabold text-zinc-900 tracking-tight truncate">
                        {selDriver.name}
                      </h2>
                      <span className="text-xs font-bold font-mono bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded">
                        {selDriver.code}
                      </span>
                      <Tag
                        label={selDriver.is_active ? "Active" : "Inactive"}
                        variant={selDriver.is_active ? "green" : "red"}
                      />
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs font-semibold text-zinc-500">📞 {selDriver.phone || "—"}</span>
                      <span className={`text-xs font-semibold ${expiring ? "text-amber-600" : "text-zinc-400"}`}>
                        {expiring ? "⚠ " : ""}License · {selDriver.license_expiry_date || "—"}
                      </span>
                      <Tag
                        label={`BGV: ${selDriver.bg_verify_status}`}
                        variant={selDriver.bg_verify_status === "Verified" ? "green" : "amber"}
                      />
                    </div>
                  </div>
                </div>

                {/* Right: avg rating pill — only when data is loaded */}
                {summary && (
                  <div className="flex-shrink-0 flex flex-col items-end gap-1 ml-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-zinc-900">
                        {(summary.average_rating ?? 0).toFixed(1)}
                      </span>
                      <span className="text-sm font-semibold text-zinc-400">/ 5</span>
                    </div>
                    <StarRating value={summary.average_rating ?? 0} size={14} />
                    <span className="text-xs font-semibold text-zinc-400">
                      {summary.total_reviews ?? 0} reviews
                    </span>
                  </div>
                )}

              </div>
            </DetailCard>

            {/* ── Review body card ── */}
            <DetailCard className="overflow-hidden">

              {reviewLoading && <div className="py-10"><Spinner /></div>}

              {!reviewLoading && (!reviewData || hasNoData) && (
                <div className="flex flex-col items-center justify-center gap-3 py-14 px-6 text-center">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
                    className="text-zinc-300" stroke="currentColor" strokeWidth="1.4"
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-6l-2 3H10l-2-3H2" />
                    <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
                  </svg>
                  <div>
                    <p className="text-sm font-bold text-zinc-600">No reviews yet</p>
                    <p className="text-xs font-medium text-zinc-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
                      {selDriver.name} hasn't received any reviews in the selected period.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 bg-zinc-50 border border-zinc-200
                    text-zinc-500 text-xs font-semibold px-3 py-1 rounded-full">
                    0 reviews · Try a wider date range
                  </span>
                </div>
              )}

              {!reviewLoading && reviewData && !hasNoData && (
                <div className="p-5 flex flex-col gap-4">
                  {isLow && (
                    <div className="flex gap-3 items-start bg-red-50 border-2 border-red-100 rounded-xl p-4">
                      <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-semibold text-red-700">
                        <strong className="font-extrabold">Low Rating Alert</strong> — Avg{" "}
                        {(summary.average_rating ?? 0).toFixed(1)} · Consider a coaching session.
                      </p>
                    </div>
                  )}
                  <ReviewSummary summary={summary} />
                  {reviews.length > 0 && (
                    <ReviewList
                      reviews={reviews}
                      type="driver"
                      pagination={pagination}
                      page={page}
                      onPage={p => {
                        dispatch(setDriverReviewPage(p));
                        dispatch(fetchDriverReviewsThunk({
                          driverId: selDriver.driver_id, page: p, startDate: sd, endDate: ed,
                        }));
                      }}
                    />
                  )}
                </div>
              )}

            </DetailCard>
          </div>
        )}
      </RightPane>
    </div>
  );
};

export default DriversTab;
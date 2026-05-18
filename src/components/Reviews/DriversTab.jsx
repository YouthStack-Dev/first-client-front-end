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
  SectionLabel,
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

  // Normalise API response shape
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
              const expiring = new Date(d.license_expiry_date) < new Date(Date.now() + 60 * 864e5);
              return (
                <button key={d.driver_id} onClick={() => pickDriver(d)}
                  className={`w-full text-left px-4 py-3 border-b border-zinc-50 transition-all
                    ${active
                      ? "bg-blue-50 border-l-2 border-l-blue-500"
                      : "border-l-2 border-l-transparent hover:bg-zinc-50 hover:border-l-zinc-200"
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-sm font-bold ${active ? "text-blue-700" : "text-zinc-800"}`}>
                          {d.name}
                        </span>
                        <span className="text-[10px] font-mono bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded">
                          {d.code}
                        </span>
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

      {/* ── 60% RIGHT ── */}
      <RightPane>
        {!selDriver
          ? (
            <CenterPrompt
              icon="👤"
              title="Select a driver"
              sub="Choose a driver to view their review performance"
            />
          ) : (
            <div className="max-w-2xl">

              {/* ── Single unified card ── */}
              <DetailCard className="overflow-hidden">

                {/* Driver header */}
                <div className="flex items-start justify-between px-5 pt-5 pb-4">
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-zinc-400 mb-1">
                      Driver · {selDriver.code}
                    </p>
                    <h2 className="text-2xl font-black text-zinc-900 tracking-tight">
                      {selDriver.name}
                    </h2>
                  </div>
                  <Tag
                    label={selDriver.is_active ? "Active" : "Inactive"}
                    variant={selDriver.is_active ? "green" : "red"}
                  />
                </div>

                {/* Meta tags */}
                <div className="flex gap-2 flex-wrap items-center px-5 pb-4">
                  <Tag label={`📞 ${selDriver.phone || "—"}`} />
                  <Tag
                    label={`BGV: ${selDriver.bg_verify_status}`}
                    variant={selDriver.bg_verify_status === "Verified" ? "green" : "amber"}
                  />
                </div>

                {/* Divider */}
                <div className="border-t border-zinc-100" />

                {/* Review section */}
                {reviewLoading && <div className="py-10"><Spinner /></div>}

                {/* No data — empty state inside the same card */}
                {!reviewLoading && (!reviewData || hasNoData) && (
                  <div className="flex flex-col items-center justify-center gap-3 py-14 px-6 text-center">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
                      className="text-zinc-300" stroke="currentColor" strokeWidth="1.4"
                      strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 12h-6l-2 3H10l-2-3H2" />
                      <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
                    </svg>
                    <div>
                      <p className="text-sm font-bold text-zinc-500">No reviews yet</p>
                      <p className="text-xs text-zinc-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
                        {selDriver.name} hasn't received any reviews in the selected period.
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 bg-zinc-50 border border-zinc-200
                      text-zinc-400 text-[11px] font-semibold px-3 py-1 rounded-full">
                      0 reviews · Try a wider date range
                    </span>
                  </div>
                )}

                {/* Has reviews */}
                {!reviewLoading && reviewData && !hasNoData && (
                  <div className="p-5 flex flex-col gap-4">
                    {isLow && (
                      <div className="flex gap-3 items-start bg-red-50 border border-red-100 rounded-xl p-4">
                        <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">
                          <strong>Low Rating Alert</strong> — Avg {(summary.average_rating ?? 0).toFixed(1)} · Consider a coaching session.
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
          )
        }
      </RightPane>
    </div>
  );
};

export default DriversTab;
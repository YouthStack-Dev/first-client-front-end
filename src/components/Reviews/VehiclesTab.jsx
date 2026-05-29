// VehiclesTab.jsx

import React, { useState, useCallback } from "react";
import { useDispatch, useSelector }     from "react-redux";
import { ChevronRight, Wrench }         from "lucide-react";

import {
  fetchVehicleReviewsThunk,
} from "../../redux/features/reviews/Reviewthunk";

import {
  resetVehicleReviews,
  setVehicleReviewPage,
} from "../../redux/features/reviews/Reviewslice";

import {
  selectVehicleReviewData,
  selectVehicleReviewLoading,
  selectVehicleReviewPage,
} from "../../redux/features/reviews/Reviewselector";

import { fetchVehiclesThunk } from "../../redux/features/manageVehicles/vehicleThunk";
import { selectVehicles }     from "../../redux/features/manageVehicles/vehicleSelectors";

import {
  Tag,
  Spinner,
  EmptyWell,
  DetailCard,
  LeftPane,
  RightPane,
  CenterPrompt,
  DateRangeFilter,
  VendorSelect,
  ReviewSummary,
  ReviewList,
  NoReviewsInline,
} from "./reviewShared";

// ─────────────────────────────────────────────────────────────────────────────

const VehiclesTab = ({ isVendorUser, vendorId, vendorOptions }) => {
  const dispatch      = useDispatch();
  const vehicles      = useSelector(selectVehicles);
  const reviewData    = useSelector(selectVehicleReviewData);
  const reviewLoading = useSelector(selectVehicleReviewLoading);
  const page          = useSelector(selectVehicleReviewPage);

  const [selVendor,  setSelVendor]  = useState(isVendorUser ? { value: vendorId } : null);
  const [selVehicle, setSelVehicle] = useState(null);
  const [sd,         setSd]         = useState("");
  const [ed,         setEd]         = useState("");

  const summary    = reviewData?.summary    ?? reviewData?.data?.summary    ?? null;
  const reviews    = reviewData?.reviews    ?? reviewData?.data?.reviews    ?? [];
  const pagination = reviewData?.pagination ?? reviewData?.data?.pagination ?? { total: 0, pages: 1 };
  const hasNoData  = !!reviewData && reviews.length === 0 && (summary?.total_reviews ?? 0) === 0;
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

      {/* ── 40% LEFT ── */}
      <LeftPane header={
        <>
          {!isVendorUser && (
            <VendorSelect
              options={vendorOptions}
              value={selVendor}
              onChange={setSelVendor}
              onLoad={loadVehicles}
            />
          )}
          <DateRangeFilter
            sd={sd} ed={ed} setSd={setSd} setEd={setEd}
            onApply={applyDates}
            onClear={() => {
              setSd(""); setEd("");
              if (selVehicle)
                dispatch(fetchVehicleReviewsThunk({
                  vehicleId: selVehicle.vehicle_id, page: 1, startDate: "", endDate: "",
                }));
            }}
          />
        </>
      }>
        {!selVendor && !isVendorUser
          ? <EmptyWell icon="🏢" title="Pick a vendor" sub="Select a vendor first" />
          : vehicles.map(v => {
              const active = selVehicle?.vehicle_id === v.vehicle_id;
              const ins    = new Date(v.insurance_expiry_date) < new Date(Date.now() + 30 * 864e5);
              return (
                <button key={v.vehicle_id} onClick={() => pickVehicle(v)}
                  className={`w-full text-left px-4 py-3.5 border-b border-zinc-100 transition-all
                    ${active
                      ? "bg-blue-50 border-l-[3px] border-l-blue-500"
                      : "border-l-[3px] border-l-transparent hover:bg-zinc-50 hover:border-l-zinc-300"
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={`text-sm font-extrabold font-mono ${active ? "text-blue-700" : "text-zinc-900"}`}>
                          {v.rc_number}
                        </span>
                        <Tag label={v.vehicle_type_name} variant="blue" />
                        {!v.is_active && <Tag label="Inactive" variant="red" />}
                      </div>
                      <p className="text-xs font-semibold text-zinc-600 mb-0.5">
                        👨‍✈️ {v.driver_name || "—"}
                      </p>
                      <p className={`text-xs font-semibold ${ins ? "text-amber-600" : "text-zinc-400"}`}>
                        {ins ? "⚠ Expiring · " : "Insurance · "}{v.insurance_expiry_date || "—"}
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
        {!selVehicle ? (
          <CenterPrompt
            icon="🚗"
            title="Select a vehicle"
            sub="Choose a vehicle to view its condition reviews"
          />
        ) : (
          <DetailCard className="flex flex-row h-full overflow-hidden">

            {/* ── LEFT COLUMN: vehicle info (fixed 240px) ── */}
            <div className="w-60 flex-shrink-0 border-r border-zinc-200 flex flex-col overflow-y-auto">

              {/* Header */}
              <div className="px-5 pt-5 pb-4 border-b border-zinc-200">
                <p className="text-xs font-extrabold tracking-widest uppercase text-zinc-400 mb-1.5">
                  {selVehicle.vehicle_type_name}
                </p>
                <h2 className="text-xl font-extrabold font-mono text-zinc-900 tracking-tight leading-tight">
                  {selVehicle.rc_number}
                </h2>
                <div className="mt-2.5">
                  <Tag
                    label={selVehicle.is_active ? "Active" : "Inactive"}
                    variant={selVehicle.is_active ? "green" : "red"}
                  />
                </div>
              </div>

              {/* Meta */}
              <div className="px-5 py-4 flex flex-col gap-3 border-b border-zinc-200">
                {selVehicle.driver_name && (
                  <div className="flex items-center gap-2">
                    <span className="text-base">👨‍✈️</span>
                    <span className="text-sm font-semibold text-zinc-700">{selVehicle.driver_name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-base">🛡</span>
                  <span className={`text-sm font-semibold ${insExp ? "text-amber-600" : "text-zinc-700"}`}>
                    {insExp ? "⚠ Expiring · " : "Insurance · "}
                    {selVehicle.insurance_expiry_date || "—"}
                  </span>
                </div>
                {selVehicle.model && (
                  <div className="flex items-center gap-2">
                    <span className="text-base">🚘</span>
                    <span className="text-sm font-semibold text-zinc-700">{selVehicle.model}</span>
                  </div>
                )}
              </div>

              {/* Summary stats if available */}
              {summary && (
                <div className="px-5 py-4 flex flex-col gap-2">
                  <p className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 mb-1">
                    Condition Score
                  </p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-extrabold text-zinc-900">
                      {(summary.average_rating ?? 0).toFixed(1)}
                    </span>
                    <span className="text-sm font-semibold text-zinc-400">/ 5</span>
                  </div>
                  <p className="text-xs font-semibold text-zinc-500">
                    {summary.total_reviews ?? 0} reviews total
                  </p>
                </div>
              )}
            </div>

            {/* ── RIGHT COLUMN: reviews ── */}
            <div className="flex-1 flex flex-col overflow-y-auto">

              {reviewLoading && (
                <div className="flex-1 flex items-center justify-center">
                  <Spinner />
                </div>
              )}

              {!reviewLoading && (!reviewData || hasNoData) && (
                <div className="flex-1 flex items-center justify-center">
                  <NoReviewsInline name={selVehicle.rc_number} type="vehicle" />
                </div>
              )}

              {!reviewLoading && reviewData && !hasNoData && (
                <div className="p-5 flex flex-col gap-4">
                  {isMaint && (
                    <div className="flex gap-3 items-start bg-amber-50 border-2 border-amber-100 rounded-xl p-4">
                      <Wrench size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-semibold text-amber-700">
                        <strong className="font-extrabold">Maintenance Alert</strong> — Avg{" "}
                        {(summary.average_rating ?? 0).toFixed(1)} · Schedule a service check.
                      </p>
                    </div>
                  )}
                  <ReviewSummary summary={summary} />
                  {reviews.length > 0 && (
                    <ReviewList
                      reviews={reviews}
                      type="vehicle"
                      pagination={pagination}
                      page={page}
                      onPage={p => {
                        dispatch(setVehicleReviewPage(p));
                        dispatch(fetchVehicleReviewsThunk({
                          vehicleId: selVehicle.vehicle_id, page: p, startDate: sd, endDate: ed,
                        }));
                      }}
                    />
                  )}
                </div>
              )}

            </div>

          </DetailCard>
        )}
      </RightPane>
    </div>
  );
};

export default VehiclesTab;
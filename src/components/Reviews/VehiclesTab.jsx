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
  const hasMetaTags = selVehicle && (selVehicle.driver_name || insExp);

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
                  className={`w-full text-left px-4 py-3 border-b border-zinc-50 transition-all
                    ${active
                      ? "bg-blue-50 border-l-2 border-l-blue-500"
                      : "border-l-2 border-l-transparent hover:bg-zinc-50 hover:border-l-zinc-200"
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-sm font-bold font-mono ${active ? "text-blue-700" : "text-zinc-800"}`}>
                          {v.rc_number}
                        </span>
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

      {/* ── 60% RIGHT ── */}
      <RightPane>
        {!selVehicle ? (
          <CenterPrompt
            icon="🚗"
            title="Select a vehicle"
            sub="Choose a vehicle to view its condition reviews"
          />
        ) : (
          <div className="max-w-2xl">
            <DetailCard className="overflow-hidden">

              {/* Header */}
              <div className="flex items-start justify-between px-5 pt-5 pb-3">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-zinc-400 mb-1">
                    {selVehicle.vehicle_type_name}
                  </p>
                  <h2 className="text-2xl font-black font-mono text-zinc-900 tracking-tight">
                    {selVehicle.rc_number}
                  </h2>
                </div>
                <Tag
                  label={selVehicle.is_active ? "Active" : "Inactive"}
                  variant={selVehicle.is_active ? "green" : "red"}
                />
              </div>

              {/* Meta tags — only when there's content */}
              {hasMetaTags && (
                <div className="flex gap-2 flex-wrap items-center px-5 pb-3">
                  {selVehicle.driver_name && <Tag label={`👨‍✈️ ${selVehicle.driver_name}`} />}
                  {insExp && <Tag label="⚠ Insurance Expiring" variant="amber" />}
                </div>
              )}

              <div className="border-t border-zinc-100" />

              {/* ── Loading ── */}
              {reviewLoading && <div className="py-10"><Spinner /></div>}

              {/* ── No reviews ── */}
              {!reviewLoading && (!reviewData || hasNoData) && (
                <NoReviewsInline name={selVehicle.rc_number} type="vehicle" />
              )}

              {/* ── Has reviews ── */}
              {!reviewLoading && reviewData && !hasNoData && (
                <div className="p-5 flex flex-col gap-4">
                  {isMaint && (
                    <div className="flex gap-3 items-start bg-amber-50 border border-amber-100 rounded-xl p-4">
                      <Wrench size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-700">
                        <strong>Maintenance Alert</strong> — Avg {(summary.average_rating ?? 0).toFixed(1)} · Schedule a service check.
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

            </DetailCard>
          </div>
        )}
      </RightPane>
    </div>
  );
};

export default VehiclesTab;
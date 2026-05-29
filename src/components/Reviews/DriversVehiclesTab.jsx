// // DriversVehiclesTab.jsx
// // Merged tab — toggle between Drivers and Vehicles list in the left pane.
// // Right pane shows sticky identity header + ReviewSummary + accordion ReviewList.
// // Both driver and vehicle reviews share the same review object shape, so the
// // same ReviewList component handles both without any changes.

// import React, { useState, useCallback } from "react";
// import { useDispatch, useSelector }     from "react-redux";
// import { ChevronRight, AlertTriangle, Wrench } from "lucide-react";

// import {
//   fetchDriverReviewsThunk,
//   fetchVehicleReviewsThunk,
// } from "../../redux/features/reviews/Reviewthunk";

// import {
//   resetDriverReviews,
//   setDriverReviewPage,
//   resetVehicleReviews,
//   setVehicleReviewPage,
// } from "../../redux/features/reviews/Reviewslice";

// import {
//   selectDriverReviewData,
//   selectDriverReviewLoading,
//   selectDriverReviewPage,
//   selectVehicleReviewData,
//   selectVehicleReviewLoading,
//   selectVehicleReviewPage,
// } from "../../redux/features/reviews/Reviewselector";

// import {
//   NewfetchDriversThunk,
//   driversSelectors,
// } from "../../redux/features/manageDriver/newDriverSlice";

// import { fetchVehiclesThunk } from "../../redux/features/manageVehicles/vehicleThunk";
// import { selectVehicles }     from "../../redux/features/manageVehicles/vehicleSelectors";

// import {
//   Tag,
//   StarRating,
//   Spinner,
//   EmptyWell,
//   LeftPane,
//   RightPane,
//   CenterPrompt,
//   DateRangeFilter,
//   VendorSelect,
//   ReviewSummary,
//   ReviewList,
//   NoReviewsInline,
// } from "./reviewShared";

// // ─────────────────────────────────────────────────────────────────────────────

// const DriversVehiclesTab = ({ isVendorUser, vendorId, vendorOptions }) => {
//   const dispatch = useDispatch();

//   // ── mode toggle ──
//   const [mode, setMode] = useState("drivers"); // "drivers" | "vehicles"

//   // ── shared filter state ──
//   const [selVendor, setSelVendor] = useState(isVendorUser ? { value: vendorId } : null);
//   const [sd,        setSd]        = useState("");
//   const [ed,        setEd]        = useState("");

//   // ── driver state ──
//   const drivers       = useSelector(driversSelectors.selectAll);
//   const driverData    = useSelector(selectDriverReviewData);
//   const driverLoading = useSelector(selectDriverReviewLoading);
//   const driverPage    = useSelector(selectDriverReviewPage);
//   const [selDriver, setSelDriver] = useState(null);

//   // ── vehicle state ──
//   const vehicles      = useSelector(selectVehicles);
//   const vehicleData   = useSelector(selectVehicleReviewData);
//   const vehicleLoading= useSelector(selectVehicleReviewLoading);
//   const vehiclePage   = useSelector(selectVehicleReviewPage);
//   const [selVehicle, setSelVehicle] = useState(null);

//   // ── derived review data for whichever mode is active ──
//   const reviewData    = mode === "drivers" ? driverData    : vehicleData;
//   const reviewLoading = mode === "drivers" ? driverLoading : vehicleLoading;
//   const page          = mode === "drivers" ? driverPage    : vehiclePage;
//   const selEntity     = mode === "drivers" ? selDriver     : selVehicle;

//   const summary    = reviewData?.summary    ?? reviewData?.data?.summary    ?? null;
//   const reviews    = reviewData?.reviews    ?? reviewData?.data?.reviews    ?? [];
//   const pagination = reviewData?.pagination ?? reviewData?.data?.pagination ?? { total: 0, pages: 1 };
//   const hasNoData  = !!reviewData && reviews.length === 0 && (summary?.total_reviews ?? 0) === 0;

//   const isLow   = mode === "drivers"  && summary && (summary.average_rating ?? 0) < 3 && (summary.total_reviews ?? 0) >= 3;
//   const isMaint = mode === "vehicles" && summary && (summary.average_rating ?? 0) < 3 && (summary.total_reviews ?? 0) > 5;

//   // ── load list ──
//   const loadList = useCallback(() => {
//     const vid = isVendorUser ? vendorId : selVendor?.value;
//     if (!vid) return;
//     if (mode === "drivers") {
//       dispatch(NewfetchDriversThunk({ vendor_id: vid }));
//       setSelDriver(null);
//       dispatch(resetDriverReviews());
//     } else {
//       dispatch(fetchVehiclesThunk({ vendor_id: vid, skip: 0, limit: 100 }));
//       setSelVehicle(null);
//       dispatch(resetVehicleReviews());
//     }
//   }, [dispatch, isVendorUser, vendorId, selVendor, mode]);

//   // ── mode switch — reset selection + reviews ──
//   const switchMode = (m) => {
//     setMode(m);
//     setSelDriver(null);
//     setSelVehicle(null);
//     dispatch(resetDriverReviews());
//     dispatch(resetVehicleReviews());
//     // reload list for new mode if vendor already selected
//     const vid = isVendorUser ? vendorId : selVendor?.value;
//     if (!vid) return;
//     if (m === "drivers") {
//       dispatch(NewfetchDriversThunk({ vendor_id: vid }));
//     } else {
//       dispatch(fetchVehiclesThunk({ vendor_id: vid, skip: 0, limit: 100 }));
//     }
//   };

//   // ── pick entity ──
//   const pickDriver = useCallback((d) => {
//     setSelDriver(d);
//     dispatch(fetchDriverReviewsThunk({ driverId: d.driver_id, page: 1, startDate: sd, endDate: ed }));
//   }, [dispatch, sd, ed]);

//   const pickVehicle = useCallback((v) => {
//     setSelVehicle(v);
//     dispatch(fetchVehicleReviewsThunk({ vehicleId: v.vehicle_id, page: 1, startDate: sd, endDate: ed }));
//   }, [dispatch, sd, ed]);

//   // ── apply date filter ──
//   const applyDates = useCallback(() => {
//     if (mode === "drivers" && selDriver) {
//       dispatch(fetchDriverReviewsThunk({ driverId: selDriver.driver_id, page: 1, startDate: sd, endDate: ed }));
//     } else if (mode === "vehicles" && selVehicle) {
//       dispatch(fetchVehicleReviewsThunk({ vehicleId: selVehicle.vehicle_id, page: 1, startDate: sd, endDate: ed }));
//     }
//   }, [dispatch, mode, selDriver, selVehicle, sd, ed]);

//   const clearDates = useCallback(() => {
//     setSd(""); setEd("");
//     if (mode === "drivers" && selDriver)
//       dispatch(fetchDriverReviewsThunk({ driverId: selDriver.driver_id, page: 1, startDate: "", endDate: "" }));
//     if (mode === "vehicles" && selVehicle)
//       dispatch(fetchVehicleReviewsThunk({ vehicleId: selVehicle.vehicle_id, page: 1, startDate: "", endDate: "" }));
//   }, [dispatch, mode, selDriver, selVehicle]);

//   React.useEffect(() => {
//     if (isVendorUser && vendorId) loadList();
//     return () => {
//       dispatch(resetDriverReviews());
//       dispatch(resetVehicleReviews());
//     };
//   }, []); // eslint-disable-line

//   // ── helpers for right-pane header ──
//   const insExp = selVehicle &&
//     new Date(selVehicle.insurance_expiry_date) < new Date(Date.now() + 30 * 864e5);
//   const licExp = selDriver &&
//     new Date(selDriver.license_expiry_date) < new Date(Date.now() + 60 * 864e5);

//   return (
//     <div className="flex h-full overflow-hidden">

//       {/* ══════════════ 40% LEFT PANE ══════════════ */}
//       <LeftPane header={
//         <>
//           {/* ── Driver / Vehicle toggle ── */}
//           <div className="flex rounded-lg border border-zinc-200 overflow-hidden">
//             {["drivers", "vehicles"].map(m => (
//               <button
//                 key={m}
//                 onClick={() => switchMode(m)}
//                 className={`flex-1 py-2 text-xs font-bold tracking-wide transition-colors capitalize
//                   ${mode === m
//                     ? "bg-blue-600 text-white"
//                     : "bg-white text-zinc-500 hover:bg-zinc-50"
//                   }`}
//               >
//                 {m === "drivers" ? "👨‍✈️ Drivers" : "🚗 Vehicles"}
//               </button>
//             ))}
//           </div>

//           {!isVendorUser && (
//             <VendorSelect
//               options={vendorOptions}
//               value={selVendor}
//               onChange={setSelVendor}
//               onLoad={loadList}
//             />
//           )}

//           <DateRangeFilter
//             sd={sd} ed={ed} setSd={setSd} setEd={setEd}
//             onApply={applyDates}
//             onClear={clearDates}
//           />
//         </>
//       }>

//         {/* ── Driver list ── */}
//         {mode === "drivers" && (
//           !selVendor && !isVendorUser
//             ? <EmptyWell icon="🏢" title="Pick a vendor" sub="Select a vendor first" />
//             : drivers.map(d => {
//                 const active = selDriver?.driver_id === d.driver_id;
//                 const exp    = new Date(d.license_expiry_date) < new Date(Date.now() + 60 * 864e5);
//                 return (
//                   <button key={d.driver_id} onClick={() => pickDriver(d)}
//                     className={`w-full text-left px-4 py-3.5 border-b border-zinc-100 transition-all
//                       ${active
//                         ? "bg-blue-50 border-l-[3px] border-l-blue-500"
//                         : "border-l-[3px] border-l-transparent hover:bg-zinc-50 hover:border-l-zinc-300"
//                       }`}
//                   >
//                     <div className="flex items-start justify-between">
//                       <div className="min-w-0">
//                         <div className="flex items-center gap-2 mb-1.5 flex-wrap">
//                           <span className={`text-sm font-extrabold ${active ? "text-blue-700" : "text-zinc-900"}`}>
//                             {d.name}
//                           </span>
//                           <span className="text-xs font-bold font-mono bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded">
//                             {d.code}
//                           </span>
//                           {!d.is_active && <Tag label="Inactive" variant="red" />}
//                         </div>
//                         <p className="text-xs font-semibold text-zinc-600 mb-0.5">📞 {d.phone || "—"}</p>
//                         <p className={`text-xs font-semibold ${exp ? "text-amber-600" : "text-zinc-400"}`}>
//                           {exp ? "⚠ " : ""}License · {d.license_expiry_date || "—"}
//                         </p>
//                       </div>
//                       <ChevronRight size={15} className={`flex-shrink-0 mt-1 ${active ? "text-blue-500" : "text-zinc-400"}`} />
//                     </div>
//                   </button>
//                 );
//               })
//         )}

//         {/* ── Vehicle list ── */}
//         {mode === "vehicles" && (
//           !selVendor && !isVendorUser
//             ? <EmptyWell icon="🏢" title="Pick a vendor" sub="Select a vendor first" />
//             : vehicles.map(v => {
//                 const active = selVehicle?.vehicle_id === v.vehicle_id;
//                 const ins    = new Date(v.insurance_expiry_date) < new Date(Date.now() + 30 * 864e5);
//                 return (
//                   <button key={v.vehicle_id} onClick={() => pickVehicle(v)}
//                     className={`w-full text-left px-4 py-3.5 border-b border-zinc-100 transition-all
//                       ${active
//                         ? "bg-blue-50 border-l-[3px] border-l-blue-500"
//                         : "border-l-[3px] border-l-transparent hover:bg-zinc-50 hover:border-l-zinc-300"
//                       }`}
//                   >
//                     <div className="flex items-start justify-between">
//                       <div className="min-w-0">
//                         <div className="flex items-center gap-2 mb-1.5 flex-wrap">
//                           <span className={`text-sm font-extrabold font-mono ${active ? "text-blue-700" : "text-zinc-900"}`}>
//                             {v.rc_number}
//                           </span>
//                           <Tag label={v.vehicle_type_name} variant="blue" />
//                           {!v.is_active && <Tag label="Inactive" variant="red" />}
//                         </div>
//                         <p className="text-xs font-semibold text-zinc-600 mb-0.5">
//                           👨‍✈️ {v.driver_name || "—"}
//                         </p>
//                         <p className={`text-xs font-semibold ${ins ? "text-amber-600" : "text-zinc-400"}`}>
//                           {ins ? "⚠ Expiring · " : "Insurance · "}{v.insurance_expiry_date || "—"}
//                         </p>
//                       </div>
//                       <ChevronRight size={15} className={`flex-shrink-0 mt-1 ${active ? "text-blue-500" : "text-zinc-400"}`} />
//                     </div>
//                   </button>
//                 );
//               })
//         )}
//       </LeftPane>

//       {/* ══════════════ 60% RIGHT PANE ══════════════ */}
//       <RightPane>
//         {!selEntity ? (
//           <CenterPrompt
//             icon={mode === "drivers" ? "👤" : "🚗"}
//             title={mode === "drivers" ? "Select a driver" : "Select a vehicle"}
//             sub={mode === "drivers"
//               ? "Choose a driver to view their review performance"
//               : "Choose a vehicle to view its condition reviews"}
//           />
//         ) : (
//           <div className="flex flex-col gap-4 max-w-2xl">

//             {/* ── Sticky identity header ── */}
//             <div className="flex items-center justify-between bg-white rounded-xl border border-zinc-100
//                             shadow-sm px-5 py-4 sticky top-0 z-10">
//               <div className="flex items-center gap-3 min-w-0">
//                 <div className={`w-10 h-10 rounded-full flex items-center justify-center
//                                  flex-shrink-0 text-sm font-extrabold
//                                  ${mode === "drivers" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-xl"}`}>
//                   {mode === "drivers"
//                     ? selDriver.name?.charAt(0)?.toUpperCase() ?? "D"
//                     : "🚗"}
//                 </div>
//                 <div className="min-w-0">
//                   <div className="flex items-center gap-2 flex-wrap">
//                     <h2 className={`text-base font-extrabold text-zinc-900 tracking-tight truncate
//                                     ${mode === "vehicles" ? "font-mono" : ""}`}>
//                       {mode === "drivers" ? selDriver.name : selVehicle.rc_number}
//                     </h2>
//                     {mode === "drivers" && (
//                       <span className="text-xs font-bold font-mono bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded">
//                         {selDriver.code}
//                       </span>
//                     )}
//                     {mode === "vehicles" && (
//                       <Tag label={selVehicle.vehicle_type_name} variant="blue" />
//                     )}
//                     <Tag
//                       label={(mode === "drivers" ? selDriver : selVehicle).is_active ? "Active" : "Inactive"}
//                       variant={(mode === "drivers" ? selDriver : selVehicle).is_active ? "green" : "red"}
//                     />
//                     {licExp && <Tag label="⚠ License Expiring" variant="amber" />}
//                     {insExp && <Tag label="⚠ Insurance Expiring" variant="amber" />}
//                   </div>
//                   <p className="text-xs font-semibold text-zinc-500 mt-0.5">
//                     {mode === "drivers" ? (
//                       <>
//                         📞 {selDriver.phone || "—"}
//                         {selDriver.bg_verify_status && (
//                           <span className={`ml-3 ${selDriver.bg_verify_status === "Verified" ? "text-emerald-600" : "text-amber-600"}`}>
//                             ✅ BGV: {selDriver.bg_verify_status}
//                           </span>
//                         )}
//                       </>
//                     ) : (
//                       <>
//                         {selVehicle.driver_name && `👨‍✈️ ${selVehicle.driver_name}`}
//                         {selVehicle.model && <span className="ml-3 text-zinc-400">{selVehicle.model}</span>}
//                       </>
//                     )}
//                   </p>
//                 </div>
//               </div>

//               {/* Avg rating — shows once summary loads */}
//               {summary && (
//                 <div className="flex-shrink-0 flex flex-col items-end gap-0.5 ml-4">
//                   <div className="flex items-baseline gap-1">
//                     <span className="text-2xl font-extrabold text-zinc-900">
//                       {(summary.average_rating ?? 0).toFixed(1)}
//                     </span>
//                     <span className="text-sm font-semibold text-zinc-400">/ 5</span>
//                   </div>
//                   <StarRating value={summary.average_rating ?? 0} size={13} />
//                   <span className="text-xs font-semibold text-zinc-400">
//                     {summary.total_reviews ?? 0} reviews
//                   </span>
//                 </div>
//               )}
//             </div>

//             {/* ── Loading ── */}
//             {reviewLoading && <Spinner />}

//             {/* ── No data ── */}
//             {!reviewLoading && (!reviewData || hasNoData) && (
//               <NoReviewsInline
//                 name={mode === "drivers" ? selDriver.name : selVehicle.rc_number}
//                 type={mode === "drivers" ? "driver" : "vehicle"}
//               />
//             )}

//             {/* ── Has reviews ── */}
//             {!reviewLoading && reviewData && !hasNoData && (
//               <>
//                 {/* Alert banners */}
//                 {isLow && (
//                   <div className="flex gap-3 items-start bg-red-50 border-2 border-red-100 rounded-xl p-4">
//                     <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
//                     <p className="text-sm font-semibold text-red-700">
//                       <strong className="font-extrabold">Low Rating Alert</strong> — Avg{" "}
//                       {(summary.average_rating ?? 0).toFixed(1)} · Consider a coaching session.
//                     </p>
//                   </div>
//                 )}
//                 {isMaint && (
//                   <div className="flex gap-3 items-start bg-amber-50 border-2 border-amber-100 rounded-xl p-4">
//                     <Wrench size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
//                     <p className="text-sm font-semibold text-amber-700">
//                       <strong className="font-extrabold">Maintenance Alert</strong> — Avg{" "}
//                       {(summary.average_rating ?? 0).toFixed(1)} · Schedule a service check.
//                     </p>
//                   </div>
//                 )}

//                 <ReviewSummary summary={summary} />

//                 {reviews.length > 0 && (
//                   <ReviewList
//                     reviews={reviews}
//                     pagination={pagination}
//                     page={page}
//                     onPage={p => {
//                       if (mode === "drivers") {
//                         dispatch(setDriverReviewPage(p));
//                         dispatch(fetchDriverReviewsThunk({
//                           driverId: selDriver.driver_id, page: p, startDate: sd, endDate: ed,
//                         }));
//                       } else {
//                         dispatch(setVehicleReviewPage(p));
//                         dispatch(fetchVehicleReviewsThunk({
//                           vehicleId: selVehicle.vehicle_id, page: p, startDate: sd, endDate: ed,
//                         }));
//                       }
//                     }}
//                   />
//                 )}
//               </>
//             )}

//           </div>
//         )}
//       </RightPane>
//     </div>
//   );
// };

// export default DriversVehiclesTab;
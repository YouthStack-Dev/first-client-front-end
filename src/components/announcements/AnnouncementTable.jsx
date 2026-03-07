// import React, { useMemo, useState, useCallback, useEffect } from "react";
// import { useDispatch, useSelector }                          from "react-redux";

// import DynamicTable from "../DynamicTable";

// import {
//   publishAnnouncement,
//   deleteAnnouncement,
//   fetchAnnouncementById,
// } from "../../redux/features/notifications/announcementThunks";
// import {
//   selectIsPublishing,
//   selectIsDeleting,
//   selectLoadingDetail,
//   selectPublishError,
//   selectDeleteError,
//   clearError,
// } from "../../redux/features/notifications/announcementsSlice";

// // ─── Helpers ───────────────────────────────────────────────────────────────────
// function normalizeChannels(channels) {
//   if (!channels)                    return [];
//   if (Array.isArray(channels))      return channels;
//   if (typeof channels === "string") return channels.split(",").map(c => c.trim()).filter(Boolean);
//   return [];
// }

// // ─── Badge components ─────────────────────────────────────────────────────────
// const STATUS_STYLES = {
//   draft:     "bg-yellow-100 text-yellow-700",
//   published: "bg-green-100  text-green-700",
//   cancelled: "bg-gray-100   text-gray-500",
// };

// function StatusBadge({ status }) {
//   const cls = STATUS_STYLES[status] ?? "bg-gray-100 text-gray-400";
//   return (
//     <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${cls}`}>
//       {status ?? "-"}
//     </span>
//   );
// }

// function ChannelBadges({ channels }) {
//   if (!channels.length) return <span className="text-gray-400 text-xs">-</span>;
//   return (
//     <div className="flex flex-wrap gap-1">
//       {channels.map((ch) => (
//         <span key={ch} className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
//           {ch}
//         </span>
//       ))}
//     </div>
//   );
// }

// // ─── Table column config ──────────────────────────────────────────────────────
// const HEADERS = [
//   { key: "title",            label: "Title"      },
//   { key: "target_type",      label: "Target"     },
//   { key: "status",           label: "Status"     },
//   { key: "channels",         label: "Channels"   },
//   { key: "total_recipients", label: "Recipients" },
// ];

// // TODO: extract to shared components/ui/Spinner when used in 3+ places
// function Spinner() {
//   return (
//     <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
//       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
//       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
//     </svg>
//   );
// }

// // ─── Component ────────────────────────────────────────────────────────────────
// const AnnouncementTable = ({
//   data = [],
//   loading,
//   page,
//   pageSize,
//   onPageChange,
//   onCreate,
//   onEdit,            // called with FRESH announcement from GET /announcements/{id}
//   onRecipients,
//   onMutationSuccess, // called after publish or delete — parent re-fetches list
// }) => {
//   const dispatch = useDispatch();

//   const isPublishing    = useSelector(selectIsPublishing);
//   const isDeleting      = useSelector(selectIsDeleting);
//   const isLoadingDetail = useSelector(selectLoadingDetail);
//   const publishError    = useSelector(selectPublishError);
//   const deleteError     = useSelector(selectDeleteError);

//   const [publishingId, setPublishingId] = useState(null);
//   const [deletingId,   setDeletingId]   = useState(null);
//   const [editingId,    setEditingId]    = useState(null);

//   // Clear inline errors on unmount so stale banners don't reappear
//   useEffect(() => {
//     return () => {
//       dispatch(clearError("publishError"));
//       dispatch(clearError("deleteError"));
//     };
//   }, [dispatch]);

//   // ── Edit — fetches fresh data before opening form ──────────────────────────
//   const handleEdit = useCallback(async (row) => {
//     setEditingId(row.announcement_id);
//     const result = await dispatch(fetchAnnouncementById(row.announcement_id));
//     setEditingId(null);
//     onEdit(result.error ? row : (result.payload?.data ?? row));
//   }, [dispatch, onEdit]);

//   // ── Publish ────────────────────────────────────────────────────────────────
//   const handlePublish = useCallback(async (row) => {
//     setPublishingId(row.announcement_id);
//     const result = await dispatch(publishAnnouncement(row.announcement_id));
//     setPublishingId(null);
//     if (!result.error) onMutationSuccess?.();
//   }, [dispatch, onMutationSuccess]);

//   // ── Delete ─────────────────────────────────────────────────────────────────
//   // TODO: replace window.confirm with a proper confirm modal
//   const handleDelete = useCallback(async (row) => {
//     if (!window.confirm(`Delete "${row.title}"? This cannot be undone.`)) return;
//     setDeletingId(row.announcement_id);
//     const result = await dispatch(deleteAnnouncement(row.announcement_id));
//     setDeletingId(null);
//     if (!result.error) onMutationSuccess?.();
//   }, [dispatch, onMutationSuccess]);

//   // ── Formatted data ─────────────────────────────────────────────────────────
//   const formattedData = useMemo(
//     () => data.map((item) => ({
//       ...item,
//       _status:  item.status,
//       status:   <StatusBadge   status={item.status} />,
//       channels: <ChannelBadges channels={normalizeChannels(item.channels)} />,
//     })),
//     [data]
//   );

//   // ── Render ─────────────────────────────────────────────────────────────────
//   return (
//     <div className="bg-white border rounded-xl p-4">

//       {/* Header */}
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-lg font-semibold">Announcements</h2>
//         <button
//           onClick={onCreate}
//           className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
//         >
//           + Create Announcement
//         </button>
//       </div>

//       {/* Publish error */}
//       {publishError && (
//         <div role="alert" className="mb-3 flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 px-4 py-2 text-sm text-orange-700">
//           <span>⚠ Publish failed: {publishError.message}</span>
//           <button onClick={() => dispatch(clearError("publishError"))} className="ml-2 font-bold text-orange-400 hover:text-orange-600">×</button>
//         </div>
//       )}

//       {/* Delete error */}
//       {deleteError && (
//         <div role="alert" className="mb-3 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
//           <span>⚠ Delete failed: {deleteError.message}</span>
//           <button onClick={() => dispatch(clearError("deleteError"))} className="ml-2 font-bold text-red-400 hover:text-red-600">×</button>
//         </div>
//       )}

//       {/* showPagination={false} — this component owns its own pagination below */}
//       <DynamicTable
//         headers={HEADERS}
//         data={formattedData}
//         loading={loading}
//         emptyMessage="No announcements yet. Create one to get started."
//         showPagination={false}
//         renderActions={(row) => {
//           const isDraft       = row._status === "draft";
//           const rowEditing    = isLoadingDetail && editingId    === row.announcement_id;
//           const rowPublishing = isPublishing    && publishingId === row.announcement_id;
//           const rowDeleting   = isDeleting      && deletingId   === row.announcement_id;

//           const blockDestructive = rowPublishing || rowDeleting;
//           const blockAll         = blockDestructive || rowEditing;

//           return (
//             <div className="flex items-center gap-3">

//               {isDraft && (
//                 <button
//                   onClick={() => handleEdit(row)}
//                   disabled={blockAll}
//                   className="text-blue-600 text-sm hover:underline disabled:opacity-40 flex items-center gap-1"
//                 >
//                   {rowEditing ? <><Spinner /> Loading…</> : "Edit"}
//                 </button>
//               )}

//               {isDraft && (
//                 <button
//                   onClick={() => handlePublish(row)}
//                   disabled={blockAll}
//                   className="text-green-600 text-sm hover:underline disabled:opacity-40 flex items-center gap-1"
//                 >
//                   {rowPublishing ? <><Spinner /> Publishing…</> : "Publish"}
//                 </button>
//               )}

//               <button
//                 onClick={() => onRecipients(row)}
//                 disabled={blockDestructive}
//                 className="text-purple-600 text-sm hover:underline disabled:opacity-40"
//               >
//                 Recipients
//               </button>

//               <button
//                 onClick={() => handleDelete(row)}
//                 disabled={blockAll}
//                 className="text-red-500 text-sm hover:underline disabled:opacity-40 flex items-center gap-1"
//               >
//                 {rowDeleting ? <><Spinner /> Deleting…</> : "Delete"}
//               </button>

//             </div>
//           );
//         }}
//       />

//       {/* Pagination */}
//       {onPageChange && (
//         <div className="mt-4 flex items-center justify-end gap-3">
//           <button
//             onClick={() => onPageChange((p) => Math.max(1, p - 1))}
//             disabled={page <= 1 || loading}
//             className="px-3 py-1 text-sm border rounded disabled:opacity-40"
//           >
//             ← Prev
//           </button>
//           <span className="text-sm text-gray-500">Page {page}</span>
//           <button
//             onClick={() => onPageChange((p) => p + 1)}
//             disabled={loading || data.length < pageSize}
//             className="px-3 py-1 text-sm border rounded disabled:opacity-40"
//           >
//             Next →
//           </button>
//         </div>
//       )}

//     </div>
//   );
// };

// export default AnnouncementTable;
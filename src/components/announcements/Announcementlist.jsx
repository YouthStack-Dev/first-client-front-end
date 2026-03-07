import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector }                          from "react-redux";

import {
  publishAnnouncement,
  deleteAnnouncement,
  fetchAnnouncementById,
} from "../../redux/features/notifications/announcementThunks";
import {
  selectIsPublishing,
  selectIsDeleting,
  selectLoadingDetail,
  selectPublishError,
  selectDeleteError,
  clearError,
} from "../../redux/features/notifications/announcementsSlice";

// ─── Helpers ───────────────────────────────────────────────────────────────────
function normalizeChannels(channels) {
  if (!channels)                    return [];
  if (Array.isArray(channels))      return channels;
  if (typeof channels === "string") return channels.split(",").map(c => c.trim()).filter(Boolean);
  return [];
}

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ─── Config ────────────────────────────────────────────────────────────────────
const STATUS_CFG = {
  draft:     { label: "Draft",     bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-400"   },
  published: { label: "Published", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  cancelled: { label: "Cancelled", bg: "bg-gray-100",   text: "text-gray-500",    border: "border-gray-200",    dot: "bg-gray-400"    },
};

const CHANNEL_CFG = {
  push:   { label: "Push",   color: "bg-blue-100 text-blue-700"       },
  in_app: { label: "In-App", color: "bg-violet-100 text-violet-700"   },
  sms:    { label: "SMS",    color: "bg-green-100 text-green-700"     },
  email:  { label: "Email",  color: "bg-orange-100 text-orange-700"   },
};

const TARGET_LABEL = {
  all_employees:      "All Employees",
  specific_employees: "Specific Employees",
  teams:              "Teams",
  all_drivers:        "All Drivers",
  vendor_drivers:     "Vendor Drivers",
  specific_drivers:   "Specific Drivers",
};

const CONTENT_ICON = {
  text: "📝", image: "🖼", video: "🎬",
  audio: "🎵", pdf: "📄", link: "🔗",
};

const FILTERS = ["All", "Draft", "Published"];

// ─── Spinner ──────────────────────────────────────────────────────────────────
// TODO: replace with shared components/ui/Spinner when extracted
function Spinner() {
  return (
    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
    </svg>
  );
}

// ─── Single Card ──────────────────────────────────────────────────────────────
const AnnouncementCard = React.memo(({
  item,
  onEdit,
  onPublish,
  onDelete,
  onRecipients,
  isEditingThis,
  isPublishingThis,
  isDeletingThis,
}) => {
  const status  = STATUS_CFG[item.status] ?? STATUS_CFG.draft;
  const isDraft = item.status === "draft";
  const busy    = isEditingThis || isPublishingThis || isDeletingThis;
  const channels = normalizeChannels(item.channels);

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">

      {/* Left accent bar — amber=draft, green=published */}
      <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-full
        ${isDraft ? "bg-amber-400" : "bg-emerald-500"}`}
      />

      <div className="pl-5 pr-4 pt-4 pb-3">

        {/* Top row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border
              ${status.bg} ${status.text} ${status.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}/>
              {status.label}
            </span>
            <span className="text-base" title={item.content_type}>
              {CONTENT_ICON[item.content_type] ?? "📝"}
            </span>
          </div>
          <span className="text-[11px] text-gray-400">{timeAgo(item.created_at)}</span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-900 leading-snug mb-1">
          {item.title}
        </h3>

        {/* Body preview */}
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">
          {item.body}
        </p>

        {/* Meta: target + channels + recipients */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600 text-[11px] font-medium">
            🎯 {TARGET_LABEL[item.target_type] ?? item.target_type}
          </span>

          {channels.map(ch => (
            <span key={ch} className={`px-2 py-0.5 rounded-lg text-[11px] font-medium
              ${CHANNEL_CFG[ch]?.color ?? "bg-gray-100 text-gray-600"}`}>
              {CHANNEL_CFG[ch]?.label ?? ch}
            </span>
          ))}

          {item.total_recipients > 0 && (
            <span className="ml-auto text-[11px] text-gray-400">
              👥 {item.total_recipients} recipient{item.total_recipients !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-gray-50 pt-2.5 flex items-center gap-1">

          {isDraft && (
            <button
              onClick={() => onEdit(item)}
              disabled={busy}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600
                hover:bg-blue-50 disabled:opacity-40 transition-colors"
            >
              {isEditingThis ? <><Spinner /> Loading…</> : "✏️ Edit"}
            </button>
          )}

          {isDraft && (
            <button
              onClick={() => onPublish(item)}
              disabled={busy}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-600
                hover:bg-emerald-50 disabled:opacity-40 transition-colors"
            >
              {isPublishingThis ? <><Spinner /> Publishing…</> : "🚀 Publish"}
            </button>
          )}

          <button
            onClick={() => onRecipients(item)}
            disabled={isPublishingThis || isDeletingThis}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-violet-600
              hover:bg-violet-50 disabled:opacity-40 transition-colors"
          >
            👁 Recipients
          </button>

          <button
            onClick={() => onDelete(item)}
            disabled={busy}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-red-500
              hover:bg-red-50 disabled:opacity-40 transition-colors ml-auto"
          >
            {isDeletingThis ? <><Spinner /> Deleting…</> : "🗑 Delete"}
          </button>

        </div>
      </div>
    </div>
  );
});

// ─── Main Component ───────────────────────────────────────────────────────────
const AnnouncementList = ({
  data = [],
  loading,
  page,
  pageSize,
  onPageChange,
  onCreate,
  onEdit,            // receives FRESH announcement from GET /announcements/{id}
  onRecipients,
  onMutationSuccess, // called after publish or delete — parent re-fetches list
}) => {
  const dispatch = useDispatch();

  const isPublishing    = useSelector(selectIsPublishing);
  const isDeleting      = useSelector(selectIsDeleting);
  const isLoadingDetail = useSelector(selectLoadingDetail);
  const publishError    = useSelector(selectPublishError);
  const deleteError     = useSelector(selectDeleteError);

  const [publishingId, setPublishingId] = useState(null);
  const [deletingId,   setDeletingId]   = useState(null);
  const [editingId,    setEditingId]    = useState(null);
  const [filter,       setFilter]       = useState("All");
  const [search,       setSearch]       = useState("");

  // Clear errors on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError("publishError"));
      dispatch(clearError("deleteError"));
    };
  }, [dispatch]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleEdit = useCallback(async (item) => {
    setEditingId(item.announcement_id);
    const result = await dispatch(fetchAnnouncementById(item.announcement_id));
    setEditingId(null);
    onEdit(result.error ? item : (result.payload?.data ?? item));
  }, [dispatch, onEdit]);

  const handlePublish = useCallback(async (item) => {
    setPublishingId(item.announcement_id);
    const result = await dispatch(publishAnnouncement(item.announcement_id));
    setPublishingId(null);
    if (!result.error) onMutationSuccess?.();
  }, [dispatch, onMutationSuccess]);

  // TODO: replace window.confirm with a proper confirm modal
  const handleDelete = useCallback(async (item) => {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    setDeletingId(item.announcement_id);
    const result = await dispatch(deleteAnnouncement(item.announcement_id));
    setDeletingId(null);
    if (!result.error) onMutationSuccess?.();
  }, [dispatch, onMutationSuccess]);

  // ── Client-side filter + search (on current page data) ───────────────────
  const visibleItems = useMemo(() => {
    return data.filter(item => {
      const matchFilter =
        filter === "All" ||
        item.status?.toLowerCase() === filter.toLowerCase();
      const matchSearch =
        !search.trim() ||
        item.title?.toLowerCase().includes(search.toLowerCase()) ||
        item.body?.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [data, filter, search]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div>

      {/* Publish error */}
      {publishError && (
        <div role="alert" className="mb-4 flex items-center justify-between rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm text-orange-700">
          <span>⚠ Publish failed: {publishError.message}</span>
          <button onClick={() => dispatch(clearError("publishError"))} className="ml-3 font-bold text-orange-400 hover:text-orange-600">×</button>
        </div>
      )}

      {/* Delete error */}
      {deleteError && (
        <div role="alert" className="mb-4 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          <span>⚠ Delete failed: {deleteError.message}</span>
          <button onClick={() => dispatch(clearError("deleteError"))} className="ml-3 font-bold text-red-400 hover:text-red-600">×</button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Announcements</h2>
          {!loading && (
            <p className="text-xs text-gray-400 mt-0.5">{data.length} total</p>
          )}
        </div>
        <button
          onClick={onCreate}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold
            rounded-xl hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
        >
          + Create
        </button>
      </div>

      {/* Filter tabs + search */}
      <div className="flex items-center gap-2 mb-5">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
              ${filter === f
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white text-gray-500 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600"}`}
          >
            {f}
          </button>
        ))}
        <input
          placeholder="Search…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="ml-auto px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white w-40
            placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
        />
      </div>

      {/* Card list */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-36 rounded-2xl bg-gray-100 animate-pulse"/>
          ))}
        </div>
      ) : visibleItems.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-sm font-medium">
            {search || filter !== "All" ? "No announcements match your filter." : "No announcements yet. Create one to get started."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {visibleItems.map(item => (
            <AnnouncementCard
              key={item.announcement_id}
              item={item}
              isEditingThis={isLoadingDetail && editingId    === item.announcement_id}
              isPublishingThis={isPublishing  && publishingId === item.announcement_id}
              isDeletingThis={isDeleting      && deletingId   === item.announcement_id}
              onEdit={handleEdit}
              onPublish={handlePublish}
              onDelete={handleDelete}
              onRecipients={onRecipients}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {onPageChange && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => onPageChange(p => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg
              disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-500">Page {page}</span>
          <button
            onClick={() => onPageChange(p => p + 1)}
            disabled={loading || data.length < pageSize}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg
              disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Next →
          </button>
        </div>
      )}

    </div>
  );
};

export default AnnouncementList;
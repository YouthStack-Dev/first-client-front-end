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
  const utc  = /Z|[+-]\d{2}:\d{2}$/.test(iso) ? iso : iso + "Z";
  const diff = Math.floor((Date.now() - new Date(utc)) / 1000);

  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ─── Config ────────────────────────────────────────────────────────────────────
const STATUS_CFG = {
  draft: {
    label: "Draft",
    pill: "bg-amber-50 text-amber-700 border border-amber-200",
    dot:  "bg-amber-400",
    bar:  "bg-amber-400",
  },
  published: {
    label: "Published",
    pill: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    dot:  "bg-emerald-500",
    bar:  "bg-emerald-500",
  },
  cancelled: {
    label: "Cancelled",
    pill: "bg-gray-100 text-gray-500 border border-gray-200",
    dot:  "bg-gray-400",
    bar:  "bg-gray-300",
  },
};

const CHANNEL_CFG = {
  push:   { label: "Push",   cls: "bg-blue-50 text-blue-700 border border-blue-100"     },
  in_app: { label: "In-App", cls: "bg-violet-50 text-violet-700 border border-violet-100" },
  sms:    { label: "SMS",    cls: "bg-green-50 text-green-700 border border-green-100"  },
  email:  { label: "Email",  cls: "bg-orange-50 text-orange-700 border border-orange-100" },
};

const TARGET_LABEL = {
  all_employees:      "All Employees",
  specific_employees: "Specific Employees",
  teams:              "Teams",
  all_drivers:        "All Drivers",
  vendor_drivers:     "Vendor Drivers",
  specific_drivers:   "Specific Drivers",
};

const CONTENT_TYPE_LABEL = {
  text:  "Text",
  image: "Image",
  video: "Video",
  audio: "Audio",
  pdf:   "PDF",
  link:  "Link",
};

const FILTERS = ["All", "Draft", "Published"];

// ─── Icons (inline SVG — no emoji) ────────────────────────────────────────────
const Icons = {
  Edit: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  Send: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  ),
  Eye: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  Trash: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  ),
  Users: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Target: () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  Search: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  Plus: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  ChevronLeft: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  Inbox: () => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
    </svg>
  ),
  Spinner: () => (
    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
    </svg>
  ),
};

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
  const status   = STATUS_CFG[item.status] ?? STATUS_CFG.draft;
  const isDraft  = item.status === "draft";
  const busy     = isEditingThis || isPublishingThis || isDeletingThis;
  const channels = normalizeChannels(item.channels);

  return (
    <div className="relative bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 overflow-hidden flex flex-col">

      {/* Top accent bar */}
      <div className={`h-[3px] w-full flex-shrink-0 ${status.bar}`} />

      <div className="flex flex-col flex-1 px-4 pt-3.5 pb-3 gap-2.5">

        {/* Row 1: status pill + content type + time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${status.pill}`}>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${status.dot}`} />
              {status.label}
            </span>
            {item.content_type && (
              <span className="text-[11px] text-gray-400 font-medium">
                {CONTENT_TYPE_LABEL[item.content_type] ?? item.content_type}
              </span>
            )}
          </div>
          <span className="text-[11px] text-gray-400 tabular-nums">{timeAgo(item.created_at)}</span>
        </div>

        {/* Row 2: Title */}
        <h3 className="text-sm font-semibold text-gray-900 leading-snug tracking-tight line-clamp-1">
          {item.title}
        </h3>

        {/* Row 3: Body preview */}
        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 -mt-1">
          {item.body}
        </p>

        {/* Row 4: Target + channels + recipients */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-50 text-gray-500 border border-gray-100 text-[11px] font-medium">
            <Icons.Target />
            {TARGET_LABEL[item.target_type] ?? item.target_type}
          </span>

          {channels.map(ch => (
            <span
              key={ch}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${CHANNEL_CFG[ch]?.cls ?? "bg-gray-50 text-gray-500 border border-gray-100"}`}
            >
              {CHANNEL_CFG[ch]?.label ?? ch}
            </span>
          ))}

          {item.total_recipients > 0 && (
            <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-gray-400">
              <Icons.Users />
              {item.total_recipients} recipient{item.total_recipients !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-50 -mx-4" />

        {/* Row 5: Actions */}
        <div className="flex items-center gap-0.5 -mb-0.5">

          {isDraft && (
            <button
              onClick={() => onEdit(item)}
              disabled={busy}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-40 transition-colors"
            >
              {isEditingThis ? <><Icons.Spinner /> Loading…</> : <><Icons.Edit /> Edit</>}
            </button>
          )}

          {isDraft && (
            <button
              onClick={() => onPublish(item)}
              disabled={busy}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-emerald-600 hover:bg-emerald-50 disabled:opacity-40 transition-colors"
            >
              {isPublishingThis ? <><Icons.Spinner /> Publishing…</> : <><Icons.Send /> Publish</>}
            </button>
          )}

          <button
            onClick={() => onRecipients(item)}
            disabled={isPublishingThis || isDeletingThis}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-violet-600 hover:bg-violet-50 disabled:opacity-40 transition-colors"
          >
            <Icons.Eye /> Recipients
          </button>

          <button
            onClick={() => onDelete(item)}
            disabled={busy}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 disabled:opacity-40 transition-colors ml-auto"
          >
            {isDeletingThis ? <><Icons.Spinner /> Deleting…</> : <><Icons.Trash /> Delete</>}
          </button>

        </div>
      </div>
    </div>
  );
});

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="h-[3px] bg-gray-100 animate-pulse" />
      <div className="px-4 pt-3.5 pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-5 w-20 bg-gray-100 rounded-full animate-pulse" />
          <div className="h-3 w-10 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
        <div className="space-y-1.5">
          <div className="h-3 w-full bg-gray-100 rounded animate-pulse" />
          <div className="h-3 w-2/3 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="flex gap-1.5">
          <div className="h-5 w-24 bg-gray-100 rounded-md animate-pulse" />
          <div className="h-5 w-14 bg-gray-100 rounded-md animate-pulse" />
          <div className="h-5 w-14 bg-gray-100 rounded-md animate-pulse" />
        </div>
        <div className="border-t border-gray-50" />
        <div className="flex gap-1">
          <div className="h-7 w-14 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-7 w-18 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-7 w-20 bg-gray-100 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const AnnouncementList = ({
  data = [],
  loading,
  page,
  pageSize,
  totalPages = 1,  // total number of pages — pass from parent (e.g. Math.ceil(totalCount / pageSize))
  onPageChange,
  onCreate,
  onEdit,
  onRecipients,
  onMutationSuccess,
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

  useEffect(() => {
    return () => {
      dispatch(clearError("publishError"));
      dispatch(clearError("deleteError"));
    };
  }, [dispatch]);

  // ── Handlers ──────────────────────────────────────────────────────────────
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

  // ── Filter + search ───────────────────────────────────────────────────────
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
          <span>Publish failed: {publishError.message}</span>
          <button
            onClick={() => dispatch(clearError("publishError"))}
            className="ml-3 text-orange-400 hover:text-orange-600 text-lg leading-none font-light"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* Delete error */}
      {deleteError && (
        <div role="alert" className="mb-4 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          <span>Delete failed: {deleteError.message}</span>
          <button
            onClick={() => dispatch(clearError("deleteError"))}
            className="ml-3 text-red-400 hover:text-red-600 text-lg leading-none font-light"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* Toolbar — Row 1: search + create */}
      <div className="flex items-center gap-3 mb-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Icons.Search />
          </span>
          <input
            placeholder="Search announcements…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 text-xs bg-white
              placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
          />
        </div>
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold
            rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap flex-shrink-0"
        >
          <Icons.Plus /> Create
        </button>
      </div>

      {/* Toolbar — Row 2: filter pills */}
      <div className="flex items-center gap-2 mb-5">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap
              ${filter === f
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700"
              }`}
          >
            {f}
            {!loading && f === "All" && (
              <span className={`ml-1.5 text-[10px] ${filter === f ? "text-gray-300" : "text-gray-400"}`}>
                {data.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Card grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : visibleItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-300">
          <Icons.Inbox />
          <p className="mt-3 text-sm font-medium text-gray-400">
            {search || filter !== "All"
              ? "No announcements match your filter."
              : "No announcements yet. Create one to get started."}
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
      {onPageChange && totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-6">

          {/* Prev */}
          <button
            onClick={() => onPageChange(p => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className="inline-flex items-center gap-1 px-3 h-8 text-xs font-medium border border-gray-200 rounded-lg
              disabled:opacity-35 hover:bg-gray-50 hover:border-gray-300 transition-colors text-gray-600"
          >
            <Icons.ChevronLeft /> Prev
          </button>

          {/* Page numbers with ellipsis */}
          {(() => {
            const pages = [];
            const delta = 1; // siblings around current page

            // Build the set of page numbers to show
            const range = new Set([
              1,
              totalPages,
              ...Array.from({ length: delta * 2 + 1 }, (_, i) => page - delta + i)
                .filter(p => p >= 1 && p <= totalPages),
            ]);

            const sorted = [...range].sort((a, b) => a - b);

            sorted.forEach((p, i) => {
              // Insert ellipsis if there's a gap
              if (i > 0 && p - sorted[i - 1] > 1) {
                pages.push(
                  <span key={`dots-${p}`} className="text-xs text-gray-400 px-1 select-none">…</span>
                );
              }
              pages.push(
                <button
                  key={p}
                  onClick={() => onPageChange(() => p)}
                  disabled={loading}
                  className={`inline-flex items-center justify-center h-8 w-8 text-xs font-medium rounded-lg transition-colors
                    ${p === page
                      ? "bg-indigo-600 text-white border border-indigo-600"
                      : "border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-35"
                    }`}
                >
                  {p}
                </button>
              );
            });

            return pages;
          })()}

          {/* Next */}
          <button
            onClick={() => onPageChange(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
            className="inline-flex items-center gap-1 px-3 h-8 text-xs font-medium border border-gray-200 rounded-lg
              disabled:opacity-35 hover:bg-gray-50 hover:border-gray-300 transition-colors text-gray-600"
          >
            Next <Icons.ChevronRight />
          </button>

        </div>
      )}

    </div>
  );
};

export default AnnouncementList;
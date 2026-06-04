import React, { useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, ChevronLeft, ChevronRight, Users } from "lucide-react";

import Modal from "@components/modals/Modal";
import DynamicTable from "../DynamicTable";

import { fetchAnnouncementRecipients } from "../../redux/features/notifications/announcementThunks";
import {
  selectRecipients,
  selectLoadingRecipients,
  selectRecipientsError,
  selectRecipientsMeta,
  selectRecipientsPage,
  clearRecipients,
  clearError,
  setRecipientsPage,
} from "../../redux/features/notifications/announcementsSlice";

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 50;

const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  delivered: "bg-blue-100   text-blue-800   border border-blue-200",
  failed: "bg-red-100    text-red-800    border border-red-200",
  no_device: "bg-gray-100   text-gray-600   border border-gray-200",
  read: "bg-green-100  text-green-800  border border-green-200",
};

const HEADERS = [
  { key: "recipient_user_id", label: "User ID", className: "w-16" },
  { key: "recipient_name", label: "Name", className: "w-32" },
  { key: "recipient_type", label: "Type", className: "w-20" },
  { key: "delivery_status", label: "Status", className: "w-28" },
  { key: "push_sent_at", label: "Push", className: "w-36" },
  { key: "sms_sent_at", label: "SMS", className: "w-36" },
  { key: "email_sent_at", label: "Email", className: "w-36" },
  { key: "read_at", label: "Read At", className: "w-36" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function DeliveryBadge({ status }) {
  const cls =
    STATUS_STYLES[status] ?? "bg-gray-100 text-gray-500 border border-gray-200";
  const label = status?.replace("_", " ") ?? "-";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${cls}`}
    >
      {label}
    </span>
  );
}

const fmtDate = (val) =>
  val
    ? new Date(val).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

// ─── Component ────────────────────────────────────────────────────────────────
const AnnouncementRecipients = ({ announcement, onClose }) => {
  const dispatch = useDispatch();

  const recipients = useSelector(selectRecipients) ?? [];
  const loadingRecipients = useSelector(selectLoadingRecipients);
  const recipientsError = useSelector(selectRecipientsError);
  const meta = useSelector(selectRecipientsMeta);
  const currentPage = useSelector(selectRecipientsPage) ?? 1;

  const announcementId = announcement?.announcement_id;

  useEffect(() => {
    dispatch(setRecipientsPage(1));
  }, [announcementId, dispatch]);

  useEffect(() => {
    if (!announcementId) return;
    dispatch(
      fetchAnnouncementRecipients({
        id: announcementId,
        params: { page: currentPage, page_size: PAGE_SIZE },
      }),
    );
    return () => {
      dispatch(clearRecipients());
      dispatch(clearError("recipientsError"));
    };
  }, [announcementId, currentPage, dispatch]);

  const formattedData = useMemo(
    () =>
      recipients.map((r) => ({
        ...r,
        recipient_name: r.recipient_name ?? "-",
        delivery_status: <DeliveryBadge status={r.delivery_status} />,
        push_sent_at: fmtDate(r.push_sent_at),
        sms_sent_at: fmtDate(r.sms_sent_at),
        email_sent_at: fmtDate(r.email_sent_at),
        read_at: fmtDate(r.read_at),
      })),
    [recipients],
  );

  const goTo = useCallback(
    (page) => dispatch(setRecipientsPage(page)),
    [dispatch],
  );

  const hasPagination = meta && meta.total_pages > 1;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Recipients — ${announcement?.title ?? ""}`}
      size="xl"
    >
      {/* Error banner */}
      {recipientsError && (
        <div
          role="alert"
          className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <span>⚠ {recipientsError.message}</span>
          <button
            onClick={() => dispatch(clearError("recipientsError"))}
            className="ml-3 text-red-400 hover:text-red-600"
            aria-label="Dismiss error"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Summary + pagination bar */}
      {!loadingRecipients && !recipientsError && meta && (
        <div className="mb-3 flex items-center justify-between rounded-lg bg-gray-50 border border-gray-200 px-4 py-2">
          {/* Left: total count */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users size={15} className="text-gray-400" />
            <span>
              <span className="font-semibold text-gray-800">{meta.total}</span>{" "}
              recipient{meta.total !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Right: pagination — only when more than one page */}
          {hasPagination && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <button
                onClick={() => goTo(currentPage - 1)}
                disabled={!meta.has_prev || loadingRecipients}
                className="flex items-center gap-1 px-2 py-1 rounded-md border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition-colors"
              >
                <ChevronLeft size={14} /> Prev
              </button>

              <span className="px-3 py-1 text-xs text-gray-500">
                {meta.page} / {meta.total_pages}
              </span>

              <button
                onClick={() => goTo(currentPage + 1)}
                disabled={!meta.has_next || loadingRecipients}
                className="flex items-center gap-1 px-2 py-1 rounded-md border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition-colors"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Table — showPagination=false suppresses DynamicTable's own Prev/Next */}
      <DynamicTable
        headers={HEADERS}
        data={formattedData}
        loading={loadingRecipients}
        emptyMessage="No recipients found for this announcement."
        showActions={false}
        showPagination={false}
        showCheckbox={false}
      />
    </Modal>
  );
};

export default AnnouncementRecipients;

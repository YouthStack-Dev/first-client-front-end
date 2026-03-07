
import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector }   from "react-redux";
import { X }                          from "lucide-react";

import Modal        from "@components/modals/Modal";
import DynamicTable from "../DynamicTable";

import { fetchAnnouncementRecipients } from "../../redux/features/notifications/announcementThunks";
import {
  selectRecipients,
  selectLoadingRecipients,
  selectRecipientsError,
  clearRecipients,
  clearError,
} from "../../redux/features/notifications/announcementsSlice";

// ─── Constants ──────────────────────────────────────────────────────────────────
const PAGE_SIZE = 50;

const STATUS_STYLES = {
  pending:   "bg-yellow-100 text-yellow-700",
  delivered: "bg-blue-100   text-blue-700",
  failed:    "bg-red-100    text-red-700",
  no_device: "bg-gray-100   text-gray-600",
  read:      "bg-green-100  text-green-700",
};

const HEADERS = [
  { key: "recipient_user_id", label: "User ID"    },
  { key: "recipient_type",    label: "Type"       },
  { key: "delivery_status",   label: "Status"     },
  { key: "push_sent_at",      label: "Push Sent"  },
  { key: "sms_sent_at",       label: "SMS Sent"   },
  { key: "email_sent_at",     label: "Email Sent" },
  { key: "read_at",           label: "Read At"    },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function DeliveryBadge({ status }) {
  const cls = STATUS_STYLES[status] ?? "bg-gray-100 text-gray-500";
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
      {status ?? "-"}
    </span>
  );
}

const fmtDate = (val) => val ? new Date(val).toLocaleString() : "-";

// ─── Component ─────────────────────────────────────────────────────────────────
const AnnouncementRecipients = ({ announcement, onClose }) => {
  const dispatch = useDispatch();

  // Fix 6: fallback to [] — selectRecipients may return undefined before hydration
  const recipients        = useSelector(selectRecipients) ?? [];
  const loadingRecipients = useSelector(selectLoadingRecipients);
  const recipientsError   = useSelector(selectRecipientsError);

  const announcementId = announcement?.announcement_id;

  // Fix 3 + 4: dep narrowed to ID (not whole object); fetch and cleanup
  // are the same lifecycle so they belong in one effect.
  useEffect(() => {
    if (!announcementId) return;

    dispatch(
      fetchAnnouncementRecipients({
        id:     announcementId,
        params: { page: 1, page_size: PAGE_SIZE },
      })
    );

    return () => {
      dispatch(clearRecipients());
      dispatch(clearError("recipientsError"));
    };
  }, [announcementId, dispatch]);

  // Fix 1: memoized — was re-running on every render including unrelated ones
  const formattedData = useMemo(
    () => recipients.map((r) => ({
      ...r,
      delivery_status: <DeliveryBadge status={r.delivery_status} />,
      push_sent_at:    fmtDate(r.push_sent_at),
      sms_sent_at:     fmtDate(r.sms_sent_at),
      email_sent_at:   fmtDate(r.email_sent_at),
      read_at:         fmtDate(r.read_at),
    })),
    [recipients]
  );

  const hitPageCap = recipients.length === PAGE_SIZE;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    // Fix 8: isOpen={true} → isOpen (implicit true)
    <Modal
      isOpen
      onClose={onClose}
      title={`Recipients — ${announcement?.title ?? ""}`}
      size="xl"
    >
      {/* Fix 5: error banner now dismissible, consistent with rest of codebase */}
      {recipientsError && (
        <div role="alert"
          className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>⚠ {recipientsError.message}</span>
          <button
            onClick={() => dispatch(clearError("recipientsError"))}
            className="ml-3 text-red-400 hover:text-red-600"
            aria-label="Dismiss error"
          >
            <X size={14}/>
          </button>
        </div>
      )}

      {!loadingRecipients && !recipientsError && recipients.length > 0 && (
        <div className="mb-3 flex items-center gap-3">
          <p className="text-sm text-gray-500">
            {recipients.length} recipient{recipients.length !== 1 ? "s" : ""}
          </p>
          {/* Fix 7: warn user if results may be truncated */}
          {hitPageCap && (
            <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              Showing first {PAGE_SIZE} — more may exist
            </span>
          )}
        </div>
      )}

      <DynamicTable
        headers={HEADERS}
        data={formattedData}
        loading={loadingRecipients}
        emptyMessage="No recipients found for this announcement."
        showActions={false}
      />
    </Modal>
  );
};

export default AnnouncementRecipients;
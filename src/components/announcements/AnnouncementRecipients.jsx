import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

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

const STATUS_STYLES = {
  pending:   "bg-yellow-100 text-yellow-700",
  delivered: "bg-blue-100   text-blue-700",
  failed:    "bg-red-100    text-red-700",
  no_device: "bg-gray-100   text-gray-600",
  read:      "bg-green-100  text-green-700",
};

function DeliveryBadge({ status }) {
  const cls = STATUS_STYLES[status] ?? "bg-gray-100 text-gray-500";
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
      {status ?? "-"}
    </span>
  );
}

const HEADERS = [
  { key: "recipient_user_id", label: "User ID"    },
  { key: "recipient_type",    label: "Type"       },
  { key: "delivery_status",   label: "Status"     },
  { key: "push_sent_at",      label: "Push Sent"  },
  { key: "sms_sent_at",       label: "SMS Sent"   },
  { key: "email_sent_at",     label: "Email Sent" },
  { key: "read_at",           label: "Read At"    },
];

const AnnouncementRecipients = ({ announcement, onClose }) => {
  const dispatch = useDispatch();

  const recipients        = useSelector(selectRecipients);
  const loadingRecipients = useSelector(selectLoadingRecipients);
  const recipientsError   = useSelector(selectRecipientsError);


  useEffect(() => {
    if (!announcement?.announcement_id) return;
    dispatch(
      fetchAnnouncementRecipients({
        id:     announcement.announcement_id,
        params: { page: 1, page_size: 50 },
      })
    );
  }, [announcement, dispatch]);


  useEffect(() => {
    return () => {
      dispatch(clearRecipients());
      dispatch(clearError("recipientsError"));
    };
  }, [dispatch]);


  const formattedData = recipients.map((r) => ({
    ...r,
    delivery_status: <DeliveryBadge status={r.delivery_status} />,
    push_sent_at:    r.push_sent_at  ? new Date(r.push_sent_at).toLocaleString()  : "-",
    sms_sent_at:     r.sms_sent_at   ? new Date(r.sms_sent_at).toLocaleString()   : "-",
    email_sent_at:   r.email_sent_at ? new Date(r.email_sent_at).toLocaleString() : "-",
    read_at:         r.read_at       ? new Date(r.read_at).toLocaleString()        : "-",
  }));


  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Recipients — ${announcement?.title ?? ""}`}
      size="xl"
    >
      {recipientsError && (
        <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          ⚠ {recipientsError.message}
        </div>
      )}

      {!loadingRecipients && !recipientsError && recipients.length > 0 && (
        <p className="mb-3 text-sm text-gray-500">
          {recipients.length} recipient{recipients.length !== 1 ? "s" : ""}
        </p>
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
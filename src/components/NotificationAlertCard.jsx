import {
  AlertTriangle,
  MapPin,
  Clock,
  User,
  CheckCircle,
  Send,
  Mail,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Calendar,
  Phone,
  Map,
  Eye,
  Check,
  RefreshCw,
  Bell,
  Activity,
  ShieldAlert,
  AlertCircle,
  Info,
  MessageSquare,
  AlertOctagon,
  ClockIcon,
} from "lucide-react";
import { useState } from "react";

export const NotificationAlertCard = ({ alert, onAction }) => {
  const [expanded, setExpanded] = useState(false);

  const {
    alert_id,
    alert_type,
    severity,
    status,
    trigger_notes,
    triggered_at,
    employee_id,
    booking_id,
    trigger_latitude,
    trigger_longitude,
    notifications = [],
    acknowledged_at,
    acknowledged_by_name,
    updated_at,
  } = alert;

  const formatDateTime = (dateString) => {
    if (!dateString) return { date: "", time: "", relative: "" };
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      relative: getRelativeTime(date),
    };
  };

  const getRelativeTime = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const { time, relative } = formatDateTime(triggered_at);

  const getAlertTypeIcon = (type) => {
    switch (type) {
      case "SAFETY":
        return { icon: ShieldAlert, color: "text-red-500", bg: "bg-red-100" };
      case "SECURITY":
        return { icon: AlertCircle, color: "text-orange-500", bg: "bg-orange-100" };
      case "EMERGENCY":
        return { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-100" };
      default:
        return { icon: Info, color: "text-blue-500", bg: "bg-blue-100" };
    }
  };

  const severityStyles = {
    CRITICAL: {
      bg: "bg-red-100",
      border: "border-red-200",
      text: "text-red-700",
      icon: "text-red-500",
      badge: "bg-red-500 text-white",
      dot: "bg-red-500",
      lightBadge: "bg-red-100 text-red-800",
      actionBtn: "bg-red-600 hover:bg-red-700 text-white",
    },
    HIGH: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      text: "text-orange-700",
      icon: "text-orange-500",
      badge: "bg-orange-500 text-white",
      dot: "bg-orange-500",
      lightBadge: "bg-orange-100 text-orange-800",
      actionBtn: "bg-orange-600 hover:bg-orange-700 text-white",
    },
    MEDIUM: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-700",
      icon: "text-yellow-500",
      badge: "bg-yellow-500 text-white",
      dot: "bg-yellow-500",
      lightBadge: "bg-yellow-100 text-yellow-800",
      actionBtn: "bg-yellow-600 hover:bg-yellow-700 text-white",
    },
    LOW: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
      icon: "text-blue-500",
      badge: "bg-blue-500 text-white",
      dot: "bg-blue-500",
      lightBadge: "bg-blue-100 text-blue-800",
      actionBtn: "bg-blue-600 hover:bg-blue-700 text-white",
    },
  };

  const statusStyles = {
    TRIGGERED: {
      bg: "bg-red-100",
      text: "text-red-800",
      icon: AlertTriangle,
      badge: "bg-red-500 text-white",
    },
    ACKNOWLEDGED: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      icon: CheckCircle,
      badge: "bg-blue-500 text-white",
    },
    IN_PROGRESS: {
      bg: "bg-purple-100",
      text: "text-purple-800",
      icon: Activity,
      badge: "bg-purple-500 text-white",
    },
    RESOLVED: {
      bg: "bg-teal-100",
      text: "text-teal-800",
      icon: CheckCircle,
      badge: "bg-teal-500 text-white",
    },
    CLOSED: {
      bg: "bg-green-100",
      text: "text-green-800",
      icon: CheckCircle,
      badge: "bg-green-500 text-white",
    },
    FALSE_ALARM: {
      bg: "bg-gray-100",
      text: "text-gray-800",
      icon: AlertCircle,
      badge: "bg-gray-500 text-white",
    },
  };

  const severityStyle = severityStyles[severity] || severityStyles.CRITICAL;
  const statusStyle = statusStyles[status] || statusStyles.TRIGGERED;
  const StatusIcon = statusStyle.icon;
  const AlertTypeIcon = getAlertTypeIcon(alert_type).icon;
  const alertTypeColor = getAlertTypeIcon(alert_type).color;

  const notificationStats = {
    total: notifications.length,
    sent: notifications.filter((n) => n.status === "SENT").length,
    failed: notifications.filter((n) => n.status === "FAILED").length,
    pending: notifications.filter((n) => n.status === "PENDING").length,
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case "EMAIL":
        return { icon: Mail, color: "text-blue-500", bg: "bg-blue-100" };
      case "SMS":
        return { icon: Smartphone, color: "text-green-500", bg: "bg-green-100" };
      case "PUSH":
        return { icon: Bell, color: "text-purple-500", bg: "bg-purple-100" };
      case "WHATSAPP":
        return { icon: MessageSquare, color: "text-green-600", bg: "bg-green-100" };
      default:
        return { icon: Send, color: "text-gray-500", bg: "bg-gray-100" };
    }
  };

  const handleAction = (action) => {
    if (onAction) onAction(action, alert);
  };

  const handleViewLocation = () => {
    if (trigger_latitude && trigger_longitude) {
      window.open(
        `https://maps.google.com/?q=${trigger_latitude},${trigger_longitude}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  const getAllActionButtons = () => {
    const actions = [];

    switch (status) {
      case "TRIGGERED":
        actions.push(
          {
            label: "Acknowledge",
            icon: Check,
            onClick: () => handleAction("acknowledge"),
            className: "bg-green-600 hover:bg-green-700 text-white",
          },
          {
            label: "Escalate",
            icon: AlertOctagon,
            onClick: () => handleAction("escalate"),
            className: "bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200",
          },
          {
            label: "Close Alert",
            icon: AlertOctagon,
            onClick: () => handleAction("closealert"),
            className: "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200",
          }
        );
        break;

      case "ACKNOWLEDGED":
        actions.push(
          {
            label: "Escalate",
            icon: AlertOctagon,
            onClick: () => handleAction("escalate"),
            className: "bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200",
          },
          {
            label: "Close Alert",
            icon: AlertOctagon,
            onClick: () => handleAction("closealert"),
            className: "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200",
          }
        );
        break;

      case "IN_PROGRESS":
        actions.push(
          {
            label: "Escalate",
            icon: AlertOctagon,
            onClick: () => handleAction("escalate"),
            className: "bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200",
          },
          {
            label: "Close Alert",
            icon: AlertOctagon,
            onClick: () => handleAction("closealert"),
            className: "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200",
          }
        );
        break;

      case "RESOLVED":
        actions.push(
          {
            label: "Close Alert",
            icon: AlertOctagon,
            onClick: () => handleAction("closealert"),
            className: "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200",
          }
        );
        break;

      case "CLOSED":
      case "FALSE_ALARM":
      default:
        break;
    }

    // View Location — always shown if coordinates exist
    if (trigger_latitude && trigger_longitude) {
      actions.push({
        label: "View Location",
        icon: MapPin,
        onClick: handleViewLocation,
        className: "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200",
      });
    }

    // ── Timeline — always shown for every alert ──
    actions.push({
      label: "Timeline",
      icon: ClockIcon,
      onClick: () => handleAction("timeline"),
      className: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200",
    });

    return actions;
  };

  return (
    <div
      className={`${severityStyle.bg} ${severityStyle.border} border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden bg-app-surface`}
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {/* Severity dot */}
            <div className="pt-1">
              <div className={`w-2 h-2 rounded-full ${severityStyle.dot}`}></div>
            </div>

            {/* Alert Info */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${getAlertTypeIcon(alert_type).bg}`}>
                      <AlertTypeIcon className={`h-5 w-5 ${alertTypeColor}`} />
                    </div>
                    <span className="font-bold text-app-text-primary">
                      {alert_type} Alert
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`${severityStyle.badge} px-2 py-0.5 rounded-full text-xs font-semibold`}>
                      {severity}
                    </span>
                    <span className={`${statusStyle.badge} px-2 py-0.5 rounded-full text-xs font-semibold`}>
                      {status}
                    </span>
                  </div>
                </div>

                {/* Expand/Collapse */}
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="p-2 hover:bg-app-tertiary rounded-lg transition-colors"
                  aria-label={expanded ? "Collapse details" : "Expand details"}
                >
                  {expanded ? (
                    <ChevronUp className="h-4 w-4 text-app-text-muted" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-app-text-muted" />
                  )}
                </button>
              </div>

              <p className="text-app-text-secondary mb-3">{trigger_notes}</p>

              {/* Quick Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-app-text-muted">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>Employee #{employee_id}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Booking #{booking_id}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bell className="h-4 w-4" />
                  <span>{notificationStats.sent}/{notificationStats.total} sent</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{relative}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 pb-3 flex flex-wrap items-center gap-2 border-b border-app-border">
        {getAllActionButtons().map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${action.className} hover:scale-[1.02] active:scale-[0.98]`}
          >
            <action.icon className="h-4 w-4" />
            {action.label}
          </button>
        ))}
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-app-border bg-app-surface">
          <div className="p-6">
            <div className="grid gap-6 mb-6">
              {/* Notifications Section */}
              <div>
                <h4 className="text-sm font-semibold text-app-text-primary mb-3 flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications
                  <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {notifications.length}
                  </span>
                </h4>

                {notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.map((notification) => {
                      const channelInfo = getChannelIcon(notification.channel);
                      const ChannelIcon = channelInfo.icon;
                      const isFailed = notification.status === "FAILED";
                      const isPending = notification.status === "PENDING";

                      return (
                        <div
                          key={notification.notification_id}
                          className={`p-3 rounded-lg border ${
                            isFailed
                              ? "border-red-200 bg-red-50"
                              : isPending
                              ? "border-yellow-200 bg-yellow-50"
                              : "border-green-200 bg-green-50"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${channelInfo.bg} ${channelInfo.color}`}>
                                <ChannelIcon className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-medium text-app-text-primary">
                                  {notification.recipient_name}
                                </p>
                                <p className="text-xs text-app-text-muted">
                                  {notification.recipient_role}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                isFailed
                                  ? "bg-red-100 text-red-800"
                                  : isPending
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {notification.status}
                            </span>
                          </div>
                          <div className="text-sm text-app-text-secondary mt-2">
                            {notification.message_preview ||
                              `Notification sent via ${notification.channel}`}
                          </div>
                          {notification.failure_reason && (
                            <p className="text-sm text-red-600 mt-2">
                              <span className="font-medium">Error:</span>{" "}
                              {notification.failure_reason}
                            </p>
                          )}
                          {notification.sent_at && (
                            <p className="text-xs text-app-text-muted mt-2">
                              Sent: {formatDateTime(notification.sent_at).time}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      No notifications sent for this alert
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
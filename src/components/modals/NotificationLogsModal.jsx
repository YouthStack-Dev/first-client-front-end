// NotificationLogsModal.jsx
import React, {
  useState, useEffect, useCallback, useRef, useMemo,
} from "react";
import { createPortal } from "react-dom";
import {
  X, Loader2, AlertCircle, Mail, MessageSquare,
  Bell, ChevronDown, ChevronUp, User, FileText,
  RefreshCw, Clock, Send, RotateCcw, Car, Hash,
} from "lucide-react";
import { API_CLIENT } from "../../Api/API_Client";
import { logError } from "../../utils/logger";

// ─────────────────────────────────────────────────────────────────────────────
// Constants — original colors preserved
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_COLOR = {
  sent:     { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0", dot: "#22c55e" },
  failed:   { bg: "#fef2f2", text: "#b91c1c", border: "#fecaca", dot: "#ef4444" },
  no_email: { bg: "#f8fafc", text: "#64748b", border: "#e2e8f0", dot: "#94a3b8" },
  no_phone: { bg: "#f8fafc", text: "#64748b", border: "#e2e8f0", dot: "#94a3b8" },
  default:  { bg: "#fffbeb", text: "#92400e", border: "#fde68a", dot: "#f59e0b" },
};

const TRIGGER_META = {
  dispatch:           { label: "Dispatch",          icon: Send,      bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
  resend:             { label: "Resend",             icon: RotateCcw, bg: "#fdf4ff", text: "#7c3aed", border: "#e9d5ff" },
  vehicle_assignment: { label: "Vehicle Assignment", icon: Car,       bg: "#fff7ed", text: "#c2410c", border: "#fed7aa" },
};

const PILL_BASE_STYLE = {
  display: "inline-flex", alignItems: "center", gap: 4,
  fontSize: 11, fontWeight: 700, padding: "4px 9px", borderRadius: 20,
  whiteSpace: "nowrap", maxWidth: 220,
  overflow: "hidden", textOverflow: "ellipsis",
};

// ─────────────────────────────────────────────────────────────────────────────
// Pure helpers
// ─────────────────────────────────────────────────────────────────────────────
const getStatusStyle = (s) => {
  if (!s) return STATUS_COLOR.default;
  if (s === "sent") return STATUS_COLOR.sent;
  if (s.startsWith("failed") || s.startsWith("error")) return STATUS_COLOR.failed;
  if (s === "no_email") return STATUS_COLOR.no_email;
  if (s === "no_phone") return STATUS_COLOR.no_phone;
  return STATUS_COLOR.default;
};

const formatStatus = (s) => (s ? s.replace(/_/g, " ").toLowerCase() : "—");

const formatTs = (ts) => {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("en-IN", {
    day: "2-digit", month: "short",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
};

const sumFailed = (email, sms, push) =>
  (email?.failed ?? 0) + (sms?.failed ?? 0) + (push?.failed ?? 0);

const buildTenantQs = (tenantId) => {
  if (!tenantId) return "";
  return `?${new URLSearchParams({ tenant_id: tenantId })}`;
};

// Group logs by route_id — same-route dispatches share one card
const groupLogsByRoute = (logs) => {
  const map = new Map();
  for (const log of logs) {
    if (!map.has(log.route_id)) {
      map.set(log.route_id, {
        route_id:   log.route_id,
        route_code: log.route_code,
        dispatches: [],
      });
    }
    map.get(log.route_id).dispatches.push(log);
  }
  return Array.from(map.values());
};

// ─────────────────────────────────────────────────────────────────────────────
// StatusPill — original
// ─────────────────────────────────────────────────────────────────────────────
const StatusPill = React.memo(({ status, icon: Icon }) => {
  const c = getStatusStyle(status);
  return (
    <span
      title={status ?? "—"}
      style={{
        ...PILL_BASE_STYLE,
        border: `1px solid ${c.border}`,
        background: c.bg,
        color: c.text,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      <Icon size={10} style={{ flexShrink: 0 }} aria-hidden="true" />
      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
        {formatStatus(status)}
      </span>
    </span>
  );
});
StatusPill.displayName = "StatusPill";

// ─────────────────────────────────────────────────────────────────────────────
// ChannelBar — original
// ─────────────────────────────────────────────────────────────────────────────
const ChannelBar = React.memo(({ label, icon: Icon, sent, failed, color }) => {
  const total = sent + failed;
  const pct   = total > 0 ? Math.round((sent / total) * 100) : 0;
  return (
    <div style={{
      flex: 1, padding: "14px 16px", borderRadius: 10,
      background: "#f8fafc", border: "1px solid #e2e8f0",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#64748b", fontWeight: 600 }}>
          <Icon size={13} color={color} aria-hidden="true" /> {label}
        </div>
        <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>{pct}%</span>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: "#15803d" }}>{sent} sent</span>
        {failed > 0 && (
          <span style={{ fontSize: 15, fontWeight: 800, color: "#ef4444" }}>{failed} failed</span>
        )}
      </div>
      <div style={{ height: 6, borderRadius: 6, background: "#e2e8f0", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`, background: color,
          borderRadius: 6, transition: "width 0.4s",
        }} />
      </div>
    </div>
  );
});
ChannelBar.displayName = "ChannelBar";

// ─────────────────────────────────────────────────────────────────────────────
// TriggerBadge — original
// ─────────────────────────────────────────────────────────────────────────────
const TriggerBadge = React.memo(({ triggeredBy }) => {
  const meta = TRIGGER_META[triggeredBy] ?? {
    label: triggeredBy ?? "Unknown",
    icon: FileText,
    bg: "#f8fafc", text: "#64748b", border: "#e2e8f0",
  };
  const Icon = meta.icon;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
      border: `1px solid ${meta.border}`, background: meta.bg, color: meta.text,
    }}>
      <Icon size={11} aria-hidden="true" /> {meta.label}
    </span>
  );
});
TriggerBadge.displayName = "TriggerBadge";

// ─────────────────────────────────────────────────────────────────────────────
// EmployeeRow — original
// ─────────────────────────────────────────────────────────────────────────────
const EmployeeRow = React.memo(({ d }) => {
  const hasName  = !!d.employee_name;
  const hasEmpId = d.employee_id != null;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "10px 14px", borderRadius: 8,
      background: "#fff", border: "1px solid #e2e8f0", minHeight: 50,
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 8, flexShrink: 0,
        background: "#f1f5f9", border: "1px solid #e2e8f0",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <User size={15} color="#94a3b8" aria-hidden="true" />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13,
          fontWeight: hasName ? 700 : 400,
          color: hasName ? "#1e293b" : "#94a3b8",
          fontStyle: hasName ? "normal" : "italic",
          marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {hasName ? d.employee_name : "—"}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {hasEmpId ? (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 3,
              background: "#eff6ff", color: "#3b82f6",
              border: "1px solid #bfdbfe", borderRadius: 5,
              padding: "1px 6px", fontSize: 11, fontWeight: 600,
            }}>
              <User size={9} aria-hidden="true" /> Emp {d.employee_id}
            </span>
          ) : (
            <span style={{ fontSize: 11, color: "#cbd5e1", fontStyle: "italic" }}>Emp —</span>
          )}
          {d.booking_id != null && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 3,
              background: "#f8fafc", color: "#64748b",
              border: "1px solid #e2e8f0", borderRadius: 5,
              padding: "1px 6px", fontSize: 11, fontWeight: 600,
            }}>
              <Hash size={9} aria-hidden="true" /> Booking {d.booking_id}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
        <StatusPill status={d.email_status} icon={Mail} />
        <StatusPill status={d.sms_status}   icon={MessageSquare} />
        <StatusPill status={d.push_status}  icon={Bell} />
      </div>
    </div>
  );
});
EmployeeRow.displayName = "EmployeeRow";

// ─────────────────────────────────────────────────────────────────────────────
// DispatchBlock — a single dispatch entry shown inside an expanded RouteGroupCard
// No collapse here — just displays the dispatch info + all employee rows flat
// ─────────────────────────────────────────────────────────────────────────────
const DispatchBlock = React.memo(({ log, isLast }) => {
  const details  = useMemo(() => log.details ?? [], [log.details]);
  const hasIssue = useMemo(
    () => sumFailed(log.email, log.sms, log.push) > 0,
    [log.email, log.sms, log.push],
  );

  return (
    <div style={{
      borderRadius: 8,
      border: `1px solid ${hasIssue ? "#fde68a" : "#e2e8f0"}`,
      background: hasIssue ? "#fffdf5" : "#fafafa",
      overflow: "hidden",
      marginBottom: isLast ? 0 : 10,
    }}>
      {/* Dispatch meta row */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 14px",
        borderBottom: details.length > 0 ? "1px solid #f1f5f9" : "none",
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
            <TriggerBadge triggeredBy={log.triggered_by} />
            <span style={{
              fontSize: 11, fontWeight: 600, color: "#94a3b8",
              background: "#f8fafc", border: "1px solid #e2e8f0",
              borderRadius: 5, padding: "1px 6px",
            }}>
              log #{log.id}
            </span>
          </div>
          <div style={{
            fontSize: 12, color: "#64748b", marginTop: 5,
            display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap",
          }}>
            <Clock size={11} aria-hidden="true" />
            <span>{formatTs(log.created_at)}</span>
            <span style={{ color: "#cbd5e1" }}>·</span>
            <User size={11} aria-hidden="true" />
            <span>
              {log.total_employees ?? details.length}{" "}
              employee{(log.total_employees ?? details.length) !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Channel chips */}
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
          {[
            { Icon: Mail,          val: log.email?.sent ?? 0, fail: log.email?.failed ?? 0 },
            { Icon: MessageSquare, val: log.sms?.sent   ?? 0, fail: log.sms?.failed   ?? 0 },
            { Icon: Bell,          val: log.push?.sent  ?? 0, fail: log.push?.failed  ?? 0 },
          ].map(({ Icon, val, fail }, i) => (
            <span key={i} style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              fontSize: 12, fontWeight: 600,
              color:      fail > 0 ? "#b91c1c" : "#15803d",
              background: fail > 0 ? "#fef2f2" : "#f0fdf4",
              border:     `1px solid ${fail > 0 ? "#fecaca" : "#bbf7d0"}`,
              borderRadius: 7, padding: "4px 10px",
            }}>
              <Icon size={11} aria-hidden="true" /> {val}
              {fail > 0 && <span style={{ color: "#ef4444" }}>/{fail}✗</span>}
            </span>
          ))}
        </div>
      </div>

      {/* Per-employee rows */}
      {details.length > 0 && (
        <div style={{ padding: "10px 14px 12px" }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: "#94a3b8",
            marginBottom: 7, letterSpacing: "0.05em",
          }}>
            PER-EMPLOYEE DELIVERY ({details.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {details.map((d, i) => (
              <EmployeeRow key={d.booking_id ?? d.employee_id ?? i} d={d} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
DispatchBlock.displayName = "DispatchBlock";

// ─────────────────────────────────────────────────────────────────────────────
// RouteGroupCard — ONE card per route
// ► Click the card header to expand / collapse ALL dispatches for that route
// ─────────────────────────────────────────────────────────────────────────────
const RouteGroupCard = React.memo(({ group, onRedispatch, isRedispatching = false }) => {
  const { route_id, route_code, dispatches } = group;
  const [expanded, setExpanded] = useState(false);
  const toggleExpand = useCallback(() => setExpanded((v) => !v), []);

  // Aggregate channel totals across all dispatches in this route
  const totals = useMemo(() => dispatches.reduce(
    (acc, log) => ({
      emailSent:   acc.emailSent   + (log.email?.sent   ?? 0),
      emailFailed: acc.emailFailed + (log.email?.failed ?? 0),
      smsSent:     acc.smsSent     + (log.sms?.sent     ?? 0),
      smsFailed:   acc.smsFailed   + (log.sms?.failed   ?? 0),
      pushSent:    acc.pushSent    + (log.push?.sent    ?? 0),
      pushFailed:  acc.pushFailed  + (log.push?.failed  ?? 0),
    }),
    { emailSent: 0, emailFailed: 0, smsSent: 0, smsFailed: 0, pushSent: 0, pushFailed: 0 },
  ), [dispatches]);

  const hasAnyIssue = (totals.emailFailed + totals.smsFailed + totals.pushFailed) > 0;
  const totalEmployees = useMemo(
    () => dispatches.reduce((s, l) => s + (l.total_employees ?? l.details?.length ?? 0), 0),
    [dispatches],
  );

  return (
    <div style={{
      borderRadius: 10,
      border: `1px solid ${hasAnyIssue ? "#fde68a" : "#e2e8f0"}`,
      background: "#fff",
      overflow: "hidden",
    }}>
      {/* ── Clickable route header ── */}
      <div
        role="button"
        tabIndex={0}
        onClick={toggleExpand}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggleExpand()}
        aria-expanded={expanded}
        style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "13px 16px", cursor: "pointer", outline: "none",
          background: hasAnyIssue ? "#fffbeb" : "#fff",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Route ID + code */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              fontSize: 15, fontWeight: 800, color: "#1e293b",
            }}>
              <Hash size={13} color="#6366f1" aria-hidden="true" />
              Route {route_id}
            </span>
            {route_code && (
              <span style={{
                fontSize: 11, fontWeight: 600, color: "#94a3b8",
                background: "#f1f5f9", border: "1px solid #e2e8f0",
                borderRadius: 6, padding: "2px 7px",
              }}>
                {route_code}
              </span>
            )}
          </div>

          {/* Dispatch count + employee count */}
          <div style={{
            fontSize: 12, color: "#64748b", marginTop: 5,
            display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap",
          }}>
            <FileText size={11} aria-hidden="true" />
            <span>{dispatches.length} dispatch{dispatches.length !== 1 ? "es" : ""}</span>
            <span style={{ color: "#cbd5e1" }}>·</span>
            <User size={11} aria-hidden="true" />
            <span>{totalEmployees} employee{totalEmployees !== 1 ? "s" : ""}</span>
          </div>
        </div>

        {/* Aggregated channel chips */}
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRedispatch?.({ routeId: route_id, routeCode: route_code });
            }}
            disabled={isRedispatching}
            title={isRedispatching ? "Redispatching..." : "Redispatch this route"}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "5px 10px", borderRadius: 7,
              border: "1px solid #e9d5ff",
              background: isRedispatching ? "#f8fafc" : "#fdf4ff",
              color: isRedispatching ? "#94a3b8" : "#7c3aed",
              fontSize: 12, fontWeight: 700, fontFamily: "inherit",
              cursor: isRedispatching ? "not-allowed" : "pointer",
              opacity: isRedispatching ? 0.75 : 1,
              whiteSpace: "nowrap",
            }}
          >
            {isRedispatching
              ? <Loader2 size={12} style={{ animation: "nlSpin 0.8s linear infinite" }} aria-hidden="true" />
              : <RotateCcw size={12} aria-hidden="true" />
            }
            {isRedispatching ? "Redispatching..." : "Redispatch"}
          </button>

          {[
            { Icon: Mail,          val: totals.emailSent, fail: totals.emailFailed },
            { Icon: MessageSquare, val: totals.smsSent,   fail: totals.smsFailed   },
            { Icon: Bell,          val: totals.pushSent,  fail: totals.pushFailed  },
          ].map(({ Icon, val, fail }, i) => (
            <span key={i} style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              fontSize: 12, fontWeight: 600,
              color:      fail > 0 ? "#b91c1c" : "#15803d",
              background: fail > 0 ? "#fef2f2" : "#f0fdf4",
              border:     `1px solid ${fail > 0 ? "#fecaca" : "#bbf7d0"}`,
              borderRadius: 7, padding: "4px 10px",
            }}>
              <Icon size={11} aria-hidden="true" /> {val}
              {fail > 0 && <span style={{ color: "#ef4444" }}>/{fail}✗</span>}
            </span>
          ))}
        </div>

        {/* Chevron */}
        {expanded
          ? <ChevronUp   size={15} color="#94a3b8" style={{ flexShrink: 0 }} aria-hidden="true" />
          : <ChevronDown size={15} color="#94a3b8" style={{ flexShrink: 0 }} aria-hidden="true" />
        }
      </div>

      {/* ── Expanded: all dispatches + employee rows for this route ── */}
      {expanded && (
        <div style={{
          borderTop: "1px solid #f1f5f9",
          background: "#fafafa",
          padding: "12px 14px 14px",
        }}>
          {dispatches.map((log, i) => (
            <DispatchBlock
              key={log.id}
              log={log}
              isLast={i === dispatches.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
});
RouteGroupCard.displayName = "RouteGroupCard";

// ─────────────────────────────────────────────────────────────────────────────
// NotificationLogsModal — original structure preserved
// ─────────────────────────────────────────────────────────────────────────────
const NotificationLogsModal = ({
  isOpen,
  onClose,
  shiftId,
  shiftCode,
  bookingDate,
  tenantId,
}) => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [actionMessage, setActionMessage] = useState("");
  const [redispatchingByRoute, setRedispatchingByRoute] = useState({});

  const abortRef      = useRef(null);
  const refreshBtnRef = useRef(null);

  const fetchLogs = useCallback(async () => {
    if (!shiftId || !bookingDate) return;
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ booking_date: bookingDate, shift_id: shiftId });
      if (tenantId) params.append("tenant_id", tenantId);
      const res  = await API_CLIENT.get(`/routes/notification-logs?${params}`, {
        signal: abortRef.current.signal,
      });
      const body = res.data?.data ?? res.data;
      setData(body);
    } catch (err) {
      if (err?.name === "CanceledError" || err?.name === "AbortError") return;
      logError("[NotificationLogsModal] fetch failed:", err);
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.detail  ||
        "Failed to load notification logs."
      );
    } finally {
      setLoading(false);
    }
  }, [shiftId, bookingDate, tenantId]);

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    } else {
      abortRef.current?.abort();
      setData(null);
      setError(null);
      setActionMessage("");
      setRedispatchingByRoute({});
    }
  }, [isOpen, fetchLogs]);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => refreshBtnRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const aggregate   = useMemo(() => data?.aggregate,  [data]);
  const logs        = useMemo(() => data?.logs ?? [],  [data]);
  const routeGroups = useMemo(() => groupLogsByRoute(logs), [logs]);

  const handleRedispatch = useCallback(async ({ routeId, routeCode }) => {
    if (!routeId) return;

    setActionMessage("");
    setRedispatchingByRoute((prev) => ({ ...prev, [routeId]: true }));
    try {
      const qs = buildTenantQs(tenantId);
      const res = await API_CLIENT.post(`/routes/${routeId}/resend-notifications${qs}`);
      const body = res.data?.data ?? res.data;
      setActionMessage(
        res.data?.message ||
        `${routeCode ?? body?.route_code ?? `Route #${routeId}`} redispatch queued successfully.`
      );
      await fetchLogs();
    } catch (err) {
      logError(`[NotificationLogsModal] redispatch failed for route ${routeId}:`, err);
      setActionMessage(
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Redispatch failed. Please try again."
      );
    } finally {
      setRedispatchingByRoute((prev) => ({ ...prev, [routeId]: false }));
    }
  }, [tenantId, fetchLogs]);

  if (!isOpen) return null;

  return createPortal(
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 50000,
          background: "rgba(15,23,42,0.45)", backdropFilter: "blur(3px)",
          animation: "nlFadeIn 0.18s ease",
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="nl-modal-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed", zIndex: 50001,
          top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: "min(820px, calc(100vw - 32px))",
          maxHeight: "min(900px, 92vh)",
          background: "#fff", borderRadius: 16,
          boxShadow: "0 24px 60px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.06)",
          display: "flex", flexDirection: "column", overflow: "hidden",
          animation: "nlSlideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* ── Header ── */}
        <div style={{
          padding: "18px 24px 16px", borderBottom: "1px solid #f1f5f9",
          background: "linear-gradient(135deg,#f0fdf4 0%,#ecfdf5 100%)",
          display: "flex", alignItems: "flex-start", gap: 12, flexShrink: 0,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 11, flexShrink: 0,
            background: "linear-gradient(135deg,#34d399,#059669)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px #34d39955",
          }}>
            <FileText size={20} color="#fff" aria-hidden="true" />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div id="nl-modal-title" style={{ fontWeight: 800, fontSize: 17, color: "#1e293b" }}>
              Notification Logs
            </div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 3 }}>
              {shiftCode ?? `Shift #${shiftId}`} · {bookingDate}
              {data && (
                <>
                  <span style={{ marginLeft: 8, color: "#059669", fontWeight: 600 }}>
                    · {data.total_logs} log{data.total_logs !== 1 ? "s" : ""}
                  </span>
                  {routeGroups.length > 0 && (
                    <span style={{ marginLeft: 6, color: "#6366f1", fontWeight: 600 }}>
                      · {routeGroups.length} route{routeGroups.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          <button
            ref={refreshBtnRef}
            type="button"
            onClick={fetchLogs}
            disabled={loading}
            aria-label="Refresh logs"
            title="Refresh logs"
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: "1px solid #e2e8f0", background: "#fff",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginRight: 6, opacity: loading ? 0.6 : 1, transition: "opacity 0.15s",
            }}
          >
            <RefreshCw
              size={14} color="#64748b" aria-hidden="true"
              style={{ animation: loading ? "nlSpin 0.8s linear infinite" : "none" }}
            />
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 32, height: 32, borderRadius: 8, border: "none",
              background: "#f1f5f9", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}
          >
            <X size={15} color="#64748b" aria-hidden="true" />
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>

          {loading && (
            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", padding: "60px 0", gap: 12,
            }}>
              <Loader2
                size={26} color="#059669" aria-hidden="true"
                style={{ animation: "nlSpin 0.8s linear infinite" }}
              />
              <span style={{ fontSize: 14, color: "#94a3b8" }}>
                Loading notification logs…
              </span>
            </div>
          )}

          {!loading && error && (
            <div
              role="alert"
              style={{
                display: "flex", alignItems: "center", gap: 10,
                background: "#fef2f2", border: "1px solid #fecaca",
                borderRadius: 10, padding: "14px 16px", fontSize: 13, color: "#b91c1c",
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} aria-hidden="true" />
              {error}
            </div>
          )}

          {!loading && !error && actionMessage && (
            <div
              role="status"
              style={{
                display: "flex", alignItems: "center", gap: 10,
                background: "#f8fafc", border: "1px solid #e2e8f0",
                borderRadius: 10, padding: "12px 14px",
                fontSize: 13, color: "#475569", marginBottom: 14,
              }}
            >
              <RotateCcw size={14} aria-hidden="true" />
              {actionMessage}
            </div>
          )}

          {!loading && !error && routeGroups.length === 0 && (
            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", padding: "60px 0", gap: 10,
            }}>
              <FileText size={36} color="#e2e8f0" aria-hidden="true" />
              <span style={{ fontSize: 15, fontWeight: 600, color: "#94a3b8" }}>
                No notification logs found
              </span>
              <span style={{ fontSize: 13, color: "#cbd5e1" }}>
                No dispatches have been made for this shift and date yet.
              </span>
            </div>
          )}

          {!loading && !error && routeGroups.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* Aggregate summary */}
              {aggregate && (
                <section aria-label="Aggregate notification summary">
                  <div style={{
                    fontSize: 12, fontWeight: 700, color: "#64748b",
                    marginBottom: 10, letterSpacing: "0.05em",
                  }}>
                    AGGREGATE SUMMARY — ALL DISPATCHES
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <ChannelBar
                      label="Email" icon={Mail} color="#6366f1"
                      sent={aggregate.email?.sent ?? 0} failed={aggregate.email?.failed ?? 0}
                    />
                    <ChannelBar
                      label="SMS" icon={MessageSquare} color="#0ea5e9"
                      sent={aggregate.sms?.sent ?? 0} failed={aggregate.sms?.failed ?? 0}
                    />
                    <ChannelBar
                      label="Push" icon={Bell} color="#8b5cf6"
                      sent={aggregate.push?.sent ?? 0} failed={aggregate.push?.failed ?? 0}
                    />
                  </div>
                </section>
              )}

              {/* Route-grouped cards */}
              <section aria-label="Dispatch log entries">
                <div style={{
                  fontSize: 12, fontWeight: 700, color: "#64748b",
                  marginBottom: 10, letterSpacing: "0.05em",
                }}>
                  DISPATCH LOGS ({logs.length}) — {routeGroups.length} ROUTE{routeGroups.length !== 1 ? "S" : ""}
                </div>
                <div role="list" style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {routeGroups.map((group) => (
                    <RouteGroupCard
                      key={group.route_id}
                      group={group}
                      onRedispatch={handleRedispatch}
                      isRedispatching={!!redispatchingByRoute[group.route_id]}
                    />
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{
          padding: "12px 24px", borderTop: "1px solid #f1f5f9",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "#fafafa", flexShrink: 0,
        }}>
          <span style={{ fontSize: 13, color: "#94a3b8" }}>
            {data?.total_logs ?? 0} total log{data?.total_logs !== 1 ? "s" : ""} · {bookingDate}
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "8px 20px", borderRadius: 8,
              border: "1.5px solid #e2e8f0", background: "#fff",
              fontSize: 13, fontWeight: 600, color: "#64748b",
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Close
          </button>
        </div>
      </div>

      <style>{`
        @keyframes nlFadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes nlSlideUp { from { opacity: 0; transform: translate(-50%, -46%) scale(0.97) } to { opacity: 1; transform: translate(-50%, -50%) scale(1) } }
        @keyframes nlSpin    { to { transform: rotate(360deg) } }
      `}</style>
    </>,
    document.body
  );
};

export default NotificationLogsModal;

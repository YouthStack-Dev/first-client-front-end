// BulkDispatchModal.jsx
import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Send, X, Loader2, CheckCircle2, AlertCircle,
  Mail, MessageSquare, Bell, User,
  ChevronDown, ChevronUp, Clock, FileText,
  Route as RouteIcon, Users, AlertTriangle,
} from "lucide-react";
import { API_CLIENT } from "../../Api/API_Client";
import { logError } from "../../utils/logger";
import NotificationLogsModal from ".././modals/NotificationLogsModal";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_COLOR = {
  sent:     { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0", dot: "#22c55e" },
  failed:   { bg: "#fef2f2", text: "#b91c1c", border: "#fecaca", dot: "#ef4444" },
  no_email: { bg: "#f8fafc", text: "#64748b", border: "#e2e8f0", dot: "#94a3b8" },
  no_phone: { bg: "#f8fafc", text: "#64748b", border: "#e2e8f0", dot: "#94a3b8" },
  default:  { bg: "#fffbeb", text: "#92400e", border: "#fde68a", dot: "#f59e0b" },
};

const PROGRESS_STYLE = {
  bg:    { pending: "#f8fafc", running: "#eef2ff", success: "#f0fdf4", error: "#fef2f2" },
  bd:    { pending: "#e2e8f0", running: "#c7d2fe", success: "#bbf7d0", error: "#fecaca" },
  label: { pending: "Waiting…", running: "Dispatching…", success: "Done ✓", error: "Failed" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const getStatusStyle = (s) => {
  if (!s) return STATUS_COLOR.default;
  if (s === "sent") return STATUS_COLOR.sent;
  if (s.startsWith("failed") || s.startsWith("error")) return STATUS_COLOR.failed;
  if (s === "no_email") return STATUS_COLOR.no_email;
  if (s === "no_phone") return STATUS_COLOR.no_phone;
  return STATUS_COLOR.default;
};

const formatStatusLabel = (s) => {
  if (!s) return "—";
  if (s === "no_email") return "No email";
  if (s === "no_phone") return "No phone";
  if (s.startsWith("failed")) return "Failed";
  return s.replace(/_/g, " ").toLowerCase();
};

const getFailureHint = (employees) => {
  if (!employees?.length) return null;
  const hasSmsFailure  = employees.some((e) => e.sms_status?.startsWith("failed")  || e.sms_status === "no_phone");
  const hasPushFailure = employees.some((e) => e.push_status?.startsWith("failed") || e.push_status?.includes("no_active"));
  if (hasPushFailure && hasSmsFailure)
    return "SMS and push failed — employee may not have the app installed or phone number missing";
  if (hasPushFailure)
    return "Push notification failed — employee may not have the app installed";
  if (hasSmsFailure)
    return "SMS failed — phone number may be missing or invalid";
  return null;
};

const getInitials = (name) => {
  if (!name) return "?";
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
};

const AVATAR_COLORS = [
  { bg: "#EEF2FF", text: "#4338CA" },
  { bg: "#F0FDF4", text: "#15803D" },
  { bg: "#FFF7ED", text: "#C2410C" },
  { bg: "#EFF6FF", text: "#1D4ED8" },
  { bg: "#FDF4FF", text: "#7E22CE" },
];

const getAvatarColor = (name) => {
  if (!name) return AVATAR_COLORS[0];
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
};

const buildQs = (tenantId) => {
  if (!tenantId) return "";
  return `?${new URLSearchParams({ tenant_id: tenantId })}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// StatusPill — channel delivery badge
// ─────────────────────────────────────────────────────────────────────────────
const StatusPill = React.memo(({ status, icon: Icon, label }) => {
  const c = getStatusStyle(status);
  return (
    <span
      title={status ?? "—"}
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        fontSize: 11, fontWeight: 500, padding: "3px 8px",
        borderRadius: 20, whiteSpace: "nowrap",
        border: `1px solid ${c.border}`, background: c.bg, color: c.text,
      }}
    >
      <Icon size={10} aria-hidden="true" />
      {formatStatusLabel(status)}
    </span>
  );
});
StatusPill.displayName = "StatusPill";

// ─────────────────────────────────────────────────────────────────────────────
// ProgressRow
// ─────────────────────────────────────────────────────────────────────────────
const PROGRESS_ICONS = {
  pending: <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#e2e8f0", flexShrink: 0 }} />,
  running: <Loader2 size={14} color="#6366f1" style={{ animation: "bdSpin 0.8s linear infinite", flexShrink: 0 }} aria-hidden="true" />,
  success: <CheckCircle2 size={14} color="#15803d" style={{ flexShrink: 0 }} aria-hidden="true" />,
  error:   <AlertCircle  size={14} color="#ef4444" style={{ flexShrink: 0 }} aria-hidden="true" />,
};

const ProgressRow = React.memo(({ routeCode, routeId, state }) => (
  <div
    role="listitem"
    style={{
      display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
      borderRadius: 8,
      background: PROGRESS_STYLE.bg[state] ?? PROGRESS_STYLE.bg.pending,
      border: `1px solid ${PROGRESS_STYLE.bd[state] ?? PROGRESS_STYLE.bd.pending}`,
      transition: "all 0.2s",
    }}
  >
    {PROGRESS_ICONS[state] ?? PROGRESS_ICONS.pending}
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: "#1e293b" }}>
        {routeCode ?? `Route #${routeId}`}
      </div>
    </div>
    <span style={{
      fontSize: 11, fontWeight: 500, color:
        state === "success" ? "#15803d" :
        state === "error"   ? "#b91c1c" :
        state === "running" ? "#4338ca" : "#94a3b8",
    }}>
      {PROGRESS_STYLE.label[state] ?? ""}
    </span>
  </div>
));
ProgressRow.displayName = "ProgressRow";

// ─────────────────────────────────────────────────────────────────────────────
// RouteResultRow — redesigned
// ─────────────────────────────────────────────────────────────────────────────
const RouteResultRow = React.memo(({ routeResult, onViewLogs }) => {
  const [expanded, setExpanded] = useState(true);
  const { routeId, routeCode, status, data, error } = routeResult;
  const summary   = data?.summary;
  const employees = useMemo(() => data?.employees ?? [], [data]);
  const isSuccess = status === "success";
  const isResend  = !!data?.resend;
  const canViewLogs = isSuccess && !isResend && !!data?.log_id;
  const failureHint = isSuccess && !isResend ? getFailureHint(employees) : null;

  const toggleExpand = useCallback(() => {
    if (isSuccess && !isResend) setExpanded((v) => !v);
  }, [isSuccess, isResend]);

  return (
    <div
      role="listitem"
      style={{
        borderRadius: 10,
        border: `1px solid ${isSuccess ? "#bbf7d0" : "#fecaca"}`,
        background: isSuccess ? "#f0fdf4" : "#fef2f2",
        overflow: "hidden",
        marginBottom: 8,
      }}
    >
      {/* ── Route header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px" }}>

        {/* Route icon */}
        <div style={{
          width: 30, height: 30, borderRadius: 8, flexShrink: 0,
          background: isSuccess ? "#dcfce7" : "#fee2e2",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <RouteIcon size={14} color={isSuccess ? "#15803d" : "#ef4444"} aria-hidden="true" />
        </div>

        {/* Route name + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#1e293b" }}>
            {routeCode ?? `Route #${routeId}`}
          </div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
            {isSuccess && !isResend && summary && (
              <span>{summary.total_employees} employee{summary.total_employees !== 1 ? "s" : ""}</span>
            )}
            {isSuccess && isResend && (
              <span style={{ color: "#0369a1" }}>
                {data.notifications_queued ?? 0} queued · delivering in background
              </span>
            )}
            {!isSuccess && (
              <span style={{ color: "#b91c1c" }}>{error}</span>
            )}
          </div>
        </div>

        {/* Right: log badge + view logs + expand */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>

          {isSuccess && isResend && (
            <span style={{
              fontSize: 10, fontWeight: 500, color: "#0369a1",
              background: "#e0f2fe", borderRadius: 20, padding: "3px 8px",
              border: "1px solid #bae6fd", display: "inline-flex", alignItems: "center", gap: 4,
            }}>
              <Clock size={9} aria-hidden="true" /> Queued
            </span>
          )}

          {isSuccess && !isResend && data?.log_id && (
            <span style={{
              fontSize: 10, fontWeight: 500, color: "#15803d",
              background: "#dcfce7", borderRadius: 20,
              padding: "3px 8px", border: "1px solid #bbf7d0",
            }}>
              Log #{data.log_id}
            </span>
          )}

          {canViewLogs && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onViewLogs?.({ routeId, routeCode, logId: data.log_id }); }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                fontSize: 11, fontWeight: 500, padding: "4px 10px", borderRadius: 7,
                background: "#fff", color: "#059669",
                border: "1px solid #bbf7d0",
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              <FileText size={11} aria-hidden="true" />
              View logs
            </button>
          )}

          {isSuccess && !isResend && employees.length > 0 && (
            <button
              type="button"
              onClick={toggleExpand}
              aria-label={expanded ? "Collapse" : "Expand"}
              style={{
                width: 24, height: 24, borderRadius: 6, border: "none",
                background: "#dcfce7", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {expanded
                ? <ChevronUp   size={13} color="#15803d" aria-hidden="true" />
                : <ChevronDown size={13} color="#15803d" aria-hidden="true" />
              }
            </button>
          )}
        </div>
      </div>

      {/* ── Employee rows ── */}
      {expanded && !isResend && employees.length > 0 && (
        <div style={{ borderTop: "1px solid #bbf7d0" }}>
          {employees.map((emp, i) => {
            const av = getAvatarColor(emp.employee_name);
            return (
              <div
                key={emp.booking_id ?? emp.employee_name ?? i}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 14px",
                  background: i % 2 === 0 ? "#fff" : "#f8fffe",
                  borderTop: i > 0 ? "1px solid #e8fdf2" : "none",
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  background: av.bg, color: av.text,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 500,
                }}>
                  {getInitials(emp.employee_name)}
                </div>

                {/* Name */}
                <span style={{ fontSize: 12, fontWeight: 500, color: "#1e293b", flex: 1, minWidth: 0 }}>
                  {emp.employee_name}
                </span>

                {/* Channel pills */}
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <StatusPill status={emp.email_status} icon={Mail}          label="Email" />
                  <StatusPill status={emp.sms_status}   icon={MessageSquare} label="SMS"   />
                  <StatusPill status={emp.push_status}  icon={Bell}          label="Push"  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Failure hint ── */}
      {failureHint && expanded && (
        <div style={{
          padding: "8px 14px", borderTop: "1px solid #FED7AA",
          background: "#FFF7ED",
          display: "flex", alignItems: "flex-start", gap: 7,
          fontSize: 11, color: "#92400E", lineHeight: 1.5,
        }}>
          <AlertTriangle size={13} color="#F59E0B" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
          {failureHint}
        </div>
      )}

      {/* ── Skipped bookings (resend) ── */}
      {isSuccess && isResend && data?.skipped_bookings?.length > 0 && (
        <div style={{
          borderTop: "1px solid #bae6fd", background: "#f0f9ff",
          padding: "7px 14px", fontSize: 11, color: "#0369a1",
        }}>
          Skipped booking IDs: {data.skipped_bookings.join(", ")}
        </div>
      )}
    </div>
  );
});
RouteResultRow.displayName = "RouteResultRow";

// ─────────────────────────────────────────────────────────────────────────────
// BulkDispatchModal
// ─────────────────────────────────────────────────────────────────────────────
const BulkDispatchModal = ({
  isOpen,
  onClose,
  routes = [],
  tenantId,
  onSuccess,
  shiftId,
  shiftCode,
  bookingDate,
}) => {
  const [step,      setStep]      = useState("confirm");
  const [progress,  setProgress]  = useState({});
  const [results,   setResults]   = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [logsOpen,  setLogsOpen]  = useState(false);

  const resultsRef    = useRef([]);
  const firstFocusRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setStep("confirm");
      setProgress({});
      setResults([]);
      resultsRef.current = [];
      setLogsOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => firstFocusRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape" && !isRunning && !logsOpen) handleClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, isRunning, logsOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = useCallback(() => {
    if (isRunning) return;
    setStep("confirm"); setProgress({}); setResults([]);
    resultsRef.current = [];
    setLogsOpen(false);
    onClose();
  }, [isRunning, onClose]);

  const handleCloseAfterResults = useCallback(() => {
    onSuccess?.();
    handleClose();
  }, [onSuccess, handleClose]);

  const handleViewLogs = useCallback(() => {
    setLogsOpen(true);
  }, []);

  const dispatchable = useMemo(
    () => routes.filter((r) => r.driver?.name && r.driver.name !== "Not assigned"),
    [routes]
  );
  const nonDispatchable = useMemo(
    () => routes.filter((r) => !r.driver?.name || r.driver.name === "Not assigned"),
    [routes]
  );

  const handleDispatch = useCallback(async () => {
    if (!dispatchable.length) return;
    setIsRunning(true);
    setStep("progress");

    const init = {};
    routes.forEach((r) => { init[r.route_id] = "pending"; });
    setProgress({ ...init });

    const allResults = [];
    const qs = buildQs(tenantId);

    for (const route of routes) {
      setProgress((prev) => ({ ...prev, [route.route_id]: "running" }));
      try {
        const res  = await API_CLIENT.post(`/routes/${route.route_id}/dispatch${qs}`);
        const data = res.data?.data ?? res.data;
        setProgress((prev) => ({ ...prev, [route.route_id]: "success" }));
        allResults.push({ routeId: route.route_id, routeCode: route.route_code, status: "success", data, error: null });
      } catch (err) {
        logError(`[BulkDispatch] route ${route.route_id} failed:`, err);
        const msg = err?.response?.data?.message || err?.response?.data?.detail || "Dispatch failed";
        setProgress((prev) => ({ ...prev, [route.route_id]: "error" }));
        allResults.push({ routeId: route.route_id, routeCode: route.route_code, status: "error", data: null, error: msg });
      }
    }

    resultsRef.current = allResults;
    setResults(allResults);
    setIsRunning(false);
    setStep("results");
  }, [routes, tenantId, dispatchable.length]);

  if (!isOpen) return null;

  const successCount = results.filter((r) => r.status === "success").length;
  const failCount    = results.filter((r) => r.status === "error").length;
  const totalEmployees = results.reduce((sum, r) => sum + (r.data?.summary?.total_employees ?? 0), 0);
  const isBusy = isRunning;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={handleClose}
        style={{
          position: "fixed", inset: 0, zIndex: 50000,
          background: "rgba(15,23,42,0.45)", backdropFilter: "blur(3px)",
          animation: "bdFadeIn 0.18s ease",
        }}
      />

      {/* Modal panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bd-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed", zIndex: 50001,
          top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: "min(580px, calc(100vw - 32px))",
          maxHeight: "min(760px, 90vh)",
          background: "#fff", borderRadius: 16,
          boxShadow: "0 24px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)",
          display: "flex", flexDirection: "column", overflow: "hidden",
          animation: "bdSlideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* ── Header ── */}
        <div style={{
          padding: "16px 20px", borderBottom: "1px solid #E0E7FF",
          background: "#EEF2FF",
          display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: "#6366F1",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Send size={18} color="#fff" aria-hidden="true" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div id="bd-title" style={{ fontWeight: 500, fontSize: 15, color: "#1e293b" }}>
              Bulk dispatch
            </div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
              {step === "confirm"  && `${routes.length} route${routes.length !== 1 ? "s" : ""} selected`}
              {step === "progress" && `Dispatching ${routes.length} route${routes.length !== 1 ? "s" : ""}…`}
              {step === "results"  && (
                <span>
                  <span style={{ color: "#15803d", fontWeight: 500 }}>{successCount} succeeded</span>
                  {failCount > 0 && <span style={{ color: "#ef4444", fontWeight: 500 }}> · {failCount} failed</span>}
                </span>
              )}
            </div>
          </div>
          <button
            ref={firstFocusRef}
            type="button"
            onClick={step === "results" ? handleCloseAfterResults : handleClose}
            disabled={isBusy}
            aria-label="Close"
            style={{
              width: 30, height: 30, borderRadius: 8, border: "none",
              background: "#E0E7FF", cursor: isBusy ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, opacity: isBusy ? 0.5 : 1,
            }}
          >
            <X size={14} color="#4338CA" aria-hidden="true" />
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>

          {/* ── CONFIRM ── */}
          {step === "confirm" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{
                background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10,
                padding: "12px 14px", fontSize: 12, color: "#92400e", lineHeight: 1.7,
              }}>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>Before dispatching</div>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  <li>OTPs will be regenerated for all selected routes</li>
                  <li>All employees will receive Email, SMS &amp; Push notifications</li>
                  <li>Routes without a driver will be skipped</li>
                </ul>
              </div>

              {dispatchable.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 500, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Will dispatch ({dispatchable.length})
                  </div>
                  <div role="list" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {dispatchable.map((r) => (
                      <div key={r.route_id} role="listitem" style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
                        borderRadius: 8, background: "#f0fdf4", border: "1px solid #bbf7d0",
                      }}>
                        <RouteIcon size={13} color="#15803d" aria-hidden="true" />
                        <span style={{ fontWeight: 500, fontSize: 13, color: "#1e293b", flex: 1 }}>
                          {r.route_code ?? `Route #${r.route_id}`}
                        </span>
                        <span style={{ color: "#64748b", fontSize: 11 }}>{r.driver?.name}</span>
                        <span style={{ color: "#94a3b8", fontSize: 11 }}>{r.stops?.length ?? 0} employees</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {nonDispatchable.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 500, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Will skip — no driver ({nonDispatchable.length})
                  </div>
                  <div role="list" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {nonDispatchable.map((r) => (
                      <div key={r.route_id} role="listitem" style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
                        borderRadius: 8, background: "#fafafa", border: "1px solid #e2e8f0", opacity: 0.6,
                      }}>
                        <RouteIcon size={13} color="#94a3b8" aria-hidden="true" />
                        <span style={{ fontWeight: 500, fontSize: 13, color: "#64748b", flex: 1 }}>
                          {r.route_code ?? `Route #${r.route_id}`}
                        </span>
                        <span style={{ color: "#94a3b8", fontSize: 11 }}>No driver assigned</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── PROGRESS ── */}
          {step === "progress" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: "#64748b", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Dispatch progress
              </div>
              <div role="list" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {routes.map((r) => (
                  <ProgressRow
                    key={r.route_id}
                    routeId={r.route_id}
                    routeCode={r.route_code}
                    state={progress[r.route_id] ?? "pending"}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── RESULTS ── */}
          {step === "results" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Summary cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{
                  padding: "10px 14px", borderRadius: 10,
                  background: "#f0fdf4", border: "1px solid #bbf7d0",
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <CheckCircle2 size={20} color="#16a34a" aria-hidden="true" />
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 500, color: "#15803d", lineHeight: 1 }}>{successCount}</div>
                    <div style={{ fontSize: 11, color: "#16a34a", marginTop: 3 }}>Routes succeeded</div>
                  </div>
                </div>
                <div style={{
                  padding: "10px 14px", borderRadius: 10,
                  background: "#f8fafc", border: "1px solid #e2e8f0",
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <Users size={20} color="#64748b" aria-hidden="true" />
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 500, color: "#1e293b", lineHeight: 1 }}>{totalEmployees}</div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>Employees notified</div>
                  </div>
                </div>
                {failCount > 0 && (
                  <div style={{
                    gridColumn: "1 / -1",
                    padding: "10px 14px", borderRadius: 10,
                    background: "#fef2f2", border: "1px solid #fecaca",
                    display: "flex", alignItems: "center", gap: 10,
                  }}>
                    <AlertCircle size={18} color="#ef4444" aria-hidden="true" />
                    <div style={{ fontSize: 12, color: "#b91c1c" }}>
                      <span style={{ fontWeight: 500 }}>{failCount} route{failCount !== 1 ? "s" : ""} failed</span>
                      {" — "}check the details below and retry if needed
                    </div>
                  </div>
                )}
              </div>

              {/* Route result rows */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 500, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Route results
                </div>
                <div role="list">
                  {results.map((r, i) => (
                    <RouteResultRow
                      key={r.routeId ?? r.routeCode ?? i}
                      routeResult={r}
                      onViewLogs={handleViewLogs}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{
          padding: "12px 20px", borderTop: "1px solid #f1f5f9",
          display: "flex", alignItems: "center", gap: 10, justifyContent: "flex-end",
          background: "#fafafa", flexShrink: 0,
        }}>
          <button
            type="button"
            onClick={step === "results" ? handleCloseAfterResults : handleClose}
            disabled={isBusy}
            style={{
              padding: "8px 18px", borderRadius: 8,
              border: "1px solid #e2e8f0", background: "#fff",
              fontSize: 13, fontWeight: 500, color: "#64748b",
              fontFamily: "inherit", cursor: isBusy ? "not-allowed" : "pointer",
              opacity: isBusy ? 0.6 : 1,
            }}
          >
            {step === "results" ? "Close" : "Cancel"}
          </button>

          {step === "confirm" && (
            <button
              type="button"
              onClick={handleDispatch}
              disabled={dispatchable.length === 0}
              aria-disabled={dispatchable.length === 0}
              style={{
                padding: "8px 20px", borderRadius: 8, border: "none",
                background: dispatchable.length === 0 ? "#e2e8f0" : "#6366F1",
                color:  dispatchable.length === 0 ? "#94a3b8" : "#fff",
                fontSize: 13, fontWeight: 500, fontFamily: "inherit",
                cursor: dispatchable.length === 0 ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: 7,
                transition: "opacity 0.15s",
              }}
            >
              <Send size={13} aria-hidden="true" />
              Dispatch {dispatchable.length} route{dispatchable.length !== 1 ? "s" : ""}
            </button>
          )}
        </div>
      </div>

      {/* NotificationLogsModal stacked above */}
      <NotificationLogsModal
        isOpen={logsOpen}
        onClose={() => setLogsOpen(false)}
        shiftId={shiftId}
        shiftCode={shiftCode}
        bookingDate={bookingDate}
        tenantId={tenantId}
      />

      <style>{`
        @keyframes bdFadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes bdSlideUp { from { opacity: 0; transform: translate(-50%, -46%) scale(0.97) } to { opacity: 1; transform: translate(-50%, -50%) scale(1) } }
        @keyframes bdSpin    { to { transform: rotate(360deg) } }
      `}</style>
    </>,
    document.body
  );
};

export default BulkDispatchModal;
// BulkDispatchModal.jsx
import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Send, X, Loader2, CheckCircle2, AlertCircle,
  Mail, MessageSquare, Bell, User,
  Zap, ChevronDown, ChevronUp, Clock, FileText, // ✅ added FileText for View Logs btn
  Route as RouteIcon,
} from "lucide-react";
import { API_CLIENT } from "../../Api/API_Client";
import { logError } from "../../utils/logger";
import NotificationLogsModal from ".././modals/NotificationLogsModal"; // ✅ NEW import

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

const formatStatusLabel = (s) => {
  if (!s) return "—";
  return s.replace(/_/g, " ").toLowerCase();
};

const buildQs = (tenantId) => {
  if (!tenantId) return "";
  return `?${new URLSearchParams({ tenant_id: tenantId })}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// StatusPill
// ─────────────────────────────────────────────────────────────────────────────
const PILL_BASE = {
  display: "inline-flex", alignItems: "center", gap: 4,
  fontSize: 10, fontWeight: 700, padding: "3px 7px",
  borderRadius: 20, whiteSpace: "nowrap", maxWidth: 200,
  overflow: "hidden", textOverflow: "ellipsis",
};

const StatusPill = React.memo(({ status, icon: Icon }) => {
  const c = getStatusStyle(status);
  return (
    <span
      title={status ?? "—"}
      style={{ ...PILL_BASE, border: `1px solid ${c.border}`, background: c.bg, color: c.text }}
    >
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      <Icon size={9} style={{ flexShrink: 0 }} aria-hidden="true" />
      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{formatStatusLabel(status)}</span>
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
      display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 7,
      background: PROGRESS_STYLE.bg[state] ?? PROGRESS_STYLE.bg.pending,
      border: `1px solid ${PROGRESS_STYLE.bd[state] ?? PROGRESS_STYLE.bd.pending}`,
      transition: "all 0.2s",
    }}
  >
    {PROGRESS_ICONS[state] ?? PROGRESS_ICONS.pending}
    <span style={{ fontSize: 12, fontWeight: 600, color: "#1e293b", flex: 1 }}>
      {routeCode ?? `Route #${routeId}`}
    </span>
    <span style={{ fontSize: 10, color: "#94a3b8" }}>
      {PROGRESS_STYLE.label[state] ?? ""}
    </span>
  </div>
));
ProgressRow.displayName = "ProgressRow";

// ─────────────────────────────────────────────────────────────────────────────
// RouteResultRow
// ✅ NEW: accepts onViewLogs prop — shows "View Logs" button on success rows
//         that have a log_id returned from the dispatch API
// ─────────────────────────────────────────────────────────────────────────────
const RouteResultRow = React.memo(({ routeResult, onViewLogs }) => {
  const [expanded, setExpanded] = useState(false);
  const { routeId, routeCode, status, data, error } = routeResult;
  const summary   = data?.summary;
  const employees = useMemo(() => data?.employees ?? [], [data]);
  const isSuccess = status === "success";
  const isResend  = !!data?.resend;

  const toggleExpand = useCallback(() => {
    if (isSuccess && !isResend) setExpanded((v) => !v);
  }, [isSuccess, isResend]);

  const failedTotal = useMemo(() => {
    if (!summary) return 0;
    return (summary.email?.failed ?? 0) + (summary.sms?.failed ?? 0) + (summary.push?.failed ?? 0);
  }, [summary]);

  // ✅ NEW: show View Logs only when dispatch succeeded and API returned a log_id
  const canViewLogs = isSuccess && !isResend && !!data?.log_id;

  return (
    <div
      role="listitem"
      style={{
        borderRadius: 8,
        border: `1px solid ${isSuccess ? "#bbf7d0" : "#fecaca"}`,
        background: isSuccess ? "#f0fdf4" : "#fef2f2",
        overflow: "hidden",
      }}
    >
      {/* Row header */}
      <div
        onClick={toggleExpand}
        role={isSuccess && !isResend && employees.length > 0 ? "button" : undefined}
        tabIndex={isSuccess && !isResend && employees.length > 0 ? 0 : undefined}
        onKeyDown={(e) => e.key === "Enter" && toggleExpand()}
        aria-expanded={isSuccess && !isResend && employees.length > 0 ? expanded : undefined}
        style={{
          display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
          cursor: isSuccess && !isResend && employees.length > 0 ? "pointer" : "default",
          outline: "none",
        }}
      >
        {/* Status icon */}
        <div style={{
          width: 26, height: 26, borderRadius: 7, flexShrink: 0,
          background: isSuccess ? "#dcfce7" : "#fee2e2",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {isSuccess
            ? <CheckCircle2 size={14} color="#15803d" aria-hidden="true" />
            : <AlertCircle  size={14} color="#ef4444" aria-hidden="true" />
          }
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>
            {routeCode ?? `Route #${routeId}`}
          </div>
          {isSuccess && (
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
              {isResend ? (
                <span>
                  <span style={{ color: "#15803d", fontWeight: 600 }}>
                    {data.notifications_queued ?? 0} notification{data.notifications_queued !== 1 ? "s" : ""} queued
                  </span>
                  {data.skipped_bookings?.length > 0 && (
                    <span style={{ color: "#f59e0b", marginLeft: 4 }}>
                      · {data.skipped_bookings.length} booking{data.skipped_bookings.length !== 1 ? "s" : ""} skipped
                    </span>
                  )}
                  <span style={{ color: "#94a3b8", marginLeft: 4 }}>· delivering in background</span>
                </span>
              ) : summary ? (
                <span>
                  {summary.total_employees} employees ·{" "}
                  <span style={{ color: "#15803d" }}>
                    {summary.email?.sent ?? 0}✉ {summary.sms?.sent ?? 0}📱 {summary.push?.sent ?? 0}🔔
                  </span>
                  {failedTotal > 0 && (
                    <span style={{ color: "#ef4444", marginLeft: 4 }}>· {failedTotal} failed</span>
                  )}
                </span>
              ) : null}
            </div>
          )}
          {!isSuccess && (
            <div style={{ fontSize: 11, color: "#b91c1c", marginTop: 2 }}>{error}</div>
          )}
        </div>

        {/* Right side badges + View Logs */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          {isSuccess && isResend && (
            <span style={{
              fontSize: 10, fontWeight: 600, color: "#0369a1",
              background: "#e0f2fe", borderRadius: 20, padding: "3px 8px",
              border: "1px solid #bae6fd", display: "inline-flex", alignItems: "center", gap: 3,
            }}>
              <Clock size={9} aria-hidden="true" /> Queued
            </span>
          )}

          {/* ✅ NEW — View Logs button */}
          {canViewLogs && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation(); // don't trigger toggleExpand
                onViewLogs?.({ routeId, routeCode, logId: data.log_id });
              }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 7,
                background: "#fff", color: "#059669",
                border: "1px solid #bbf7d0",
                cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.15s",
              }}
            >
              <FileText size={11} aria-hidden="true" />
              View Logs
            </button>
          )}

          {isSuccess && !isResend && data?.log_id && (
            <span style={{
              fontSize: 10, fontWeight: 600, color: "#15803d",
              background: "#dcfce7", borderRadius: 20,
              padding: "3px 8px", border: "1px solid #bbf7d0",
            }}>
              Log #{data.log_id}
            </span>
          )}

          {isSuccess && !isResend && employees.length > 0 && (
            expanded
              ? <ChevronUp   size={13} color="#94a3b8" aria-hidden="true" />
              : <ChevronDown size={13} color="#94a3b8" aria-hidden="true" />
          )}
        </div>
      </div>

      {/* Expanded employee delivery details */}
      {expanded && !isResend && employees.length > 0 && (
        <div style={{
          borderTop: "1px solid #bbf7d0", background: "#fff",
          padding: "8px 14px", display: "flex", flexDirection: "column", gap: 5,
        }}>
          {employees.map((emp) => (
            <div
              key={emp.booking_id ?? emp.employee_name}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "6px 10px",
                borderRadius: 6, background: "#f8fafc", border: "1px solid #e2e8f0",
              }}
            >
              <User size={11} color="#94a3b8" style={{ flexShrink: 0 }} aria-hidden="true" />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#1e293b", flex: 1, minWidth: 0 }}>
                {emp.employee_name}
              </span>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
                <StatusPill status={emp.email_status} icon={Mail} />
                <StatusPill status={emp.sms_status}   icon={MessageSquare} />
                <StatusPill status={emp.push_status}  icon={Bell} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skipped bookings — resend only */}
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
// ✅ NEW props: shiftId, shiftCode, bookingDate — forwarded to NotificationLogsModal
// ─────────────────────────────────────────────────────────────────────────────
const BulkDispatchModal = ({
  isOpen,
  onClose,
  routes = [],
  tenantId,
  onSuccess,
  shiftId,       // ✅ NEW
  shiftCode,     // ✅ NEW
  bookingDate,   // ✅ NEW
}) => {
  const [step,      setStep]      = useState("confirm");
  const [progress,  setProgress]  = useState({});
  const [results,   setResults]   = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  // ✅ NEW — logs modal state
  const [logsOpen,  setLogsOpen]  = useState(false);

  const resultsRef    = useRef([]);
  const firstFocusRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setStep("confirm");
      setProgress({});
      setResults([]);
      resultsRef.current = [];
      setLogsOpen(false); // ✅ NEW: reset on close
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

  const isBusy = isRunning;

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

  // ✅ NEW — opens NotificationLogsModal; route info available for future filtering
  const handleViewLogs = useCallback(({ routeId, routeCode, logId }) => {
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
          maxHeight: "min(720px, 90vh)",
          background: "#fff", borderRadius: 16,
          boxShadow: "0 24px 60px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.06)",
          display: "flex", flexDirection: "column", overflow: "hidden",
          animation: "bdSlideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* ── Header ── */}
        <div style={{
          padding: "16px 20px 14px", borderBottom: "1px solid #f1f5f9",
          background: "linear-gradient(135deg,#eff6ff 0%,#eef2ff 100%)",
          display: "flex", alignItems: "flex-start", gap: 10, flexShrink: 0,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: "linear-gradient(135deg,#60a5fa,#6366f1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px #60a5fa55",
          }}>
            <Zap size={18} color="#fff" aria-hidden="true" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div id="bd-title" style={{ fontWeight: 800, fontSize: 15, color: "#1e293b" }}>
              Bulk Dispatch
            </div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
              {step === "confirm"  && `${routes.length} route${routes.length !== 1 ? "s" : ""} selected`}
              {step === "progress" && `Dispatching ${routes.length} route${routes.length !== 1 ? "s" : ""}…`}
              {step === "results"  && (
                <span>
                  <span style={{ color: "#15803d", fontWeight: 700 }}>{successCount} succeeded</span>
                  {failCount > 0 && <span style={{ color: "#ef4444", fontWeight: 700 }}> · {failCount} failed</span>}
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
              width: 28, height: 28, borderRadius: 8, border: "none",
              background: "#f1f5f9", cursor: isBusy ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, opacity: isBusy ? 0.5 : 1,
            }}
          >
            <X size={14} color="#64748b" aria-hidden="true" />
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>

          {/* CONFIRM */}
          {step === "confirm" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{
                background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10,
                padding: "12px 14px", fontSize: 12, color: "#92400e", lineHeight: 1.6,
              }}>
                <strong>⚠️ Before dispatching:</strong>
                <ul style={{ margin: "6px 0 0 16px", padding: 0 }}>
                  <li>OTPs will be <strong>regenerated</strong> for all selected routes</li>
                  <li>All employees will receive Email, SMS &amp; Push notifications</li>
                  <li>Routes without a driver will be skipped</li>
                </ul>
              </div>

              {dispatchable.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 6 }}>
                    WILL DISPATCH ({dispatchable.length})
                  </div>
                  <div role="list" style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {dispatchable.map((r) => (
                      <div key={r.route_id} role="listitem" style={{
                        display: "flex", alignItems: "center", gap: 8, padding: "7px 10px",
                        borderRadius: 7, background: "#f0fdf4", border: "1px solid #bbf7d0", fontSize: 12,
                      }}>
                        <RouteIcon size={11} color="#15803d" aria-hidden="true" />
                        <span style={{ fontWeight: 700, color: "#1e293b" }}>{r.route_code ?? `Route #${r.route_id}`}</span>
                        <span style={{ color: "#64748b", fontSize: 10 }}>· {r.driver?.name}</span>
                        <span style={{ color: "#64748b", fontSize: 10, marginLeft: "auto" }}>{r.stops?.length ?? 0} employees</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {nonDispatchable.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 6 }}>
                    WILL SKIP — NO DRIVER ({nonDispatchable.length})
                  </div>
                  <div role="list" style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {nonDispatchable.map((r) => (
                      <div key={r.route_id} role="listitem" style={{
                        display: "flex", alignItems: "center", gap: 8, padding: "7px 10px",
                        borderRadius: 7, background: "#fafafa", border: "1px solid #e2e8f0",
                        fontSize: 12, opacity: 0.6,
                      }}>
                        <RouteIcon size={11} color="#94a3b8" aria-hidden="true" />
                        <span style={{ fontWeight: 700, color: "#64748b" }}>{r.route_code ?? `Route #${r.route_id}`}</span>
                        <span style={{ color: "#94a3b8", fontSize: 10 }}>· No driver assigned</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PROGRESS */}
          {step === "progress" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 4 }}>
                DISPATCH PROGRESS
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

          {/* RESULTS */}
          {step === "results" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                <div style={{
                  flex: 1, padding: "8px 12px", borderRadius: 8,
                  background: "#f0fdf4", border: "1px solid #bbf7d0",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <CheckCircle2 size={14} color="#15803d" aria-hidden="true" />
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#15803d" }}>{successCount} Succeeded</span>
                </div>
                {failCount > 0 && (
                  <div style={{
                    flex: 1, padding: "8px 12px", borderRadius: 8,
                    background: "#fef2f2", border: "1px solid #fecaca",
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <AlertCircle size={14} color="#ef4444" aria-hidden="true" />
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#ef4444" }}>{failCount} Failed</span>
                  </div>
                )}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 2 }}>
                ROUTE RESULTS
              </div>
              <div role="list" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {results.map((r, i) => (
                  <RouteResultRow
                    key={r.routeId ?? r.routeCode ?? i}
                    routeResult={r}
                    onViewLogs={handleViewLogs} // ✅ NEW
                  />
                ))}
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
              padding: "7px 16px", borderRadius: 8,
              border: "1.5px solid #e2e8f0", background: "#fff",
              fontSize: 12, fontWeight: 600, color: "#64748b",
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
                padding: "7px 18px", borderRadius: 8, border: "none",
                background: dispatchable.length === 0 ? "#e2e8f0" : "linear-gradient(135deg,#60a5fa,#6366f1)",
                color:  dispatchable.length === 0 ? "#94a3b8" : "#fff",
                fontSize: 12, fontWeight: 700, fontFamily: "inherit",
                cursor: dispatchable.length === 0 ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: 6,
                boxShadow: dispatchable.length > 0 ? "0 2px 8px #60a5fa55" : "none",
                transition: "all 0.15s",
              }}
            >
              <Send size={13} aria-hidden="true" />
              Dispatch {dispatchable.length} Route{dispatchable.length !== 1 ? "s" : ""}
            </button>
          )}
        </div>
      </div>

      {/* ✅ NEW — NotificationLogsModal rendered in the same portal stack,
           zIndex 50002 so it sits above BulkDispatchModal (50001) */}
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

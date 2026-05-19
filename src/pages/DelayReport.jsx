import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BarChart2, Clock, TrendingDown, TrendingUp, CheckCircle2,
  RotateCcw, SlidersHorizontal, X, Info,
} from "lucide-react";

import { fetchDelayReportThunk, fetchRouteDelayDetailThunk } from "../redux/features/delayReports/delayReportsThunks";
import { clearDetail } from "../redux/features/delayReports/delayReportsSlice";
import {
  selectDelayReportStatus,
  selectDelayReportError,
  selectDelayReportSummary,
  selectDelayReportRoutes,
  selectDetailStatus,
  selectDetailError,
  selectRouteDelayDetail,
} from "../redux/features/delayReports/delayReportsSlice";
import { selectCurrentUser } from "../redux/features/auth/authSlice";
import DelayBadge from "../components/RouteManagement/DelayBadge";

// ─────────────────────────────────────────────────────────────────────────────
// Shared small helpers
// ─────────────────────────────────────────────────────────────────────────────
const fmtTime = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  } catch { return iso; }
};

const fmtDate = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return iso; }
};

const fmtDelayMins = (mins) => {
  if (mins == null) return "—";
  if (mins === 0)   return "0 min";
  return mins > 0 ? `+${mins} min` : `${mins} min`;
};

// ─────────────────────────────────────────────────────────────────────────────
// KPI Card
// ─────────────────────────────────────────────────────────────────────────────
const KpiCard = ({ icon: Icon, value, label, color, bgColor }) => (
  <div style={{
    background: "white", border: "0.5px solid #e2e8f0", borderRadius: 10,
    padding: "12px 14px", display: "flex", alignItems: "center", gap: 10,
  }}>
    <div style={{
      width: 36, height: 36, borderRadius: 8, background: bgColor,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <Icon size={16} color={color} />
    </div>
    <div>
      <div style={{ fontSize: 22, fontWeight: 600, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>{label}</div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// FilterField
// ─────────────────────────────────────────────────────────────────────────────
const FilterField = ({ label, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
      {label}
    </label>
    {children}
  </div>
);

const inputBase = (width = 140) => ({
  width, padding: "6px 10px", fontSize: 13,
  borderRadius: 8, border: "0.5px solid #cbd5e1",
  background: "white", outline: "none", color: "#0f172a",
});

// ─────────────────────────────────────────────────────────────────────────────
// Route Delay Detail Modal (inline)
// ─────────────────────────────────────────────────────────────────────────────
const RouteDelayDetailModal = ({ routeId, tenantId, onClose }) => {
  const dispatch     = useDispatch();
  const detailStatus = useSelector(selectDetailStatus);
  const detailError  = useSelector(selectDetailError);
  const detail       = useSelector(selectRouteDelayDetail);

  useEffect(() => {
    dispatch(fetchRouteDelayDetailThunk({ routeId, tenant_id: tenantId }));
    return () => { dispatch(clearDetail()); };
  }, [dispatch, routeId, tenantId]);

  const ds = detail?.delay_summary;

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 9999, padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "white", borderRadius: 14, width: "100%", maxWidth: 680,
        maxHeight: "90vh", display: "flex", flexDirection: "column",
        boxShadow: "0 16px 48px rgba(0,0,0,0.18)",
      }}>
        {/* Header */}
        <div style={{
          padding: "16px 20px", borderBottom: "0.5px solid #e2e8f0",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, color: "#0f172a" }}>
              Delay Analysis — {detail?.route_code ?? `Route #${routeId}`}
            </div>
            {detail && (
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                Shift {detail.shift_id ?? "—"} &middot; {detail.status ?? "—"}
              </div>
            )}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", display: "flex" }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", padding: "16px 20px", flex: 1 }}>
          {detailStatus === "loading" && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>Loading…</div>
          )}
          {detailStatus === "failed" && (
            <div style={{ background: "#fef2f2", border: "0.5px solid #fecaca", borderRadius: 8, padding: "12px 14px", color: "#dc2626", fontSize: 13 }}>
              {detailError}
            </div>
          )}
          {detailStatus === "succeeded" && detail && (
            <>
              {/* Summary row */}
              <div style={{
                background: "#f8fafc", border: "0.5px solid #e2e8f0", borderRadius: 10,
                padding: "14px 16px", marginBottom: 20, display: "flex", flexWrap: "wrap", gap: 16,
              }}>
                <div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Delay Status</div>
                  <DelayBadge
                    delayType={ds?.delay_type}
                    delayMinutes={ds?.delay_minutes}
                    graceMins={ds?.ota_grace_minutes}
                    showNull
                  />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Actual Start</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{fmtTime(detail.actual_start_time)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Actual End</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{fmtTime(detail.actual_end_time)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Est. Duration</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                    {detail.estimated_total_time_min != null ? `${detail.estimated_total_time_min} min` : "—"}
                  </div>
                </div>
                {ds?.ota_grace_minutes != null && (
                  <div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Grace Window</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>&plusmn;{ds.ota_grace_minutes} min</div>
                  </div>
                )}
              </div>

              {/* Event history table */}
              <div style={{ fontWeight: 600, fontSize: 13, color: "#0f172a", marginBottom: 10 }}>Event History</div>
              {(!detail.events || detail.events.length === 0) ? (
                <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8", fontSize: 13 }}>No events recorded</div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      {["Kind", "Type", "Delay", "Tagged At", "Notes"].map((h) => (
                        <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontWeight: 600, color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "0.5px solid #e2e8f0" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {detail.events.map((ev, i) => (
                      <tr key={ev.id ?? i} style={{ borderBottom: "0.5px solid #f1f5f9" }}>
                        <td style={{ padding: "8px 10px", fontWeight: 600, color: "#0f172a" }}>{ev.event_kind}</td>
                        <td style={{ padding: "8px 10px" }}>
                          <DelayBadge delayType={ev.delay_type} delayMinutes={ev.delay_minutes} showNull compact />
                        </td>
                        <td style={{ padding: "8px 10px", color: "#0f172a" }}>{fmtDelayMins(ev.delay_minutes)}</td>
                        <td style={{ padding: "8px 10px", color: "#64748b" }}>{fmtTime(ev.tagged_at)}</td>
                        <td style={{ padding: "8px 10px", color: "#64748b" }}>
                          {ev.notes ? (
                            <span title={ev.notes} style={{ cursor: "help", display: "inline-flex", alignItems: "center", gap: 4 }}>
                              <Info size={13} style={{ flexShrink: 0 }} />
                              <span style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "inline-block" }}>
                                {ev.notes}
                              </span>
                            </span>
                          ) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
const DelayReport = () => {
  const dispatch    = useDispatch();
  const currentUser = useSelector(selectCurrentUser);

  const isAdmin    = currentUser?.type === "admin";
  const userTenant = currentUser?.employee?.tenant_id || currentUser?.vendor_user?.tenant_id || currentUser?.tenant_id || "";

  const status  = useSelector(selectDelayReportStatus);
  const error   = useSelector(selectDelayReportError);
  const summary = useSelector(selectDelayReportSummary);
  const routes  = useSelector(selectDelayReportRoutes);

  // ── Filter state ────────────────────────────────────────────────────────────
  const today     = new Date().toISOString().split("T")[0];
  const sevenAgo  = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
  const [startDate,  setStartDate]  = useState(sevenAgo);
  const [endDate,    setEndDate]    = useState(today);
  const [delayType,  setDelayType]  = useState("");
  const [tenantId,   setTenantId]   = useState(isAdmin ? "" : userTenant);
  const [detailRouteId, setDetailRouteId] = useState(null);

  // ── Param builder ────────────────────────────────────────────────────────────
  const buildParams = useCallback(() => ({
    start_date:  startDate,
    end_date:    endDate,
    ...(delayType && { delay_type: delayType }),
    ...(isAdmin && tenantId && { tenant_id: tenantId }),
    ...(!isAdmin && userTenant && { tenant_id: userTenant }),
  }), [startDate, endDate, delayType, isAdmin, tenantId, userTenant]);

  // ── Auto-fetch for company users on mount ────────────────────────────────────
  useEffect(() => {
    if (!isAdmin) {
      dispatch(fetchDelayReportThunk(buildParams()));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApply = () => {
    if (isAdmin && !tenantId) return;
    dispatch(fetchDelayReportThunk(buildParams()));
  };

  const handleReset = () => {
    setStartDate(sevenAgo);
    setEndDate(today);
    setDelayType("");
    if (!isAdmin && userTenant) {
      dispatch(fetchDelayReportThunk({ start_date: sevenAgo, end_date: today, tenant_id: userTenant }));
    }
  };

  const canFetch = isAdmin ? !!tenantId : true;

  const avgDelay = summary?.average_delay_minutes;
  const avgLabel = avgDelay == null ? "—" : avgDelay > 0 ? `+${avgDelay.toFixed(1)}m` : avgDelay < 0 ? `${avgDelay.toFixed(1)}m` : "0m";

  return (
    <div style={{ fontFamily: "Inter,-apple-system,BlinkMacSystemFont,sans-serif", background: "#f1f5f9", minHeight: "100vh" }}>
      <style>{`
        ::placeholder { color: #94a3b8; }
        input[type="date"]::-webkit-calendar-picker-indicator { opacity: 0.5; cursor: pointer; }
      `}</style>

      <div style={{ padding: "20px 28px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ── KPI Cards ─────────────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
          <KpiCard icon={BarChart2}    value={summary?.total_routes_tagged ?? "—"} label="Total Tagged"    color="#534AB7" bgColor="#EEEDFE" />
          <KpiCard icon={TrendingDown} value={summary?.late              ?? "—"} label="Late"             color="#A32D2D" bgColor="#FCEBEB" />
          <KpiCard icon={TrendingUp}   value={summary?.early             ?? "—"} label="Early"            color="#1D4ED8" bgColor="#EFF6FF" />
          <KpiCard icon={CheckCircle2} value={summary?.on_time           ?? "—"} label="On Time"          color="#166534" bgColor="#F0FDF4" />
          <KpiCard icon={Clock}        value={avgLabel}                          label="Avg Delay"         color="#92400E" bgColor="#FEF3C7" />
        </div>

        {/* ── Filter card ───────────────────────────────────────────────── */}
        <div style={{ background: "white", border: "0.5px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>

          <div style={{ padding: "12px 16px", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end", borderBottom: "0.5px solid #f1f5f9" }}>

            {/* Tenant — superadmin only */}
            {isAdmin && (
              <FilterField label="Tenant ID">
                <input
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  placeholder="e.g. TENANT001"
                  style={inputBase(160)}
                />
              </FilterField>
            )}

            {/* Date range */}
            <FilterField label="From">
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputBase(140)} />
            </FilterField>
            <FilterField label="To">
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={inputBase(140)} />
            </FilterField>

            {/* Delay type filter */}
            <FilterField label="Delay Type">
              <select
                value={delayType}
                onChange={(e) => setDelayType(e.target.value)}
                style={{ ...inputBase(130), cursor: "pointer" }}
              >
                <option value="">All</option>
                <option value="LATE">Late</option>
                <option value="EARLY">Early</option>
                <option value="ON_TIME">On Time</option>
              </select>
            </FilterField>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
              <button
                onClick={handleReset}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", background: "white", border: "0.5px solid #e2e8f0", borderRadius: 8, color: "#64748b", cursor: "pointer", fontSize: 13 }}
              >
                <RotateCcw size={13} /> Reset
              </button>
              <button
                onClick={handleApply}
                disabled={!canFetch}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 16px", background: !canFetch ? "#e2e8f0" : "#534AB7", border: "none", borderRadius: 8, color: !canFetch ? "#94a3b8" : "white", cursor: !canFetch ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 600, boxShadow: !canFetch ? "none" : "0 2px 8px rgba(83,74,183,0.25)" }}
              >
                <SlidersHorizontal size={13} /> Apply
              </button>
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div style={{ padding: "10px 16px", background: "#fef2f2", borderBottom: "0.5px solid #fecaca", color: "#dc2626", fontSize: 13 }}>
              {error}
            </div>
          )}

          {/* Gate message */}
          {isAdmin && !tenantId ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <BarChart2 style={{ margin: "0 auto 14px", display: "block", color: "#cbd5e1" }} size={44} />
              <div style={{ fontSize: 14, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Enter a Tenant ID to load the delay report</div>
            </div>
          ) : status === "loading" ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8", fontSize: 14 }}>Loading…</div>
          ) : routes.length === 0 && status === "succeeded" ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8", fontSize: 14 }}>No delay data for the selected range.</div>
          ) : routes.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Route Code", "Shift", "Driver", "Start", "End", "Est. Duration", "Delay"].map((h) => (
                      <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "0.5px solid #e2e8f0", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {routes.map((r) => (
                    <tr
                      key={r.route_id}
                      onClick={() => setDetailRouteId(r.route_id)}
                      style={{ borderBottom: "0.5px solid #f1f5f9", cursor: "pointer", transition: "background 0.12s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#f8fafc"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = ""; }}
                    >
                      <td style={{ padding: "10px 12px", fontWeight: 600, color: "#0f172a" }}>{r.route_code ?? `#${r.route_id}`}</td>
                      <td style={{ padding: "10px 12px", color: "#0f172a" }}>{r.shift_id ?? "—"}</td>
                      <td style={{ padding: "10px 12px", color: "#0f172a" }}>
                        {r.assigned_driver_id ? `#${r.assigned_driver_id}` : "—"}
                      </td>
                      <td style={{ padding: "10px 12px", color: "#0f172a", whiteSpace: "nowrap" }}>{fmtTime(r.actual_start_time)}</td>
                      <td style={{ padding: "10px 12px", color: "#0f172a", whiteSpace: "nowrap" }}>{fmtTime(r.actual_end_time)}</td>
                      <td style={{ padding: "10px 12px", color: "#0f172a" }}>
                        {r.estimated_total_time_min != null ? `${r.estimated_total_time_min} min` : "—"}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <DelayBadge
                          delayType={r.delay_type}
                          delayMinutes={r.delay_minutes}
                          graceMins={r.ota_grace_minutes}
                          showNull
                          compact
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>

        {/* Date note */}
        <div style={{ fontSize: 11, color: "#94a3b8", textAlign: "right" }}>
          Showing delay data tagged between {startDate} and {endDate} &middot; Max range: 90 days
        </div>
      </div>

      {/* Route delay detail modal */}
      {detailRouteId && (
        <RouteDelayDetailModal
          routeId={detailRouteId}
          tenantId={isAdmin ? tenantId : userTenant}
          onClose={() => setDetailRouteId(null)}
        />
      )}
    </div>
  );
};

export default DelayReport;

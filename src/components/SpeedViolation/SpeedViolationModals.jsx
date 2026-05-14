import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRouteSummaryThunk,
} from "../../redux/features/speedviolations/speedViolationsThunk";
import {
  selectRouteSummary,
  selectRouteSummaryLoading,
  selectRouteSummaryError,
  clearRouteSummary,
} from "../../redux/features/speedviolations/speedViolationsSlice";

// ─── Shared atoms ─────────────────────────────────────────────────────────────
const Spinner = () => (
  <svg style={{ animation: "spin 0.8s linear infinite" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/>
  </svg>
);

const ModalWrapper = ({ title, subtitle, onClose, children, width = 620 }) => (
  <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)" }}>
    <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 16, width: "100%", maxWidth: width, margin: "0 16px", boxShadow: "0 20px 60px rgba(0,0,0,0.12)", overflow: "hidden", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "18px 24px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "flex-start", background: "#fafafa", flexShrink: 0 }}>
        <div>
          <div style={{ color: "#0f172a", fontWeight: 700, fontSize: 16 }}>{title}</div>
          {subtitle && <div style={{ color: "#94a3b8", fontSize: 11, marginTop: 3, fontFamily: "monospace" }}>{subtitle}</div>}
        </div>
        <button
          onClick={onClose}
          style={{ background: "#f1f5f9", border: "none", color: "#64748b", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "4px 9px", borderRadius: 6 }}
          onMouseOver={e => { e.currentTarget.style.background = "#e2e8f0"; e.currentTarget.style.color = "#0f172a"; }}
          onMouseOut={e  => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#64748b"; }}
        >×</button>
      </div>
      {/* Scrollable body */}
      <div style={{ padding: "22px 24px", overflowY: "auto" }}>{children}</div>
    </div>
  </div>
);

const formatDateTime = (dt) => {
  if (!dt) return "—";
  try {
    return new Date(dt).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true,
    });
  } catch { return dt; }
};

const SEVERITY_STYLE = (overspeedBy) => {
  if (overspeedBy >= 30) return { bg: "#fef2f2", color: "#dc2626", border: "#fecaca", label: "Critical" };
  if (overspeedBy >= 15) return { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa", label: "High"     };
  if (overspeedBy >= 5)  return { bg: "#fffbeb", color: "#b45309", border: "#fde68a", label: "Medium"   };
  return                        { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0", label: "Low"      };
};

// ─── Route Summary Modal ──────────────────────────────────────────────────────
export const RouteSummaryModal = ({ routeId, tenantId = null, onClose }) => {
  const dispatch = useDispatch();
  const summary  = useSelector(selectRouteSummary);
  const loading  = useSelector(selectRouteSummaryLoading);
  const error    = useSelector(selectRouteSummaryError);

  useEffect(() => {
    dispatch(fetchRouteSummaryThunk({ routeId, tenantId }));
    return () => dispatch(clearRouteSummary());
  }, [routeId]);

  return (
    <ModalWrapper
      title={`Route Summary — #${routeId}`}
      subtitle={`GET /api/v1/speed-violations/route/${routeId}/summary`}
      onClose={onClose}
      width={700}
    >
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "40px 0", color: "#6366f1", fontSize: 13 }}>
          <Spinner /> Loading summary…
        </div>
      ) : error ? (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "14px 16px", color: "#dc2626", fontSize: 13 }}>
          {error}
        </div>
      ) : summary ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
            {[
              { l: "Total Violations", v: summary.total_violations, c: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
              { l: "Max Speed",        v: `${summary.max_speed_recorded} km/h`, c: "#c2410c", bg: "#fff7ed", border: "#fed7aa" },
              { l: "Avg Speed",        v: `${summary.avg_speed_recorded?.toFixed(1)} km/h`, c: "#b45309", bg: "#fffbeb", border: "#fde68a" },
              { l: "Speed Limit",      v: `${summary.speed_limit} km/h`, c: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
            ].map((s) => (
              <div key={s.l} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ color: s.c, fontSize: 20, fontWeight: 800, lineHeight: 1 }}>{s.v}</div>
                <div style={{ color: "#94a3b8", fontSize: 11, fontWeight: 500, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Driver + Vehicle info */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Driver",          value: summary.driver_name || "—" },
              { label: "Driver ID",       value: summary.driver_id   || "—" },
              { label: "Vehicle RC",      value: summary.vehicle_rc  || "—" },
              { label: "Vehicle ID",      value: summary.vehicle_id  || "—" },
              { label: "First Violation", value: formatDateTime(summary.first_violation_at) },
              { label: "Last Violation",  value: formatDateTime(summary.last_violation_at)  },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#f8fafc", borderRadius: 8, border: "1px solid #f1f5f9" }}>
                <span style={{ color: "#94a3b8", fontSize: 12, fontWeight: 500, width: 120, flexShrink: 0 }}>{label}</span>
                <span style={{ color: "#0f172a", fontSize: 13, fontWeight: 600 }}>{String(value)}</span>
              </div>
            ))}
          </div>

          {/* Violations list */}
          {summary.violations?.length > 0 && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 10 }}>
                All Violations on this Ride
              </div>
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                      {["#", "Speed", "Limit", "Overspeed", "Severity", "Recorded At"].map(h => (
                        <th key={h} style={{ padding: "9px 12px", textAlign: "left", color: "#64748b", fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {summary.violations.map((v, i) => {
                      const sev = SEVERITY_STYLE(v.overspeed_by ?? (v.speed_recorded - v.speed_limit));
                      return (
                        <tr key={v.violation_id} style={{ borderBottom: i < summary.violations.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                          <td style={{ padding: "10px 12px", color: "#94a3b8", fontSize: 12 }}>#{v.violation_id}</td>
                          <td style={{ padding: "10px 12px", color: "#dc2626", fontWeight: 700, fontSize: 13 }}>{v.speed_recorded} km/h</td>
                          <td style={{ padding: "10px 12px", color: "#16a34a", fontWeight: 600, fontSize: 13 }}>{v.speed_limit} km/h</td>
                          <td style={{ padding: "10px 12px", color: sev.color, fontWeight: 700, fontSize: 13 }}>+{(v.overspeed_by ?? (v.speed_recorded - v.speed_limit)).toFixed(1)} km/h</td>
                          <td style={{ padding: "10px 12px" }}>
                            <span style={{ background: sev.bg, border: `1px solid ${sev.border}`, color: sev.color, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20 }}>{sev.label}</span>
                          </td>
                          <td style={{ padding: "10px 12px", color: "#64748b", fontSize: 12 }}>{formatDateTime(v.recorded_at)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ padding: "10px 24px", borderRadius: 8, border: "1px solid #e2e8f0", background: "white", color: "#64748b", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
              Close
            </button>
          </div>
        </div>
      ) : null}
    </ModalWrapper>
  );
};
const SEVERITY_STYLE = (overspeedBy) => {
  if (overspeedBy >= 30) return { bg: "#fef2f2", color: "#dc2626", border: "#fecaca", label: "Critical" };
  if (overspeedBy >= 15) return { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa", label: "High"     };
  if (overspeedBy >= 5)  return { bg: "#fffbeb", color: "#b45309", border: "#fde68a", label: "Medium"   };
  return                        { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0", label: "Low"      };
};

const formatDateTime = (dt) => {
  if (!dt) return "—";
  try {
    return new Date(dt).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true,
    });
  } catch { return dt; }
};

const Spinner = () => (
  <svg style={{ animation: "spin 0.8s linear infinite" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/>
  </svg>
);

const SpeedViolationTable = ({ violations, loading, onViewRoute, onViewDriver }) => {

  const Btn = ({ label, bg, color, hoverBg, onClick }) => (
    <button
      onClick={onClick}
      style={{ padding: "4px 12px", background: bg, border: "none", borderRadius: 6, color, cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all 0.12s", whiteSpace: "nowrap" }}
      onMouseOver={e => e.currentTarget.style.background = hoverBg}
      onMouseOut={e  => e.currentTarget.style.background = bg}
    >{label}</button>
  );

  return (
    <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              {["#", "Driver", "Vehicle RC", "Speed", "Limit", "Overspeed By", "Severity", "Recorded At", "Actions"].map((h) => (
                <th key={h} style={{ padding: "11px 14px", textAlign: "left", color: "#64748b", fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ padding: "60px 16px", textAlign: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "#6366f1", fontSize: 13 }}>
                    <Spinner /> Loading violations…
                  </div>
                </td>
              </tr>
            ) : violations.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: "60px 16px", textAlign: "center" }}>
                  <svg style={{ margin: "0 auto 12px", display: "block" }} width="40" height="40" fill="none" stroke="#cbd5e1" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div style={{ color: "#64748b", fontSize: 14, fontWeight: 600 }}>No violations found</div>
                  <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 4 }}>Try adjusting your filters</div>
                </td>
              </tr>
            ) : (
              violations.map((v, i) => {
                const sev = SEVERITY_STYLE(v.overspeed_by ?? (v.speed_recorded - v.speed_limit));
                return (
                  <tr key={v.violation_id}
                    style={{ borderBottom: i < violations.length - 1 ? "1px solid #f1f5f9" : "none", transition: "background 0.1s" }}
                    onMouseOver={e => e.currentTarget.style.background = "#fafafa"}
                    onMouseOut={e  => e.currentTarget.style.background = "transparent"}
                  >
                    {/* ID */}
                    <td style={{ padding: "13px 14px", color: "#94a3b8", fontSize: 12, fontWeight: 500 }}>
                      #{v.violation_id}
                    </td>

                    {/* Driver */}
                    <td style={{ padding: "13px 14px" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{v.driver_name || "—"}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>ID: {v.driver_id}</div>
                    </td>

                    {/* Vehicle RC */}
                    <td style={{ padding: "13px 14px" }}>
                      <span style={{ background: "#f1f5f9", color: "#475569", fontSize: 12, fontWeight: 600, padding: "3px 8px", borderRadius: 6, fontFamily: "monospace" }}>
                        {v.vehicle_rc || "—"}
                      </span>
                    </td>

                    {/* Speed recorded */}
                    <td style={{ padding: "13px 14px" }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: "#dc2626" }}>
                        {v.speed_recorded}
                      </span>
                      <span style={{ color: "#94a3b8", fontSize: 11, marginLeft: 3 }}>km/h</span>
                    </td>

                    {/* Speed limit */}
                    <td style={{ padding: "13px 14px" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#16a34a" }}>
                        {v.speed_limit}
                      </span>
                      <span style={{ color: "#94a3b8", fontSize: 11, marginLeft: 3 }}>km/h</span>
                    </td>

                    {/* Overspeed by */}
                    <td style={{ padding: "13px 14px" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: sev.color }}>
                        +{(v.overspeed_by ?? (v.speed_recorded - v.speed_limit)).toFixed(1)} km/h
                      </span>
                    </td>

                    {/* Severity badge */}
                    <td style={{ padding: "13px 14px" }}>
                      <span style={{ background: sev.bg, border: `1px solid ${sev.border}`, color: sev.color, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>
                        {sev.label}
                      </span>
                    </td>

                    {/* Recorded at */}
                    <td style={{ padding: "13px 14px", color: "#64748b", fontSize: 12, whiteSpace: "nowrap" }}>
                      {formatDateTime(v.recorded_at)}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "13px 14px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        {v.route_id && (
                          <Btn label="Route" bg="#eef2ff" color="#4f46e5" hoverBg="#e0e7ff" onClick={() => onViewRoute(v.route_id)} />
                        )}
                        <Btn label="Driver" bg="#f0f9ff" color="#0369a1" hoverBg="#bae6fd" onClick={() => onViewDriver(v.driver_id)} />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SpeedViolationTable;
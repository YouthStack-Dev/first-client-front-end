// SpeedViolationTable.jsx — 3-level: Driver → Route → Individual violations

import { useState, Fragment } from "react";

/* ── Severity helpers ─────────────────────────────────────────────────────── */
const SEVERITY_STYLE = (overspeedBy) => {
  if (overspeedBy >= 30) return { bg: "#fef2f2", color: "#dc2626", border: "#fecaca", label: "Critical" };
  if (overspeedBy >= 15) return { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa", label: "High"     };
  if (overspeedBy >= 5)  return { bg: "#fffbeb", color: "#b45309", border: "#fde68a", label: "Medium"   };
  return                        { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0", label: "Low"      };
};
const SEVERITY_RANK = { Critical: 4, High: 3, Medium: 2, Low: 1 };
const worstSeverity = (violations) => {
  let worst = null;
  for (const v of violations) {
    const ob  = v.overspeed_by ?? (v.speed_recorded - v.speed_limit);
    const sev = SEVERITY_STYLE(ob);
    if (!worst || SEVERITY_RANK[sev.label] > SEVERITY_RANK[worst.label]) worst = sev;
  }
  return worst ?? SEVERITY_STYLE(0);
};

/* ── Grouping helper ──────────────────────────────────────────────────────── */
// Returns [ { driver_id, driver_name, routes: [ { route_id, violations: [...] } ] } ]
const groupByDriverThenRoute = (violations) => {
  const driverMap = new Map();
  for (const v of violations) {
    if (!driverMap.has(v.driver_id)) {
      driverMap.set(v.driver_id, { driver_id: v.driver_id, driver_name: v.driver_name || "—", routeMap: new Map() });
    }
    const driver = driverMap.get(v.driver_id);
    if (!driver.routeMap.has(v.route_id)) {
      driver.routeMap.set(v.route_id, { route_id: v.route_id, violations: [] });
    }
    driver.routeMap.get(v.route_id).violations.push(v);
  }
  return Array.from(driverMap.values()).map(d => ({
    driver_id:   d.driver_id,
    driver_name: d.driver_name,
    routes:      Array.from(d.routeMap.values()),
  }));
};

/* ── Misc helpers ─────────────────────────────────────────────────────────── */
const formatDateTime = (dt) => {
  if (!dt) return "—";
  try {
    return new Date(dt).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true,
    });
  } catch { return dt; }
};

/* ── Reusable micro-components ────────────────────────────────────────────── */
const Spinner = () => (
  <svg style={{ animation: "spin 0.8s linear infinite" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/>
  </svg>
);

const Btn = ({ label, bg, color, hoverBg, onClick }) => (
  <button
    onClick={e => { e.stopPropagation(); onClick(); }}
    style={{ padding: "4px 12px", background: bg, border: "none", borderRadius: 6, color, cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "background 0.12s", whiteSpace: "nowrap" }}
    onMouseOver={e => e.currentTarget.style.background = hoverBg}
    onMouseOut={e  => e.currentTarget.style.background = bg}
  >{label}</button>
);

const Chevron = ({ open, size = 15 }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transition: "transform 0.2s", transform: open ? "rotate(90deg)" : "rotate(0deg)", flexShrink: 0 }}
  >
    <path d="M9 18l6-6-6-6"/>
  </svg>
);

const SeverityBadge = ({ sev }) => (
  <span style={{ background: sev.bg, border: `1px solid ${sev.border}`, color: sev.color, fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 20, whiteSpace: "nowrap" }}>
    {sev.label}
  </span>
);

const CountBadge = ({ count, bg = "#eef2ff", color = "#4f46e5" }) => (
  <span style={{ background: bg, color, fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20, whiteSpace: "nowrap" }}>
    {count} {count === 1 ? "violation" : "violations"}
  </span>
);

/* ── Main component ───────────────────────────────────────────────────────── */
const SpeedViolationTable = ({ violations = [], loading = false, onViewRoute, onViewDriver, currentPage = 1, limit = 20 }) => {

  const [openDrivers, setOpenDrivers] = useState(new Set());
  const [openRoutes,  setOpenRoutes]  = useState(new Set()); // key: `${driver_id}-${route_id}`

  const toggleDriver = (driverId) =>
    setOpenDrivers(prev => { const s = new Set(prev); s.has(driverId) ? s.delete(driverId) : s.add(driverId); return s; });

  const toggleRoute = (driverId, routeId) => {
    const key = `${driverId}-${routeId}`;
    setOpenRoutes(prev => { const s = new Set(prev); s.has(key) ? s.delete(key) : s.add(key); return s; });
  };

  const groups     = groupByDriverThenRoute(violations);
  const rowOffset  = (currentPage - 1) * limit;

  const TH = ({ children }) => (
    <th style={{ padding: "11px 14px", textAlign: "left", color: "#64748b", fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
      {children}
    </th>
  );

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>

            {/* ── HEADER ── */}
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <TH></TH>
                <TH>Driver / Route</TH>
                <TH>Vehicle RC</TH>
                <TH>Violations</TH>
                <TH>Worst Severity</TH>
                <TH>Actions</TH>
              </tr>
            </thead>

            {/* ── BODY ── */}
            <tbody>

              {/* Loading */}
              {loading && (
                <tr>
                  <td colSpan={6} style={{ padding: "60px 16px", textAlign: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "#6366f1", fontSize: 13 }}>
                      <Spinner /> Loading violations…
                    </div>
                  </td>
                </tr>
              )}

              {/* Empty */}
              {!loading && groups.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: "60px 16px", textAlign: "center" }}>
                    <svg style={{ margin: "0 auto 12px", display: "block" }} width="40" height="40" fill="none" stroke="#cbd5e1" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div style={{ color: "#64748b", fontSize: 14, fontWeight: 600 }}>No violations found</div>
                    <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 4 }}>Try adjusting your filters</div>
                  </td>
                </tr>
              )}

              {/* Data */}
              {!loading && groups.map((driver, driverIndex) => {
                const driverOpen      = openDrivers.has(driver.driver_id);
                const allViolations   = driver.routes.flatMap(r => r.violations);
                const driverWorst     = worstSeverity(allViolations);
                const totalCount      = allViolations.length;
                const uniqueRCs       = [...new Set(allViolations.map(v => v.vehicle_rc).filter(Boolean))];
                const isLastDriver    = driverIndex === groups.length - 1;

                return (
                  <Fragment key={`driver-${driver.driver_id}`}>
                    {/* ════ LEVEL 1 — Driver row ════ */}
                    <tr
                      onClick={() => toggleDriver(driver.driver_id)}
                      style={{
                        borderBottom: driverOpen ? "1px solid #e0e7ff" : (!isLastDriver ? "1px solid #f1f5f9" : "none"),
                        background:   driverOpen ? "#f5f7ff" : "white",
                        cursor: "pointer", userSelect: "none", transition: "background 0.15s",
                      }}
                      onMouseOver={e => { if (!driverOpen) e.currentTarget.style.background = "#f8fafc"; }}
                      onMouseOut={e  => { if (!driverOpen) e.currentTarget.style.background = "white";   }}
                    >
                      {/* chevron + index */}
                      <td style={{ padding: "14px 14px", width: 44 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, color: "#6366f1" }}>
                          <Chevron open={driverOpen} />
                          <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>{rowOffset + driverIndex + 1}</span>
                        </div>
                      </td>

                      {/* driver name */}
                      <td style={{ padding: "14px 14px" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{driver.driver_name}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>
                          ID: {driver.driver_id} · {driver.routes.length} {driver.routes.length === 1 ? "route" : "routes"}
                        </div>
                      </td>

                      {/* vehicle RCs */}
                      <td style={{ padding: "14px 14px" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {uniqueRCs.length > 0
                            ? uniqueRCs.map(rc => (
                                <span key={rc} style={{ background: "#f1f5f9", color: "#475569", fontSize: 12, fontWeight: 600, padding: "3px 8px", borderRadius: 6, fontFamily: "monospace" }}>
                                  {rc}
                                </span>
                              ))
                            : <span style={{ color: "#94a3b8", fontSize: 12 }}>—</span>
                          }
                        </div>
                      </td>

                      {/* total count */}
                      <td style={{ padding: "14px 14px" }}>
                        <CountBadge count={totalCount} />
                      </td>

                      {/* worst severity */}
                      <td style={{ padding: "14px 14px" }}>
                        <SeverityBadge sev={driverWorst} />
                      </td>

                      {/* driver button */}
                      <td style={{ padding: "14px 14px" }}>
                        <Btn label="Driver" bg="#f0f9ff" color="#0369a1" hoverBg="#bae6fd" onClick={() => onViewDriver(driver.driver_id)} />
                      </td>
                    </tr>

                    {/* ════ LEVEL 2 — Route rows (visible when driver is open) ════ */}
                    {driverOpen && driver.routes.map((route, routeIndex) => {
                      const routeKey    = `${driver.driver_id}-${route.route_id}`;
                      const routeOpen   = openRoutes.has(routeKey);
                      const routeWorst  = worstSeverity(route.violations);
                      const isLastRoute = routeIndex === driver.routes.length - 1;
                      const routeRCs    = [...new Set(route.violations.map(v => v.vehicle_rc).filter(Boolean))];

                      return (
                        <Fragment key={`route-${routeKey}`}>
                          <tr
                            onClick={() => toggleRoute(driver.driver_id, route.route_id)}
                            style={{
                              borderBottom: routeOpen ? "1px solid #e0e7ff" : (!isLastRoute || !isLastDriver ? "1px solid #f1f5f9" : "none"),
                              background:   routeOpen ? "#eff1ff" : "#f5f7ff",
                              cursor: "pointer", userSelect: "none", transition: "background 0.15s",
                            }}
                            onMouseOver={e => { if (!routeOpen) e.currentTarget.style.background = "#eef0ff"; }}
                            onMouseOut={e  => { if (!routeOpen) e.currentTarget.style.background = "#f5f7ff"; }}
                          >
                            {/* indent + chevron */}
                            <td style={{ padding: "11px 14px", width: 44 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, paddingLeft: 20, color: "#818cf8" }}>
                                <Chevron open={routeOpen} size={13} />
                              </div>
                            </td>

                            {/* route label */}
                            <td style={{ padding: "11px 14px" }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: "#3730a3" }}>
                                Route #{route.route_id}
                              </div>
                            </td>

                            {/* route RCs */}
                            <td style={{ padding: "11px 14px" }}>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                {routeRCs.length > 0
                                  ? routeRCs.map(rc => (
                                      <span key={rc} style={{ background: "#e0e7ff", color: "#4338ca", fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 5, fontFamily: "monospace" }}>
                                        {rc}
                                      </span>
                                    ))
                                  : <span style={{ color: "#94a3b8", fontSize: 11 }}>—</span>
                                }
                              </div>
                            </td>

                            {/* route violation count */}
                            <td style={{ padding: "11px 14px" }}>
                              <CountBadge count={route.violations.length} bg="#e0e7ff" color="#4338ca" />
                            </td>

                            {/* route worst severity */}
                            <td style={{ padding: "11px 14px" }}>
                              <SeverityBadge sev={routeWorst} />
                            </td>

                            {/* route button */}
                            <td style={{ padding: "11px 14px" }}>
                              <Btn label="Route" bg="#eef2ff" color="#4f46e5" hoverBg="#e0e7ff" onClick={() => onViewRoute(route.route_id)} />
                            </td>
                          </tr>

                          {/* ════ LEVEL 3 — Individual violation rows ════ */}
                          {routeOpen && route.violations.map((v, vIndex) => {
                            const ob          = v.overspeed_by ?? (v.speed_recorded - v.speed_limit);
                            const sev         = SEVERITY_STYLE(ob);
                            const isLastV     = vIndex === route.violations.length - 1;

                            return (
                              <tr
                                key={`v-${v.violation_id}`}
                                style={{
                                  borderBottom: (!isLastV || !isLastRoute || !isLastDriver) ? "1px solid #f1f5f9" : "none",
                                  background: "#fafaff",
                                  transition: "background 0.1s",
                                }}
                                onMouseOver={e => e.currentTarget.style.background = "#eef0ff"}
                                onMouseOut={e  => e.currentTarget.style.background = "#fafaff"}
                              >
                                {/* indent marker */}
                                <td style={{ padding: "10px 14px", width: 44 }}>
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingLeft: 28 }}>
                                    <div style={{ width: 2, height: 16, background: "#c7d2fe", borderRadius: 2 }} />
                                  </div>
                                </td>

                                {/* violation ID + time */}
                                <td style={{ padding: "10px 14px" }}>
                                  <div style={{ fontSize: 11, fontWeight: 600, color: "#6366f1" }}>#{v.violation_id}</div>
                                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{formatDateTime(v.recorded_at)}</div>
                                </td>

                                {/* vehicle RC */}
                                <td style={{ padding: "10px 14px" }}>
                                  <span style={{ background: "#e0e7ff", color: "#4338ca", fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 5, fontFamily: "monospace" }}>
                                    {v.vehicle_rc || "—"}
                                  </span>
                                </td>

                                {/* speed details */}
                                <td style={{ padding: "10px 14px" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                                    <span style={{ fontSize: 13, fontWeight: 800, color: "#dc2626" }}>{Number(v.speed_recorded).toFixed(1)}</span>
                                    <span style={{ color: "#94a3b8", fontSize: 11 }}>km/h</span>
                                    <span style={{ color: "#cbd5e1", fontSize: 10 }}>vs</span>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: "#16a34a" }}>{v.speed_limit}</span>
                                    <span style={{ color: "#94a3b8", fontSize: 11 }}>limit</span>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: sev.color }}>+{ob.toFixed(1)}</span>
                                  </div>
                                </td>

                                {/* severity */}
                                <td style={{ padding: "10px 14px" }}>
                                  <SeverityBadge sev={sev} />
                                </td>

                                {/* no actions on leaf row — route button is on the route header */}
                                <td style={{ padding: "10px 14px" }} />
                              </tr>
                            );
                          })}
                        </Fragment>
                      );
                    })}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default SpeedViolationTable;
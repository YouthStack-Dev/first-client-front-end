import { useEffect } from "react";

// ─── ModuleBadge ──────────────────────────────────────────────────────────────
const MODULE_COLORS = {
  booking:                  { bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8" },
  driver:                   { bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d" },
  "app-driver":             { bg: "#f0fdfa", border: "#99f6e4", text: "#0f766e" },
  employee:                 { bg: "#faf5ff", border: "#e9d5ff", text: "#7e22ce" },
  "route-booking":          { bg: "#fffbeb", border: "#fde68a", text: "#b45309" },
  route:                    { bg: "#fff7ed", border: "#fed7aa", text: "#c2410c" },
  shift:                    { bg: "#fef2f2", border: "#fecaca", text: "#dc2626" },
  team:                     { bg: "#eff6ff", border: "#bfdbfe", text: "#1e40af" },
  admin_tenant:             { bg: "#eef2ff", border: "#c7d2fe", text: "#4338ca" },
  vehicle:                  { bg: "#f0fdf4", border: "#bbf7d0", text: "#166534" },
  "vehicle-type":           { bg: "#dcfce7", border: "#86efac", text: "#15803d" },
  vendor:                   { bg: "#fffbeb", border: "#fde68a", text: "#92400e" },
  "vendor-user":            { bg: "#fff7ed", border: "#fed7aa", text: "#9a3412" },
  "weekoff-config":         { bg: "#f5f3ff", border: "#ddd6fe", text: "#6d28d9" },
  cutoff:                   { bg: "#f0fdfa", border: "#99f6e4", text: "#115e59" },
  permissions:              { bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8" },
  policy:                   { bg: "#eef2ff", border: "#c7d2fe", text: "#4338ca" },
  role:                     { bg: "#fdf4ff", border: "#f5d0fe", text: "#a21caf" },
  report:                   { bg: "#fefce8", border: "#fef08a", text: "#a16207" },
  route_merge:              { bg: "#fef2f2", border: "#fecaca", text: "#b91c1c" },
  route_vendor_assignment:  { bg: "#f0fdf4", border: "#bbf7d0", text: "#047857" },
  route_vehicle_assignment: { bg: "#f0fdfa", border: "#99f6e4", text: "#0e7490" },
  audit_log:                { bg: "#f8fafc", border: "#e2e8f0", text: "#475569" },
  dashboard:                { bg: "#f0f9ff", border: "#bae6fd", text: "#0369a1" },
  escort:                   { bg: "#fdf4ff", border: "#f5d0fe", text: "#9333ea" },
};

export const ModuleBadge = ({ label }) => {
  const c = MODULE_COLORS[label?.toLowerCase()] || { bg: "#f8fafc", border: "#e2e8f0", text: "#475569" };
  return (
    <span style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text, fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
};

// ─── ActiveBadge ──────────────────────────────────────────────────────────────
export const ActiveBadge = ({ active }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600,
    background: active ? "#f0fdf4" : "#fef2f2",
    border: `1px solid ${active ? "#bbf7d0" : "#fecaca"}`,
    color: active ? "#15803d" : "#dc2626" }}>
    <span style={{ width: 5, height: 5, borderRadius: "50%", background: active ? "#22c55e" : "#ef4444", display: "inline-block" }} />
    {active ? "Active" : "Inactive"}
  </span>
);

// ─── Spinner ──────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 15 }) => (
  <svg style={{ animation: "spin 0.8s linear infinite" }} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
  </svg>
);

// ─── Toast ────────────────────────────────────────────────────────────────────
export const Toast = ({ msg, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const cfg = {
    success: { bg: "#f0fdf4", border: "#bbf7d0", color: "#15803d", icon: "✓" },
    error:   { bg: "#fef2f2", border: "#fecaca", color: "#dc2626", icon: "✕" },
  }[type] || { bg: "#f8fafc", border: "#e2e8f0", color: "#475569", icon: "i" };

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", alignItems: "center", gap: 10, padding: "13px 18px", borderRadius: 12, border: `1px solid ${cfg.border}`, background: cfg.bg, color: cfg.color, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.1)", minWidth: 260 }}>
      <span style={{ fontWeight: 800, fontSize: 15 }}>{cfg.icon}</span>
      <span>{msg}</span>
    </div>
  );
};

// ─── Modal wrapper ────────────────────────────────────────────────────────────
export const Modal = ({ title, subtitle, onClose, children, width = 520 }) => (
  <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)" }}>
    <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 16, width: "100%", maxWidth: width, margin: "0 16px", boxShadow: "0 20px 60px rgba(0,0,0,0.12)", overflow: "hidden" }}>
      <div style={{ padding: "18px 24px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "flex-start", background: "#fafafa" }}>
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
      <div style={{ padding: "22px 24px" }}>{children}</div>
    </div>
  </div>
);
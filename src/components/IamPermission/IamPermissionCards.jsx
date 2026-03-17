const MODULE_GRADIENTS = {
  booking:                  "linear-gradient(135deg,#6366f1,#8b5cf6)",
  driver:                   "linear-gradient(135deg,#059669,#10b981)",
  "app-driver":             "linear-gradient(135deg,#0891b2,#06b6d4)",
  employee:                 "linear-gradient(135deg,#7c3aed,#a855f7)",
  route:                    "linear-gradient(135deg,#d97706,#f59e0b)",
  "route-booking":          "linear-gradient(135deg,#b45309,#d97706)",
  shift:                    "linear-gradient(135deg,#dc2626,#ef4444)",
  team:                     "linear-gradient(135deg,#1d4ed8,#3b82f6)",
  vehicle:                  "linear-gradient(135deg,#065f46,#059669)",
  "vehicle-type":           "linear-gradient(135deg,#047857,#10b981)",
  vendor:                   "linear-gradient(135deg,#b45309,#f59e0b)",
  "vendor-user":            "linear-gradient(135deg,#92400e,#d97706)",
  permissions:              "linear-gradient(135deg,#4f46e5,#6366f1)",
  policy:                   "linear-gradient(135deg,#7e22ce,#9333ea)",
  role:                     "linear-gradient(135deg,#be123c,#e11d48)",
  report:                   "linear-gradient(135deg,#a16207,#ca8a04)",
  dashboard:                "linear-gradient(135deg,#0369a1,#0ea5e9)",
  audit_log:                "linear-gradient(135deg,#374151,#6b7280)",
  admin_tenant:             "linear-gradient(135deg,#1e40af,#3b82f6)",
  cutoff:                   "linear-gradient(135deg,#0f766e,#14b8a6)",
  escort:                   "linear-gradient(135deg,#9333ea,#c026d3)",
  route_merge:              "linear-gradient(135deg,#c2410c,#ea580c)",
  route_vendor_assignment:  "linear-gradient(135deg,#92400e,#f59e0b)",
  route_vehicle_assignment: "linear-gradient(135deg,#065f46,#34d399)",
  "weekoff-config":         "linear-gradient(135deg,#1d4ed8,#60a5fa)",
};

const ACTION_STYLES = {
  create: { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  read:   { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  update: { bg: "#fffbeb", color: "#b45309", border: "#fde68a" },
  delete: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
};

const getGradient   = (m) => MODULE_GRADIENTS[m?.toLowerCase()] || "linear-gradient(135deg,#475569,#64748b)";
const getActionStyle = (a) => ACTION_STYLES[a?.toLowerCase()] || { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" };

const CARDS_PER_PAGE = 12;

// ─── Single Permission Card ───────────────────────────────────────────────────
const PermissionCard = ({ p, index, onView, onEdit, onDelete }) => {
  const grad   = getGradient(p.module);
  const aStyle = getActionStyle(p.action);

  return (
    <div
      className="pcard"
      style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", animation: "fadeUp 0.22s ease both", animationDelay: `${index * 12}ms` }}
    >
      {/* Header */}
      <div style={{ background: grad, padding: "16px 18px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="17" height="17" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <div style={{ color: "white", fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>{p.module}</div>
              <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, marginTop: 2 }}>ID: {p.permission_id}</div>
            </div>
          </div>
          {/* Active badge */}
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: p.is_active ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)", border: `1px solid ${p.is_active ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)"}`, color: p.is_active ? "#bbf7d0" : "#fecaca", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, flexShrink: 0 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: p.is_active ? "#4ade80" : "#f87171", display: "inline-block" }}/>
            {p.is_active ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "14px 18px" }}>
        {/* Action */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <svg width="12" height="12" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ color: "#94a3b8", fontSize: 12 }}>Action</span>
          <span style={{ background: aStyle.bg, color: aStyle.color, border: `1px solid ${aStyle.border}`, fontSize: 12, fontWeight: 600, padding: "2px 10px", borderRadius: 20 }}>
            {p.action}
          </span>
        </div>
        {/* Description */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <svg style={{ marginTop: 1, flexShrink: 0 }} width="12" height="12" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round"/><polyline points="14 2 14 8 20 8"/>
          </svg>
          <span style={{ color: p.description ? "#475569" : "#cbd5e1", fontSize: 12, lineHeight: 1.5 }}>
            {p.description || "No description provided"}
          </span>
        </div>
      </div>

      {/* Footer buttons */}
      <div style={{ padding: "0 18px 16px", display: "flex", gap: 8 }}>
        <button className="pcard-btn" onClick={() => onView(p)}   style={{ background: "#eef2ff", color: "#4f46e5" }}>View</button>
        <button className="pcard-btn" onClick={() => onEdit(p)}   style={{ background: "#f0f9ff", color: "#0369a1" }}>Edit</button>
        <button className="pcard-btn" onClick={() => onDelete(p)} style={{ background: "#fef2f2", color: "#dc2626" }}>Delete</button>
      </div>
    </div>
  );
};

// ─── Pagination ───────────────────────────────────────────────────────────────
const Pagination = ({ page, totalPages, total, onPageChange }) => {
  const start = (page - 1) * CARDS_PER_PAGE + 1;
  const end   = Math.min(page * CARDS_PER_PAGE, total);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
    .reduce((acc, n, i, arr) => {
      if (i > 0 && n - arr[i - 1] > 1) acc.push("...");
      acc.push(n);
      return acc;
    }, []);

  const NavBtn = ({ dir }) => {
    const isPrev  = dir === "prev";
    const disabled = isPrev ? page === 1 : page === totalPages;
    return (
      <button
        onClick={() => onPageChange(isPrev ? page - 1 : page + 1)}
        disabled={disabled}
        style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid #e2e8f0", background: "white", color: disabled ? "#cbd5e1" : "#64748b", cursor: disabled ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d={isPrev ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    );
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 24, flexWrap: "wrap", gap: 12 }}>
      <div style={{ color: "#94a3b8", fontSize: 13 }}>
        Showing <strong style={{ color: "#0f172a" }}>{start}–{end}</strong> of <strong style={{ color: "#0f172a" }}>{total}</strong> permissions
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <NavBtn dir="prev" />
        {pages.map((n, i) =>
          n === "..." ? (
            <span key={`e-${i}`} style={{ width: 34, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>…</span>
          ) : (
            <button
              key={n}
              onClick={() => onPageChange(n)}
              style={{ width: 34, height: 34, borderRadius: 8, border: n === page ? "none" : "1px solid #e2e8f0", background: n === page ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "white", color: n === page ? "white" : "#64748b", fontWeight: n === page ? 700 : 500, fontSize: 13, cursor: "pointer" }}
            >{n}</button>
          )
        )}
        <NavBtn dir="next" />
      </div>
    </div>
  );
};

// ─── Cards Grid (main export) ─────────────────────────────────────────────────
/**
 * IamPermissionCards
 * Props:
 *  - permissions: filtered array from parent
 *  - loading: bool
 *  - page: current page number
 *  - onPageChange(n): called when user changes page
 *  - onView(p), onEdit(p), onDelete(p)
 */
const IamPermissionCards = ({ permissions, loading, page, onPageChange, onView, onEdit, onDelete }) => {
  const totalPages = Math.ceil(permissions.length / CARDS_PER_PAGE);
  const paginated  = permissions.slice((page - 1) * CARDS_PER_PAGE, page * CARDS_PER_PAGE);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "80px 0", color: "#6366f1", fontSize: 14 }}>
      <svg style={{ animation: "spin 0.8s linear infinite" }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/>
      </svg>
      Loading permissions...
    </div>
  );

  if (permissions.length === 0) return (
    <div style={{ textAlign: "center", padding: "80px 0" }}>
      <svg style={{ margin: "0 auto 14px", display: "block" }} width="48" height="48" fill="none" stroke="#cbd5e1" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <div style={{ fontSize: 15, fontWeight: 600, color: "#64748b" }}>No permissions found</div>
      <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>Try adjusting your search or filter</div>
    </div>
  );

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: 18 }}>
        {paginated.map((p, i) => (
          <PermissionCard key={p.permission_id} p={p} index={i} onView={onView} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} total={permissions.length} onPageChange={onPageChange} />
      )}
    </>
  );
};

export default IamPermissionCards;
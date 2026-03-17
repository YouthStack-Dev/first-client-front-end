import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchPermissionsThunk } from "../redux/features/iampermissions/Iampermissionsthunk";
import {
  selectPermissions,
  selectPermissionsLoading,
  selectPermissionsLoaded,
} from "../redux/features/iampermissions/Iampermissionsslice";

import IamPermissionCards from "../components/IamPermission/IamPermissionCards";
import { Toast } from "../components/IamPermission/IamPermissionUIAtoms";
import {
  CreatePermissionModal,
  EditPermissionModal,
  ViewPermissionModal,
  DeletePermissionModal,
} from "../components/IamPermission/IamPermissionModals";

/**
 * IamPermissionsPage
 * Superadmin-only — manage IAM permissions (module + action pairs)
 * Route: /superadmin/iam/permissions
 * Protected by: ProtectedRouteAuth in App.jsx (type="admin")
 */
const IamPermissionsPage = () => {
  const dispatch = useDispatch();

  const permissions = useSelector(selectPermissions);
  const loading     = useSelector(selectPermissionsLoading);
  const loaded      = useSelector(selectPermissionsLoaded);

  const [modal,        setModal]        = useState(null);
  const [selected,     setSelected]     = useState(null);
  const [toast,        setToast]        = useState(null);
  const [search,       setSearch]       = useState("");
  const [filterActive, setFilterActive] = useState("All");
  const [page,         setPage]         = useState(1);

  const showToast  = (msg, type = "success") => setToast({ msg, type });
  const openModal  = (type, permission = null) => { setSelected(permission); setModal(type); };
  const closeModal = () => { setModal(null); setSelected(null); };

  useEffect(() => {
    if (!loaded) dispatch(fetchPermissionsThunk());
  }, [dispatch, loaded]);

  // Reset to page 1 when search or filter changes
  useEffect(() => { setPage(1); }, [search, filterActive]);

  const filtered = useMemo(() => permissions.filter((p) => {
    const term = search.toLowerCase();
    const matchSearch =
      !term ||
      p.module?.toLowerCase().includes(term) ||
      p.action?.toLowerCase().includes(term) ||
      p.description?.toLowerCase().includes(term);
    const matchActive =
      filterActive === "All" ||
      (filterActive === "Active" ? p.is_active : !p.is_active);
    return matchSearch && matchActive;
  }), [permissions, search, filterActive]);

  const activeCount   = permissions.filter((p) => p.is_active).length;
  const uniqueModules = [...new Set(permissions.map((p) => p.module).filter(Boolean))].length;

  return (
    <div style={{ fontFamily: "Inter,-apple-system,BlinkMacSystemFont,sans-serif", minHeight: "100vh", background: "#f1f5f9" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .pcard { transition: transform 0.18s ease, box-shadow 0.18s ease; }
        .pcard:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0,0,0,0.12) !important; }
        .pcard-btn { transition: opacity 0.15s; cursor: pointer; border: none; font-weight: 600; font-size: 13px; border-radius: 8px; padding: 9px 0; flex: 1; }
        .pcard-btn:hover { opacity: 0.82; }
        select option { background: white; color: #1e293b; }
        ::placeholder { color: #94a3b8; }
      `}</style>

      {/* ── Toolbar ── */}
      <div style={{ background: "white", borderBottom: "1px solid #e2e8f0", padding: "14px 28px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>

          {/* Search */}
          <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
            <svg style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              style={{ width: "100%", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "9px 12px 9px 34px", fontSize: 13, outline: "none", color: "#0f172a" }}
              placeholder="Search permissions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={e => e.target.style.borderColor = "#6366f1"}
              onBlur={e  => e.target.style.borderColor = "#e2e8f0"}
            />
          </div>

          {/* Filter */}
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "9px 14px", color: "#0f172a", fontSize: 13, outline: "none", cursor: "pointer", minWidth: 130 }}
          >
            {["All", "Active", "Inactive"].map((o) => <option key={o}>{o}</option>)}
          </select>

          {/* Sync */}
          <button
            onClick={() => dispatch(fetchPermissionsThunk())}
            style={{ padding: "9px 16px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500 }}
            onMouseOver={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#0f172a"; }}
            onMouseOut={e  => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#64748b"; }}
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" strokeLinecap="round"/>
            </svg>
            Sync
          </button>

          {/* Add */}
          <button
            onClick={() => openModal("create")}
            style={{ padding: "9px 20px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", borderRadius: 8, color: "white", cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600, boxShadow: "0 2px 10px rgba(99,102,241,0.35)" }}
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" strokeLinecap="round"/></svg>
            Add Permission
          </button>
        </div>
      </div>

      {/* ── Stats Strip ── */}
      <div style={{ background: "white", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", padding: "0 28px" }}>
          {[
            { l: "Total Permissions", v: permissions.length,               c: "#6366f1" },
            { l: "Active",            v: activeCount,                      c: "#16a34a" },
            { l: "Inactive",          v: permissions.length - activeCount, c: "#dc2626" },
            { l: "Modules",           v: uniqueModules,                    c: "#0369a1" },
          ].map((s, i) => (
            <div key={s.l} style={{ padding: "16px 32px 16px 0", marginRight: 32, borderRight: i < 3 ? "1px solid #f1f5f9" : "none" }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.c, lineHeight: 1 }}>{loading ? "—" : s.v}</div>
              <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, marginTop: 3 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Cards ── */}
      <div style={{ padding: "24px 28px" }}>
        <IamPermissionCards
          permissions={filtered}
          loading={loading}
          page={page}
          onPageChange={setPage}
          onView={(p)   => openModal("view",   p)}
          onEdit={(p)   => openModal("edit",   p)}
          onDelete={(p) => openModal("delete", p)}
        />
      </div>

      {/* ── Modals ── */}
      {modal === "create" && (
        <CreatePermissionModal onClose={closeModal} onSuccess={(msg) => showToast(msg, "success")} />
      )}
      {modal === "edit" && selected && (
        <EditPermissionModal permission={selected} onClose={closeModal} onSuccess={(msg) => showToast(msg, "success")} />
      )}
      {modal === "view" && selected && (
        <ViewPermissionModal permissionId={selected.permission_id} onClose={closeModal} onEdit={() => setModal("edit")} />
      )}
      {modal === "delete" && selected && (
        <DeletePermissionModal permission={selected} onClose={closeModal} onSuccess={(msg) => showToast(msg, "error")} />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default IamPermissionsPage;
import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import { fetchPermissionsThunk } from "../redux/features/iampermissions/Iampermissionsthunk";
import {
  selectPermissions,
  selectPermissionsLoading,
  selectPermissionsLoaded,
} from "../redux/features/iampermissions/Iampermissionsslice";

import IamPermissionCards from "../components/IamPermission/IamPermissionCards";
import {
  CreatePermissionModal,
  EditPermissionModal,
  ViewPermissionModal,
  DeletePermissionModal,
} from "../components/IamPermission/IamPermissionModals";

// ─── Stats config ─────────────────────────────────────────────────────────────
// Centralised so adding a new stat is one line here, nothing else changes.
const getStats = (permissions, activeCount) => [
  { label: "Total Permissions", getValue: () => permissions.length,               color: "text-indigo-500" },
  { label: "Active",            getValue: () => activeCount,                      color: "text-green-600"  },
  { label: "Inactive",          getValue: () => permissions.length - activeCount, color: "text-red-500"    },
  { label: "Modules",           getValue: () => [...new Set(permissions.map((p) => p.module).filter(Boolean))].length, color: "text-sky-600" },
];

// ─── IamPermissionsPage ───────────────────────────────────────────────────────
const IamPermissionsPage = () => {
  const dispatch = useDispatch();

  const permissions = useSelector(selectPermissions);
  const loading     = useSelector(selectPermissionsLoading);
  const loaded      = useSelector(selectPermissionsLoaded);

  const [modal,        setModal]        = useState(null);
  const [selected,     setSelected]     = useState(null);
  const [search,       setSearch]       = useState("");
  const [filterActive, setFilterActive] = useState("All");
  const [page,         setPage]         = useState(1);

  // showToast maps to react-toastify — same signature (msg, type)
  const showToast  = useCallback((msg, type = "success") => toast[type]?.(msg) ?? toast(msg), []);
  const closeModal = useCallback(() => { setModal(null); setSelected(null); }, []);
  const openModal  = useCallback((type, permission = null) => { setSelected(permission); setModal(type); }, []);

  useEffect(() => {
    if (!loaded) dispatch(fetchPermissionsThunk());
  }, [dispatch, loaded]);

  // Reset to page 1 whenever search or filter changes
  useEffect(() => { setPage(1); }, [search, filterActive]);

  const filtered = useMemo(() => permissions.filter((p) => {
    const term        = search.toLowerCase();
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

  const activeCount = permissions.filter((p) => p.is_active).length;
  const stats       = getStats(permissions, activeCount);

  return (
    <div className="min-h-screen bg-slate-100 font-sans">

      {/* Global keyframe styles — kept minimal, only what Tailwind can't express */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        .pcard { transition: transform 0.18s ease, box-shadow 0.18s ease; }
        .pcard:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0,0,0,0.12) !important; }
      `}</style>

      {/* ── Toolbar ── */}
      <div className="bg-white border-b border-slate-200 px-7 py-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-3 flex-wrap">

          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <svg
              className="absolute left-[11px] top-1/2 -translate-y-1/2 text-slate-400"
              width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500
                rounded-lg py-[9px] pl-[34px] pr-3 text-[13px] text-slate-900
                outline-none transition-colors duration-150 placeholder:text-slate-400"
              placeholder="Search permissions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status filter */}
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-[14px] py-[9px]
              text-slate-900 text-[13px] outline-none cursor-pointer min-w-[130px]
              focus:border-indigo-500 transition-colors duration-150"
          >
            {["All", "Active", "Inactive"].map((o) => <option key={o}>{o}</option>)}
          </select>

          {/* Sync */}
          <button
            onClick={() => dispatch(fetchPermissionsThunk())}
            className="flex items-center gap-[6px] px-4 py-[9px] bg-slate-50
              border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100
              hover:text-slate-900 text-[13px] font-medium cursor-pointer
              transition-colors duration-150"
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" strokeLinecap="round"/>
            </svg>
            Sync
          </button>

          {/* Add Permission */}
          <button
            onClick={() => openModal("create")}
            className="flex items-center gap-[7px] px-5 py-[9px] rounded-lg border-none
              text-white text-[13px] font-semibold cursor-pointer
              shadow-[0_2px_10px_rgba(99,102,241,0.35)] hover:opacity-90
              transition-opacity duration-150"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
            </svg>
            Add Permission
          </button>

        </div>
      </div>

      {/* ── Stats Strip ── */}
      <div className="bg-white border-b border-slate-200">
        <div className="flex px-7 flex-wrap">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`py-4 pr-8 mr-8 ${i < stats.length - 1 ? "border-r border-slate-100" : ""}`}
            >
              <div className={`text-[26px] font-extrabold leading-none ${s.color}`}>
                {loading ? "—" : s.getValue()}
              </div>
              <div className="text-[12px] text-slate-400 font-medium mt-[3px]">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Cards area ── */}
      <div className="px-7 py-6">
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
        <CreatePermissionModal
          onClose={closeModal}
          onSuccess={showToast}
        />
      )}
      {modal === "edit" && selected && (
        <EditPermissionModal
          permission={selected}
          onClose={closeModal}
          onSuccess={showToast}
        />
      )}
      {modal === "view" && selected && (
        <ViewPermissionModal
          permissionId={selected.permission_id}
          onClose={closeModal}
          onEdit={() => setModal("edit")}
        />
      )}
      {modal === "delete" && selected && (
        <DeletePermissionModal
          permission={selected}
          onClose={closeModal}
          onSuccess={showToast}
        />
      )}

    </div>
  );
};

export default IamPermissionsPage;
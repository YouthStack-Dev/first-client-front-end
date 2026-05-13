import { memo } from "react";
import { getGradient, getActionStyle } from "../../constants/Moduleconstants";
import { Spinner } from "./IamPermissionUIAtoms";

const CARDS_PER_PAGE = 16;

// ─── NavBtn ───────────────────────────────────────────────────────────────────
// Hoisted outside Pagination so it is not re-created on every render.
const NavBtn = ({ dir, page, totalPages, onPageChange }) => {
  const isPrev   = dir === "prev";
  const disabled = isPrev ? page === 1 : page === totalPages;

  return (
    <button
      onClick={() => onPageChange(isPrev ? page - 1 : page + 1)}
      disabled={disabled}
      className={`w-[34px] h-[34px] rounded-lg border border-slate-200 bg-white
        flex items-center justify-center transition-colors duration-150
        ${disabled
          ? "text-slate-300 cursor-not-allowed"
          : "text-slate-500 hover:bg-slate-50 cursor-pointer"
        }`}
    >
      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path
          d={isPrev ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

// ─── Pagination ───────────────────────────────────────────────────────────────
const Pagination = ({ page, totalPages, total, onPageChange }) => {
  const start = (page - 1) * CARDS_PER_PAGE + 1;
  const end   = Math.min(page * CARDS_PER_PAGE, total);

  // Build page number array with "..." gaps
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
    .reduce((acc, n, i, arr) => {
      if (i > 0 && n - arr[i - 1] > 1) acc.push("...");
      acc.push(n);
      return acc;
    }, []);

  return (
    <div className="flex items-center justify-between mt-6 flex-wrap gap-3">
      {/* Count label */}
      <p className="text-slate-400 text-[13px]">
        Showing{" "}
        <strong className="text-slate-900">{start}–{end}</strong>
        {" "}of{" "}
        <strong className="text-slate-900">{total}</strong>
        {" "}permissions
      </p>

      {/* Page buttons */}
      <div className="flex items-center gap-[6px]">
        <NavBtn dir="prev" page={page} totalPages={totalPages} onPageChange={onPageChange} />

        {pages.map((n, i) =>
          n === "..." ? (
            <span
              key={`ellipsis-${i}`}
              className="w-[34px] text-center text-slate-400 text-[13px]"
            >
              …
            </span>
          ) : (
            <button
              key={n}
              onClick={() => onPageChange(n)}
              className={`w-[34px] h-[34px] rounded-lg text-[13px] cursor-pointer transition-all duration-150
                ${n === page
                  ? "border-none text-white font-bold shadow-[0_2px_8px_rgba(99,102,241,0.35)]"
                  : "border border-slate-200 bg-white text-slate-500 font-medium hover:bg-slate-50"
                }`}
              style={n === page ? { background: "linear-gradient(135deg,#6366f1,#8b5cf6)" } : undefined}
            >
              {n}
            </button>
          )
        )}

        <NavBtn dir="next" page={page} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </div>
  );
};

// ─── PermissionCard ───────────────────────────────────────────────────────────
const PermissionCard = memo(({ p, index, onView, onEdit, onDelete }) => {
  const grad   = getGradient(p.module);
  const aStyle = getActionStyle(p.action);

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.07)]"
      style={{
        animation: "fadeUp 0.22s ease both",
        animationDelay: `${index * 12}ms`,
      }}
    >
      {/* ── Card Header ── */}
      <div className="relative px-[18px] py-4" style={{ background: grad }}>

        {/* Active / Inactive badge — pinned top-right */}
        <span
          className={`absolute top-3 right-3 inline-flex items-center gap-1
            text-[11px] font-semibold px-[10px] py-[3px] rounded-full border
            ${p.is_active
              ? "bg-green-400/20 border-green-400/40 text-green-100"
              : "bg-red-400/20   border-red-400/40   text-red-200"
            }`}
        >
          <span
            className={`inline-block w-[5px] h-[5px] rounded-full
              ${p.is_active ? "bg-green-400" : "bg-red-400"}`}
          />
          {p.is_active ? "Active" : "Inactive"}
        </span>

        {/* Icon + module name + ID */}
        <div className="flex items-center gap-3 pr-20">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <svg width="19" height="19" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="text-white font-extrabold text-[20px] leading-tight tracking-tight break-words capitalize">
              {p.module}
            </p>
            <p className="text-white/60 text-[11px] mt-[3px] font-mono">
              ID: {p.permission_id}
            </p>
          </div>
        </div>

      </div>

      {/* ── Card Body ── */}
      <div className="px-[18px] py-[14px]">

        {/* Action — highlighted block */}
        <div className="flex items-center gap-2 mb-[10px]">
          <svg width="12" height="12" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-slate-400 text-[12px]">Action</span>
          <span
            className="text-[13px] font-extrabold px-3 py-[4px] rounded-lg border-2 uppercase tracking-widest"
            style={{ background: aStyle.bg, color: aStyle.color, borderColor: aStyle.border }}
          >
            {p.action}
          </span>
        </div>

        {/* Description */}
        <div className="flex items-start gap-2">
          <svg
            className="mt-[1px] shrink-0"
            width="12" height="12" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <span className={`text-[12px] leading-relaxed ${p.description ? "text-slate-600" : "text-slate-300"}`}>
            {p.description || "No description provided"}
          </span>
        </div>
      </div>

      {/* ── Card Footer ── */}
      <div className="px-[18px] pb-4 flex gap-2">
        <button
          onClick={() => onView(p)}
          className="flex-1 text-[12px] font-semibold py-[6px] rounded-lg
            bg-indigo-50 text-indigo-600 hover:bg-indigo-100
            transition-colors duration-150 cursor-pointer border-none"
        >
          View
        </button>
        <button
          onClick={() => onEdit(p)}
          className="flex-1 text-[12px] font-semibold py-[6px] rounded-lg
            bg-sky-50 text-sky-700 hover:bg-sky-100
            transition-colors duration-150 cursor-pointer border-none"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(p)}
          className="flex-1 text-[12px] font-semibold py-[6px] rounded-lg
            bg-red-50 text-red-600 hover:bg-red-100
            transition-colors duration-150 cursor-pointer border-none"
        >
          Delete
        </button>
      </div>
    </div>
  );
});
PermissionCard.displayName = "PermissionCard";

// ─── Loading State ────────────────────────────────────────────────────────────
const LoadingState = () => (
  <div className="flex items-center justify-center gap-3 py-20 text-indigo-500 text-[14px]">
    <Spinner size={20} />
    Loading permissions...
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = () => (
  <div className="text-center py-20">
    <svg
      className="mx-auto mb-[14px]"
      width="48" height="48" fill="none" stroke="#cbd5e1" strokeWidth="1.5" viewBox="0 0 24 24"
    >
      <path
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    <p className="text-[15px] font-semibold text-slate-500">No permissions found</p>
    <p className="text-[13px] text-slate-400 mt-1">Try adjusting your search or filter</p>
  </div>
);

// ─── IamPermissionCards (main export) ────────────────────────────────────────
/**
 * Props:
 *  permissions  — filtered array passed in by parent (no slicing done outside)
 *  loading      — bool
 *  page         — current page number (controlled by parent)
 *  onPageChange — (n: number) => void
 *  onView       — (p) => void
 *  onEdit       — (p) => void
 *  onDelete     — (p) => void
 */
const IamPermissionCards = ({
  permissions,
  loading,
  page,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}) => {
  const totalPages = Math.ceil(permissions.length / CARDS_PER_PAGE);
  const paginated  = permissions.slice((page - 1) * CARDS_PER_PAGE, page * CARDS_PER_PAGE);

  if (loading)             return <LoadingState />;
  if (!permissions.length) return <EmptyState />;

  return (
    <>
      {/*
        Responsive grid:
          mobile  → 1 column
          sm      → 2 columns
          lg      → 3 columns
          xl      → 4 columns
        Fixes the hardcoded repeat(4,1fr) that broke on tablets/mobile.
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[18px]">
        {paginated.map((p, i) => (
          <PermissionCard
            key={p.permission_id}
            p={p}
            index={i}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={permissions.length}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
};

export default IamPermissionCards;
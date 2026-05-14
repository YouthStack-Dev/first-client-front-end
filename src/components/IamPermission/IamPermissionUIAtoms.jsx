import { useEffect, useRef } from "react";
import { getModuleColors } from "../../constants/Moduleconstants";

// ─── ModuleBadge ──────────────────────────────────────────────────────────────
// Colours now come from the single source of truth in moduleConstants.js.
// To add a new module, update moduleConstants.js only — no changes needed here.
export const ModuleBadge = ({ label }) => {
  const c = getModuleColors(label);
  return (
    <span
      style={{ backgroundColor: c.bg, borderColor: c.border, color: c.text }}
      className="inline-block border text-[11px] font-semibold tracking-wide whitespace-nowrap px-[10px] py-[3px] rounded-full"
    >
      {label}
    </span>
  );
};

// ─── ActiveBadge ──────────────────────────────────────────────────────────────
export const ActiveBadge = ({ active }) => (
  <span
    className={`inline-flex items-center gap-[5px] text-[11px] font-semibold px-[10px] py-[3px] rounded-full border
      ${active
        ? "bg-green-50 border-green-200 text-green-700"
        : "bg-red-50   border-red-200   text-red-600"
      }`}
  >
    <span
      className={`inline-block w-[5px] h-[5px] rounded-full
        ${active ? "bg-green-400" : "bg-red-400"}`}
    />
    {active ? "Active" : "Inactive"}
  </span>
);

// ─── Spinner ──────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 15 }) => (
  <svg
    className="animate-spin"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
  </svg>
);

// ─── Toast ────────────────────────────────────────────────────────────────────
const TOAST_STYLES = {
  success: { className: "bg-green-50 border-green-200 text-green-700", icon: "✓" },
  error:   { className: "bg-red-50   border-red-200   text-red-600",   icon: "✕" },
  default: { className: "bg-slate-50 border-slate-200 text-slate-600", icon: "i" },
};

export const Toast = ({ msg, type, onClose }) => {
  // Keep the latest onClose in a ref so the timer is NEVER reset when the
  // parent re-renders and passes a new inline function reference.
  // The timeout fires exactly once, 3.5s after Toast first mounts.
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    const t = setTimeout(() => onCloseRef.current?.(), 3500);
    return () => clearTimeout(t);
  }, []); // empty — intentional: run once on mount only

  const { className, icon } = TOAST_STYLES[type] ?? TOAST_STYLES.default;

  return (
    <div
      className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-[10px]
        px-[18px] py-[13px] rounded-xl border font-semibold text-[13px]
        shadow-[0_4px_20px_rgba(0,0,0,0.10)] min-w-[260px] ${className}`}
    >
      <span className="text-[15px] font-extrabold">{icon}</span>
      <span>{msg}</span>
    </div>
  );
};

// ─── Modal ────────────────────────────────────────────────────────────────────
// `width` is kept as a prop for cases where the modal needs a custom max-width
// (e.g. DeletePermissionModal uses 440px). It is applied via inline style only
// for that single dynamic value; all structural styles use Tailwind.
export const Modal = ({ title, subtitle, onClose, children, width = 520 }) => (
  <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
    <div
      className="bg-white border border-slate-200 rounded-2xl w-full mx-4 shadow-[0_20px_60px_rgba(0,0,0,0.12)] overflow-hidden"
      style={{ maxWidth: width }}
    >
      {/* Header */}
      <div className="flex items-start justify-between px-6 py-[18px] border-b border-slate-100 bg-[#fafafa]">
        <div>
          <h2 className="text-slate-900 font-bold text-base leading-snug">{title}</h2>
          {subtitle && (
            <p className="text-slate-400 text-[11px] mt-[3px] font-mono">{subtitle}</p>
          )}
        </div>

        <button
          onClick={onClose}
          className="bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900
            border-none text-[18px] leading-none px-[9px] py-1 rounded-md
            transition-colors duration-150 cursor-pointer"
        >
          ×
        </button>
      </div>

      {/* Body */}
      <div className="px-6 py-[22px]">{children}</div>
    </div>
  </div>
);
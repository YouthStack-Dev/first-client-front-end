/**
 * moduleConstants.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for all IAM module colour tokens.
 *
 * ADDING A NEW MODULE
 *   1. Add one entry to MODULE_META below.
 *   2. That's it — gradients, badge colours, and action styles all derive
 *      from this one file automatically.
 *
 * CONSUMERS
 *   import { getGradient, getModuleColors, getActionStyle } from "@constants/moduleConstants";
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Master module registry.
 * Each entry drives BOTH the card-header gradient AND the badge colour scheme.
 *
 * gradient : used in IamPermissionCards (card header background)
 * badge    : used in IamPermissionUIAtoms (ModuleBadge chip)
 *   bg     → chip background
 *   border → chip border
 *   text   → chip text
 */
const MODULE_META = {
  booking: {
    gradient: "linear-gradient(135deg,#6366f1,#8b5cf6)",
    badge: { bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8" },
  },
  driver: {
    gradient: "linear-gradient(135deg,#059669,#10b981)",
    badge: { bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d" },
  },
  "driver_app": {
    gradient: "linear-gradient(135deg,#0891b2,#06b6d4)",
    badge: { bg: "#f0fdfa", border: "#99f6e4", text: "#0f766e" },
  },
  employee: {
    gradient: "linear-gradient(135deg,#7c3aed,#a855f7)",
    badge: { bg: "#faf5ff", border: "#e9d5ff", text: "#7e22ce" },
  },
  route: {
    gradient: "linear-gradient(135deg,#d97706,#f59e0b)",
    badge: { bg: "#fff7ed", border: "#fed7aa", text: "#c2410c" },
  },
  "route-booking": {
    gradient: "linear-gradient(135deg,#b45309,#d97706)",
    badge: { bg: "#fffbeb", border: "#fde68a", text: "#b45309" },
  },
  shift: {
    gradient: "linear-gradient(135deg,#dc2626,#ef4444)",
    badge: { bg: "#fef2f2", border: "#fecaca", text: "#dc2626" },
  },
  team: {
    gradient: "linear-gradient(135deg,#1d4ed8,#3b82f6)",
    badge: { bg: "#eff6ff", border: "#bfdbfe", text: "#1e40af" },
  },
  vehicle: {
    gradient: "linear-gradient(135deg,#065f46,#059669)",
    badge: { bg: "#f0fdf4", border: "#bbf7d0", text: "#166534" },
  },
  "vehicle_type": {
    gradient: "linear-gradient(135deg,#047857,#10b981)",
    badge: { bg: "#dcfce7", border: "#86efac", text: "#15803d" },
  },
  vendor: {
    gradient: "linear-gradient(135deg,#b45309,#f59e0b)",
    badge: { bg: "#fffbeb", border: "#fde68a", text: "#92400e" },
  },
  "vendor_user": {
    gradient: "linear-gradient(135deg,#92400e,#d97706)",
    badge: { bg: "#fff7ed", border: "#fed7aa", text: "#9a3412" },
  },
  permissions: {
    gradient: "linear-gradient(135deg,#4f46e5,#6366f1)",
    badge: { bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8" },
  },
  policy: {
    gradient: "linear-gradient(135deg,#7e22ce,#9333ea)",
    badge: { bg: "#eef2ff", border: "#c7d2fe", text: "#4338ca" },
  },
  role: {
    gradient: "linear-gradient(135deg,#be123c,#e11d48)",
    badge: { bg: "#fdf4ff", border: "#f5d0fe", text: "#a21caf" },
  },
  report: {
    gradient: "linear-gradient(135deg,#a16207,#ca8a04)",
    badge: { bg: "#fefce8", border: "#fef08a", text: "#a16207" },
  },
  dashboard: {
    gradient: "linear-gradient(135deg,#0369a1,#0ea5e9)",
    badge: { bg: "#f0f9ff", border: "#bae6fd", text: "#0369a1" },
  },
  audit_log: {
    gradient: "linear-gradient(135deg,#374151,#6b7280)",
    badge: { bg: "#f8fafc", border: "#e2e8f0", text: "#475569" },
  },
  admin_tenant: {
    gradient: "linear-gradient(135deg,#1e40af,#3b82f6)",
    badge: { bg: "#eef2ff", border: "#c7d2fe", text: "#4338ca" },
  },
  cutoff: {
    gradient: "linear-gradient(135deg,#0f766e,#14b8a6)",
    badge: { bg: "#f0fdfa", border: "#99f6e4", text: "#115e59" },
  },
  escort: {
    gradient: "linear-gradient(135deg,#9333ea,#c026d3)",
    badge: { bg: "#fdf4ff", border: "#f5d0fe", text: "#9333ea" },
  },
  route_merge: {
    gradient: "linear-gradient(135deg,#c2410c,#ea580c)",
    badge: { bg: "#fef2f2", border: "#fecaca", text: "#b91c1c" },
  },
  route_vendor_assignment: {
    gradient: "linear-gradient(135deg,#92400e,#f59e0b)",
    badge: { bg: "#f0fdf4", border: "#bbf7d0", text: "#047857" },
  },
  route_vehicle_assignment: {
    gradient: "linear-gradient(135deg,#065f46,#34d399)",
    badge: { bg: "#f0fdfa", border: "#99f6e4", text: "#0e7490" },
  },
  "weekoff_config": {
    gradient: "linear-gradient(135deg,#1d4ed8,#60a5fa)",
    badge: { bg: "#f5f3ff", border: "#ddd6fe", text: "#6d28d9" },
  },
};

// ─── Fallbacks ────────────────────────────────────────────────────────────────
const FALLBACK_GRADIENT = "linear-gradient(135deg,#475569,#64748b)";
const FALLBACK_BADGE    = { bg: "#f8fafc", border: "#e2e8f0", text: "#475569" };

/**
 * Returns the card-header gradient for a given module name.
 * Falls back gracefully for unknown modules.
 *
 * @param {string} module
 * @returns {string} CSS gradient string
 */
export const getGradient = (module) =>
  MODULE_META[module?.toLowerCase()]?.gradient ?? FALLBACK_GRADIENT;

/**
 * Returns the badge colour tokens { bg, border, text } for a given module.
 * Falls back gracefully for unknown modules.
 *
 * @param {string} module
 * @returns {{ bg: string, border: string, text: string }}
 */
export const getModuleColors = (module) =>
  MODULE_META[module?.toLowerCase()]?.badge ?? FALLBACK_BADGE;

// ─── Action styles (used by IamPermissionCards) ───────────────────────────────
/**
 * Colour tokens for the action chip (create / read / update / delete).
 * Extend this object to support new action types.
 */
const ACTION_STYLES = {
  create: { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  read:   { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  update: { bg: "#fffbeb", color: "#b45309", border: "#fde68a" },
  delete: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
};

const FALLBACK_ACTION = { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" };

/**
 * Returns action chip colour tokens for a given action string.
 *
 * @param {string} action
 * @returns {{ bg: string, color: string, border: string }}
 */
export const getActionStyle = (action) =>
  ACTION_STYLES[action?.toLowerCase()] ?? FALLBACK_ACTION;

/**
 * Full list of registered module keys.
 * Useful for dropdowns, filters, or validation.
 *
 * @returns {string[]}
 */
export const getAllModuleKeys = () => Object.keys(MODULE_META);
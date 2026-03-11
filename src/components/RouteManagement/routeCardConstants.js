// ─────────────────────────────────────────────────────────────────────────────
// Design tokens — single source of truth for all colors used across
// SavedRouteCard, EmployeeChip, AssignEscortModal and related components.
// Never hardcode these hex values inline — always import from here.
// ─────────────────────────────────────────────────────────────────────────────

export const CHIP_COLORS = [
  { bg: "#ede9fe", text: "#5b21b6", border: "#7c3aed" },
  { bg: "#dbeafe", text: "#1e40af", border: "#2563eb" },
  { bg: "#d1fae5", text: "#065f46", border: "#059669" },
  { bg: "#fef3c7", text: "#92400e", border: "#d97706" },
  { bg: "#ffe4e6", text: "#9f1239", border: "#e11d48" },
  { bg: "#e0f2fe", text: "#0369a1", border: "#0284c7" },
  { bg: "#f3e8ff", text: "#7e22ce", border: "#9333ea" },
];

// Female-specific chip color — used in chips, mini cards, and overflow popover
export const FEMALE_CHIP_COLOR = {
  bg:     "#fdf2f8",
  text:   "#9d174d",
  border: "#f9a8d4",
};

// Escort button states
export const ESCORT_COLORS = {
  unassigned: {
    bg:     "linear-gradient(135deg,#fce7f3,#fdf2f8)",
    text:   "#9d174d",
    shadow: "0 0 0 1.5px #f9a8d4",
  },
  assigned: {
    bg:     "linear-gradient(135deg,#d1fae5,#a7f3d0)",
    text:   "#065f46",
    shadow: "0 1px 4px #a7f3d088",
  },
  badge: {
    bg:     "#f0fdf4",
    text:   "#15803d",
    border: "#86efac",
  },
};

// Female silhouette fill color
export const FEMALE_ICON_COLOR = "#be185d";

// Max employee chips shown inline before overflow popover
export const MAX_VISIBLE_CHIPS = 5;
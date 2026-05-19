import React from "react";

// delay_type: "LATE" | "EARLY" | "ON_TIME" | null
// null is rendered only when explicitly passed with showNull=true (e.g. on completed routes)
const DELAY_CONFIGS = {
  LATE:    { bg: "#FCEBEB", text: "#A32D2D", border: "#FECACA" },
  EARLY:   { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  ON_TIME: { bg: "#F0FDF4", text: "#166534", border: "#BBF7D0" },
};

const getLabel = (delayType, delayMinutes) => {
  if (delayType === "LATE")    return `LATE +${delayMinutes}m`;
  if (delayType === "EARLY")   return `EARLY \u2212${Math.abs(delayMinutes)}m`;
  if (delayType === "ON_TIME") return "ON TIME";
  return "Not Tagged";
};

const DelayBadge = ({
  delayType,
  delayMinutes,
  graceMins,
  showNull = false,
  compact  = false,
}) => {
  if (!delayType && !showNull) return null;

  const cfg = DELAY_CONFIGS[delayType] || {
    bg: "#F1F5F9",
    text: "#64748B",
    border: "#CBD5E1",
  };

  const title = graceMins != null
    ? `Grace window: \xB1${graceMins} min`
    : undefined;

  return (
    <span
      title={title}
      style={{
        display:        "inline-flex",
        alignItems:     "center",
        padding:        compact ? "1px 6px" : "2px 8px",
        borderRadius:   20,
        fontSize:       compact ? 10 : 11,
        fontWeight:     700,
        background:     cfg.bg,
        color:          cfg.text,
        border:         `1px solid ${cfg.border}`,
        whiteSpace:     "nowrap",
        letterSpacing:  "0.03em",
        cursor:         graceMins != null ? "help" : "default",
      }}
    >
      {getLabel(delayType, delayMinutes)}
    </span>
  );
};

export default DelayBadge;

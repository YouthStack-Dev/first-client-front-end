import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { MapPin, Users } from "lucide-react";
import { getChipColor, getCodeInitials, shortLocation, isFemaleGender } from "./routeCards";
import { FEMALE_ICON_COLOR, MAX_VISIBLE_CHIPS } from "./routeCardConstants";

// ─────────────────────────────────────────────────────────────────────────────
// FemaleSilhouette
// Inline SVG so we have no external image dependency and full color control.
// ─────────────────────────────────────────────────────────────────────────────
export const FemaleSilhouette = ({ size = 18, color = FEMALE_ICON_COLOR }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill={color} xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="16" cy="9" rx="5" ry="5.5" />
    <path d="M10.5 8.5 C9 4 11 2 16 2 C21 2 23 4 21.5 8.5 C20.5 6.5 18.5 5.5 16 5.5 C13.5 5.5 11.5 6.5 10.5 8.5Z" />
    <rect x="14" y="14" width="4" height="3" rx="1.5" />
    <path d="M7 30 C7 23 10.5 19.5 16 19.5 C21.5 19.5 25 23 25 30Z" />
    <path d="M13 17 C13 17 14.5 19.5 16 19.5 C17.5 19.5 19 17 19 17 C18 16.5 16 16 16 16 C16 16 14 16.5 13 17Z" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// ChipTooltip
// Portal-rendered tooltip anchored to a chip. Reads position from a ref so it
// always appears above the chip regardless of scroll position.
// ─────────────────────────────────────────────────────────────────────────────
const ChipTooltip = ({ anchorRef, visible, stop, isFemale }) => {
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (visible && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({
        top:  rect.top  + window.scrollY - 8,
        left: rect.left + rect.width / 2 + window.scrollX,
      });
    }
  }, [visible, anchorRef]);

  if (!visible) return null;

  return createPortal(
    <div
      style={{
        position: "absolute",
        top: pos.top,
        left: pos.left,
        transform: "translate(-50%, -100%)",
        background: "#1e293b",
        color: "#f8fafc",
        borderRadius: 9,
        padding: "8px 12px",
        whiteSpace: "nowrap",
        fontSize: 12,
        zIndex: 99999,
        pointerEvents: "none",
        boxShadow: "0 6px 20px rgba(0,0,0,0.28)",
      }}
    >
      <div style={{ fontWeight: 800, marginBottom: 2 }}>
        {stop.employee_name || stop.employee_code}
      </div>
      {stop.employee_name && (
        <div style={{ fontSize: 10, color: "#64748b", marginBottom: 3 }}>
          {stop.employee_code}
        </div>
      )}
      <div style={{ fontSize: 11, color: isFemale ? "#f9a8d4" : "#93c5fd", marginBottom: 2 }}>
        {isFemale ? "♀ Female" : "♂ Male"}
      </div>
      <div style={{ fontSize: 11, color: "#94a3b8" }}>
        📍 {shortLocation(stop.pickup_location)}
      </div>
      {/* Downward arrow */}
      <div style={{
        position: "absolute", top: "100%", left: "50%",
        transform: "translateX(-50%)",
        borderWidth: "5px 5px 0",
        borderStyle: "solid",
        borderColor: "#1e293b transparent transparent",
      }} />
    </div>,
    document.body
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// EmployeeChip
// A single circular avatar chip. Shows female silhouette or initials.
// Hover reveals ChipTooltip via portal.
// ─────────────────────────────────────────────────────────────────────────────
export const EmployeeChip = ({ stop, zIndex }) => {
  const [hovered, setHovered] = useState(false);
  const chipRef               = useRef(null);
  const isFemale              = isFemaleGender(stop.gender);
  const color                 = getChipColor(stop.employee_code, isFemale);

  return (
    <div
      ref={chipRef}
      style={{ position: "relative", display: "inline-flex", zIndex }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          width: 26, height: 26,
          borderRadius: "50%",
          background: color.bg,
          border: `2px solid ${hovered ? color.border : isFemale ? "#f9a8d4" : "#fff"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          transition: "transform 0.15s, box-shadow 0.15s, border-color 0.15s",
          transform: hovered ? "scale(1.18) translateY(-2px)" : "scale(1)",
          boxShadow: hovered
            ? `0 3px 10px ${color.border}55`
            : isFemale
            ? "0 1px 4px #f9a8d488"
            : "0 1px 3px rgba(0,0,0,0.12)",
          userSelect: "none",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        {isFemale
          ? <FemaleSilhouette size={17} />
          : <span style={{ fontSize: 10, fontWeight: 800, color: color.text }}>{getCodeInitials(stop.employee_code)}</span>
        }
      </div>
      <ChipTooltip anchorRef={chipRef} visible={hovered} stop={stop} isFemale={isFemale} />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// EmployeeMiniCard
// Expanded card shown in the "Show details" section.
// Displays employee name, code, pickup and drop locations.
// ─────────────────────────────────────────────────────────────────────────────
export const EmployeeMiniCard = ({ stop }) => {
  const isFemale = isFemaleGender(stop.gender);
  const color    = getChipColor(stop.employee_code, isFemale);

  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 8,
      background: isFemale ? "#fdf2f8" : "#fff",
      border: `1px solid ${color.border}33`,
      borderRadius: 8,
      padding: "6px 10px",
      minWidth: 175,
      flexShrink: 0,
    }}>
      {/* Avatar */}
      <div style={{
        width: 26, height: 26,
        borderRadius: "50%",
        background: color.bg,
        border: `1.5px solid ${color.border}66`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, marginTop: 1, overflow: "hidden",
      }}>
        {isFemale
          ? <FemaleSilhouette size={17} />
          : <span style={{ fontSize: 10, fontWeight: 800, color: color.text }}>{getCodeInitials(stop.employee_code)}</span>
        }
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 11, color: "#1e293b", marginBottom: 1 }}>
          {stop.employee_name || stop.employee_code}
        </div>
        {stop.employee_name && (
          <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 3 }}>{stop.employee_code}</div>
        )}
        <div style={{ fontSize: 10, color: "#64748b", display: "flex", alignItems: "center", gap: 3, marginBottom: 2 }}>
          <MapPin size={8} color="#22c55e" />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 110 }}>
            {shortLocation(stop.pickup_location || "N/A")}
          </span>
        </div>
        <div style={{ fontSize: 10, color: "#64748b", display: "flex", alignItems: "center", gap: 3 }}>
          <MapPin size={8} color="#ef4444" />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 110 }}>
            {shortLocation(stop.drop_location || "N/A")}
          </span>
        </div>
      </div>

      {/* Status dot */}
      <span style={{
        width: 7, height: 7,
        borderRadius: "50%",
        flexShrink: 0, marginTop: 4,
        background: stop.status === "Scheduled" ? "#22c55e" : "#f59e0b",
      }} />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// OverflowPopover
// Shows a "+N" button when chips exceed MAX_VISIBLE_CHIPS.
// Clicking opens a popover listing the remaining employees.
// Closes on outside click.
// ─────────────────────────────────────────────────────────────────────────────
export const OverflowPopover = ({ stops }) => {
  const [open, setOpen] = useState(false);
  const ref             = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-flex" }}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        style={{
          width: 26, height: 26,
          borderRadius: "50%",
          background: open ? "#1e3a5f" : "#f1f5f9",
          border: `2px solid ${open ? "#2563eb" : "#e2e8f0"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 10, fontWeight: 800,
          color: open ? "#fff" : "#475569",
          cursor: "pointer",
          transition: "all 0.15s",
          flexShrink: 0,
          fontFamily: "inherit",
        }}
      >
        +{stops.length}
      </button>

      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute", bottom: "calc(100% + 10px)", left: "50%",
            transform: "translateX(-50%)",
            background: "#fff",
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
            zIndex: 9999,
            minWidth: 220,
            overflow: "hidden",
          }}
        >
          <div style={{
            padding: "8px 12px",
            borderBottom: "1px solid #f1f5f9",
            fontSize: 11, fontWeight: 700, color: "#94a3b8",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <Users size={10} />
            {stops.length} more employee{stops.length !== 1 ? "s" : ""}
          </div>

          <div style={{ maxHeight: 200, overflowY: "auto" }}>
            {stops.map((stop) => {
              const isFemale = isFemaleGender(stop.gender);
              const color    = getChipColor(stop.employee_code, isFemale);
              return (
                <div
                  key={stop.booking_id}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "7px 12px",
                    background: isFemale ? "#fdf2f8" : "transparent",
                  }}
                >
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%",
                    background: color.bg, border: `1.5px solid ${color.border}55`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    overflow: "hidden", flexShrink: 0,
                  }}>
                    {isFemale
                      ? <FemaleSilhouette size={15} />
                      : <span style={{ fontSize: 10, fontWeight: 800, color: color.text }}>{getCodeInitials(stop.employee_code)}</span>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 12, color: "#1e293b" }}>
                      {stop.employee_name || stop.employee_code}
                    </div>
                    {stop.employee_name && (
                      <div style={{ fontSize: 10, color: "#94a3b8" }}>{stop.employee_code}</div>
                    )}
                    <div style={{ fontSize: 10, color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      📍 {shortLocation(stop.pickup_location)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Downward arrow */}
          <div style={{
            position: "absolute", top: "100%", left: "50%",
            transform: "translateX(-50%)",
            borderWidth: "6px 6px 0", borderStyle: "solid",
            borderColor: "#fff transparent transparent",
          }} />
        </div>
      )}
    </div>
  );
};
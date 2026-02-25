import React, { useState, useRef, useEffect } from "react";
import { X, Clock, GripVertical, User, Navigation, Truck, RouteIcon, RefreshCw } from "lucide-react";
import BookingCard from "../ui/BookingCard";
import { API_CLIENT } from "../../Api/API_Client";

// ─────────────────────────────────────────────────────────────────────────────
// DraggableBookingRow — drag handle + BookingCard + always-visible time inputs
// ─────────────────────────────────────────────────────────────────────────────
const DraggableBookingRow = ({
  stop, index, isDragging, isDragOver,
  onDragStart, onDragOver, onDrop, onDragEnd,
  onTimeChange, onDropTimeChange,
  isSelected, isDeleteDisabled,
  onBookingClick, onRemoveFromRoute,
  originalOrder, // NEW: to show order change indicator
}) => {
  const hasOrderChanged = originalOrder !== undefined && originalOrder !== index;
  
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      style={{
        opacity: isDragging ? 0.35 : 1,
        background: isDragOver ? "#f5f3ff" : "#fff",
        border: `1.5px solid ${isDragOver ? "#a78bfa" : hasOrderChanged ? "#f59e0b" : "#e2e8f0"}`,
        borderRadius: 12,
        marginBottom: 10,
        transition: "all 0.15s",
        boxShadow: isDragOver 
          ? "0 4px 16px rgba(99,102,241,0.12)" 
          : hasOrderChanged 
            ? "0 2px 12px rgba(245,158,11,0.15)" 
            : "0 1px 4px rgba(0,0,0,0.05)",
        display: "flex", 
        alignItems: "stretch",
        position: "relative",
      }}
    >
      {/* Order change indicator badge */}
      {hasOrderChanged && (
        <div
          style={{
            position: "absolute",
            top: -8,
            left: 8,
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            color: "#fff",
            fontSize: 10,
            fontWeight: 700,
            padding: "3px 8px",
            borderRadius: 6,
            boxShadow: "0 2px 8px rgba(245,158,11,0.4)",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          ⚡ Position: {originalOrder + 1} → {index + 1}
        </div>
      )}

      {/* Drag handle strip */}
      <div
        style={{
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          width: 32, 
          background: hasOrderChanged ? "#fef3c7" : "#f8fafc",
          borderRight: "1px solid #f1f5f9",
          cursor: "grab", 
          color: hasOrderChanged ? "#d97706" : "#94a3b8", 
          flexShrink: 0,
          borderRadius: "10px 0 0 10px",
        }}
        title="Drag to reorder"
      >
        <GripVertical size={18} />
      </div>

      {/* BookingCard */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <BookingCard
          stop={stop}
          index={index}
          isSelected={isSelected}
          isDeleteDisabled={isDeleteDisabled}
          onBookingClick={onBookingClick}
          onRemoveFromRoute={onRemoveFromRoute}
          className="border-0 shadow-none rounded-none"
        />
      </div>

      {/* ── Time inputs on the RIGHT ── */}
      <div
        style={{
          display: "flex", 
          flexDirection: "column", 
          justifyContent: "center",
          gap: 6, 
          padding: "10px 14px",
          borderLeft: "1px solid #f1f5f9",
          background: "#fafafa",
          flexShrink: 0,
          borderRadius: "0 10px 10px 0",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pickup */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{
            fontSize: 11, 
            fontWeight: 700, 
            color: "#3b82f6",
            background: "#eff6ff", 
            borderRadius: 5, 
            padding: "2px 6px",
            whiteSpace: "nowrap", 
            minWidth: 44, 
            textAlign: "center",
          }}>
            Pick
          </span>
          <input
            type="time"
            value={stop.estimated_pick_up_time || ""}
            onChange={(e) => onTimeChange(stop.booking_id, e.target.value)}
            style={{
              border: "1.5px solid #bfdbfe", 
              borderRadius: 7,
              padding: "5px 8px", 
              fontSize: 13, 
              fontWeight: 700,
              color: stop.estimated_pick_up_time ? "#1d4ed8" : "#94a3b8",
              background: "#fff", 
              outline: "none",
              fontFamily: "inherit", 
              width: 110,
            }}
            onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
            onBlur={(e) => e.target.style.borderColor = "#bfdbfe"}
          />
        </div>

        {/* Drop */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{
            fontSize: 11, 
            fontWeight: 700, 
            color: "#ef4444",
            background: "#fef2f2", 
            borderRadius: 5, 
            padding: "2px 6px",
            whiteSpace: "nowrap", 
            minWidth: 44, 
            textAlign: "center",
          }}>
            Drop
          </span>
          <input
            type="time"
            value={stop.estimated_drop_time || ""}
            onChange={(e) => onDropTimeChange(stop.booking_id, e.target.value)}
            style={{
              border: "1.5px solid #fecaca", 
              borderRadius: 7,
              padding: "5px 8px", 
              fontSize: 13, 
              fontWeight: 700,
              color: stop.estimated_drop_time ? "#dc2626" : "#94a3b8",
              background: "#fff", 
              outline: "none",
              fontFamily: "inherit", 
              width: 110,
            }}
            onFocus={(e) => e.target.style.borderColor = "#ef4444"}
            onBlur={(e) => e.target.style.borderColor = "#fecaca"}
          />
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// RouteEditModal
// ─────────────────────────────────────────────────────────────────────────────
const RouteEditModal = ({
  route, 
  isOpen, 
  onClose, 
  onSave,
  selectedBookings, 
  onBookingSelect,
  onRemoveFromRoute, 
  isDeleteDisabled,
  onCreateRoute,
}) => {
  const [stops, setStops] = useState([]);
  const [originalStops, setOriginalStops] = useState([]); // Track original state
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingRoute, setIsCreatingRoute] = useState(false);
  const [draggingIdx, setDraggingIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const [wasReordered, setWasReordered] = useState(false);
  const [timeChanged, setTimeChanged] = useState(false); // Track time changes
  const dragIndex = useRef(null);
  const dragOverIndex = useRef(null);

  useEffect(() => {
    if (route?.stops) {
      const stopsCopy = route.stops.map((s) => ({ ...s }));
      setStops(stopsCopy);
      setOriginalStops(route.stops.map((s) => ({ ...s }))); // Store original
      setWasReordered(false);
      setTimeChanged(false);
    }
  }, [route, isOpen]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !route) return null;

  // ── Check if times have changed ──
  const checkTimeChanged = () => {
    if (!originalStops.length) return false;
    
    return stops.some((stop, idx) => {
      const original = originalStops.find(o => o.booking_id === stop.booking_id);
      if (!original) return false;
      
      return stop.estimated_pick_up_time !== original.estimated_pick_up_time ||
             stop.estimated_drop_time !== original.estimated_drop_time;
    });
  };

  // ── Determine what changed ──
  const hasTimeChanged = checkTimeChanged();
  const hasBothChanged = wasReordered && hasTimeChanged;
  
  // ── Dynamic button config ──
  const getButtonConfig = () => {
    if (hasBothChanged) {
      return {
        text: "Update Time & Order",
        icon: <RefreshCw size={15} />,
        gradient: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
        shadow: "0 2px 10px rgba(139,92,246,0.4)",
      };
    } else if (wasReordered) {
      return {
        text: "Update Order",
        icon: <GripVertical size={15} />,
        gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
        shadow: "0 2px 10px rgba(245,158,11,0.4)",
      };
    } else if (hasTimeChanged) {
      return {
        text: "Update Time",
        icon: <Clock size={15} />,
        gradient: "linear-gradient(135deg, #3b82f6, #2563eb)",
        shadow: "0 2px 10px rgba(59,130,246,0.4)",
      };
    } else {
      return {
        text: "No Changes",
        icon: <Clock size={15} />,
        gradient: "#e2e8f0",
        shadow: "none",
        disabled: true,
      };
    }
  };

  const buttonConfig = getButtonConfig();

  // ── Create mapping of original order for visual indicators ──
  const originalOrderMap = {};
  originalStops.forEach((stop, idx) => {
    originalOrderMap[stop.booking_id] = idx;
  });

  // ── selected booking IDs from the modal's stop list ──
  const selectedInModal = selectedBookings
    ? stops.filter((s) => selectedBookings.has(s.booking_id)).map((s) => s.booking_id)
    : [];
  const hasSelection = selectedInModal.length > 0;

  const handleDragStart = (e, index) => {
    dragIndex.current = index;
    setDraggingIdx(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    dragOverIndex.current = index;
    setDragOverIdx(index);
  };

  const handleDrop = () => {
    const from = dragIndex.current;
    const to = dragOverIndex.current;
    if (from !== null && to !== null && from !== to) {
      const updated = [...stops];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      setStops(updated);
      setWasReordered(true);
    }
    dragIndex.current = null;
    dragOverIndex.current = null;
    setDraggingIdx(null);
    setDragOverIdx(null);
  };

  const handleDragEnd = () => {
    setDraggingIdx(null);
    setDragOverIdx(null);
  };

  const handleTimeChange = (bookingId, newTime) => {
    setStops((prev) =>
      prev.map((s) => s.booking_id === bookingId ? { ...s, estimated_pick_up_time: newTime } : s)
    );
    setTimeChanged(true);
  };

  const handleDropTimeChange = (bookingId, newTime) => {
    setStops((prev) =>
      prev.map((s) => s.booking_id === bookingId ? { ...s, estimated_drop_time: newTime } : s)
    );
    setTimeChanged(true);
  };

  const handleBookingClick = (e, bookingId) => {
    if (e.target.closest("button")) return;
    onBookingSelect && onBookingSelect(bookingId);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        bookings: stops.map((s, i) => ({
          booking_id: s.booking_id,
          order_id: i + 1,
          estimated_pick_up_time: s.estimated_pick_up_time ? `${s.estimated_pick_up_time}:00` : "",
          estimated_drop_time: s.estimated_drop_time ? `${s.estimated_drop_time}:00` : "",
        })),
        optimize: wasReordered, // TRUE if order changed (with or without time changes)
      };

      await API_CLIENT.patch(`/routes/${route.route_id}/update`, payload);
      onSave && onSave();
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.detail?.message || err?.response?.data?.message || "Failed to save. Please try again.";
      alert(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Create Route from selected bookings inside the modal ──
  const handleCreateRoute = async () => {
    if (!hasSelection) return;
    setIsCreatingRoute(true);
    try {
      const payload = { booking_ids: selectedInModal, optimize: true };
      await API_CLIENT.post("/routes/new-route", payload);
      onCreateRoute && onCreateRoute();
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.detail?.message || err?.response?.data?.message || "Failed to create route. Please try again.";
      alert(msg);
    } finally {
      setIsCreatingRoute(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed", 
          inset: 0,
          background: "rgba(15,23,42,0.5)",
          backdropFilter: "blur(4px)",
          zIndex: 1000,
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed", 
          top: "50%", 
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(1100px, 96vw)",
          maxHeight: "92vh",
          background: "#fff",
          borderRadius: 18,
          boxShadow: "0 32px 80px rgba(0,0,0,0.22)",
          zIndex: 1001,
          display: "flex", 
          flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div style={{
          padding: "18px 24px",
          borderBottom: "1px solid #f1f5f9",
          display: "flex", 
          alignItems: "center", 
          gap: 14,
          background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          flexShrink: 0,
        }}>
          <div style={{ flex: 1 }}>
            {/* Title row */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ fontWeight: 800, fontSize: 18, color: "#1e293b" }}>
                Route #{route.route_id}
              </span>
              {route.route_code && (
                <span style={{
                  fontSize: 13, 
                  color: "#64748b", 
                  background: "#f1f5f9",
                  borderRadius: 6, 
                  padding: "2px 8px", 
                  fontWeight: 500,
                }}>
                  {route.route_code}
                </span>
              )}
              <span style={{
                fontSize: 12, 
                background: "#ede9fe", 
                color: "#7c3aed",
                borderRadius: 6, 
                padding: "2px 10px", 
                fontWeight: 600,
              }}>
                {stops.length} stops
              </span>
            </div>

            {/* Info row */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "#64748b" }}>
                <User size={13} color="#a78bfa" />
                {route.driver?.name || "No driver"}
              </span>
              {route.vehicle?.rc_number && (
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "#64748b" }}>
                  <Truck size={13} color="#34d399" />
                  {route.vehicle.rc_number}
                </span>
              )}
              {route.summary?.total_distance_km && (
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "#64748b" }}>
                  <Navigation size={13} color="#34d399" />
                  {route.summary.total_distance_km} km
                </span>
              )}
              
              {/* Dynamic status badge */}
              {hasBothChanged && (
                <span style={{
                  fontSize: 12,
                  background: "#f3e8ff",
                  color: "#7c3aed",
                  borderRadius: 6, 
                  padding: "2px 10px", 
                  fontWeight: 600,
                }}>
                  🔄 Time & Order Modified
                </span>
              )}
              {!hasBothChanged && wasReordered && (
                <span style={{
                  fontSize: 12,
                  background: "#fef3c7",
                  color: "#d97706",
                  borderRadius: 6, 
                  padding: "2px 10px", 
                  fontWeight: 600,
                }}>
                  ⚡ Order Changed
                </span>
              )}
              {!hasBothChanged && !wasReordered && hasTimeChanged && (
                <span style={{
                  fontSize: 12,
                  background: "#dbeafe",
                  color: "#2563eb",
                  borderRadius: 6, 
                  padding: "2px 10px", 
                  fontWeight: 600,
                }}>
                  🕐 Time Modified
                </span>
              )}
              {!hasBothChanged && !wasReordered && !hasTimeChanged && (
                <span style={{
                  fontSize: 12,
                  background: "#f0fdf4",
                  color: "#16a34a",
                  borderRadius: 6, 
                  padding: "2px 10px", 
                  fontWeight: 600,
                }}>
                  ✓ No Changes
                </span>
              )}
            </div>
          </div>

          {/* Close btn */}
          <button
            onClick={onClose}
            style={{
              width: 34, 
              height: 34, 
              borderRadius: "50%",
              border: "1px solid #e2e8f0", 
              background: "#fff",
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              cursor: "pointer", 
              color: "#64748b", 
              transition: "all 0.15s", 
              flexShrink: 0,
            }}
            onMouseEnter={(e) => { 
              e.currentTarget.style.background = "#fee2e2"; 
              e.currentTarget.style.color = "#ef4444"; 
            }}
            onMouseLeave={(e) => { 
              e.currentTarget.style.background = "#fff"; 
              e.currentTarget.style.color = "#64748b"; 
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Stop list ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          {stops.map((stop, index) => (
            <DraggableBookingRow
              key={stop.booking_id}
              stop={stop}
              index={index}
              isDragging={draggingIdx === index}
              isDragOver={dragOverIdx === index}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              onTimeChange={handleTimeChange}
              onDropTimeChange={handleDropTimeChange}
              isSelected={selectedBookings?.has(stop.booking_id)}
              isDeleteDisabled={isDeleteDisabled}
              onBookingClick={handleBookingClick}
              onRemoveFromRoute={onRemoveFromRoute}
              originalOrder={originalOrderMap[stop.booking_id]}
            />
          ))}
        </div>

        {/* ── Footer ── */}
        <div style={{
          padding: "14px 24px",
          borderTop: "1px solid #f1f5f9",
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          background: "#fafafa", 
          flexShrink: 0,
        }}>
          {/* Left: status hint */}
          <span style={{ fontSize: 13, color: "#64748b" }}>
            {hasBothChanged && (
              <span style={{ color: "#7c3aed", fontWeight: 600 }}>
                🔄 Optimize: <strong>ON</strong> (Time + Order)
              </span>
            )}
            {!hasBothChanged && wasReordered && (
              <span style={{ color: "#d97706", fontWeight: 600 }}>
                ⚡ Optimize: <strong>ON</strong> (Order changed)
              </span>
            )}
            {!hasBothChanged && !wasReordered && hasTimeChanged && (
              <span style={{ color: "#2563eb", fontWeight: 600 }}>
                🕐 Optimize: <strong>OFF</strong> (Time only)
              </span>
            )}
            {!hasBothChanged && !wasReordered && !hasTimeChanged && (
              <span style={{ color: "#94a3b8", fontWeight: 500 }}>
                No modifications detected
              </span>
            )}
          </span>

          {/* Right: action buttons */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>

            {/* ── Create Route button ── */}
            <button
              onClick={handleCreateRoute}
              disabled={!hasSelection || isCreatingRoute}
              title={
                !hasSelection
                  ? "Click bookings in the list to select them, then create a new route"
                  : `Create a new route from ${selectedInModal.length} selected booking${selectedInModal.length !== 1 ? "s" : ""}`
              }
              style={{
                padding: "9px 20px", 
                borderRadius: 9, 
                border: "none",
                background: hasSelection && !isCreatingRoute
                  ? "linear-gradient(135deg, #10b981, #059669)"
                  : "#e2e8f0",
                color: hasSelection && !isCreatingRoute ? "#fff" : "#94a3b8",
                fontSize: 14, 
                fontWeight: 700,
                cursor: hasSelection && !isCreatingRoute ? "pointer" : "not-allowed",
                display: "flex", 
                alignItems: "center", 
                gap: 7,
                boxShadow: hasSelection && !isCreatingRoute ? "0 2px 10px rgba(16,185,129,0.35)" : "none",
                transition: "all 0.15s",
              }}
            >
              <RouteIcon size={15} />
              {isCreatingRoute
                ? "Creating..."
                : hasSelection
                  ? `Separate Route (${selectedInModal.length})`
                  : "Separate Route"
              }
            </button>

            <button
              onClick={onClose}
              style={{
                padding: "9px 20px", 
                borderRadius: 9,
                border: "1px solid #e2e8f0", 
                background: "#fff",
                fontSize: 14, 
                color: "#64748b", 
                cursor: "pointer",
                fontWeight: 500,
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
            >
              Cancel
            </button>

            {/* ── Dynamic Save Button ── */}
            <button
              onClick={handleSave}
              disabled={isSaving || buttonConfig.disabled}
              style={{
                padding: "9px 24px", 
                borderRadius: 9, 
                border: "none",
                background: isSaving 
                  ? "#d1d5db" 
                  : buttonConfig.disabled 
                    ? "#e2e8f0" 
                    : buttonConfig.gradient,
                color: buttonConfig.disabled ? "#94a3b8" : "#fff",
                fontSize: 14, 
                fontWeight: 700,
                cursor: (isSaving || buttonConfig.disabled) ? "not-allowed" : "pointer",
                display: "flex", 
                alignItems: "center", 
                gap: 7,
                boxShadow: (isSaving || buttonConfig.disabled) ? "none" : buttonConfig.shadow,
                transition: "all 0.15s",
              }}
            >
              {isSaving ? (
                <>
                  <RefreshCw size={15} style={{ animation: "spin 1s linear infinite" }} />
                  Saving...
                </>
              ) : (
                <>
                  {buttonConfig.icon}
                  {buttonConfig.text}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Add spin animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default RouteEditModal;
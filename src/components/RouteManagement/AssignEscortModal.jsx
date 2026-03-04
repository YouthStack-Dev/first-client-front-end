import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Shield,
  Search,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Phone,
  Building,
} from "lucide-react";
import { API_CLIENT } from "../../Api/API_Client";
import { logDebug, logError } from "../../utils/logger";
import { FemaleSilhouette } from "./EmployeeChipComponents";
import { ESCORT_COLORS } from "./routeCardConstants";

// ─────────────────────────────────────────────────────────────────────────────
// EscortRow
// A single selectable escort item in the picker list.
// ─────────────────────────────────────────────────────────────────────────────
const EscortRow = ({ escort, isSelected, onSelect }) => {
  const initials = (escort.name || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      onClick={() => onSelect(escort)}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "10px 14px",
        borderRadius: 10,
        border: `1.5px solid ${isSelected ? "#7c3aed" : "#e2e8f0"}`,
        background: isSelected ? "#f5f3ff" : "#fff",
        cursor: "pointer",
        transition: "all 0.15s",
        boxShadow: isSelected ? "0 0 0 3px #ede9fe" : "none",
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: isSelected ? "#ede9fe" : "#f1f5f9",
        border: `2px solid ${isSelected ? "#7c3aed" : "#e2e8f0"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s",
      }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: isSelected ? "#5b21b6" : "#64748b" }}>
          {initials}
        </span>
      </div>

      {/* Details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b", marginBottom: 2 }}>
          {escort.name}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {escort.phone && (
            <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, color: "#64748b" }}>
              <Phone size={9} /> {escort.phone}
            </span>
          )}
          {escort.vendor_name && (
            <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, color: "#64748b" }}>
              <Building size={9} /> {escort.vendor_name}
            </span>
          )}
        </div>
      </div>

      {/* Right side: available badge + checkmark */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <span style={{
          fontSize: 9, fontWeight: 700,
          background: "#d1fae5", color: "#065f46",
          border: "1px solid #a7f3d0",
          borderRadius: 20, padding: "2px 7px",
        }}>
          Available
        </span>
        {isSelected && <CheckCircle2 size={16} color="#7c3aed" />}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// AssignEscortModal
//
// Props:
//   isOpen        {boolean}
//   onClose       {() => void}
//   routeId       {number}
//   triggerReason {string}   — shown as context chip in header
//   tenantId      {string|null} — appended to PUT if provided (admin users)
//   onSuccess     {(escort) => void} — called after successful assignment
// ─────────────────────────────────────────────────────────────────────────────
const AssignEscortModal = ({ isOpen, onClose, routeId, triggerReason, tenantId, onSuccess }) => {
  const [escorts,   setEscorts]   = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [selected,  setSelected]  = useState(null);
  const [search,    setSearch]    = useState("");
  const [error,     setError]     = useState(null);
  const [success,   setSuccess]   = useState(false);
  const searchRef                 = useRef(null);

  // Fetch escorts list whenever modal opens
  useEffect(() => {
    if (!isOpen) return;

    setSelected(null);
    setSearch("");
    setError(null);
    setSuccess(false);
    setLoading(true);

    API_CLIENT.get("/escorts/")
      .then((res) => {
        // API response shape: { data: [...], status: 200 }
        const list = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
        setEscorts(list);
        logDebug("[AssignEscortModal] escorts loaded:", list.length);
      })
      .catch((err) => {
        logError("[AssignEscortModal] fetch failed:", err);
        setError("Failed to load escorts. Please try again.");
      })
      .finally(() => setLoading(false));

    setTimeout(() => searchRef.current?.focus(), 120);
  }, [isOpen]);

  // PUT /routes/{routeId}/assign-escort?escort_id=X[&tenant_id=Y]
  const handleAssign = async () => {
    if (!selected) return;

    setAssigning(true);
    setError(null);

    const escortId = selected.id ?? selected.escort_id;
    const params   = new URLSearchParams({ escort_id: escortId });
    if (tenantId) params.append("tenant_id", tenantId);

    try {
      await API_CLIENT.put(`/routes/${routeId}/assign-escort?${params}`);
      setSuccess(true);
      onSuccess?.(selected);
    } catch (err) {
      logError("[AssignEscortModal] assign failed:", err);
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.detail  ||
        "Failed to assign escort. Please try again."
      );
    } finally {
      setAssigning(false);
    }
  };

  const handleClose = () => { if (!assigning) onClose(); };

  const filteredEscorts = escorts.filter((e) =>
    !search.trim() ||
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.vendor_name?.toLowerCase().includes(search.toLowerCase()) ||
    e.phone?.includes(search)
  );

  const selectedKey = selected?.id ?? selected?.escort_id;

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: "fixed", inset: 0, zIndex: 50000,
          background: "rgba(15,23,42,0.45)",
          backdropFilter: "blur(3px)",
          animation: "escortFadeIn 0.18s ease",
        }}
      />

      {/* Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed", zIndex: 50001,
          top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: "min(480px, calc(100vw - 32px))",
          maxHeight: "min(600px, 90vh)",
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 24px 60px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.06)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          animation: "escortSlideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* ── Header ── */}
        <div style={{
          padding: "16px 20px 14px",
          borderBottom: "1px solid #f1f5f9",
          background: "linear-gradient(135deg, #fdf2f8 0%, #f5f3ff 100%)",
          display: "flex", alignItems: "flex-start", gap: 10,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: "linear-gradient(135deg,#f9a8d4,#c084fc)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px #f9a8d455",
          }}>
            <Shield size={18} color="#fff" />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#1e293b" }}>Assign Escort</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
              Route ID {routeId} · Select an available escort below
            </div>
            {triggerReason && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                marginTop: 6, fontSize: 10, fontWeight: 600,
                background: ESCORT_COLORS.unassigned.bg,
                color: ESCORT_COLORS.unassigned.text,
                border: `1px solid #f9a8d4`,
                borderRadius: 20, padding: "2px 8px",
              }}>
                <FemaleSilhouette size={10} />
                {triggerReason}
              </span>
            )}
          </div>

          <button
            onClick={handleClose}
            disabled={assigning}
            style={{
              width: 28, height: 28, borderRadius: 8, border: "none",
              background: "#f1f5f9",
              cursor: assigning ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <X size={14} color="#64748b" />
          </button>
        </div>

        {/* ── Search ── */}
        <div style={{ padding: "12px 20px 8px", borderBottom: "1px solid #f8fafc" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#f8fafc", border: "1.5px solid #e2e8f0",
            borderRadius: 9, padding: "7px 12px",
          }}>
            <Search size={13} color="#94a3b8" />
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, vendor, phone…"
              style={{
                flex: 1, border: "none", outline: "none",
                background: "transparent", fontSize: 13,
                color: "#1e293b", fontFamily: "inherit",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}
              >
                <X size={11} color="#94a3b8" />
              </button>
            )}
          </div>
        </div>

        {/* ── Escort list ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 20px" }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 0", gap: 10 }}>
              <Loader2 size={22} color="#a78bfa" style={{ animation: "escortSpin 0.8s linear infinite" }} />
              <span style={{ fontSize: 12, color: "#94a3b8" }}>Loading available escorts…</span>
            </div>
          ) : filteredEscorts.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "36px 0", gap: 8 }}>
              <Shield size={28} color="#e2e8f0" />
              <span style={{ fontSize: 12, color: "#94a3b8" }}>
                {search ? "No escorts match your search." : "No available escorts found."}
              </span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {filteredEscorts.map((escort) => {
                const escortKey = escort.id ?? escort.escort_id;
                return (
                  <EscortRow
                    key={escortKey}
                    escort={escort}
                    isSelected={escortKey === selectedKey}
                    onSelect={setSelected}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* ── Inline feedback (error / success) ── */}
        {error && (
          <div style={{
            margin: "0 20px 8px",
            display: "flex", alignItems: "center", gap: 8,
            background: "#fef2f2", border: "1px solid #fecaca",
            borderRadius: 8, padding: "8px 12px",
            fontSize: 12, color: "#b91c1c",
          }}>
            <AlertCircle size={13} /> {error}
          </div>
        )}
        {success && (
          <div style={{
            margin: "0 20px 8px",
            display: "flex", alignItems: "center", gap: 8,
            background: "#f0fdf4", border: "1px solid #bbf7d0",
            borderRadius: 8, padding: "8px 12px",
            fontSize: 12, color: "#15803d",
          }}>
            <CheckCircle2 size={13} /> Escort assigned successfully!
          </div>
        )}

        {/* ── Footer ── */}
        <div style={{
          padding: "12px 20px",
          borderTop: "1px solid #f1f5f9",
          display: "flex", alignItems: "center", gap: 10, justifyContent: "flex-end",
          background: "#fafafa",
        }}>
          {selected && !success && (
            <div style={{ flex: 1, fontSize: 11, color: "#64748b", display: "flex", alignItems: "center", gap: 5 }}>
              <CheckCircle2 size={11} color="#7c3aed" />
              <span><strong style={{ color: "#1e293b" }}>{selected.name}</strong> selected</span>
            </div>
          )}

          <button
            onClick={handleClose}
            disabled={assigning}
            style={{
              padding: "7px 16px", borderRadius: 8,
              border: "1.5px solid #e2e8f0", background: "#fff",
              fontSize: 12, fontWeight: 600, color: "#64748b",
              cursor: assigning ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
          >
            Cancel
          </button>

          <button
            onClick={success ? handleClose : handleAssign}
            disabled={(!selected && !success) || assigning}
            style={{
              padding: "7px 18px", borderRadius: 8, border: "none",
              background: success
                ? "linear-gradient(135deg,#22c55e,#16a34a)"
                : !selected || assigning
                ? "#e2e8f0"
                : "linear-gradient(135deg,#c084fc,#7c3aed)",
              color: !selected && !success ? "#94a3b8" : "#fff",
              fontSize: 12, fontWeight: 700,
              cursor: (!selected && !success) || assigning ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 6,
              boxShadow: selected && !assigning && !success ? "0 2px 8px #c084fc55" : "none",
              transition: "all 0.15s",
            }}
          >
            {assigning
              ? <><Loader2 size={13} style={{ animation: "escortSpin 0.8s linear infinite" }} /> Assigning…</>
              : success
              ? <><CheckCircle2 size={13} /> Done</>
              : <><Shield size={13} /> Assign Escort</>
            }
          </button>
        </div>
      </div>

      <style>{`
        @keyframes escortFadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes escortSlideUp { from{opacity:0;transform:translate(-50%,-46%) scale(0.97)} to{opacity:1;transform:translate(-50%,-50%) scale(1)} }
        @keyframes escortSpin    { to{transform:rotate(360deg)} }
      `}</style>
    </>,
    document.body
  );
};

export default AssignEscortModal;
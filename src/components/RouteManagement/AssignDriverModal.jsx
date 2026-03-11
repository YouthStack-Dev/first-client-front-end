// AssignDriverModal.jsx
import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Car, Check, Search, RefreshCw, Loader2 } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { selectAllVehicles } from "../../redux/features/manageVehicles/vehicleSelectors";
import { fetchVehiclesThunk } from "../../redux/features/manageVehicles/vehicleThunk";

// ✅ Props added: tenantId, isAssigning
const AssignDriverModal = ({
  isOpen,
  onClose,
  onAssign,
  selectedRoutesCount,
  routeIds,
  tenantId,       // ✅ NEW — forwarded from ShiftRoutingManagement
  isAssigning,    // ✅ NEW — loading state from parent during API call
}) => {
  const [selectedAssignment, setSelectedAssignment] = useState("");
  const [search,             setSearch]             = useState("");
  const [localLoading,       setLocalLoading]       = useState(false);
  const dispatch = useDispatch();

  const allVehicles = useSelector(selectAllVehicles);

  // Fetch vehicles on open if not already loaded
  useEffect(() => {
    if (isOpen && allVehicles.length === 0) {
      setLocalLoading(true);
      dispatch(fetchVehiclesThunk())
        .unwrap()
        .finally(() => setLocalLoading(false));
    }
  }, [isOpen, dispatch, allVehicles.length]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) { setSelectedAssignment(""); setSearch(""); }
  }, [isOpen]);

  const handleRefresh = async () => {
    setLocalLoading(true);
    try {
      await dispatch(fetchVehiclesThunk()).unwrap();
    } catch (err) {
      console.error("Failed to refresh vehicles:", err);
    } finally {
      setLocalLoading(false);
    }
  };

  // ✅ FIXED: removed duplicate `vehicle_id || vehicle_id` mapping
  const availableAssignments = useMemo(() =>
    allVehicles
      .filter((v) => v.is_active)
      .map((v) => ({
        vehicle_id:   v.vehicle_id,
        vehicle_rc:   v.rc_number   || v.vehicle_rc  || "N/A",
        driver_name:  v.driver_name || "Unassigned",
        vehicle_type: v.vehicle_type_name || v.vehicle_type || "Unknown Type",
        status:       v.driver_id ? "Available" : "No Driver",
      })),
    [allVehicles]
  );

  const filteredAssignments = useMemo(() => {
    if (!search.trim()) return availableAssignments;
    const q = search.toLowerCase();
    return availableAssignments.filter((a) =>
      a.vehicle_rc.toLowerCase().includes(q) ||
      a.driver_name.toLowerCase().includes(q)
    );
  }, [search, availableAssignments]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    onAssign(selectedAssignment);
  };

  const handleClose = () => {
    if (isAssigning) return; // prevent close during API call
    setSelectedAssignment(""); setSearch("");
    onClose();
  };

  const getStatusColor = (status) => ({
    "Available": "text-green-600 bg-green-100",
    "No Driver": "text-yellow-600 bg-yellow-100",
    "On Duty":   "text-red-600 bg-red-100",
  }[status] ?? "text-gray-600 bg-gray-100");

  const isBusy      = localLoading || isAssigning;
  const hasVehicles = availableAssignments.length > 0;

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: "fixed", inset: 0, zIndex: 50000,
          background: "rgba(15,23,42,0.45)", backdropFilter: "blur(3px)",
          animation: "admFadeIn 0.18s ease",
        }}
      />

      {/* Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed", zIndex: 50001,
          top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: "min(480px, calc(100vw - 32px))",
          maxHeight: "min(700px, 90vh)",
          background: "#fff", borderRadius: 16,
          boxShadow: "0 24px 60px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.06)",
          display: "flex", flexDirection: "column", overflow: "hidden",
          animation: "admSlideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "16px 20px 14px",
          borderBottom: "1px solid #f1f5f9",
          background: "linear-gradient(135deg,#f0fdf4 0%,#ecfdf5 100%)",
          display: "flex", alignItems: "flex-start", gap: 10,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: "linear-gradient(135deg,#34d399,#059669)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px #34d39955",
          }}>
            <Car size={18} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#1e293b" }}>Assign Vehicle</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
              {selectedRoutesCount} route{selectedRoutesCount !== 1 ? "s" : ""} selected
              {tenantId && <span style={{ color: "#94a3b8", marginLeft: 6 }}>· tenant {tenantId}</span>}
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isBusy}
            title="Refresh vehicles"
            style={{
              width: 28, height: 28, borderRadius: 8, border: "1px solid #e2e8f0",
              background: "#fff", cursor: isBusy ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", marginRight: 4,
            }}
          >
            <RefreshCw size={13} color="#64748b" style={{ animation: localLoading ? "admSpin 0.8s linear infinite" : "none" }} />
          </button>
          <button
            onClick={handleClose}
            disabled={isAssigning}
            style={{
              width: 28, height: 28, borderRadius: 8, border: "none",
              background: "#f1f5f9", cursor: isAssigning ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <X size={14} color="#64748b" />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Search */}
          <div style={{ position: "relative" }}>
            <Search size={13} color="#94a3b8" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search by RC number or driver…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={isBusy || !hasVehicles}
              style={{
                width: "100%", paddingLeft: 30, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
                borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12,
                background: isBusy || !hasVehicles ? "#f8fafc" : "#fff",
                outline: "none", boxSizing: "border-box",
                fontFamily: "inherit", color: "#1e293b",
              }}
            />
          </div>

          {/* Count row */}
          {!localLoading && hasVehicles && (
            <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>
              {filteredAssignments.length} of {availableAssignments.length} vehicles
            </div>
          )}

          {/* Loading state */}
          {localLoading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 0", gap: 10 }}>
              <Loader2 size={22} color="#059669" style={{ animation: "admSpin 0.8s linear infinite" }} />
              <span style={{ fontSize: 12, color: "#94a3b8" }}>Loading vehicles…</span>
            </div>
          )}

          {/* Empty state */}
          {!localLoading && !hasVehicles && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 0", gap: 8 }}>
              <Car size={32} color="#e2e8f0" />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>No vehicles available</span>
              <span style={{ fontSize: 11, color: "#cbd5e1" }}>
                {allVehicles.length === 0 ? "No vehicles found in the system." : "No active vehicles with drivers."}
              </span>
            </div>
          )}

          {/* Vehicle list */}
          {!localLoading && hasVehicles && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {filteredAssignments.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8", fontSize: 12 }}>
                  No vehicles match your search
                </div>
              ) : (
                filteredAssignments.map((a) => {
                  const isSelected   = selectedAssignment === a.vehicle_id;
                  const isDisabled   = a.status !== "Available";
                  return (
                    <div
                      key={a.vehicle_id}
                      onClick={() => !isDisabled && setSelectedAssignment(a.vehicle_id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 12px", borderRadius: 8,
                        border: `1px solid ${isSelected ? "#6ee7b7" : "#e2e8f0"}`,
                        background: isSelected ? "#f0fdf4" : "#fff",
                        cursor: isDisabled ? "not-allowed" : "pointer",
                        opacity: isDisabled ? 0.5 : 1,
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{
                        width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                        background: isSelected ? "#dcfce7" : "#f8fafc",
                        border: `1px solid ${isSelected ? "#bbf7d0" : "#e2e8f0"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Car size={15} color={isSelected ? "#059669" : "#94a3b8"} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{a.vehicle_rc}</div>
                        <div style={{ fontSize: 11, color: "#64748b", marginTop: 1 }}>
                          {a.driver_name} · {a.vehicle_type}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                          background: a.status === "Available" ? "#f0fdf4" : "#fffbeb",
                          color:      a.status === "Available" ? "#15803d" : "#92400e",
                          border:     `1px solid ${a.status === "Available" ? "#bbf7d0" : "#fde68a"}`,
                        }}>
                          {a.status}
                        </span>
                        {isSelected && <Check size={14} color="#059669" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Selected summary */}
          {selectedAssignment && !localLoading && (
            <div style={{
              padding: "10px 12px", borderRadius: 8,
              background: "#f0fdf4", border: "1px solid #bbf7d0",
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#15803d", marginBottom: 4 }}>SELECTED VEHICLE</div>
              {(() => {
                const a = availableAssignments.find((x) => x.vehicle_id === selectedAssignment);
                return a ? (
                  <div style={{ fontSize: 12, color: "#1e293b", display: "flex", alignItems: "center", gap: 6 }}>
                    <Car size={12} color="#059669" />
                    <strong>{a.vehicle_rc}</strong>
                    <span style={{ color: "#64748b" }}>· {a.driver_name}</span>
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: "12px 20px", borderTop: "1px solid #f1f5f9",
          display: "flex", gap: 10, justifyContent: "flex-end",
          background: "#fafafa",
        }}>
          <button
            onClick={handleClose}
            disabled={isAssigning}
            style={{
              padding: "8px 18px", borderRadius: 8, border: "1.5px solid #e2e8f0",
              background: "#fff", fontSize: 12, fontWeight: 600, color: "#64748b",
              cursor: isAssigning ? "not-allowed" : "pointer", fontFamily: "inherit",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedAssignment || isBusy}
            style={{
              padding: "8px 20px", borderRadius: 8, border: "none",
              background: !selectedAssignment || isBusy
                ? "#e2e8f0"
                : "linear-gradient(135deg,#34d399,#059669)",
              color: !selectedAssignment || isBusy ? "#94a3b8" : "#fff",
              fontSize: 12, fontWeight: 700, fontFamily: "inherit",
              cursor: !selectedAssignment || isBusy ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 6,
              boxShadow: selectedAssignment && !isBusy ? "0 2px 8px #34d39955" : "none",
              transition: "all 0.15s",
            }}
          >
            {isAssigning
              ? <><Loader2 size={13} style={{ animation: "admSpin 0.8s linear infinite" }} /> Assigning…</>
              : <>Assign to {selectedRoutesCount} Route{selectedRoutesCount !== 1 ? "s" : ""}</>
            }
          </button>
        </div>
      </div>

      <style>{`
        @keyframes admFadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes admSlideUp { from{opacity:0;transform:translate(-50%,-46%) scale(0.97)} to{opacity:1;transform:translate(-50%,-50%) scale(1)} }
        @keyframes admSpin    { to{transform:rotate(360deg)} }
      `}</style>
    </>,
    document.body
  );
};

export default AssignDriverModal;
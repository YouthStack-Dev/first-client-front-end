// src/components/liveDrivers/LiveDriverMap.jsx

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";

import { selectCurrentUser } from "../redux/features/auth/authSlice";
import { useVendorOptions } from "../hooks/useVendorOptions";
import { useLiveDrivers } from "../utils/Uselivedrivers";

import LiveDriverMapCanvas from "../components/liveDrivers/LiveDriverMapCanvas";
import LiveDriverSidebar from "../components/liveDrivers/LiveDriverSidebar";

import {
  vendorColor,
  isStale,
  secAgo,
  fmtAge,
} from "../components/liveDrivers/liveDriverHelpers";
import { API_CLIENT } from "../Api/API_Client";

import { S } from "../components/liveDrivers/styles";

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LiveDriverMap() {
  const user = useSelector(selectCurrentUser);
  const tenantId = user?.tenant_id ?? null;
  const isSuperAdmin =
    user?.type === "admin" ||
    user?.roles?.includes("SuperAdmin") ||
    user?.admin_id != null;

  const [selectedTenant, setSelectedTenant] = useState(
    isSuperAdmin ? "" : tenantId
  );
  const [selectedVid, setSelectedVid] = useState(null);
  const [filterMode, setFilterMode] = useState("all");
  const [detail, setDetail] = useState(null);
  const [fitKey, setFitKey] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [syncError, setSyncError] = useState(false);

  const tenantToUse = isSuperAdmin ? selectedTenant || null : tenantId;
  const { vendorOptions, vendorList, loading: vendorsLoading } = useVendorOptions(
    tenantToUse,
    !!(tenantToUse || isSuperAdmin)
  );

  const tenantOptions = useMemo(() => {
    const seen = new Set();
    const options = [];

    vendorList.forEach((vendor) => {
      const tenant = vendor?.tenant_id;
      if (!tenant || seen.has(tenant)) return;
      seen.add(tenant);
      options.push({
        value: tenant,
        label: vendor?.tenant_name ? `${vendor.tenant_name} (${tenant})` : tenant,
      });
    });

    return options.sort((a, b) => a.label.localeCompare(b.label));
  }, [vendorList]);

  useEffect(() => {
    if (isSuperAdmin) {
      setSelectedVid(null);
    }
  }, [selectedTenant, isSuperAdmin]);

  const { driverMap, status, error: fbError } = useLiveDrivers({
    tenantId: tenantToUse,
    vendorId: selectedVid,
  });

  // Trigger map fit once on load and when tenant/vendor selection changes
  useEffect(() => {
    setFitKey((k) => k + 1);
  }, [tenantToUse, selectedVid]);

  const isVisible = useCallback((vid, d) => {
    if (filterMode === "active" && (!d.is_active || isStale(d))) return false;
    if (filterMode === "offline" && d.is_active) return false;
    if (filterMode === "stale" && !isStale(d)) return false;
    return true;
  }, [filterMode]);

  const handleMarkerClick = useCallback((vid, did) => {
    setDetail({ vid, did });
  }, []);

  const handleSpaceSync = useCallback(async () => {
    const syncTenant = tenantToUse;
    if (isSuperAdmin && !syncTenant) {
      setSyncError(true);
      setSyncMessage("Select tenant first to run sync.");
      return;
    }

    setSyncError(false);
    setSyncMessage("Syncing space…");
    setSyncing(true);

    try {
      const response = await API_CLIENT.post(
        "/admin/firebase/sync",
        undefined,
        {
          params: syncTenant ? { tenant_id: syncTenant } : undefined,
        }
      );
      const message = response?.data?.message || "Space sync completed";
      setSyncMessage(message);
    } catch (error) {
      setSyncError(true);
      setSyncMessage(
        error?.response?.data?.message || error?.message || "Space sync failed"
      );
      console.error("Space sync failed:", error);
    } finally {
      setSyncing(false);
      window.setTimeout(() => setSyncMessage(""), 5000);
    }
  }, [tenantToUse, isSuperAdmin]);

  // Visible drivers for sidebar
  const visibleDrivers = useMemo(() => {
    const rows = [];
    Object.entries(driverMap).forEach(([vid, drivers]) => {
      Object.entries(drivers).forEach(([did, data]) => {
        if (isVisible(vid, data)) {
          rows.push({ vid, did, data });
        }
      });
    });
    return rows.sort((a, b) => a.vid.localeCompare(b.vid) || a.did.localeCompare(b.did));
  }, [driverMap, isVisible]);

  const stats = useMemo(() => {
    let active = 0, offline = 0, stale = 0;
    Object.values(driverMap).forEach((vd) =>
      Object.values(vd).forEach((d) => {
        if (!d.is_active) offline++;
        else if (isStale(d)) stale++;
        else active++;
      })
    );
    return { active, offline, stale };
  }, [driverMap]);

  const pillColor = status === "live" ? "#22c55e" : status === "error" ? "#ef4444" : "#f59e0b";
  const pillBg = status === "live" ? "#0b2317" : status === "error" ? "#2d0f0f" : "#1a1400";
  const pillLabel = status === "live" ? "● LIVE" : status === "error" ? "✕ ERROR" : "◌ CONNECTING";

  return (
    <>
      <style>{`
        @keyframes dm-pulse {
          0%   { transform: scale(1);   opacity: .75; }
          100% { transform: scale(2.2); opacity: 0;   }
        }
      `}</style>

      <div style={S.root}>
        {/* ─── Map Canvas ─── */}
        <LiveDriverMapCanvas
          apiKey={import.meta.env.VITE_GOOGLE_API || ""}
          driverMap={driverMap}
          visibleDrivers={visibleDrivers}
          fitKey={fitKey}
          selectedDetail={detail}
          handleMarkerClick={handleMarkerClick}
        />

        {/* ── Status Bar ── */}
        <div style={S.sbar}>
          <span style={{ ...S.pill, background: pillBg, color: pillColor }}>{pillLabel}</span>
          <span style={S.sdiv}>|</span>
          <span style={{ fontFamily: "monospace", fontSize: 11, color: "#888" }}>
            {isSuperAdmin
              ? selectedTenant || "Select tenant"
              : tenantId || "—"}
          </span>
          <span style={S.sdiv}>|</span>
          <Stat dot="#22c55e" value={stats.active} />
          <Stat dot="#d97706" value={stats.stale} label="stale" />
          <Stat dot="#3f4452" value={stats.offline} />

          <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <button
              style={{
                ...S.syncButton,
                ...(syncing ? S.syncButtonActive : {}),
              }}
              onClick={handleSpaceSync}
              disabled={syncing}
            >
              {syncing ? "Syncing…" : "Space Sync"}
            </button>
            {syncMessage ? (
              <span
                style={{
                  ...S.syncMessage,
                  color: syncError ? "#dc2626" : "#0f766e",
                }}
              >
                {syncMessage}
              </span>
            ) : null}
          </span>
        </div>

        <LiveDriverSidebar
          vendorsLoading={vendorsLoading}
          vendorOptions={vendorOptions}
          tenantOptions={tenantOptions}
          selectedTenant={selectedTenant}
          setSelectedTenant={setSelectedTenant}
          isSuperAdmin={isSuperAdmin}
          selectedVid={selectedVid}
          setSelectedVid={setSelectedVid}
          filterMode={filterMode}
          setFilterMode={setFilterMode}
          visibleDrivers={visibleDrivers}
          detail={detail}
          setDetail={setDetail}
          vendorColor={vendorColor}
          isStale={isStale}
          fmtAge={fmtAge}
          secAgo={secAgo}
        />


        {/* ── Legend ── */}
        <div style={S.legend}>
          {[
            ["#22c55e", "Active"],
            ["#d97706", "Stale (>5 min)"],
            ["#3f4452", "Offline"]
          ].map(([c, l]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
              <span style={{ fontSize: 11, color: "#888" }}>{l}</span>
            </div>
          ))}
        </div>

        {/* ── Overlays ── */}
        {(status === "error" || !tenantId) && (
          <div style={S.overlay}>
            <div style={S.overlayBox}>
              {status === "error" ? (
                <>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#ef4444", marginBottom: 6 }}>
                    Firebase error
                  </div>
                  <div style={{ fontSize: 12, color: "#888", fontFamily: "monospace" }}>{fbError}</div>
                </>
              ) : (
                <div style={{ fontSize: 13, color: "#888" }}>Waiting for authenticated session…</div>
              )}
            </div>
          </div>
        )}

        {!import.meta.env.VITE_GOOGLE_API && (
          <div style={{
            position: "absolute", top: 56, left: "50%", transform: "translateX(-50%)",
            zIndex: 2000, background: "#f59e0b", color: "#fff", fontSize: 11,
            fontWeight: 600, padding: "4px 14px", borderRadius: 100, whiteSpace: "nowrap"
          }}>
            ⚠ Add VITE_GOOGLE_API for maps
          </div>
        )}
      </div>
    </>
  );
}

// ─── Stat Component ───────────────────────────────────────────────────────────
function Stat({ dot, value, label }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#64748b" }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: dot, display: "inline-block", flexShrink: 0 }} />
      <span style={{ fontWeight: 600, color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>{value}</span>
      {label && <span style={{ fontSize: 11, color: "#94a3b8" }}>{label}</span>}
    </span>
  );
}
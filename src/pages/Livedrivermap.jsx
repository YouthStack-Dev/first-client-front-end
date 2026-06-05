// src/components/liveDrivers/LiveDriverMap.jsx

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useSelector } from "react-redux";

import { selectCurrentUser } from "../redux/features/auth/authSlice";
import { useVendorOptions } from "../hooks/useVendorOptions";
import { useLiveDrivers } from "../utils/Uselivedrivers";
import { API_CLIENT } from "../Api/API_Client";

import LiveDriverMapCanvas from "../components/liveDrivers/LiveDriverMapCanvas";
import LiveDriverSidebar from "../components/liveDrivers/LiveDriverSidebar";
import LiveDriverStats from "../components/liveDrivers/LiveDriverStats";

import {
  vendorColor,
  isStale,
  secAgo,
  fmtAge, 
} from "../components/liveDrivers/liveDriverHelpers";

import { S } from "../components/liveDrivers/styles";

export default function LiveDriverMap() {
  const user = useSelector(selectCurrentUser);
  const tenantId = user?.tenant_id ?? null;

  const isSuperAdmin =
    user?.type === "admin" ||
    user?.roles?.includes("SuperAdmin") ||
    user?.admin_id != null;

  const [selectedTenant, setSelectedTenant] = useState(
    isSuperAdmin ? "" : tenantId,
  );
  const [selectedVid, setSelectedVid] = useState(null);
  const [collapseVendorSelection, setCollapseVendorSelection] = useState(false);
  const [filterMode, setFilterMode] = useState("all");
  const [detail, setDetail] = useState(null);
  const [fitKey, setFitKey] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [syncError, setSyncError] = useState(false);
  const [streetViewOpen, setStreetViewOpen] = useState(false);

  const panoramaRef = useRef(null);

  const handleMapLoad = useCallback((mapInstance) => {
    mapInstance.setOptions({
      streetViewControl: true,
      streetViewControlOptions: {
        position: window.google.maps.ControlPosition.RIGHT_BOTTOM,
      },
    });
    panoramaRef.current = mapInstance.getStreetView();
    panoramaRef.current.addListener("visible_changed", () => {
      setStreetViewOpen(panoramaRef.current.getVisible());
    });
  }, []);

  const closeStreetView = useCallback(() => {
    panoramaRef.current?.setVisible(false);
  }, []);

  const tenantToUse = isSuperAdmin ? selectedTenant || null : tenantId;

  const {
    vendorOptions,
    vendorList,
    loading: vendorsLoading,
  } = useVendorOptions(tenantToUse, !!(tenantToUse || isSuperAdmin));

  const tenantOptions = useMemo(() => {
    const seen = new Set();
    const options = [];
    vendorList.forEach((vendor) => {
      const tenant = vendor?.tenant_id;
      if (!tenant || seen.has(tenant)) return;
      seen.add(tenant);
      options.push({
        value: tenant,
        label: vendor?.tenant_name
          ? `${vendor.tenant_name} (${tenant})`
          : tenant,
      });
    });
    return options.sort((a, b) => a.label.localeCompare(b.label));
  }, [vendorList]);

  useEffect(() => {
    if (isSuperAdmin) setSelectedVid(null);
  }, [selectedTenant, isSuperAdmin]);

  useEffect(() => {
    if (!selectedVid && vendorOptions.length > 0) {
      setSelectedVid(String(vendorOptions[0].value));
      setCollapseVendorSelection(true);
    }
  }, [vendorOptions, selectedVid]);

  const {
    driverMap,
    status,
    error: fbError,
  } = useLiveDrivers({
    tenantId: tenantToUse,
    vendorId: selectedVid,
  });

  useEffect(() => {
    setFitKey((k) => k + 1);
  }, [tenantToUse, selectedVid]);

  const isVisible = useCallback(
    (vid, d) => {
      if (filterMode === "active" && (!d.is_active || isStale(d))) return false;
      if (filterMode === "offline" && d.is_active) return false;
      if (filterMode === "stale" && !isStale(d)) return false;
      return true;
    },
    [filterMode],
  );

  const handleMarkerClick = useCallback((vid, did) => {
    setDetail((prev) =>
      prev?.vid === vid && prev?.did === did ? null : { vid, did },
    );
  }, []);

  const handleSpaceSync = useCallback(async () => {
    if (isSuperAdmin && !tenantToUse) {
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
        { params: tenantToUse ? { tenant_id: tenantToUse } : undefined },
      );
      setSyncMessage(response?.data?.message || "Space sync completed");
    } catch (error) {
      setSyncError(true);
      setSyncMessage(
        error?.response?.data?.message || error?.message || "Space sync failed",
      );
    } finally {
      setSyncing(false);
      window.setTimeout(() => setSyncMessage(""), 5000);
    }
  }, [tenantToUse, isSuperAdmin]);

  const allDrivers = useMemo(() => {
    const rows = [];
    Object.entries(driverMap).forEach(([vid, drivers]) =>
      Object.entries(drivers).forEach(([did, data]) =>
        rows.push({ vid, did, data }),
      ),
    );
    return rows.sort(
      (a, b) => a.vid.localeCompare(b.vid) || a.did.localeCompare(b.did),
    );
  }, [driverMap]);

  const visibleDrivers = useMemo(() => {
    const rows = [];
    Object.entries(driverMap).forEach(([vid, drivers]) =>
      Object.entries(drivers).forEach(([did, data]) => {
        if (isVisible(vid, data)) rows.push({ vid, did, data });
      }),
    );
    return rows.sort(
      (a, b) => a.vid.localeCompare(b.vid) || a.did.localeCompare(b.did),
    );
  }, [driverMap, isVisible]);

  const stats = useMemo(() => {
    let active = 0,
      offline = 0,
      stale = 0;
    Object.values(driverMap).forEach((vd) =>
      Object.values(vd).forEach((d) => {
        if (!d.is_active) offline++;
        else if (isStale(d)) stale++;
        else active++;
      }),
    );
    return { active, offline, stale };
  }, [driverMap]);

  const selectedVendorLabel = selectedVid
    ? vendorOptions.find((o) => String(o.value) === String(selectedVid))
        ?.label || selectedVid
    : "All vendors";

  return (
    <>
      <style>{`
        @keyframes dm-pulse {
          0%   { transform: scale(1);   opacity: .75; }
          100% { transform: scale(2.2); opacity: 0;   }
        }
      `}</style>

      <div style={S.root}>
        <LiveDriverStats
          stats={{
            total: stats.active + stats.offline + stats.stale,
            active: stats.active,
            stale: stats.stale,
            offline: stats.offline,
          }}
          selectedVendor={selectedVendorLabel}
          status={status}
          onSpaceSync={handleSpaceSync}
          syncing={syncing}
          syncMessage={syncMessage}
          syncError={syncError}
          isSuperAdmin={isSuperAdmin}
        />

        <LiveDriverMapCanvas
          apiKey={import.meta.env.VITE_GOOGLE_API || ""}
          tenantId={tenantToUse}
          driverMap={driverMap}
          visibleDrivers={visibleDrivers}
          fitKey={fitKey}
          selectedDetail={detail}
          handleMarkerClick={handleMarkerClick}
          onMapLoad={handleMapLoad}
        />

        <LiveDriverSidebar
          vendorsLoading={vendorsLoading}
          vendorOptions={vendorOptions}
          tenantOptions={tenantOptions}
          selectedTenant={selectedTenant}
          setSelectedTenant={setSelectedTenant}
          isSuperAdmin={isSuperAdmin}
          selectedVid={selectedVid}
          setSelectedVid={setSelectedVid}
          collapseVendorSelection={collapseVendorSelection}
          setCollapseVendorSelection={setCollapseVendorSelection}
          filterMode={filterMode}
          setFilterMode={setFilterMode}
          visibleDrivers={visibleDrivers}
          allDrivers={allDrivers}
          detail={detail}
          setDetail={setDetail}
          vendorColor={vendorColor}
          isStale={isStale}
          fmtAge={fmtAge}
          secAgo={secAgo}
        />

        {/* Legend */}
        <div style={S.legend}>
          {[
            ["#22c55e", "Active"],
            ["#d97706", "Stale (>5 min)"],
            ["#3f4452", "Offline"],
          ].map(([c, l]) => (
            <div
              key={l}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: c,
                }}
              />
              <span style={{ fontSize: 11, color: "#888" }}>{l}</span>
            </div>
          ))}
        </div>

        {/* Exit button — only visible when Street View is active */}
        {streetViewOpen && (
          <button
            onClick={closeStreetView}
            style={{
              position: "absolute",
              top: 16,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 2000,
              background: "#1e293b",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "7px 18px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            ← Exit Street View
          </button>
        )}

        {(status === "error" || !tenantToUse) && (
          <div style={S.overlay}>
            <div style={S.overlayBox}>
              {status === "error" ? (
                <>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#ef4444",
                      marginBottom: 6,
                    }}
                  >
                    Firebase error
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#888",
                      fontFamily: "monospace",
                    }}
                  >
                    {fbError}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 13, color: "#888" }}>
                  {isSuperAdmin
                    ? "Select a tenant to load the map."
                    : "Waiting for authenticated session…"}
                </div>
              )}
            </div>
          </div>
        )}

        {!import.meta.env.VITE_GOOGLE_API && (
          <div
            style={{
              position: "absolute",
              top: 56,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 2000,
              background: "#f59e0b",
              color: "#fff",
              fontSize: 11,
              fontWeight: 600,
              padding: "4px 14px",
              borderRadius: 100,
              whiteSpace: "nowrap",
            }}
          >
            ⚠ Add VITE_GOOGLE_API for maps
          </div>
        )}
      </div>
    </>
  );
}

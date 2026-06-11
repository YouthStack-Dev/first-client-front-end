// src/components/liveDrivers/LiveDriverSidebar.jsx

import React, { useEffect, useMemo, useState } from "react";
import { S } from "./styles";

export default function LiveDriverSidebar({
  vendorsLoading,
  vendorOptions,
  tenantOptions,
  selectedTenant,
  setSelectedTenant,
  isSuperAdmin,
  selectedVid,
  setSelectedVid,
  collapseVendorSelection,
  setCollapseVendorSelection,
  filterMode,
  setFilterMode,
  visibleDrivers,
  allDrivers,
  detail,
  setDetail,
  vendorColor,
  isStale,
  fmtAge,
  secAgo,
}) {
  const [searchVendor, setSearchVendor] = useState("");
  const [showVendorSelection, setShowVendorSelection] = useState(false);

  const selectedVendorLabel = selectedVid
    ? vendorOptions.find(
        (option) => String(option.value) === String(selectedVid),
      )?.label || selectedVid
    : "All vendors";

  const vendorStats = useMemo(() => {
    const statsMap = new Map();

    (vendorOptions || []).forEach((option) => {
      statsMap.set(String(option.value), {
        value: String(option.value),
        label: option.label,
        total: 0,
        active: 0,
        stale: 0,
        offline: 0,
      });
    });

    (allDrivers || []).forEach(({ vid, data }) => {
      const key = String(vid ?? data.vendorId ?? "");
      if (!statsMap.has(key)) {
        const option = vendorOptions.find((opt) => String(opt.value) === key);
        statsMap.set(key, {
          value: key,
          label: option?.label || key,
          total: 0,
          active: 0,
          stale: 0,
          offline: 0,
        });
      }
      const entry = statsMap.get(key);
      entry.total += 1;
      if (!data.is_active) entry.offline += 1;
      else if (isStale(data)) entry.stale += 1;
      else entry.active += 1;
    });

    return Array.from(statsMap.values()).filter((vendor) => {
      const term = searchVendor.trim().toLowerCase();
      if (!term) return true;
      return (
        vendor.label.toLowerCase().includes(term) ||
        String(vendor.value).toLowerCase().includes(term)
      );
    });
  }, [vendorOptions, allDrivers, searchVendor]);

  const selectedVendor = selectedVid
    ? vendorStats.find((vendor) => String(vendor.value) === String(selectedVid))
    : null;

  const showVendorSelectionList =
    showVendorSelection || Boolean(searchVendor.trim());

  useEffect(() => {
    if (collapseVendorSelection && selectedVid) {
      setShowVendorSelection(false);
      setCollapseVendorSelection(false);
    }
  }, [collapseVendorSelection, selectedVid, setCollapseVendorSelection]);

  const FILTERS = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "offline", label: "Offline" },
    { key: "stale", label: "Stale" },
  ];

  // ── Inline overrides for dark text ──────────────────────────────────────
  const card = {
    base: {
      background: "#1e293b",
      border: "1px solid #334155",
      borderRadius: 8,
      padding: "10px 12px",
      marginBottom: 6,
      width: "100%",
      textAlign: "left",
      cursor: "pointer",
    },
    active: {
      background: "#0f172a",
      border: "1px solid #3b82f6",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 6,
    },
    label: {
      fontSize: 13,
      fontWeight: 600,
      color: "#f1f5f9",        // bright white-ish
    },
    total: {
      fontSize: 12,
      fontWeight: 700,
      color: "#94a3b8",
      background: "#334155",
      borderRadius: 10,
      padding: "1px 7px",
    },
    counts: {
      display: "flex",
      gap: 8,
    },
    badgeActive: {
      fontSize: 11,
      fontWeight: 600,
      color: "#22c55e",
      background: "rgba(34,197,94,0.12)",
      borderRadius: 6,
      padding: "2px 7px",
    },
    badgeOffline: {
      fontSize: 11,
      fontWeight: 600,
      color: "#94a3b8",
      background: "rgba(148,163,184,0.1)",
      borderRadius: 6,
      padding: "2px 7px",
    },
    badgeStale: {
      fontSize: 11,
      fontWeight: 600,
      color: "#f59e0b",
      background: "rgba(245,158,11,0.12)",
      borderRadius: 6,
      padding: "2px 7px",
    },
  };

  const changeBtn = {
    width: "100%",
    marginTop: 6,
    padding: "6px 0",
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: 6,
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    textAlign: "center",
  };

  const vendorContextBar = {
    padding: "10px 14px",
    borderBottom: "1px solid #1e293b",
    background: "#0f172a",
  };

  const driverRow = (isSelected, isActive) => ({
    ...S.drow,
    ...(isSelected ? { background: "rgba(59,130,246,.15)", borderLeft: "3px solid #3b82f6" } : {}),
    ...(!isActive ? { opacity: 0.45 } : {}),
  });

  return (
    <div style={S.lpanel}>
      {/* ── Head: tenant / vendor selector ── */}
      <div style={S.lhead}>
        {isSuperAdmin && (
          <div style={{ marginBottom: 12 }}>
            <div style={S.tenantLabel}>Tenant</div>
            <select
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
              style={S.tenantSelect}
            >
              <option value="">Select tenant</option>
              {tenantOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {!isSuperAdmin || selectedTenant ? (
          <>
            <div style={S.sidebarTitle}>Fleet Overview</div>
            <input
              value={searchVendor}
              onChange={(e) => setSearchVendor(e.target.value)}
              placeholder="Search Vendor"
              style={S.sidebarSearch}
            />

            {vendorsLoading ? (
              <span style={S.chipsLoading}>Loading vendors…</span>
            ) : (
              <div style={S.vendorSummary}>
                {selectedVid && !showVendorSelectionList ? (
                  <>
                    {/* ── Selected vendor card ── */}
                    <button
                      type="button"
                      style={{ ...card.base, ...card.active }}
                      onClick={() => setShowVendorSelection(true)}
                    >
                      <div style={card.header}>
                        <span style={card.label}>{selectedVendorLabel}</span>
                        <span style={card.total}>
                          {selectedVendor?.total ?? 0} drivers
                        </span>
                      </div>
                      <div style={card.counts}>
                        <span style={card.badgeActive}>
                          🟢 {selectedVendor?.active ?? 0} active
                        </span>
                        {(selectedVendor?.stale ?? 0) > 0 && (
                          <span style={card.badgeStale}>
                            🟠 {selectedVendor.stale} stale
                          </span>
                        )}
                        <span style={card.badgeOffline}>
                          ⚫ {selectedVendor?.offline ?? 0} offline
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      style={changeBtn}
                      onClick={() => setShowVendorSelection(true)}
                    >
                      ↕ Change vendor
                    </button>
                  </>
                ) : (
                  showVendorSelectionList &&
                  (vendorStats.length === 0 ? (
                    <div style={S.empty}>No vendors found.</div>
                  ) : (
                    vendorStats.map((vendor) => {
                      const isActive =
                        String(selectedVid) === String(vendor.value);
                      return (
                        <button
                          key={vendor.value}
                          type="button"
                          style={{
                            ...card.base,
                            ...(isActive ? card.active : {}),
                          }}
                          onClick={() => {
                            setSelectedVid(String(vendor.value));
                            setShowVendorSelection(false);
                            setSearchVendor("");
                          }}
                        >
                          <div style={card.header}>
                            <span style={card.label}>
                              🚕 {vendor.label}
                            </span>
                            <span style={card.total}>{vendor.total}</span>
                          </div>
                          <div style={card.counts}>
                            <span style={card.badgeActive}>
                              🟢 {vendor.active}
                            </span>
                            {vendor.stale > 0 && (
                              <span style={card.badgeStale}>
                                🟠 {vendor.stale}
                              </span>
                            )}
                            <span style={card.badgeOffline}>
                              ⚫ {vendor.offline}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  ))
                )}
              </div>
            )}
          </>
        ) : (
          <div style={S.tenantHelp}>
            Select a tenant to load vendors and live drivers.
          </div>
        )}
      </div>

      {/* ── Body: filter tabs + driver list ── */}
      <div style={S.lbody}>
        {/* Filter tabs */}
        <div
          style={{
            display: "flex",
            gap: 4,
            padding: "8px 10px",
            borderBottom: "1px solid #1e293b",
            background: "#0f172a",
            flexShrink: 0,
          }}
        >
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              style={{
                ...S.tab,
                flex: 1,
                color: filterMode === key ? "#f1f5f9" : "#64748b",
                ...(filterMode === key ? S.tabOn : {}),
              }}
              onClick={() => setFilterMode(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Vendor context label */}
        <div style={vendorContextBar}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>
            Showing drivers for
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", marginTop: 3 }}>
            {selectedVendorLabel}
          </div>
        </div>

        {/* Driver rows */}
        {visibleDrivers.length === 0 ? (
          <div style={{ ...S.empty, color: "#64748b" }}>
            No live drivers available for this vendor.
          </div>
        ) : (
          (() => {
            let lastVid = null;
            return visibleDrivers.map(({ vid, did, data }) => {
              const c = vendorColor(vid);
              const stl = isStale(data);
              const dotC = !data.is_active ? "#475569" : stl ? "#d97706" : "#22c55e";
              if (vid !== lastVid) lastVid = vid;
              const isSelected = detail?.vid === vid && detail?.did === did;

              return (
                <div key={`${vid}/${did}`}>
                  <button
                    style={driverRow(isSelected, data.is_active)}
                    onClick={() => setDetail({ vid, did })}
                  >
                    <span style={{ ...S.ddot, background: dotC }} />
                    <span style={{ ...S.ddid, color: "#f1f5f9", fontWeight: 600 }}>
                      {data.driver_name || data.driver_code || data.vehicle_rc_number || `Driver ${did}`}
                    </span>
                    {(data.route_code || data.route_id) && (
                      <span style={{ ...S.ddsub, color: "#94a3b8" }}>
                        {data.route_code || `#${data.route_id}`}
                      </span>
                    )}
                    <span style={{ ...S.dtm, color: "#64748b" }}>
                      {fmtAge(secAgo(data.updated_at))}
                    </span>
                  </button>
                </div>
              );
            });
          })()
        )}
      </div>
    </div>
  );
}
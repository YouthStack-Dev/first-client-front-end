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
    ? vendorOptions.find((option) => String(option.value) === String(selectedVid))?.label || selectedVid
    : "All vendors";

  const vendorStats = useMemo(() => {
    const statsMap = new Map();

    (vendorOptions || []).forEach((option) => {
      statsMap.set(String(option.value), {
        value: String(option.value),
        label: option.label,
        total: 0,
        active: 0,
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
          offline: 0,
        });
      }

      const entry = statsMap.get(key);
      entry.total += 1;
      if (data.is_active) {
        entry.active += 1;
      } else {
        entry.offline += 1;
      }
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

  const showVendorSelectionList = showVendorSelection || Boolean(searchVendor.trim());

  useEffect(() => {
    if (collapseVendorSelection && selectedVid) {
      setShowVendorSelection(false);
      setCollapseVendorSelection(false);
    }
  }, [collapseVendorSelection, selectedVid, setCollapseVendorSelection]);

  return (
    <div style={S.lpanel}>
      <div style={S.lhead}>
        {isSuperAdmin ? (
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
        ) : null}

        {(!isSuperAdmin || selectedTenant) ? (
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
                    <button
                      type="button"
                      style={{
                        ...S.vendorCard,
                        ...S.vendorCardActive,
                      }}
                      onClick={() => setShowVendorSelection(true)}
                    >
                      <div style={S.vendorCardHeader}>
                        <span style={S.vendorCardLabel}>{selectedVendorLabel}</span>
                        <span style={S.vendorCardTotal}>{selectedVendor?.total ?? 0}</span>
                      </div>
                      <div style={S.vendorCardCounts}>
                        <span style={{ ...S.vendorCountBadge, ...S.vendorCountBadgeActive }}>
                          🟢 {selectedVendor?.active ?? 0}
                        </span>
                        <span style={{ ...S.vendorCountBadge, ...S.vendorCountBadgeOffline }}>
                          ⚫ {selectedVendor?.offline ?? 0}
                        </span>
                      </div>
                    </button>
                    <button
                      type="button"
                      style={{
                        ...S.tab,
                        width: "100%",
                        marginTop: 6,
                      }}
                      onClick={() => setShowVendorSelection(true)}
                    >
                      Change vendor
                    </button>
                  </>
                ) : (
                  <>
                    {showVendorSelectionList && (
                      vendorStats.length === 0 ? (
                        <div style={S.empty}>No vendors found.</div>
                      ) : (
                        vendorStats.map((vendor) => (
                          <button
                            key={vendor.value}
                            type="button"
                            style={{
                              ...S.vendorCard,
                              ...(String(selectedVid) === String(vendor.value) ? S.vendorCardActive : {}),
                            }}
                            onClick={() => {
                              setSelectedVid(String(vendor.value));
                              setShowVendorSelection(false);
                              setSearchVendor("");
                            }}
                          >
                            <div style={S.vendorCardHeader}>
                              <span style={S.vendorCardLabel}>🚕 {vendor.label}</span>
                              <span style={S.vendorCardTotal}>{vendor.total}</span>
                            </div>
                            <div style={S.vendorCardCounts}>
                              <span style={{ ...S.vendorCountBadge, ...S.vendorCountBadgeActive }}>
                                🟢 {vendor.active}
                              </span>
                              <span style={{ ...S.vendorCountBadge, ...S.vendorCountBadgeOffline }}>
                                ⚫ {vendor.offline}
                              </span>
                            </div>
                          </button>
                        ))
                      )
                    )}
                  </>
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

      <div style={S.lbody}>
        <div style={{ padding: "12px 14px", borderBottom: "1px solid #dbeafe", background: "#eef4fb" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#0f172a" }}>
            Showing drivers for
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginTop: 4 }}>
            {selectedVendorLabel}
          </div>
        </div>

        {visibleDrivers.length === 0 ? (
          <div style={S.empty}>
            No live drivers available for this vendor.
          </div>
        ) : (
          (() => {
            let lastVid = null;

            return visibleDrivers.map(({ vid, did, data }) => {
              const c = vendorColor(vid);
              const stl = isStale(data);

              const dotC = !data.is_active
                ? "#3f4452"
                : stl
                ? "#d97706"
                : c;

              const hdr =
                vid !== lastVid
                  ? ((lastVid = vid),
                    (
                      <div
                        key={`h-${vid}`}
                        style={{
                          ...S.vname,
                          color: c,
                        }}
                      >
                        {vid}
                      </div>
                    ))
                  : null;

              const active =
                detail?.vid === vid && detail?.did === did;

              return (
                <div key={`${vid}/${did}`}>
                  {hdr}

                  <button
                    style={{
                      ...S.drow,
                      ...(active
                        ? {
                            background: "rgba(255,255,255,.05)",
                          }
                        : {}),
                      ...(!data.is_active
                        ? {
                            opacity: 0.4,
                          }
                        : {}),
                    }}
                    onClick={() =>
                      setDetail({
                        vid,
                        did,
                      })
                    }
                  >
                    <span
                      style={{
                        ...S.ddot,
                        background: dotC,
                      }}
                    />

                    <span style={S.ddid}>
                      {data.driver_name || data.driver_code || did}
                    </span>

                    {data.route_code ? (
                      <span style={S.ddsub}>{data.route_code}</span>
                    ) : null}

                    <span style={S.dtm}>
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
// src/components/liveDrivers/LiveDriverSidebar.jsx

import React from "react";
import { S } from "./styles";

function Chip({ label, active, color, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: 10,
        padding: "3px 10px",
        borderRadius: 100,
        cursor: "pointer",
        fontFamily: "monospace",
        whiteSpace: "nowrap",
        transition: "all .15s",

        // FIXED: Split border properties
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: active ? color : "#e2e8f0",

        color: active ? color : "#64748b",
        background: active ? `${color}15` : "#f8fafc",
        fontWeight: active ? 600 : 400,
      }}
    >
      {label}
    </button>
  );
}

export default function LiveDriverSidebar({
  vendorsLoading,
  vendorOptions,
  tenantOptions,
  selectedTenant,
  setSelectedTenant,
  isSuperAdmin,
  selectedVid,
  setSelectedVid,
  filterMode,
  setFilterMode,
  visibleDrivers,
  detail,
  setDetail,
  vendorColor,
  isStale,
  fmtAge,
  secAgo,
}) {
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
            <div style={S.chips}>
              {vendorsLoading ? (
                <span style={S.chipsLoading}>
                  Loading vendors…
                </span>
              ) : (
                <>
                  <Chip
                    label="All"
                    active={selectedVid === null}
                    color="#38bdf8"
                    onClick={() => setSelectedVid(null)}
                  />

                  {vendorOptions.map(({ value, label }) => (
                    <Chip
                      key={value}
                      label={label}
                      active={selectedVid === value}
                      color={vendorColor(value)}
                      onClick={() =>
                        setSelectedVid(
                          selectedVid === value ? null : value
                        )
                      }
                    />
                  ))}
                </>
              )}
            </div>

            <div style={S.tabs}>
              {["all", "active", "offline", "stale"].map((f) => (
                <button
                  key={f}
                  style={{
                    ...S.tab,
                    ...(filterMode === f ? S.tabOn : {}),
                  }}
                  onClick={() => setFilterMode(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div style={S.tenantHelp}>
            Select a tenant to load vendors and live drivers.
          </div>
        )}
      </div>

      <div style={S.lbody}>
        {visibleDrivers.length === 0 ? (
          <div style={S.empty}>
            No drivers match filter
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
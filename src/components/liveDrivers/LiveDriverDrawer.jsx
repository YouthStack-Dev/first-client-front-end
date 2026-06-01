import React from "react";
import { S } from "./styles";

export default function LiveDriverDrawer({
  detailEntry,
  setDetail,
  vendorColor,
  isStale,
  fmtAge,
  secAgo,
}) {
  if (!detailEntry) return null;

  const { vid, did, data: d } = detailEntry;

  const c = vendorColor(vid);
  const stl = isStale(d);

  const [stC, stTx] = !d.is_active
    ? ["#3f4452", "Offline"]
    : stl
    ? ["#d97706", "Stale"]
    : ["#22c55e", "Active"];

  return (
    <div
      style={{
        ...S.dpanel,
        transform: "translateX(0)",
      }}
    >
      <div style={S.dpinner}>
        <div style={S.dphead}>
          <button
            style={S.dpx}
            onClick={() => setDetail(null)}
          >
            ✕
          </button>

          <span
            style={{
              fontFamily: "monospace",
              fontSize: 12,
              color: "#888",
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {did}
          </span>
        </div>

        <div style={S.dpbody}>
          <div
            style={{
              ...S.vbadge,
              background: `${c}18`,
              color: c,
              borderColor: `${c}44`,
            }}
          >
            {vid}
          </div>

          <div
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: "#e4e6f0",
              fontFamily: "monospace",
              marginBottom: 2,
              wordBreak: "break-all",
            }}
          >
            {d.driver_name || d.driver_code || did}
          </div>

          <div
            style={{
              fontSize: 13,
              color: stC,
              marginBottom: 16,
            }}
          >
            {stl ? "⚠" : d.is_active ? "●" : "○"} {stTx}
          </div>

          {[
            ["Vendor", vid],
            ["Driver ID", did],
            ["Driver Code", d.driver_code || "—"],
            [
              "Route",
              d.route_code
                ? `${d.route_code} (${d.route_id ?? "—"})`
                : d.route_id
                ? `#${d.route_id}`
                : "—",
            ],
            [
              "Speed",
              d.speed != null ? `${d.speed.toFixed(1)} km/h` : "—",
            ],
            [
              "Coordinates",
              d.lat
                ? `${d.lat.toFixed(5)}, ${d.lng.toFixed(5)}`
                : "—",
            ],
            [
              "Last update",
              fmtAge(secAgo(d.updated_at)) + " ago",
            ],
            ["is_active", String(d.is_active)],
          ].map(([lbl, val]) => (
            <div key={lbl} style={S.dprow}>
              <span
                style={{
                  fontSize: 12,
                  color: "#3e4250",
                }}
              >
                {lbl}
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: "#64748b",
                  fontFamily: "monospace",
                  textAlign: "right",
                  maxWidth: 140,
                }}
              >
                {val}
              </span>
            </div>
          ))}

          {(
            d.provider || d.accuracy != null || d.heading != null
          ) && (
            <>
              <div style={{ height: 14 }} />
              {[
                ["Provider", d.provider || "—"],
                [
                  "Accuracy",
                  d.accuracy != null ? `${d.accuracy} m` : "—",
                ],
                [
                  "Heading",
                  d.heading != null ? `${d.heading}°` : "—",
                ],
              ].map(([lbl, val]) => (
                <div key={lbl} style={S.dprow}>
                  <span
                    style={{
                      fontSize: 12,
                      color: "#3e4250",
                    }}
                  >
                    {lbl}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "#b0b4c4",
                      fontFamily: "monospace",
                      textAlign: "right",
                      maxWidth: 140,
                    }}
                  >
                    {val}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
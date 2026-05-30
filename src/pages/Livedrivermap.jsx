import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  APIProvider,
  Map,
  useMap,
} from "@vis.gl/react-google-maps";

import { selectCurrentUser } from "../redux/features/auth/authSlice";
import { useVendorOptions }  from "../hooks/useVendorOptions";
import { useLiveDrivers }    from "../utils/Uselivedrivers";

// ─── Config ──────────────────────────────────────────────────────────────────
const STALE_MS  = 5 * 60 * 1000;
const MAX_TRAIL = 20;
const TICK_MS   = 3_000;
const API_KEY   = import.meta.env.VITE_GOOGLE_API || "";

const VENDOR_COLORS = [
  "#22c55e", "#f97316", "#38bdf8", "#c084fc",
  "#fb7185", "#fbbf24", "#34d399", "#818cf8",
];

// ─── Pure helpers ─────────────────────────────────────────────────────────────
let _ci = 0;
const _cm = {};
const vendorColor = (v) => {
  if (!_cm[v]) _cm[v] = VENDOR_COLORS[_ci++ % VENDOR_COLORS.length];
  return _cm[v];
};
const isStale     = (d) => d.is_active && d.updated_at && (Date.now() - d.updated_at) > STALE_MS;
const markerColor = (v, d) => !d.is_active ? "#3f4452" : isStale(d) ? "#d97706" : vendorColor(v);
const secAgo      = (ts) => ts ? Math.round((Date.now() - ts) / 1000) : 0;
const fmtAge      = (s) =>
  s < 60 ? `${s}s` : s < 3600 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;

function haversineKm(la, lo, la2, lo2) {
  const R = 6371, r = Math.PI / 180;
  const x = Math.sin(((la2 - la) * r) / 2) ** 2 + Math.cos(la * r) * Math.cos(la2 * r) * Math.sin(((lo2 - lo) * r) / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}
function estimateSpeed(trail, trailTs) {
  const n = trail.length;
  if (n < 2) return null;
  const dtH = (trailTs[n - 1] - trailTs[n - 2]) / 3_600_000;
  if (dtH <= 0 || dtH > 0.1) return null;
  return Math.round(haversineKm(...trail[n - 2], ...trail[n - 1]) / dtH);
}

// ─── Trail polyline drawn imperatively via google.maps.Polyline ───────────────
function TrailPolyline({ trail, color }) {
  const map      = useMap();
  const lineRef  = useRef(null);

  useEffect(() => {
    if (!map || trail.length < 2) return;
    if (lineRef.current) lineRef.current.setMap(null);
    lineRef.current = new window.google.maps.Polyline({
      path:          trail.map(([lat, lng]) => ({ lat, lng })),
      strokeColor:   color,
      strokeOpacity: 0.35,
      strokeWeight:  3,
      icons: [{
        icon:   { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 3 },
        offset: "0",
        repeat: "14px",
      }],
      map,
    });
    return () => { lineRef.current?.setMap(null); lineRef.current = null; };
  }, [map, trail, color]);

  return null;
}

// ─── Builds an HTML string for a custom marker overlay ───────────────────────
function buildMarkerHtml(vid, did, color, active, stale) {
  const label =
    vid.replace(/vendor_?|vnd_?/gi, "V").replace(/\W/g, "").slice(0, 3).toUpperCase() +
    "·" +
    did.replace(/driver_?|drv_?/gi, "").replace(/\W/g, "").slice(0, 4);
  return `
    <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;position:relative">
      ${active ? `<div style="position:absolute;top:0;left:50%;transform:translateX(-50%);
        width:22px;height:22px;border-radius:50%;background:${color}44;
        animation:dm-pulse ${stale ? "3.5" : "2"}s ease-out infinite;z-index:1;margin-top:-4px"></div>` : ""}
      <div style="width:14px;height:14px;border-radius:50%;background:${color};
        border:2.5px solid rgba(0,0,0,.5);position:relative;z-index:2;
        ${active ? "" : "opacity:.35;filter:grayscale(1)"}"></div>
      <div style="font-size:9px;font-weight:600;white-space:nowrap;margin-top:2px;
        padding:1px 5px;border-radius:3px;background:rgba(4,6,11,.88);
        color:${active ? "#dde0ea" : "#555"};font-family:monospace;line-height:1.5;
        box-shadow:0 1px 4px rgba(0,0,0,.5)">${label}</div>
    </div>`;
}

// ─── Single driver marker — imperative google.maps.Marker (no mapId needed) ──
function DriverMarker({ vid, did, data, trail, onClick }) {
  const map    = useMap();
  const mkRef  = useRef(null);
  const color  = markerColor(vid, data);
  const stale  = isStale(data);
  const active = data.is_active;

  useEffect(() => {
    if (!map || !window.google) return;

    const html  = buildMarkerHtml(vid, did, color, active, stale);
    const el    = document.createElement("div");
    el.innerHTML = html;

    if (!mkRef.current) {
      // Create overlay
      const overlay = new window.google.maps.OverlayView();
      overlay.el     = el;
      overlay.lat    = data.lat;
      overlay.lng    = data.lng;
      overlay.onAdd  = function () {
        this.getPanes().overlayMouseTarget.appendChild(this.el);
        this.el.addEventListener("click", () => onClick(vid, did));
      };
      overlay.draw   = function () {
        const proj = this.getProjection();
        if (!proj) return;
        const pt = proj.fromLatLngToDivPixel(new window.google.maps.LatLng(this.lat, this.lng));
        if (pt) {
          this.el.style.position = "absolute";
          this.el.style.left     = `${pt.x - 7}px`;
          this.el.style.top      = `${pt.y - 7}px`;
          this.el.style.zIndex   = "1000";
        }
      };
      overlay.onRemove = function () { this.el?.parentNode?.removeChild(this.el); };
      overlay.setMap(map);
      mkRef.current = overlay;
    } else {
      // Update position + html
      mkRef.current.lat = data.lat;
      mkRef.current.lng = data.lng;
      mkRef.current.el.innerHTML = html;
      mkRef.current.el.onclick = () => onClick(vid, did);
      mkRef.current.draw();
    }

    return () => {
      mkRef.current?.setMap(null);
      mkRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, data.lat, data.lng, color, active, stale]);

  return trail.length > 1 ? <TrailPolyline trail={trail} color={vendorColor(vid)} /> : null;
}

// ─── Map inner — has access to useMap() ──────────────────────────────────────
function MapInner({ driverMap, isVisible, onMarkerClick, fitKey }) {
  const map        = useMap();
  const fitDoneRef = useRef(false);

  // Stores trail history per driver: `${vid}/${did}` → { trail, trailTs, prevLat, prevLng }
  const histRef = useRef({});

  // Auto-fit once we have data
  useEffect(() => {
    if (!map || fitDoneRef.current) return;
    const pts = Object.values(driverMap).flatMap((vd) =>
      Object.values(vd).filter((d) => d.lat).map((d) => ({ lat: d.lat, lng: d.lng }))
    );
    if (!pts.length) return;
    fitDoneRef.current = true;
    if (pts.length === 1) {
      map.setCenter(pts[0]);
      map.setZoom(14);
    } else {
      const bounds = new window.google.maps.LatLngBounds();
      pts.forEach((p) => bounds.extend(p));
      map.fitBounds(bounds, 60);
    }
  }, [map, driverMap]);

  // Reset fit when fitKey changes (tenant/vendor switch)
  useEffect(() => { fitDoneRef.current = false; }, [fitKey]);

  // Build flat list of visible markers, maintaining trail history
  const markers = useMemo(() => {
    const result = [];
    Object.entries(driverMap).forEach(([vid, drivers]) => {
      Object.entries(drivers).forEach(([did, data]) => {
        if (!data?.lat) return;
        const key = `${vid}/${did}`;
        let h = histRef.current[key];
        if (!h) {
          h = { trail: [[data.lat, data.lng]], trailTs: [data.updated_at || Date.now()], prevLat: data.lat, prevLng: data.lng };
          histRef.current[key] = h;
        } else if (data.lat !== h.prevLat || data.lng !== h.prevLng) {
          h.trail.push([data.lat, data.lng]);
          h.trailTs.push(data.updated_at || Date.now());
          if (h.trail.length > MAX_TRAIL) { h.trail.shift(); h.trailTs.shift(); }
          h.prevLat = data.lat;
          h.prevLng = data.lng;
        }
        if (isVisible(vid, data)) {
          result.push({ vid, did, data, trail: [...h.trail], trailTs: [...h.trailTs] });
        }
      });
    });
    // Prune stale history keys
    const live = new Set(Object.entries(driverMap).flatMap(([v, ds]) => Object.keys(ds).map((d) => `${v}/${d}`)));
    Object.keys(histRef.current).forEach((k) => { if (!live.has(k)) delete histRef.current[k]; });
    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driverMap, isVisible]);

  return (
    <>
      {markers.map(({ vid, did, data, trail }) => (
        <DriverMarker
          key={`${vid}/${did}`}
          vid={vid} did={did} data={data}
          trail={trail}
          onClick={onMarkerClick}
        />
      ))}
    </>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function LiveDriverMap() {
  const user     = useSelector(selectCurrentUser);
  const tenantId = user?.tenant_id ?? null;

  const { vendorOptions, loading: vendorsLoading } = useVendorOptions(tenantId, !!tenantId);

  const [selectedVid, setSelectedVid] = useState(null);
  const [filterMode,  setFilterMode]  = useState("all");
  const [detail,      setDetail]      = useState(null);
  const [tick,        setTick]        = useState(0);

  const { driverMap, status, error: fbError } = useLiveDrivers({ tenantId, vendorId: selectedVid });

  // Periodic tick to refresh stale badge colors
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), TICK_MS);
    return () => clearInterval(id);
  }, []);

  const isVisible = useCallback((vid, d) => {
    if (filterMode === "active"  && (!d.is_active || isStale(d))) return false;
    if (filterMode === "offline" && d.is_active)                  return false;
    if (filterMode === "stale"   && !isStale(d))                  return false;
    return true;
  }, [filterMode]);

  const handleMarkerClick = useCallback((vid, did) => setDetail({ vid, did }), []);

  const fitKey = `${tenantId}/${selectedVid}`;

  // Stats
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driverMap, tick]);

  // Sidebar list
  const visibleDrivers = useMemo(() => {
    const rows = [];
    Object.entries(driverMap).forEach(([vid, drivers]) =>
      Object.entries(drivers).forEach(([did, data]) => {
        if (isVisible(vid, data)) rows.push({ vid, did, data });
      })
    );
    return rows.sort((a, b) => a.vid.localeCompare(b.vid) || a.did.localeCompare(b.did));
  }, [driverMap, isVisible]);

  // Detail entry
  const detailEntry = useMemo(() => {
    if (!detail) return null;
    const data = driverMap[detail.vid]?.[detail.did];
    return data ? { ...detail, data } : null;
  }, [detail, driverMap]);

  const pillColor = status === "live" ? "#22c55e" : status === "error" ? "#ef4444" : "#f59e0b";
  const pillBg    = status === "live" ? "#0b2317" : status === "error" ? "#2d0f0f"  : "#1a1400";
  const pillLabel = status === "live" ? "● LIVE"  : status === "error" ? "✕ ERROR"  : "◌ CONNECTING";

  return (
    <>
      {/* Pulse keyframe */}
      <style>{`@keyframes dm-pulse{0%{transform:translate(-50%,-50%) scale(1);opacity:.8}100%{transform:translate(-50%,-50%) scale(3.4);opacity:0}}`}</style>

      <div style={S.root}>
        <APIProvider apiKey={API_KEY}>
          {/* ── Map ── */}
          <div style={S.map}>
            <Map
              defaultCenter={{ lat: 20, lng: 78 }}
              defaultZoom={5}
              gestureHandling="greedy"
              fullscreenControl={false}
              streetViewControl={false}
              mapTypeControl={false}
              zoomControl={true}
              style={{ width: "100%", height: "100%" }}
            >
              <MapInner
                driverMap={driverMap}
                isVisible={isVisible}
                onMarkerClick={handleMarkerClick}
                fitKey={fitKey}
              />
            </Map>
          </div>
        </APIProvider>

        {/* ── Status bar ── */}
        <div style={S.sbar}>
          <span style={{ ...S.pill, background: pillBg, color: pillColor }}>{pillLabel}</span>
          <span style={S.sdiv}>|</span>
          <span style={{ fontFamily: "monospace", fontSize: 11, color: "#888" }}>{tenantId || "—"}</span>
          <span style={S.sdiv}>|</span>
          <Stat dot="#22c55e" value={stats.active} />
          <Stat dot="#d97706" value={stats.stale} label="stale" />
          <Stat dot="#3f4452" value={stats.offline} />
        </div>

        {/* ── Left panel ── */}
        <div style={S.lpanel}>
          <div style={S.lhead}>
            <div style={S.chips}>
              {vendorsLoading
                ? <span style={S.chipsLoading}>Loading vendors…</span>
                : <>
                    <Chip label="All" active={selectedVid === null} color="#38bdf8" onClick={() => setSelectedVid(null)} />
                    {vendorOptions.map(({ value, label }) => (
                      <Chip key={value} label={label} active={selectedVid === value}
                        color={vendorColor(value)}
                        onClick={() => setSelectedVid(selectedVid === value ? null : value)} />
                    ))}
                  </>
              }
            </div>
            <div style={S.tabs}>
              {["all", "active", "offline", "stale"].map((f) => (
                <button key={f} style={{ ...S.tab, ...(filterMode === f ? S.tabOn : {}) }}
                  onClick={() => setFilterMode(f)}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div style={S.lbody}>
            {visibleDrivers.length === 0
              ? <div style={S.empty}>No drivers match filter</div>
              : (() => {
                  let lastVid = null;
                  return visibleDrivers.map(({ vid, did, data }) => {
                    const c    = vendorColor(vid);
                    const stl  = isStale(data);
                    const dotC = !data.is_active ? "#3f4452" : stl ? "#d97706" : c;
                    const hdr  = vid !== lastVid
                      ? (lastVid = vid, <div key={`h-${vid}`} style={{ ...S.vname, color: c }}>{vid}</div>)
                      : null;
                    const active = detail?.vid === vid && detail?.did === did;
                    return (
                      <div key={`${vid}/${did}`}>
                        {hdr}
                        <button
                          style={{ ...S.drow, ...(active ? { background: "rgba(255,255,255,.05)" } : {}), ...(!data.is_active ? { opacity: .4 } : {}) }}
                          onClick={() => setDetail({ vid, did })}>
                          <span style={{ ...S.ddot, background: dotC }} />
                          <span style={S.ddid}>{did}</span>
                          <span style={S.dtm}>{fmtAge(secAgo(data.updated_at))}</span>
                        </button>
                      </div>
                    );
                  });
                })()
            }
          </div>
        </div>

        {/* ── Detail slide-in ── */}
        <div style={{ ...S.dpanel, transform: detailEntry ? "translateX(0)" : "translateX(100%)" }}>
          {detailEntry && (() => {
            const { vid, did, data: d } = detailEntry;
            const c = vendorColor(vid);
            const stl = isStale(d);
            const [stC, stTx] = !d.is_active ? ["#3f4452", "Offline"] : stl ? ["#d97706", "Stale"] : ["#22c55e", "Active"];
            return (
              <div style={S.dpinner}>
                <div style={S.dphead}>
                  <button style={S.dpx} onClick={() => setDetail(null)}>✕</button>
                  <span style={{ fontFamily: "monospace", fontSize: 12, color: "#888", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{did}</span>
                </div>
                <div style={S.dpbody}>
                  <div style={{ ...S.vbadge, background: `${c}18`, color: c, borderColor: `${c}44` }}>{vid}</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#e4e6f0", fontFamily: "monospace", marginBottom: 2, wordBreak: "break-all" }}>{did}</div>
                  <div style={{ fontSize: 13, color: stC, marginBottom: 16 }}>{stl ? "⚠" : d.is_active ? "●" : "○"} {stTx}</div>

                  {[
                    ["Vendor",      vid],
                    ["Coordinates", d.lat ? `${d.lat.toFixed(5)}, ${d.lng.toFixed(5)}` : "—"],
                    ["Last update", fmtAge(secAgo(d.updated_at)) + " ago"],
                    ["is_active",   String(d.is_active)],
                  ].map(([lbl, val]) => (
                    <div key={lbl} style={S.dprow}>
                      <span style={{ fontSize: 12, color: "#3e4250" }}>{lbl}</span>
                      <span style={{ fontSize: 11, color: "#b0b4c4", fontFamily: "monospace", textAlign: "right", maxWidth: 140 }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* ── Legend ── */}
        <div style={S.legend}>
          {[["#22c55e", "Active"], ["#d97706", "Stale (>5 min)"], ["#3f4452", "Offline"]].map(([c, l]) => (
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
              {status === "error"
                ? <>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#ef4444", marginBottom: 6 }}>Firebase error</div>
                    <div style={{ fontSize: 12, color: "#888", fontFamily: "monospace" }}>{fbError}</div>
                  </>
                : <div style={{ fontSize: 13, color: "#888" }}>Waiting for authenticated session…</div>
              }
            </div>
          </div>
        )}

        {!API_KEY && (
          <div style={{ position: "absolute", top: 56, left: "50%", transform: "translateX(-50%)", zIndex: 2000, background: "#f59e0b", color: "#fff", fontSize: 11, fontWeight: 600, padding: "4px 14px", borderRadius: 100, whiteSpace: "nowrap" }}>
            ⚠ Add VITE_GOOGLE_API for maps
          </div>
        )}
      </div>
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Stat({ dot, value, label }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#64748b" }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: dot, display: "inline-block", flexShrink: 0 }} />
      <span style={{ fontWeight: 600, color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>{value}</span>
      {label && <span style={{ fontSize: 11, color: "#94a3b8" }}>{label}</span>}
    </span>
  );
}
function Chip({ label, active, color, onClick }) {
  return (
    <button onClick={onClick} style={{
      fontSize: 10, padding: "3px 10px", borderRadius: 100, cursor: "pointer",
      fontFamily: "monospace", whiteSpace: "nowrap", transition: "all .15s",
      border:     `1px solid ${active ? color : "#e2e8f0"}`,
      color:      active ? color : "#64748b",
      background: active ? `${color}15` : "#f8fafc",
      fontWeight: active ? 600 : 400,
    }}>{label}</button>
  );
}

// ─── Styles — white theme ─────────────────────────────────────────────────────
const S = {
  root:     { position: "relative", width: "100%", height: "100%", minHeight: 600, background: "#f1f5f9", borderRadius: 12, overflow: "hidden", fontFamily: "'DM Sans',system-ui,sans-serif" },
  map:      { position: "absolute", inset: 0, width: "100%", height: "100%" },
  sbar:     { position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", zIndex: 1500, background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 100, padding: "6px 18px", display: "flex", gap: 14, alignItems: "center", whiteSpace: "nowrap", boxShadow: "0 2px 8px rgba(0,0,0,.08)" },
  pill:     { fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 100, letterSpacing: ".3px" },
  sdiv:     { color: "#e2e8f0", fontSize: 14 },
  lpanel:   { position: "absolute", top: 64, left: 12, width: 210, maxHeight: 540, zIndex: 1500, background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,.08)" },
  lhead:    { padding: "10px 10px 0", flexShrink: 0, background: "#ffffff" },
  chips:    { display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8, borderBottom: "1px solid #f1f5f9", paddingBottom: 8 },
  chipsLoading: { fontSize: 11, color: "#94a3b8", padding: "4px 0 8px" },
  tabs:     { display: "flex", gap: 3, marginBottom: 6 },
  tab:      { flex: 1, fontSize: 10, padding: "5px 0", borderRadius: 6, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#94a3b8", cursor: "pointer", textAlign: "center", fontWeight: 500 },
  tabOn:    { background: "#eff6ff", color: "#2563eb", borderColor: "#bfdbfe", fontWeight: 600 },
  lbody:    { overflowY: "auto", flex: 1, scrollbarWidth: "thin", scrollbarColor: "#e2e8f0 transparent" },
  empty:    { fontSize: 11, color: "#94a3b8", padding: "12px 14px", fontStyle: "italic" },
  vname:    { padding: "8px 12px 2px", fontSize: 10, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "#94a3b8" },
  drow:     { width: "100%", padding: "6px 12px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", background: "transparent", border: "none", textAlign: "left", transition: "background .1s" },
  ddot:     { width: 7, height: 7, borderRadius: "50%", flexShrink: 0, display: "inline-block" },
  ddid:     { flex: 1, fontSize: 11, fontFamily: "monospace", color: "#334155", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  dtm:      { fontSize: 10, color: "#cbd5e1", flexShrink: 0 },
  dpanel:   { position: "absolute", top: 0, right: 0, width: 270, height: "100%", zIndex: 1600, transition: "transform .22s cubic-bezier(.4,0,.2,1)" },
  dpinner:  { width: "100%", height: "100%", background: "#ffffff", borderLeft: "1px solid #e2e8f0", display: "flex", flexDirection: "column", boxShadow: "-4px 0 20px rgba(0,0,0,.06)" },
  dphead:   { padding: "14px 14px 12px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8, flexShrink: 0, background: "#f8fafc" },
  dpx:      { background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 6, color: "#94a3b8", cursor: "pointer", padding: "3px 9px", fontSize: 12, flexShrink: 0 },
  dpbody:   { padding: "16px", overflowY: "auto", flex: 1 },
  vbadge:   { display: "inline-block", fontSize: 10, padding: "2px 10px", borderRadius: 100, fontFamily: "monospace", fontWeight: 700, marginBottom: 10, border: "1px solid transparent" },
  dprow:    { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "0.5px solid rgba(255,255,255,.04)" },
  dpbtn:    { width: "100%", padding: 8, fontSize: 12, background: "rgba(255,255,255,.04)", border: "0.5px solid rgba(255,255,255,.08)", borderRadius: 6, color: "#666", cursor: "pointer", marginTop: 14 },
  legend:   { position: "absolute", bottom: 28, left: 12, zIndex: 1500, background: "rgba(5,7,12,.9)", border: "0.5px solid rgba(255,255,255,.08)", borderRadius: 8, padding: "8px 12px" },
  overlay:  { position: "absolute", inset: 0, zIndex: 2500, background: "rgba(4,6,11,.85)", display: "flex", alignItems: "center", justifyContent: "center" },
  overlayBox: { background: "rgba(10,12,18,.97)", border: "0.5px solid rgba(255,255,255,.08)", borderRadius: 10, padding: "24px 28px", maxWidth: 320, textAlign: "center" },
};
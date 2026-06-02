import { useState } from "react";
import { S } from "./styles";

const defaultCards = [
  { icon: "🚕", label: "Total", key: "total" },
  { icon: "🟢", label: "Active", key: "active" },
  { icon: "🟠", label: "Stale", key: "stale" },
  { icon: "⚫", label: "Offline", key: "offline" },
];

export default function LiveDriverStats({ stats = {}, selectedVendor = "All vendors", status = "connecting", onSpaceSync, syncing = false, syncMessage = "", syncError = false, isSuperAdmin = false }) {
  const [collapsed, setCollapsed] = useState(false);

  const total = stats.total ?? ((stats.active ?? 0) + (stats.offline ?? 0) + (stats.stale ?? 0));

  if (collapsed) {
    return (
      <div style={S.compactBar}>
        <div style={S.compactLeft}>
          <button style={S.compactIcon} onClick={() => setCollapsed(false)} aria-label="Expand stats">🚕</button>
          <span style={{ marginLeft: 8, fontWeight: 800, fontSize: 14, color: "#0f172a" }}>{total}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {onSpaceSync && (
            <button
              onClick={onSpaceSync}
              style={{ ...(S.syncButton), ...(syncing ? S.syncButtonActive : {}) }}
              aria-pressed={syncing}
            >
              {syncing ? "Syncing…" : "Sync"}
            </button>
          )}
          <button style={S.compactToggle} onClick={() => setCollapsed(false)} aria-label="Expand stats">▾</button>
        </div>
        {syncMessage ? <div style={{ marginTop: 6, ...S.syncMessage }}>{syncMessage}</div> : null}
      </div>
    );
  }

  return (
    <div style={S.statsBar}>
      <div style={S.statsGroup}>
        {defaultCards.map((card) => (
          <div key={card.key} style={S.kpiCard}>
            <div style={S.kpiCardHeader}>
              <span style={S.kpiIcon}>{card.icon}</span>
              <span style={S.kpiLabel}>{card.label}</span>
            </div>
            <div style={S.kpiValue}>{stats[card.key] ?? 0}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {onSpaceSync && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={onSpaceSync}
              style={{ ...(S.syncButton), ...(syncing ? S.syncButtonActive : {}) }}
              aria-pressed={syncing}
            >
              {syncing ? "Syncing…" : "Sync"}
            </button>
            {syncMessage ? <span style={S.syncMessage}>{syncMessage}</span> : null}
          </div>
        )}

        <div style={{ width: 8 }} />
        <button style={S.collapseButton} onClick={() => setCollapsed(true)} aria-label="Collapse stats">▴</button>
      </div>
    </div>
  );
}

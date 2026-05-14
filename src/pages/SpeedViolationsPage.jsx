import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchViolationsThunk,
  fetchDriverViolationsThunk,
} from "../redux/features/speedviolations/speedViolationsThunk";
import {
  selectViolations,
  selectViolationsTotal,
  selectViolationsLoading,
  selectViolationsError,
  selectDriverViolations,
  selectDriverViolationsTotal,
  selectDriverViolationsLoading,
  selectDriverViolationsError,
  selectDriverViolationsTotalPages,
  clearDriverViolations,
} from "../redux/features/speedviolations/speedviolationsSlice";
import { selectCurrentUser } from "../redux/features/auth/authSlice";
import { fetchCompaniesThunk } from "../redux/features/company/companyThunks";

import SpeedViolationTable from "../components/SpeedViolation/SpeedViolationTable";
import { RouteSummaryModal } from "../components/SpeedViolation/SpeedViolationModals";

const LIMIT = 20;

/** Returns the canonical ID of a company/tenant object. */
const getTenantId = (company) =>
  company?.tenant_id || company?._id || company?.id || "";

/** Returns a human-readable label for a company/tenant object. */
const getTenantLabel = (company) =>
  company?.name || company?.companyName || getTenantId(company);

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Reusable label + field wrapper so filter rows stay DRY.
 */
const FilterField = ({ label, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    <label
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: "#64748b",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
      }}
    >
      {label}
    </label>
    {children}
  </div>
);

const inputStyle = (width = 140) => ({
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  padding: "8px 12px",
  fontSize: 13,
  outline: "none",
  color: "#0f172a",
  width,
});

const selectStyle = (hasValue, width = 190) => ({
  ...inputStyle(width),
  color: hasValue ? "#0f172a" : "#94a3b8",
  cursor: "pointer",
});

/**
 * Tenant dropdown — only rendered for admin users.
 * Shared across both tabs via the same `tenantId` state.
 */
const TenantSelect = ({ value, onChange, companies, loading }) => {
  if (!companies) return null; // non-admin: don't render

  return (
    <FilterField label="Tenant">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
        style={selectStyle(!!value)}
      >
        <option value="">
          {loading ? "Loading tenants…" : "Select tenant…"}
        </option>
        {companies.map((c) => (
          <option key={getTenantId(c)} value={getTenantId(c)}>
            {getTenantLabel(c)}
          </option>
        ))}
      </select>
    </FilterField>
  );
};

/**
 * Paginator — renders nothing when there's only one page.
 */
const Pagination = ({ page, pages, total, onPageChange }) => {
  if (pages <= 1) return null;

  const start = (page - 1) * LIMIT + 1;
  const end = Math.min(page * LIMIT, total);

  // Build page number array with ellipsis markers
  const nums = Array.from({ length: pages }, (_, i) => i + 1)
    .filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1)
    .reduce((acc, n, i, arr) => {
      if (i > 0 && n - arr[i - 1] > 1) acc.push("...");
      acc.push(n);
      return acc;
    }, []);

  const navBtn = (disabled) => ({
    width: 32,
    height: 32,
    borderRadius: 7,
    border: "1px solid #e2e8f0",
    background: "white",
    color: disabled ? "#cbd5e1" : "#64748b",
    cursor: disabled ? "not-allowed" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 16,
        flexWrap: "wrap",
        gap: 10,
      }}
    >
      <div style={{ color: "#94a3b8", fontSize: 13 }}>
        Showing{" "}
        <strong style={{ color: "#0f172a" }}>
          {start}–{end}
        </strong>{" "}
        of <strong style={{ color: "#0f172a" }}>{total}</strong> violations
      </div>

      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {/* Prev */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          style={navBtn(page === 1)}
        >
          <svg
            width="13"
            height="13"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" />
          </svg>
        </button>

        {/* Page numbers */}
        {nums.map((n, i) =>
          n === "..." ? (
            <span
              key={`ellipsis-${i}`}
              style={{ width: 32, textAlign: "center", color: "#94a3b8" }}
            >
              …
            </span>
          ) : (
            <button
              key={n}
              onClick={() => onPageChange(n)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 7,
                border: n === page ? "none" : "1px solid #e2e8f0",
                background:
                  n === page
                    ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
                    : "white",
                color: n === page ? "white" : "#64748b",
                fontWeight: n === page ? 700 : 500,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {n}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === pages}
          style={navBtn(page === pages)}
        >
          <svg
            width="13"
            height="13"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M9 18l6-6-6-6" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Page component
// ─────────────────────────────────────────────────────────────────────────────

const SpeedViolationsPage = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const isAdmin = currentUser?.type === "admin";

  // ── Companies / tenants (admin only) ──────────────────────────────────────
  const { data: companies = [], loading: companyLoading = false } = useSelector(
    (state) => state.company || {}
  );

  // ── Tab ───────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("all"); // "all" | "driver"

  // ── Shared admin filter ───────────────────────────────────────────────────
  const [tenantId, setTenantId] = useState("");

  // ── All-violations state ──────────────────────────────────────────────────
  const violations = useSelector(selectViolations);
  const total = useSelector(selectViolationsTotal);
  const listLoading = useSelector(selectViolationsLoading);
  const listError = useSelector(selectViolationsError);

  const [allPage, setAllPage] = useState(1);
  const [routeFilter, setRouteFilter] = useState("");
  const [driverFilter, setDriverFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // ── Driver-tab state ──────────────────────────────────────────────────────
  const driverViolations = useSelector(selectDriverViolations);
  const driverTotal = useSelector(selectDriverViolationsTotal);
  const driverTotalPages = useSelector(selectDriverViolationsTotalPages);
  const driverLoading = useSelector(selectDriverViolationsLoading);
  const driverError = useSelector(selectDriverViolationsError);

  const [driverIdInput, setDriverIdInput] = useState("");
  const [driverIdSearch, setDriverIdSearch] = useState(null);
  const [driverPage, setDriverPage] = useState(1);

  // ── Route-summary modal ───────────────────────────────────────────────────
  const [routeSummaryId, setRouteSummaryId] = useState(null);

  // ── Derived ───────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(total / LIMIT);
  const uniqueDrivers = useMemo(
    () => new Set(violations.map((v) => v.driver_id)).size,
    [violations]
  );
  const uniqueRoutes = useMemo(
    () => new Set(violations.map((v) => v.route_id).filter(Boolean)).size,
    [violations]
  );

  // ── Bootstrap ─────────────────────────────────────────────────────────────

  // Fetch tenant list once for admin
  useEffect(() => {
    if (isAdmin && companies.length === 0) {
      dispatch(fetchCompaniesThunk());
    }
  }, [isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch violations on page change (non-admin fires immediately; admin waits
  // until a tenant has been selected to avoid the 400 TENANT_ID_REQUIRED error)
  useEffect(() => {
    if (isAdmin && !tenantId) return;
    dispatch(fetchViolationsThunk(buildAllParams(allPage)));
  }, [allPage]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Parameter builder ─────────────────────────────────────────────────────
  const buildAllParams = useCallback(
    (page) => {
      const p = { page, limit: LIMIT };
      if (routeFilter.trim()) p.route_id = routeFilter.trim();
      if (driverFilter.trim()) p.driver_id = driverFilter.trim();
      if (dateFrom) p.date_from = dateFrom;
      if (dateTo) p.date_to = dateTo;
      if (isAdmin && tenantId) p.tenant_id = tenantId;
      return p;
    },
    [routeFilter, driverFilter, dateFrom, dateTo, isAdmin, tenantId]
  );

  // ── All-violations handlers ───────────────────────────────────────────────
  const handleApplyFilters = () => {
    setAllPage(1);
    dispatch(fetchViolationsThunk(buildAllParams(1)));
  };

  const handleResetFilters = () => {
    setRouteFilter("");
    setDriverFilter("");
    setDateFrom("");
    setDateTo("");
    if (!isAdmin) {
      // Tenant is admin-only — keep it; just re-fetch
    }
    setAllPage(1);
    dispatch(
      fetchViolationsThunk({
        page: 1,
        limit: LIMIT,
        ...(isAdmin && tenantId ? { tenant_id: tenantId } : {}),
      })
    );
  };

  // When an admin picks a tenant for the first time, trigger the initial load
  const handleTenantChange = (value) => {
    setTenantId(value);
    setAllPage(1);
    if (value) {
      dispatch(
        fetchViolationsThunk({
          page: 1,
          limit: LIMIT,
          tenant_id: value,
        })
      );
    }
  };

  // ── Driver-tab handlers ───────────────────────────────────────────────────
  const handleDriverSearch = () => {
    const id = parseInt(driverIdInput.trim(), 10);
    if (!id) return;
    setDriverIdSearch(id);
    setDriverPage(1);
    dispatch(
      fetchDriverViolationsThunk({
        driverId: id,
        params: {
          page: 1,
          limit: LIMIT,
          ...(isAdmin && tenantId ? { tenant_id: tenantId } : {}),
        },
      })
    );
  };

  const handleDriverPageChange = (p) => {
    setDriverPage(p);
    dispatch(
      fetchDriverViolationsThunk({
        driverId: driverIdSearch,
        params: {
          page: p,
          limit: LIMIT,
          ...(isAdmin && tenantId ? { tenant_id: tenantId } : {}),
        },
      })
    );
  };

  const handleClearDriverSearch = () => {
    dispatch(clearDriverViolations());
    setDriverIdInput("");
    setDriverIdSearch(null);
  };

  // ── Jump to driver tab from table row ─────────────────────────────────────
  const handleViewDriver = (driverId) => {
    setDriverIdInput(String(driverId));
    setActiveTab("driver");
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Shared styles
  // ─────────────────────────────────────────────────────────────────────────
  const filterCardStyle = {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: "14px 16px",
    marginBottom: 16,
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  };

  const filterRowStyle = {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "flex-end",
  };

  const errorBannerStyle = {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: 8,
    padding: "12px 16px",
    marginBottom: 16,
    color: "#dc2626",
    fontSize: 13,
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        fontFamily: "Inter,-apple-system,BlinkMacSystemFont,sans-serif",
        background: "#f1f5f9",
        minHeight: "100vh",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        ::placeholder { color: #94a3b8; }
        select option { background: white; color: #1e293b; }
        input[type="date"]::-webkit-calendar-picker-indicator { opacity: 0.5; cursor: pointer; }
      `}</style>

      {/* ── Stats strip ─────────────────────────────────────────────────── */}
      <div style={{ background: "white", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", padding: "0 28px" }}>
          {[
            { label: "Total Violations", value: total,             color: "#dc2626" },
            { label: "This Page",        value: violations.length, color: "#6366f1" },
            { label: "Unique Drivers",   value: uniqueDrivers,     color: "#0369a1" },
            { label: "Unique Routes",    value: uniqueRoutes,      color: "#16a34a" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              style={{
                padding: "16px 32px 16px 0",
                marginRight: 32,
                borderRight: i < 3 ? "1px solid #f1f5f9" : "none",
              }}
            >
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: stat.color,
                  lineHeight: 1,
                }}
              >
                {listLoading ? "—" : stat.value}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#94a3b8",
                  fontWeight: 500,
                  marginTop: 3,
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tab navigation ──────────────────────────────────────────────── */}
      <div
        style={{
          background: "white",
          borderBottom: "1px solid #e2e8f0",
          padding: "0 28px",
        }}
      >
        <div style={{ display: "flex" }}>
          {[
            { key: "all",    label: "All Violations" },
            { key: "driver", label: "By Driver"      },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "14px 20px",
                background: "none",
                border: "none",
                borderBottom:
                  activeTab === tab.key
                    ? "2px solid #6366f1"
                    : "2px solid transparent",
                color: activeTab === tab.key ? "#6366f1" : "#64748b",
                fontWeight: activeTab === tab.key ? 600 : 500,
                fontSize: 14,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <div style={{ padding: "20px 28px" }}>

        {/* ══════════════ TAB: ALL VIOLATIONS ══════════════ */}
        {activeTab === "all" && (
          <>
            {/* Filter bar */}
            <div style={filterCardStyle}>
              <div style={filterRowStyle}>

                {/* Tenant dropdown — admin only */}
                <TenantSelect
                  value={tenantId}
                  onChange={handleTenantChange}
                  companies={isAdmin ? companies : null}
                  loading={companyLoading}
                />

                {/* Route ID */}
                <FilterField label="Route ID">
                  <input
                    value={routeFilter}
                    onChange={(e) => setRouteFilter(e.target.value)}
                    style={inputStyle(110)}
                    placeholder="e.g. 42"
                  />
                </FilterField>

                {/* Driver ID */}
                <FilterField label="Driver ID">
                  <input
                    value={driverFilter}
                    onChange={(e) => setDriverFilter(e.target.value)}
                    style={inputStyle(110)}
                    placeholder="e.g. 15"
                  />
                </FilterField>

                {/* Date From */}
                <FilterField label="From">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    style={inputStyle(150)}
                  />
                </FilterField>

                {/* Date To */}
                <FilterField label="To">
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    style={inputStyle(150)}
                  />
                </FilterField>

                {/* Action buttons */}
                <div
                  style={{ display: "flex", gap: 8, marginLeft: "auto" }}
                >
                  <button
                    onClick={handleResetFilters}
                    style={{
                      padding: "8px 16px",
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      color: "#64748b",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.background = "#f1f5f9")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.background = "#f8fafc")
                    }
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleApplyFilters}
                    disabled={isAdmin && !tenantId}
                    style={{
                      padding: "8px 20px",
                      background:
                        isAdmin && !tenantId
                          ? "#e2e8f0"
                          : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                      border: "none",
                      borderRadius: 8,
                      color: isAdmin && !tenantId ? "#94a3b8" : "white",
                      cursor: isAdmin && !tenantId ? "not-allowed" : "pointer",
                      fontSize: 13,
                      fontWeight: 600,
                      boxShadow:
                        isAdmin && !tenantId
                          ? "none"
                          : "0 2px 8px rgba(99,102,241,0.3)",
                    }}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>

            {/* Error */}
            {listError && (
              <div style={errorBannerStyle}>{listError}</div>
            )}

            {/* Admin must pick a tenant before data loads */}
            {isAdmin && !tenantId ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <svg
                  style={{ margin: "0 auto 14px", display: "block" }}
                  width="44"
                  height="44"
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11M8 10v11M16 10v11M12 10v11" />
                </svg>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#64748b",
                    marginBottom: 4,
                  }}
                >
                  Select a tenant to load violations
                </div>
                <div style={{ fontSize: 13, color: "#94a3b8" }}>
                  Use the Tenant dropdown above to get started
                </div>
              </div>
            ) : (
              <>
                <SpeedViolationTable
                  violations={violations}
                  loading={listLoading}
                  onViewRoute={(routeId) => setRouteSummaryId(routeId)}
                  onViewDriver={handleViewDriver}
                />
                <Pagination
                  page={allPage}
                  pages={totalPages}
                  total={total}
                  onPageChange={(p) => setAllPage(p)}
                />
              </>
            )}
          </>
        )}

        {/* ══════════════ TAB: BY DRIVER ══════════════ */}
        {activeTab === "driver" && (
          <>
            {/* Search bar */}
            <div style={filterCardStyle}>
              <div style={filterRowStyle}>

                {/* Driver ID input */}
                <FilterField label="Driver ID">
                  <input
                    value={driverIdInput}
                    onChange={(e) => setDriverIdInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleDriverSearch()
                    }
                    style={inputStyle(160)}
                    placeholder="Enter driver ID…"
                  />
                </FilterField>

                {/* Tenant dropdown — admin only */}
                <TenantSelect
                  value={tenantId}
                  onChange={setTenantId}
                  companies={isAdmin ? companies : null}
                  loading={companyLoading}
                />

                {/* Search / Clear */}
                <button
                  onClick={handleDriverSearch}
                  disabled={isAdmin && !tenantId}
                  style={{
                    padding: "8px 20px",
                    background:
                      isAdmin && !tenantId
                        ? "#e2e8f0"
                        : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    border: "none",
                    borderRadius: 8,
                    color: isAdmin && !tenantId ? "#94a3b8" : "white",
                    cursor: isAdmin && !tenantId ? "not-allowed" : "pointer",
                    fontSize: 13,
                    fontWeight: 600,
                    boxShadow:
                      isAdmin && !tenantId
                        ? "none"
                        : "0 2px 8px rgba(99,102,241,0.3)",
                    alignSelf: "flex-end",
                  }}
                >
                  Search
                </button>

                {driverIdSearch && (
                  <button
                    onClick={handleClearDriverSearch}
                    style={{
                      padding: "8px 16px",
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      color: "#64748b",
                      cursor: "pointer",
                      fontSize: 13,
                      alignSelf: "flex-end",
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Driver stats summary */}
              {driverIdSearch && !driverLoading && driverTotal > 0 && (
                <div
                  style={{
                    marginTop: 12,
                    paddingTop: 12,
                    borderTop: "1px solid #f1f5f9",
                    display: "flex",
                    gap: 24,
                    alignItems: "center",
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: 20,
                        fontWeight: 800,
                        color: "#dc2626",
                      }}
                    >
                      {driverTotal}
                    </span>
                    <span
                      style={{ fontSize: 12, color: "#94a3b8", marginLeft: 6 }}
                    >
                      Total violations
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      color: "#6366f1",
                    }}
                  >
                    Driver #{driverIdSearch}
                  </div>
                </div>
              )}
            </div>

            {/* Prompt — no search yet */}
            {!driverIdSearch && (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 0",
                  color: "#94a3b8",
                }}
              >
                <svg
                  style={{ margin: "0 auto 14px", display: "block" }}
                  width="44"
                  height="44"
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#64748b",
                    marginBottom: 4,
                  }}
                >
                  Enter a Driver ID to search
                </div>
                <div style={{ fontSize: 13 }}>
                  View all violations for a specific driver
                </div>
              </div>
            )}

            {/* Error */}
            {driverError && (
              <div style={errorBannerStyle}>{driverError}</div>
            )}

            {/* Results */}
            {driverIdSearch && (
              <>
                <SpeedViolationTable
                  violations={driverViolations}
                  loading={driverLoading}
                  onViewRoute={(routeId) => setRouteSummaryId(routeId)}
                  onViewDriver={() => {}}
                />
                <Pagination
                  page={driverPage}
                  pages={driverTotalPages}
                  total={driverTotal}
                  onPageChange={handleDriverPageChange}
                />
              </>
            )}
          </>
        )}
      </div>

      {/* ── Route summary modal ──────────────────────────────────────────── */}
      {routeSummaryId && (
        <RouteSummaryModal
          routeId={routeSummaryId}
          tenantId={isAdmin && tenantId ? tenantId : null}
          onClose={() => setRouteSummaryId(null)}
        />
      )}
    </div>
  );
};

export default SpeedViolationsPage;
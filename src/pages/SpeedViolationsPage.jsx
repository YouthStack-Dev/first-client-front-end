import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import {
  AlertCircle, FileText, User, Route,
  RotateCcw, SlidersHorizontal,
} from "lucide-react";

import { fetchViolationsThunk } from "../redux/features/speedviolations/speedViolationsThunk";
import {
  selectViolations,
  selectViolationsTotal,
  selectViolationsLoading,
  selectViolationsError,
} from "../redux/features/speedviolations/speedviolationsSlice";
import { selectCurrentUser } from "../redux/features/auth/authSlice";
import { fetchCompaniesThunk } from "../redux/features/company/companyThunks";
import {
  driversSelectors,
  NewfetchDriversThunk,
  selectDriversLoading,
} from "../redux/features/manageDriver/newDriverSlice";
import { useVendorOptions } from "../hooks/useVendorOptions";

import SpeedViolationTable from "../components/SpeedViolation/SpeedViolationTable";
import { RouteSummaryModal } from "../components/SpeedViolation/SpeedViolationModals";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const LIMIT              = 20;
const DRIVER_FETCH_LIMIT = 100;

// ─────────────────────────────────────────────────────────────────────────────
// Severity config
// ─────────────────────────────────────────────────────────────────────────────
const SEVERITY_CONFIG = {
  CRITICAL: { bg: "#FCEBEB", text: "#A32D2D", dot: "#E24B4A" },
  HIGH:     { bg: "#FAEEDA", text: "#633806", dot: "#EF9F27" },
  MEDIUM:   { bg: "#EEEDFE", text: "#3C3489", dot: "#7F77DD" },
  LOW:      { bg: "#E6F1FB", text: "#0C447C", dot: "#378ADD" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Tenant helpers
// ─────────────────────────────────────────────────────────────────────────────
const getTenantId    = (c) => c?.tenant_id || c?._id || c?.id || "";
const getTenantLabel = (c) => c?.name || c?.companyName || getTenantId(c);

// ─────────────────────────────────────────────────────────────────────────────
// react-select shared styles — matches the rest of the page's look
// ─────────────────────────────────────────────────────────────────────────────
const rsStyles = (width = 180) => ({
  container:   (b) => ({ ...b, width }),
  control:     (b, s) => ({
    ...b,
    minHeight: 34,
    fontSize: 13,
    borderRadius: 8,
    border: s.isFocused ? "1px solid #534AB7" : "0.5px solid #cbd5e1",
    boxShadow: s.isFocused ? "0 0 0 2px rgba(83,74,183,0.15)" : "none",
    "&:hover": { borderColor: "#94a3b8" },
    cursor: "pointer",
  }),
  valueContainer: (b) => ({ ...b, padding: "2px 10px" }),
  singleValue:    (b) => ({ ...b, fontSize: 13, color: "#0f172a" }),
  placeholder:    (b) => ({ ...b, fontSize: 13, color: "#94a3b8" }),
  option:         (b, s) => ({
    ...b,
    fontSize: 13,
    background: s.isSelected ? "#534AB7" : s.isFocused ? "#f1f5f9" : "white",
    color: s.isSelected ? "white" : "#0f172a",
    cursor: "pointer",
  }),
  menu:           (b) => ({ ...b, borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", zIndex: 50 }),
  menuList:       (b) => ({ ...b, padding: 4, maxHeight: 240 }),
  clearIndicator: (b) => ({ ...b, padding: "0 6px", color: "#94a3b8", "&:hover": { color: "#64748b" } }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator:  (b) => ({ ...b, padding: "0 8px", color: "#94a3b8" }),
  input:          (b) => ({ ...b, fontSize: 13 }),
});

// ─────────────────────────────────────────────────────────────────────────────
// FilterField — label + input wrapper
// ─────────────────────────────────────────────────────────────────────────────
const FilterField = ({ label, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    <label style={{
      fontSize: 11, fontWeight: 600, color: "#64748b",
      textTransform: "uppercase", letterSpacing: "0.06em",
    }}>
      {label}
    </label>
    {children}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// StatCard
// ─────────────────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, value, label, color, bgColor }) => (
  <div style={{
    background: "white", border: "0.5px solid #e2e8f0",
    borderRadius: 10, padding: "12px 14px",
    display: "flex", alignItems: "center", gap: 10,
  }}>
    <div style={{
      width: 36, height: 36, borderRadius: 8, background: bgColor,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <Icon size={16} color={color} />
    </div>
    <div>
      <div style={{ fontSize: 22, fontWeight: 600, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>{label}</div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// SeverityBadge
// ─────────────────────────────────────────────────────────────────────────────
const SeverityBadge = ({ level, count }) => {
  const cfg = SEVERITY_CONFIG[level];
  if (!cfg) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, background: cfg.bg, borderRadius: 20, padding: "4px 10px" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
      <span style={{ fontSize: 12, fontWeight: 600, color: cfg.text }}>{level}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: cfg.text }}>{count}</span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// FilterChip
// ─────────────────────────────────────────────────────────────────────────────
const FilterChip = ({ label, value, onRemove, bg, color }) => (
  <div style={{
    display: "inline-flex", alignItems: "center", gap: 5,
    background: bg, borderRadius: 20, padding: "3px 10px",
    fontSize: 12, fontWeight: 500, color,
  }}>
    <span style={{ opacity: 0.7 }}>{label}:</span>
    <span>{value}</span>
    <button onClick={onRemove} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", color, opacity: 0.6, marginLeft: 2 }}>
      ×
    </button>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// TenantSelect — superadmin only, plain <select> (list is small)
// ─────────────────────────────────────────────────────────────────────────────
const TenantSelect = ({ value, onChange, companies, loading }) => {
  if (!companies) return null;
  return (
    <FilterField label="Tenant">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
        style={{
          width: 180, padding: "6px 10px", fontSize: 13,
          borderRadius: 8, border: "0.5px solid #cbd5e1",
          background: "white", outline: "none",
          color: value ? "#0f172a" : "#94a3b8", cursor: "pointer",
        }}
      >
        <option value="">{loading ? "Loading…" : "Select tenant…"}</option>
        {companies.map((c) => (
          <option key={getTenantId(c)} value={getTenantId(c)}>{getTenantLabel(c)}</option>
        ))}
      </select>
    </FilterField>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────────────────────────────────────
const Pagination = ({ page, pages, total, onPageChange }) => {
  if (pages <= 1) return null;
  const start = (page - 1) * LIMIT + 1;
  const end   = Math.min(page * LIMIT, total);
  const nums  = Array.from({ length: pages }, (_, i) => i + 1)
    .filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1)
    .reduce((acc, n, i, arr) => {
      if (i > 0 && n - arr[i - 1] > 1) acc.push("...");
      acc.push(n);
      return acc;
    }, []);

  const navBtn = (disabled) => ({
    width: 32, height: 32, borderRadius: 7,
    border: "0.5px solid #e2e8f0", background: "white",
    color: disabled ? "#cbd5e1" : "#64748b",
    cursor: disabled ? "not-allowed" : "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
  });

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, flexWrap: "wrap", gap: 10 }}>
      <div style={{ fontSize: 13, color: "#94a3b8" }}>
        Showing <strong style={{ color: "#0f172a" }}>{start}–{end}</strong> of{" "}
        <strong style={{ color: "#0f172a" }}>{total}</strong> violations
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <button onClick={() => onPageChange(page - 1)} disabled={page === 1} style={navBtn(page === 1)}>
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" strokeLinecap="round" /></svg>
        </button>
        {nums.map((n, i) =>
          n === "..." ? (
            <span key={`e${i}`} style={{ width: 32, textAlign: "center", color: "#94a3b8" }}>…</span>
          ) : (
            <button key={n} onClick={() => onPageChange(n)} style={{
              width: 32, height: 32, borderRadius: 7,
              border: n === page ? "none" : "0.5px solid #e2e8f0",
              background: n === page ? "#534AB7" : "white",
              color: n === page ? "white" : "#64748b",
              fontWeight: n === page ? 600 : 400,
              fontSize: 13, cursor: "pointer",
            }}>{n}</button>
          )
        )}
        <button onClick={() => onPageChange(page + 1)} disabled={page === pages} style={navBtn(page === pages)}>
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" strokeLinecap="round" /></svg>
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
const SpeedViolationsPage = () => {
  const dispatch    = useDispatch();
  const currentUser = useSelector(selectCurrentUser);

  const isAdmin = currentUser?.type === "admin";
  const userTenantId =
    currentUser?.employee?.tenant_id ||
    currentUser?.vendor_user?.tenant_id ||
    currentUser?.tenant_id || "";

  // ── Tenants (superadmin only) ─────────────────────────────────────────────
  const { data: companies = [], loading: companyLoading = false } =
    useSelector((state) => state.company || {});

  // ── Violations ────────────────────────────────────────────────────────────
  const violations  = useSelector(selectViolations);
  const total       = useSelector(selectViolationsTotal);
  const listLoading = useSelector(selectViolationsLoading);
  const listError   = useSelector(selectViolationsError);

  // ── Drivers ───────────────────────────────────────────────────────────────
  const allDrivers     = useSelector(driversSelectors.selectAll);
  const driversLoading = useSelector(selectDriversLoading);

  // ── Filter state ──────────────────────────────────────────────────────────
  const [tenantId,       setTenantId]       = useState("");
  // react-select uses { value, label } objects, null = nothing selected
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [routeFilter,    setRouteFilter]    = useState("");
  const [dateFrom,       setDateFrom]       = useState("");
  const [dateTo,         setDateTo]         = useState("");
  const [page,           setPage]           = useState(1);

  // ── Modal ─────────────────────────────────────────────────────────────────
  const [routeSummaryId, setRouteSummaryId] = useState(null);

  // ── Vendor options ────────────────────────────────────────────────────────
  const vendorTenantId     = isAdmin ? tenantId : userTenantId;
  const shouldFetchVendors = isAdmin ? !!tenantId : true;

  const { vendorOptions, loading: vendorLoading } = useVendorOptions(
    vendorTenantId || null,
    shouldFetchVendors
  );

  // Driver options for react-select
  const driverOptions = useMemo(() =>
    allDrivers.map((d) => ({
      value: String(d.driver_id),
      label: d.name || `Driver #${d.driver_id}`,
    })),
    [allDrivers]
  );

  // ── Auto-select single vendor ─────────────────────────────────────────────
  useEffect(() => {
    if (vendorOptions.length === 1 && !selectedVendor) {
      const only = vendorOptions[0];
      setSelectedVendor(only);
      dispatch(NewfetchDriversThunk({ vendor_id: only.value, skip: 0, limit: DRIVER_FETCH_LIMIT }));
    }
  }, [vendorOptions]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived ───────────────────────────────────────────────────────────────
  const totalPages    = Math.ceil(total / LIMIT);
  const uniqueDrivers = useMemo(() => new Set(violations.map((v) => v.driver_id)).size, [violations]);
  const uniqueRoutes  = useMemo(() => new Set(violations.map((v) => v.route_id).filter(Boolean)).size, [violations]);

  const severityCounts = useMemo(() => {
    const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    violations.forEach((v) => {
      const s = v.severity?.toUpperCase();
      if (s in counts) counts[s]++;
    });
    return counts;
  }, [violations]);

  const canFetch = isAdmin ? !!tenantId : true;

  // Active filter chips
  const activeFilters = [
    ...(selectedVendor ? [{ id: "vendor", label: "Vendor", value: selectedVendor.label, bg: "#EEEDFE", color: "#3C3489", onRemove: () => { setSelectedVendor(null); setSelectedDriver(null); } }] : []),
    ...(selectedDriver ? [{ id: "driver", label: "Driver", value: selectedDriver.label, bg: "#E6F1FB", color: "#0C447C", onRemove: () => setSelectedDriver(null) }] : []),
    ...(routeFilter    ? [{ id: "route",  label: "Route",  value: routeFilter,          bg: "#EAF3DE", color: "#27500A", onRemove: () => setRouteFilter("") }] : []),
    ...(dateFrom       ? [{ id: "from",   label: "From",   value: dateFrom,             bg: "#F1EFE8", color: "#444441", onRemove: () => setDateFrom("") }] : []),
    ...(dateTo         ? [{ id: "to",     label: "To",     value: dateTo,               bg: "#F1EFE8", color: "#444441", onRemove: () => setDateTo("") }] : []),
  ];

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isAdmin && companies.length === 0) dispatch(fetchCompaniesThunk());
  }, [isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!canFetch) return;
    dispatch(fetchViolationsThunk(buildParams(page)));
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Param builder ─────────────────────────────────────────────────────────
  const buildParams = useCallback(
    (p) => ({
      page: p,
      limit: LIMIT,
      ...(routeFilter.trim()       && { route_id:  routeFilter.trim()       }),
      ...(selectedDriver?.value    && { driver_id: selectedDriver.value     }),
      ...(dateFrom                 && { date_from: dateFrom                 }),
      ...(dateTo                   && { date_to:   dateTo                   }),
      ...(isAdmin && tenantId      && { tenant_id: tenantId                 }),
    }),
    [routeFilter, selectedDriver, dateFrom, dateTo, isAdmin, tenantId]
  );

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleTenantChange = (value) => {
    setTenantId(value);
    setSelectedVendor(null);
    setSelectedDriver(null);
    setPage(1);
    if (value) dispatch(fetchViolationsThunk({ page: 1, limit: LIMIT, tenant_id: value }));
  };

  const handleVendorChange = (option) => {
    setSelectedVendor(option);
    setSelectedDriver(null);
    if (option) {
      dispatch(NewfetchDriversThunk({ vendor_id: option.value, skip: 0, limit: DRIVER_FETCH_LIMIT }));
    }
  };

  const handleDriverChange = (option) => {
    setSelectedDriver(option);
    setPage(1);
  };

  const handleApply = () => {
    if (!canFetch) return;
    setPage(1);
    dispatch(fetchViolationsThunk(buildParams(1)));
  };

  const handleReset = () => {
    setSelectedDriver(null);
    setRouteFilter("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
    if (canFetch) {
      dispatch(fetchViolationsThunk({
        page: 1, limit: LIMIT,
        ...(isAdmin && tenantId && { tenant_id: tenantId }),
      }));
    }
  };

  // Clicking Driver button in table row — find the option object and set it
  const handleViewDriver = (driverId) => {
    const id     = String(driverId);
    const option = driverOptions.find((o) => o.value === id)
                ?? { value: id, label: `Driver #${id}` };
    setSelectedDriver(option);
    setPage(1);
    dispatch(fetchViolationsThunk({ ...buildParams(1), driver_id: id }));
  };

  const handleChipRemove = (chipOnRemove) => {
    chipOnRemove();
    setPage(1);
    setTimeout(() => {
      if (canFetch) dispatch(fetchViolationsThunk(buildParams(1)));
    }, 0);
  };

  const applyDisabled = !canFetch;

  const inputBase = (width = 130) => ({
    width, padding: "6px 10px", fontSize: 13,
    borderRadius: 8, border: "0.5px solid #cbd5e1",
    background: "white", outline: "none", color: "#0f172a",
  });

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "Inter,-apple-system,BlinkMacSystemFont,sans-serif", background: "#f1f5f9", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::placeholder { color: #94a3b8; }
        input[type="date"]::-webkit-calendar-picker-indicator { opacity: 0.5; cursor: pointer; }
      `}</style>

      <div style={{ padding: "20px 28px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ── Stat cards ────────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          <StatCard icon={AlertCircle} value={total}             label="Total violations" color="#E24B4A" bgColor="#FCEBEB" />
          <StatCard icon={FileText}    value={violations.length} label="This page"        color="#534AB7" bgColor="#EEEDFE" />
          <StatCard icon={User}        value={uniqueDrivers}     label="Unique drivers"   color="#185FA5" bgColor="#E6F1FB" />
          <StatCard icon={Route}       value={uniqueRoutes}      label="Unique routes"    color="#3B6D11" bgColor="#EAF3DE" />
        </div>

        {/* ── Filter card ───────────────────────────────────────────── */}
        <div style={{ background: "white", border: "0.5px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>

          {/* Filter inputs row */}
          <div style={{
            padding: "12px 16px",
            display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end",
            borderBottom: activeFilters.length > 0 ? "0.5px solid #f1f5f9" : "none",
          }}>

            {/* Tenant — superadmin only, plain select (short list) */}
            <TenantSelect
              value={tenantId}
              onChange={handleTenantChange}
              companies={isAdmin ? companies : null}
              loading={companyLoading}
            />

            {/* Vendor — react-select with search */}
            <FilterField label="Vendor">
              <Select
                options={vendorOptions}
                value={selectedVendor}
                onChange={handleVendorChange}
                isLoading={vendorLoading}
                isDisabled={isAdmin && !tenantId}
                isSearchable
                isClearable
                placeholder={
                  vendorLoading        ? "Loading…"             :
                  isAdmin && !tenantId ? "Select tenant first…" :
                  "Search vendor…"
                }
                noOptionsMessage={() => "No vendors found"}
                styles={rsStyles(190)}
              />
            </FilterField>

            {/* Driver — react-select with search */}
            <FilterField label="Driver">
              <Select
                options={driverOptions}
                value={selectedDriver}
                onChange={handleDriverChange}
                isLoading={driversLoading}
                isDisabled={!selectedVendor}
                isSearchable
                isClearable
                placeholder={
                  driversLoading   ? "Loading…"              :
                  !selectedVendor  ? "Select vendor first…"  :
                  "Search driver…"
                }
                noOptionsMessage={() => "No drivers found"}
                styles={rsStyles(200)}
              />
            </FilterField>

            {/* Route ID */}
            <FilterField label="Route ID">
              <input
                value={routeFilter}
                onChange={(e) => setRouteFilter(e.target.value)}
                style={inputBase(90)}
                placeholder="e.g. 42"
              />
            </FilterField>

            {/* From */}
            <FilterField label="From">
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={inputBase(140)} />
            </FilterField>

            {/* To */}
            <FilterField label="To">
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={inputBase(140)} />
            </FilterField>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
              <button
                onClick={handleReset}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "6px 14px", background: "white",
                  border: "0.5px solid #e2e8f0", borderRadius: 8,
                  color: "#64748b", cursor: "pointer", fontSize: 13,
                }}
              >
                <RotateCcw size={13} /> Reset
              </button>
              <button
                onClick={handleApply}
                disabled={applyDisabled}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "6px 16px",
                  background: applyDisabled ? "#e2e8f0" : "#534AB7",
                  border: "none", borderRadius: 8,
                  color: applyDisabled ? "#94a3b8" : "white",
                  cursor: applyDisabled ? "not-allowed" : "pointer",
                  fontSize: 13, fontWeight: 600,
                  boxShadow: applyDisabled ? "none" : "0 2px 8px rgba(83,74,183,0.25)",
                }}
              >
                <SlidersHorizontal size={13} /> Apply
              </button>
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilters.length > 0 && (
            <div style={{
              padding: "8px 16px", display: "flex", gap: 6,
              alignItems: "center", flexWrap: "wrap",
              background: "#f8fafc", borderBottom: "0.5px solid #f1f5f9",
            }}>
              <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginRight: 2 }}>
                Filters
              </span>
              {activeFilters.map((f) => (
                <FilterChip key={f.id} label={f.label} value={f.value} bg={f.bg} color={f.color} onRemove={() => handleChipRemove(f.onRemove)} />
              ))}
            </div>
          )}

          {/* Severity summary bar */}
          {!listLoading && violations.length > 0 && (
            <div style={{
              padding: "8px 16px", display: "flex", gap: 8,
              alignItems: "center", flexWrap: "wrap",
              borderBottom: "0.5px solid #f1f5f9",
            }}>
              <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginRight: 2 }}>
                Severity
              </span>
              {Object.keys(SEVERITY_CONFIG).map((level) =>
                severityCounts[level] > 0
                  ? <SeverityBadge key={level} level={level} count={severityCounts[level]} />
                  : null
              )}
              {selectedDriver && (
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10, paddingLeft: 12, borderLeft: "0.5px solid #e2e8f0" }}>
                  <span style={{ fontSize: 18, fontWeight: 600, color: "#E24B4A" }}>{total}</span>
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>violations for</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#534AB7" }}>{selectedDriver.label}</span>
                </div>
              )}
            </div>
          )}

          {/* Error banner */}
          {listError && (
            <div style={{ padding: "10px 16px", background: "#fef2f2", borderBottom: "0.5px solid #fecaca", color: "#dc2626", fontSize: 13 }}>
              {listError}
            </div>
          )}

          {/* Gate / Table */}
          {!canFetch ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <svg style={{ margin: "0 auto 14px", display: "block" }} width="44" height="44" fill="none" stroke="#cbd5e1" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11M8 10v11M16 10v11M12 10v11" />
              </svg>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Select a tenant to load violations</div>
              <div style={{ fontSize: 13, color: "#94a3b8" }}>Vendor and Driver are optional filters you can apply after</div>
            </div>
          ) : (
            <SpeedViolationTable
              violations={violations}
              loading={listLoading}
              currentPage={page}
              limit={LIMIT}
              onViewRoute={(routeId) => setRouteSummaryId(routeId)}
              onViewDriver={handleViewDriver}
            />
          )}
        </div>

        {/* Pagination */}
        {canFetch && (
          <Pagination page={page} pages={totalPages} total={total} onPageChange={setPage} />
        )}
      </div>

      {/* Route summary modal */}
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
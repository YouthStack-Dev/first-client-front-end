import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateFormField } from "../../redux/features/cutoff/cutoffSlice";
import {
  fetchCutoffsThunk,
  fetchEscortConfigThunk,
  saveCutoffThunk,
  saveEscortConfigThunk,
} from "../../redux/features/cutoff/cutofftrunk";
import {
  Save,
  Clock,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Zap,
  Shield,
  Activity,
  UserCheck,
  Building,
  Gauge,
  Route,
  Sliders,
  Timer,
} from "lucide-react";
import { logDebug } from "../../utils/logger";
import ReusableButton from "../ui/ReusableButton";

/* ─── tiny helpers ──────────────────────────────────────────────────────────── */
const StatusPill = ({ active, activeLabel = "Active", inactiveLabel = "Inactive" }) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase ${
      active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
    }`}
  >
    <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-slate-400"}`} />
    {active ? activeLabel : inactiveLabel}
  </span>
);

const SectionHeader = ({ icon: Icon, title, color = "text-slate-600" }) => (
  <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-app-border">
    <div className={`p-1.5 rounded-md bg-app-tertiary ${color}`}>
      <Icon className="w-3.5 h-3.5" />
    </div>
    <h2 className="text-sm font-semibold text-app-text-primary tracking-tight">{title}</h2>
  </div>
);

/* ─── main component ────────────────────────────────────────────────────────── */
const CutoffManagement = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("cutoff");

  const { formData, status, error, data, tenantConfig, tenantStatus, tenantError } =
    useSelector((state) => state.cutoff);

  const {
    booking_login_cutoff,
    cancel_login_cutoff,
    booking_logout_cutoff,
    cancel_logout_cutoff,
    medical_emergency_booking_cutoff,
    adhoc_booking_cutoff,
    allow_adhoc_booking,
    allow_medical_emergency_booking,
    escort_required_start_time,
    escort_required_end_time,
    escort_required_for_women,
    login_boarding_otp,
    login_deboarding_otp,
    logout_boarding_otp,
    logout_deboarding_otp,
    speed_limit_kmph,
    one_trip_per_shift_enabled,
    auto_move_on_conflict,
    driver_max_duty_minutes,
    driver_rest_enforcement,
    delay_driver_grace_minutes,
    delay_employee_grace_minutes,
    dark_hour_boarding_mode,
    schedule_reminder_enabled,
    schedule_reminder_minutes,
  } = formData || {};

  useEffect(() => {
    if (!data) dispatch(fetchCutoffsThunk());
    dispatch(fetchEscortConfigThunk());
  }, [dispatch, data]);

  const handleToggle = (fieldName) => {
    logDebug("toggle", fieldName);
    const newValue = !formData[fieldName];
    dispatch(updateFormField({ name: fieldName, value: newValue }));
    if (activeTab === "tenant") {
      const tenantData = buildTenantPayload();
      tenantData[fieldName] = newValue;
      dispatch(saveEscortConfigThunk(tenantData));
    }
  };

  const handleTimeChange = (fieldName, hours, minutes) => {
    dispatch(updateFormField({ name: fieldName, value: `${hours}:${minutes.toString().padStart(2, "0")}` }));
  };

  const handleFullTimeChange = (fieldName, hours, minutes, seconds = "00") => {
    dispatch(updateFormField({
      name: fieldName,
      value: `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds}`,
    }));
  };

  const buildTenantPayload = () => ({
    escort_required_start_time,
    escort_required_end_time,
    escort_required_for_women,
    login_boarding_otp,
    login_deboarding_otp,
    logout_boarding_otp,
    logout_deboarding_otp,
    speed_limit_kmph,
    one_trip_per_shift_enabled,
    auto_move_on_conflict,
    driver_max_duty_minutes,
    driver_rest_enforcement,
    delay_driver_grace_minutes,
    delay_employee_grace_minutes,
    dark_hour_boarding_mode,
    schedule_reminder_enabled,
    schedule_reminder_minutes,
  });

  const handleSaveCutoff = () => {
    dispatch(saveCutoffThunk({
      booking_login_cutoff, cancel_login_cutoff, booking_logout_cutoff, cancel_logout_cutoff,
      medical_emergency_booking_cutoff, adhoc_booking_cutoff, allow_adhoc_booking, allow_medical_emergency_booking,
    }));
  };

  const handleSaveTenant = () => {
    dispatch(saveEscortConfigThunk(buildTenantPayload()));
  };

  const parseTime = (t) => {
    if (!t) return { hours: 0, minutes: 0 };
    const [h, m] = t.split(":").map(Number);
    return { hours: h || 0, minutes: m || 0 };
  };

  const parseFullTime = (t) => {
    if (!t) return { hours: 0, minutes: 0 };
    const p = t.split(":");
    return { hours: parseInt(p[0]) || 0, minutes: parseInt(p[1]) || 0 };
  };

  const cutoffFields = [
    "booking_login_cutoff", "cancel_login_cutoff", "booking_logout_cutoff", "cancel_logout_cutoff",
    "medical_emergency_booking_cutoff", "adhoc_booking_cutoff", "allow_adhoc_booking", "allow_medical_emergency_booking",
  ];

  const tenantFields = [
    "escort_required_start_time", "escort_required_end_time", "escort_required_for_women",
    "login_boarding_otp", "login_deboarding_otp", "logout_boarding_otp", "logout_deboarding_otp",
    "speed_limit_kmph", "one_trip_per_shift_enabled", "auto_move_on_conflict",
    "driver_max_duty_minutes", "driver_rest_enforcement",
    "delay_driver_grace_minutes", "delay_employee_grace_minutes",
    "dark_hour_boarding_mode", "schedule_reminder_enabled", "schedule_reminder_minutes",
  ];

  const hasCutoffChanges = () => {
    if (!data) return false;
    return cutoffFields.some((k) => formData[k] !== data[k]);
  };

  const hasTenantChanges = () => {
    if (!tenantConfig) return false;
    return tenantFields.some((k) => formData[k] !== tenantConfig[k]);
  };

  const isSaving = (tab) => (tab === "tenant" ? tenantStatus : status) === "saving";
  const getStatus = (tab) => tab === "tenant" ? tenantStatus : status;
  const getError  = (tab) => tab === "tenant" ? tenantError  : error;

  /* ── status banner ── */
  const StatusBanner = ({ tab }) => {
    const s = getStatus(tab), e = getError(tab);
    if (s === "loading") return (
      <div className="flex items-center gap-2.5 px-4 py-2.5 mb-4 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-800">
        <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-blue-600 border-t-transparent flex-shrink-0" />
        Loading configuration…
      </div>
    );
    if (s === "failed") return (
      <div className="flex items-center gap-2.5 px-4 py-2.5 mb-4 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800">
        <XCircle className="w-3.5 h-3.5 flex-shrink-0 text-red-500" />
        <span><strong>Error:</strong> {e}</span>
      </div>
    );
    if (s === "saved") return (
      <div className="flex items-center gap-2.5 px-4 py-2.5 mb-4 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
        <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 text-emerald-500" />
        {tab === "tenant" ? "Tenant config" : "Cutoff config"} saved successfully.
      </div>
    );
    return null;
  };

  /* ── sub-components ── */
  const FieldRow = ({ icon: Icon, label, children }) => (
    <div className="group flex items-center gap-3 py-2.5 px-3 -mx-3 rounded-lg hover:bg-app-tertiary transition-colors">
      <Icon className="w-3.5 h-3.5 text-app-text-muted flex-shrink-0" />
      <span className="text-xs font-medium text-app-text-secondary flex-1 min-w-0">{label}</span>
      {children}
    </div>
  );

  const selectCls = "px-2 py-1 text-xs border border-app-border rounded-md bg-app-surface text-app-text-primary focus:border-app-primary focus:ring-1 focus:ring-app-primary focus:outline-none transition-colors";

  const CompactTimeInput = ({ label, fieldName, currentValue, icon: Icon }) => {
    const { hours, minutes } = parseTime(currentValue);
    return (
      <FieldRow icon={Icon} label={label}>
        <div className="flex items-center gap-1.5">
          <select value={hours} onChange={(e) => handleTimeChange(fieldName, +e.target.value, minutes)} className={`${selectCls} w-16`}>
            {Array.from({ length: 25 }, (_, i) => <option key={i} value={i}>{i}h</option>)}
          </select>
          <span className="text-app-text-muted text-xs">:</span>
          <select value={minutes} onChange={(e) => handleTimeChange(fieldName, hours, +e.target.value)} className={`${selectCls} w-16`}>
            {[0, 15, 30, 45].map((m) => <option key={m} value={m}>{m}m</option>)}
          </select>
          <span className="text-[10px] font-mono font-semibold text-app-primary bg-app-tertiary px-1.5 py-0.5 rounded w-12 text-center tabular-nums">
            {hours}:{minutes.toString().padStart(2, "0")}
          </span>
        </div>
      </FieldRow>
    );
  };

  const CompactFullTimeInput = ({ label, fieldName, currentValue, icon: Icon }) => {
    const { hours, minutes } = parseFullTime(currentValue);
    return (
      <FieldRow icon={Icon} label={label}>
        <div className="flex items-center gap-1.5">
          <select value={hours} onChange={(e) => handleFullTimeChange(fieldName, +e.target.value, minutes)} className={`${selectCls} w-16`}>
            {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{i.toString().padStart(2, "0")}h</option>)}
          </select>
          <span className="text-app-text-muted text-xs">:</span>
          <select value={minutes} onChange={(e) => handleFullTimeChange(fieldName, hours, +e.target.value)} className={`${selectCls} w-16`}>
            {Array.from({ length: 60 }, (_, i) => <option key={i} value={i}>{i.toString().padStart(2, "0")}m</option>)}
          </select>
          <span className="text-[10px] font-mono font-semibold text-app-primary bg-app-tertiary px-1.5 py-0.5 rounded w-12 text-center tabular-nums">
            {hours.toString().padStart(2, "00")}:{minutes.toString().padStart(2, "00")}
          </span>
        </div>
      </FieldRow>
    );
  };

  const CompactToggle = ({ label, enabled, onChange, description }) => (
    <div
      className="group flex items-center justify-between gap-3 py-2.5 px-3 -mx-3 rounded-lg hover:bg-app-tertiary transition-colors cursor-pointer"
      onClick={onChange}
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-app-text-secondary">{label}</p>
        {description && <p className="text-[11px] text-app-text-muted mt-0.5 leading-snug">{description}</p>}
      </div>
      <div className={`relative flex-shrink-0 w-9 h-5 rounded-full transition-all duration-300 ${enabled ? "bg-app-primary" : "bg-slate-300"}`}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${enabled ? "translate-x-4" : "translate-x-0"}`} />
      </div>
    </div>
  );

  const CompactNumberInput = ({ label, fieldName, currentValue, icon: Icon, unit, min = 0, max }) => {
    const [local, setLocal] = useState(currentValue != null ? String(currentValue) : "");
    useEffect(() => { setLocal(currentValue != null ? String(currentValue) : ""); }, [currentValue]);
    const onBlur = () => {
      const p = parseInt(local, 10);
      if (isNaN(p)) return;
      const v = max !== undefined ? Math.min(Math.max(p, min), max) : Math.max(p, min);
      setLocal(String(v));
      dispatch(updateFormField({ name: fieldName, value: v }));
    };
    return (
      <FieldRow icon={Icon} label={label}>
        <div className="flex items-center gap-1.5">
          <input
            type="number" value={local} min={min} max={max}
            onChange={(e) => setLocal(e.target.value)} onBlur={onBlur}
            className={`${selectCls} w-20 text-right`}
          />
          {unit && <span className="text-[11px] text-app-text-muted font-medium w-10">{unit}</span>}
        </div>
      </FieldRow>
    );
  };

  const EnforcementModeInput = () => (
    <div className="pt-1 pb-0.5">
      <p className="text-xs font-medium text-app-text-secondary px-3 -mx-3 mb-2">Enforcement mode</p>
      <div className="flex gap-2">
        {[
          { value: "warn",  label: "Warn",  desc: "Proceed with amber banner", color: "border-amber-400 bg-amber-50 text-amber-800" },
          { value: "block", label: "Block", desc: "Reject if rest insufficient", color: "border-red-400 bg-red-50 text-red-800" },
        ].map((opt) => {
          const active = driver_rest_enforcement === opt.value;
          return (
            <label
              key={opt.value}
              className={`flex-1 flex flex-col gap-1 p-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                active ? opt.color + " shadow-sm" : "border-app-border bg-app-surface hover:bg-app-tertiary"
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio" name="driver_rest_enforcement" value={opt.value}
                  checked={active}
                  onChange={() => dispatch(updateFormField({ name: "driver_rest_enforcement", value: opt.value }))}
                  className="accent-app-primary"
                />
                <span className={`text-xs font-semibold ${active ? "" : "text-app-text-primary"}`}>{opt.label}</span>
              </div>
              <p className={`text-[11px] leading-snug pl-5 ${active ? "" : "text-app-text-muted"}`}>{opt.desc}</p>
            </label>
          );
        })}
      </div>
    </div>
  );

  const Card = ({ children, className = "", span2 = false }) => (
    <div className={`bg-app-surface rounded-xl border border-app-border p-4 shadow-sm hover:shadow-md transition-shadow ${span2 ? "lg:col-span-2" : ""} ${className}`}>
      {children}
    </div>
  );

  const TabBar = ({ tabs, active, onChange }) => (
    <div className="flex gap-1 bg-app-tertiary p-1 rounded-xl border border-app-border mb-4">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id} onClick={() => onChange(id)}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 focus:outline-none
            ${active === id
              ? "bg-app-surface text-app-text-primary shadow-sm border border-app-border"
              : "text-app-text-muted hover:text-app-text-secondary"
            }`}
        >
          {Icon && <Icon className="w-3.5 h-3.5" />}
          {label}
        </button>
      ))}
    </div>
  );

  const StatBox = ({ label, value, accent = false, warning = false }) => (
    <div className={`p-3 rounded-xl border ${
      warning ? "bg-amber-50 border-amber-200" :
      accent  ? "bg-app-primary/5 border-app-primary/20" :
                "bg-app-tertiary border-app-border"
    }`}>
      <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${
        warning ? "text-amber-600" : accent ? "text-app-primary" : "text-app-text-muted"
      }`}>{label}</p>
      <p className="text-base font-bold text-app-text-primary tabular-nums">{value}</p>
    </div>
  );

  const SummaryRow = ({ label, value, pill }) => (
    <div className="flex items-center justify-between py-2 border-b border-app-border last:border-0">
      <span className="text-xs text-app-text-muted">{label}</span>
      {pill !== undefined
        ? <StatusPill active={pill} />
        : <span className="text-xs font-semibold text-app-text-primary tabular-nums">{value}</span>
      }
    </div>
  );

  if (!data && status !== "loading") {
    return (
      <div className="min-h-screen bg-app-background flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-app-primary border-t-transparent mx-auto" />
          <p className="text-xs text-app-text-muted">Loading configuration…</p>
        </div>
      </div>
    );
  }

  const mainTabs = [
    { id: "cutoff", label: "Cutoff Management", icon: Clock },
    { id: "tenant", label: "Tenant Management", icon: Building },
  ];

  return (
    <div className="min-h-screen bg-app-background">

      {/* ── Sticky header ── */}
      <div className="bg-app-surface border-b border-app-border sticky top-0 z-20 backdrop-blur-sm bg-app-surface/95">
        <div className="px-5 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-app-tertiary border border-app-border">
              <Sliders className="w-4 h-4 text-app-text-secondary" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-app-text-primary leading-none">System Configuration</h1>
              <p className="text-[11px] text-app-text-muted mt-0.5 leading-none">
                {activeTab === "cutoff" ? "Booking & cancellation time limits" : "Tenant-wide operational settings"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === "cutoff" && hasCutoffChanges() && (
              <span className="text-[10px] font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">
                Unsaved changes
              </span>
            )}
            {activeTab === "tenant" && hasTenantChanges() && (
              <span className="text-[10px] font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">
                Unsaved changes
              </span>
            )}

            {activeTab === "cutoff" && (
              <ReusableButton module="cutoff" action="update"
                buttonName={isSaving("cutoff") ? "Saving…" : "Save changes"}
                icon={isSaving("cutoff") ? null : Save}
                onClick={handleSaveCutoff}
                disabled={!hasCutoffChanges() || isSaving("cutoff")}
                isLoading={isSaving("cutoff")}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-app-primary text-white text-xs font-medium rounded-lg hover:bg-sidebar-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-app-primary focus:ring-offset-2"
              />
            )}
            {activeTab === "tenant" && (
              <ReusableButton module="tenant_config" action="update"
                buttonName={isSaving("tenant") ? "Saving…" : "Save changes"}
                icon={isSaving("tenant") ? null : Save}
                onClick={handleSaveTenant}
                disabled={!hasTenantChanges() || isSaving("tenant")}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-app-primary text-white text-xs font-medium rounded-lg hover:bg-sidebar-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-app-primary focus:ring-offset-2"
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-5 py-5 w-full">
        <StatusBanner tab={activeTab} />

        <TabBar tabs={mainTabs} active={activeTab} onChange={setActiveTab} />

        {/* ════════ CUTOFF TAB ════════ */}
        {activeTab === "cutoff" && (
          <div className="space-y-4">

            {/* ── Overview ── */}
            <div className="rounded-xl border border-app-border bg-app-tertiary/50 p-4 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1 h-4 rounded-full bg-app-primary" />
                <p className="text-xs font-semibold text-app-text-primary tracking-tight">Overview</p>
                <span className="text-[10px] text-app-text-muted">— current cutoff values at a glance</span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatBox label="Login book"    value={booking_login_cutoff}  accent />
                <StatBox label="Login cancel"  value={cancel_login_cutoff}   warning />
                <StatBox label="Logout book"   value={booking_logout_cutoff} accent />
                <StatBox label="Logout cancel" value={cancel_logout_cutoff}  warning />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {[
                  { icon: Shield, label: "Medical emergency", cutoff: medical_emergency_booking_cutoff, active: allow_medical_emergency_booking, color: "text-red-500" },
                  { icon: Zap,    label: "Adhoc booking",     cutoff: adhoc_booking_cutoff,             active: allow_adhoc_booking,             color: "text-purple-500" },
                ].map(({ icon: Icon, label, cutoff, active, color }) => (
                  <div key={label} className="flex items-center gap-3 p-3 rounded-xl border border-app-border bg-app-surface">
                    <div className={`p-2 rounded-lg bg-app-tertiary ${color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-app-text-primary">{label}</p>
                      <p className="text-[11px] text-app-text-muted font-mono mt-0.5">{cutoff}</p>
                    </div>
                    <StatusPill active={active} />
                  </div>
                ))}
              </div>
            </div>

            {/* ── divider ── */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-app-border" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-app-text-muted px-1">Configuration</span>
              <div className="flex-1 h-px bg-app-border" />
            </div>

            {/* Standard cutoffs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <SectionHeader icon={Clock} title="Booking cutoffs" color="text-app-primary" />
                <div className="space-y-0.5">
                  <CompactTimeInput label="Login booking"  fieldName="booking_login_cutoff"  currentValue={booking_login_cutoff}  icon={Clock} />
                  <CompactTimeInput label="Logout booking" fieldName="booking_logout_cutoff" currentValue={booking_logout_cutoff} icon={Clock} />
                </div>
              </Card>
              <Card>
                <SectionHeader icon={XCircle} title="Cancellation cutoffs" color="text-red-500" />
                <div className="space-y-0.5">
                  <CompactTimeInput label="Login cancellation"  fieldName="cancel_login_cutoff"  currentValue={cancel_login_cutoff}  icon={XCircle} />
                  <CompactTimeInput label="Logout cancellation" fieldName="cancel_logout_cutoff" currentValue={cancel_logout_cutoff} icon={XCircle} />
                </div>
              </Card>
            </div>

            {/* Special cutoffs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <SectionHeader icon={Shield} title="Medical emergency" color="text-red-500" />
                <div className="space-y-0.5">
                  <CompactTimeInput label="Emergency cutoff" fieldName="medical_emergency_booking_cutoff" currentValue={medical_emergency_booking_cutoff} icon={Shield} />
                  <CompactToggle label="Enable medical emergency" enabled={!!allow_medical_emergency_booking} onChange={() => handleToggle("allow_medical_emergency_booking")} />
                </div>
              </Card>
              <Card>
                <SectionHeader icon={Zap} title="Adhoc shifts" color="text-purple-500" />
                <div className="space-y-0.5">
                  <CompactTimeInput label="Adhoc cutoff" fieldName="adhoc_booking_cutoff" currentValue={adhoc_booking_cutoff} icon={Zap} />
                  <CompactToggle label="Enable adhoc booking" enabled={!!allow_adhoc_booking} onChange={() => handleToggle("allow_adhoc_booking")} />
                </div>
              </Card>
            </div>

          </div>
        )}

        {/* ════════ TENANT TAB ════════ */}
        {activeTab === "tenant" && (
          <div className="space-y-4">

            {/* ── Overview ── */}
            <div className="rounded-xl border border-app-border bg-app-tertiary/50 p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-4 rounded-full bg-app-primary" />
                <p className="text-xs font-semibold text-app-text-primary tracking-tight">Overview</p>
                <span className="text-[10px] text-app-text-muted">— current tenant settings at a glance</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-app-text-muted mb-2">Operational</p>
                  <div className="space-y-0.5">
                    <SummaryRow label="Escort window" value={`${escort_required_start_time} – ${escort_required_end_time}`} />
                    <SummaryRow label="Escort for women" pill={escort_required_for_women} />
                    <SummaryRow label="Speed limit" value={speed_limit_kmph != null ? `${speed_limit_kmph} km/h` : "—"} />
                    <SummaryRow label="One trip per shift" pill={one_trip_per_shift_enabled} />
                    <SummaryRow label="Auto move on conflict" pill={auto_move_on_conflict} />
                    <SummaryRow label="Pre-trip reminder" pill={schedule_reminder_enabled} />
                    {schedule_reminder_enabled && schedule_reminder_minutes != null && (
                      <SummaryRow label="Remind before" value={`${schedule_reminder_minutes} min`} />
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-app-text-muted mb-2">OTP settings</p>
                  <div className="space-y-0.5">
                    <SummaryRow label="Login boarding"    pill={login_boarding_otp} />
                    <SummaryRow label="Login deboarding"  pill={login_deboarding_otp} />
                    <SummaryRow label="Logout boarding"   pill={logout_boarding_otp} />
                    <SummaryRow label="Logout deboarding" pill={logout_deboarding_otp} />
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-app-text-muted mb-2">Driver duty hours</p>
                  <div className="space-y-0.5">
                    <SummaryRow label="Max duty limit" value={driver_max_duty_minutes != null ? `${driver_max_duty_minutes} min` : "—"} />
                    <SummaryRow label="Required rest"  value={driver_max_duty_minutes != null ? `${1440 - driver_max_duty_minutes} min` : "—"} />
                    <div className="flex items-center justify-between py-2 border-b border-app-border last:border-0">
                      <span className="text-xs text-app-text-muted">Enforcement</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                        driver_rest_enforcement === "block" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {driver_rest_enforcement === "block" ? "Block" : "Warn"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-app-text-muted mb-2">Grace & Dark Hours</p>
                  <div className="space-y-0.5">
                    <SummaryRow label="Driver grace time"   value={delay_driver_grace_minutes   != null ? `${delay_driver_grace_minutes} min`   : "—"} />
                    <SummaryRow label="Employee grace time" value={delay_employee_grace_minutes != null ? `${delay_employee_grace_minutes} min` : "—"} />
                    <SummaryRow label="Dark hour mode"      value={dark_hour_boarding_mode || "off"} />
                  </div>
                </div>

              </div>
            </div>

            {/* ── divider ── */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-app-border" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-app-text-muted px-1">Configuration</span>
              <div className="flex-1 h-px bg-app-border" />
            </div>

            {/* ── Config cards grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Escort settings */}
              <Card>
                <SectionHeader icon={UserCheck} title="Escort settings" color="text-pink-500" />
                <div className="space-y-0.5">
                  <CompactFullTimeInput label="Escort start time" fieldName="escort_required_start_time" currentValue={escort_required_start_time} icon={Clock} />
                  <CompactFullTimeInput label="Escort end time"   fieldName="escort_required_end_time"   currentValue={escort_required_end_time}   icon={Clock} />
                  <CompactToggle label="Require escort for women" enabled={!!escort_required_for_women} onChange={() => handleToggle("escort_required_for_women")} />
                </div>
              </Card>

              {/* OTP settings */}
              <Card>
                <SectionHeader icon={Shield} title="OTP settings" color="text-blue-500" />
                <div className="space-y-0.5">
                  <CompactToggle label="Login boarding OTP"    enabled={!!login_boarding_otp}    onChange={() => handleToggle("login_boarding_otp")} />
                  <CompactToggle label="Login deboarding OTP"  enabled={!!login_deboarding_otp}  onChange={() => handleToggle("login_deboarding_otp")} />
                  <CompactToggle label="Logout boarding OTP"   enabled={!!logout_boarding_otp}   onChange={() => handleToggle("logout_boarding_otp")} />
                  <CompactToggle label="Logout deboarding OTP" enabled={!!logout_deboarding_otp} onChange={() => handleToggle("logout_deboarding_otp")} />
                </div>
              </Card>

              {/* Vehicle Limits */}
              <Card>
                <SectionHeader icon={Gauge} title="Vehicle limits" color="text-orange-500" />
                <div className="space-y-1">
                  <CompactNumberInput label="Speed limit" fieldName="speed_limit_kmph" currentValue={speed_limit_kmph} icon={Gauge} unit="km/h" min={0} max={200} />
                </div>
              </Card>

              {/* Routing Policy */}
              <Card>
                <SectionHeader icon={Route} title="Routing policy" color="text-violet-600" />
                <div className="space-y-1">
                  <CompactToggle
                    label="Enforce one booking per shift per route"
                    enabled={!!one_trip_per_shift_enabled}
                    onChange={() => handleToggle("one_trip_per_shift_enabled")}
                    description="When ON, a booking can only ride on one route at a time."
                  />
                  <div className={one_trip_per_shift_enabled ? "" : "opacity-40 pointer-events-none"}>
                    <CompactToggle
                      label="Auto-move booking to new route on conflict"
                      enabled={!!auto_move_on_conflict}
                      onChange={() => handleToggle("auto_move_on_conflict")}
                      description="When OFF, the add operation is rejected instead of silently moving the booking."
                    />
                  </div>
                </div>
              </Card>

              {/* Driver duty hours */}
              <Card>
                <SectionHeader icon={Timer} title="Driver duty hours" color="text-teal-600" />
                <div className="space-y-2">
                  <CompactNumberInput label="Max duty limit" fieldName="driver_max_duty_minutes" currentValue={driver_max_duty_minutes} icon={Clock} unit="min" min={60} max={1440} />
                  {driver_max_duty_minutes != null && (
                    <div className="flex items-center gap-2 px-3 -mx-3 py-2 bg-app-tertiary rounded-lg">
                      <Clock className="w-3 h-3 text-app-text-muted flex-shrink-0" />
                      <p className="text-[11px] text-app-text-muted">
                        Required rest window:{" "}
                        <span className="font-semibold text-app-text-primary tabular-nums">
                          {1440 - driver_max_duty_minutes} min
                        </span>
                        {" "}({Math.floor((1440 - driver_max_duty_minutes) / 60)}h {(1440 - driver_max_duty_minutes) % 60}m)
                      </p>
                    </div>
                  )}
                  <EnforcementModeInput />
                </div>
              </Card>

              {/* Grace & Dark Hour settings */}
              <Card>
                <SectionHeader icon={Activity} title="Grace & dark hour settings" color="text-rose-500" />
                <div className="space-y-0.5">
                  <CompactNumberInput label="Driver grace time"   fieldName="delay_driver_grace_minutes"   currentValue={delay_driver_grace_minutes}   icon={Clock} unit="min" min={0} max={120} />
                  <CompactNumberInput label="Employee grace time" fieldName="delay_employee_grace_minutes" currentValue={delay_employee_grace_minutes} icon={Clock} unit="min" min={0} max={120} />
                  <div className="pt-1 pb-0.5">
                    <p className="text-xs font-medium text-app-text-secondary px-3 -mx-3 mb-2">Dark hour boarding</p>
                    <div className="flex gap-2">
                      {[
                        { value: "off", label: "Off", desc: "No restrictions",    color: "border-slate-400 bg-slate-50 text-slate-800" },
                        { value: "on",  label: "On",  desc: "Restrict boarding",  color: "border-rose-400 bg-rose-50 text-rose-800" },
                      ].map((opt) => {
                        const active = dark_hour_boarding_mode === opt.value;
                        return (
                          <label
                            key={opt.value}
                            className={`flex-1 flex flex-col gap-1 p-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                              active ? opt.color + " shadow-sm" : "border-app-border bg-app-surface hover:bg-app-tertiary"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="radio" name="dark_hour_boarding_mode" value={opt.value}
                                checked={active}
                                onChange={() => dispatch(updateFormField({ name: "dark_hour_boarding_mode", value: opt.value }))}
                                className="accent-app-primary"
                              />
                              <span className={`text-xs font-semibold ${active ? "" : "text-app-text-primary"}`}>{opt.label}</span>
                            </div>
                            <p className={`text-[11px] leading-snug pl-5 ${active ? "" : "text-app-text-muted"}`}>{opt.desc}</p>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Pre-trip reminder — spans full width */}
              <Card span2>
                <SectionHeader icon={AlertTriangle} title="Pre-trip reminder" color="text-amber-500" />
                <div className="space-y-0.5">
                  <CompactToggle
                    label="Enable pre-trip reminder"
                    enabled={!!schedule_reminder_enabled}
                    onChange={() => handleToggle("schedule_reminder_enabled")}
                    description="Notify employees before their scheduled trip."
                  />
                  <div className={schedule_reminder_enabled ? "" : "opacity-40 pointer-events-none"}>
                    <CompactNumberInput
                      label="Remind before trip"
                      fieldName="schedule_reminder_minutes"
                      currentValue={schedule_reminder_minutes}
                      icon={Clock}
                      unit="min"
                      min={1}
                      max={120}
                    />
                  </div>
                </div>
              </Card>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CutoffManagement;
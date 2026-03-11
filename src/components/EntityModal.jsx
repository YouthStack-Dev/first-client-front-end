import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Building2,
  Save,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Mail,
  Phone,
  KeyRound,
  Hash,
  MapPin,
  Globe,
  Shield,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  Eye,
  EyeOff,
  ChevronDown,
  Zap,
  Ban,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPermissionsThunk } from "../redux/features/Permissions/permissionsThunk";
import CompanyAddressMap from "../companies/CompanyAddressMap";

/* ─────────────────────────────────────────────
   Add Plus Jakarta Sans in your index.html <head>:

   <link href="https://fonts.googleapis.com/css2?
     family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
     rel="stylesheet"/>
───────────────────────────────────────────── */

const initialFormState = {
  company: {
    tenant_id: "",
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    is_active: true,
  },
  employee_email: "",
  employee_phone: "",
  employee_password: "",
  permissions: {},
};

const COMPANY_FIELDS = [
  { key: "tenant_id",  label: "Tenant ID",    icon: Hash,      type: "text"   },
  { key: "name",       label: "Company Name", icon: Building2, type: "text"   },
  { key: "address",    label: "Address",      icon: MapPin,    type: "text"   },
  { key: "latitude",   label: "Latitude",     icon: Globe,     type: "number" },
  { key: "longitude",  label: "Longitude",    icon: Globe,     type: "number" },
];

const CRUD_META = {
  create: { tag: "C", tile: "bg-emerald-50 border-emerald-200", label: "text-emerald-700", badge: "bg-emerald-100 text-emerald-600 border border-emerald-200" },
  read:   { tag: "R", tile: "bg-blue-50   border-blue-200",    label: "text-blue-700",    badge: "bg-blue-100   text-blue-600   border border-blue-200"   },
  update: { tag: "U", tile: "bg-amber-50  border-amber-200",   label: "text-amber-700",   badge: "bg-amber-100  text-amber-600  border border-amber-200"  },
  delete: { tag: "D", tile: "bg-rose-50   border-rose-200",    label: "text-rose-700",    badge: "bg-rose-100   text-rose-500   border border-rose-200"   },
};

/* ── Field ── */
const Field = ({ def, value, onChange, error, optional = false }) => {
  const Icon = def.icon;
  const [showPassword, setShowPassword] = useState(false);
  const resolvedType =
    def.type === "password" ? (showPassword ? "text" : "password") : def.type;

  return (
    <div data-error={!!error}>
      <label className="block text-[11px] font-semibold uppercase tracking-[.08em] text-slate-500 mb-1.5">
        {def.label}
        {!optional && <span className="text-rose-400 ml-0.5">*</span>}
        {optional && (
          <span className="normal-case text-[10px] font-medium ml-1 text-slate-300">
            (optional)
          </span>
        )}
      </label>
      <div className="relative group">
        <Icon
          size={14}
          className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors
            ${error ? "text-rose-400" : "text-slate-400 group-focus-within:text-blue-500"}`}
        />
        <input
          type={resolvedType}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={def.label}
          autoComplete={def.type === "password" ? "new-password" : undefined}
          className={`
            w-full pl-8 pr-${def.type === "password" ? "9" : "3"} py-2.5
            text-[13px] font-medium rounded-xl border bg-slate-50/60
            placeholder:text-slate-300 text-slate-800 outline-none transition-all
            focus:bg-white focus:shadow-[0_0_0_3px]
            ${error
              ? "border-rose-300 focus:border-rose-400 focus:shadow-rose-100"
              : "border-slate-200 focus:border-blue-400 focus:shadow-blue-100"
            }
          `}
        />
        {def.type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-[11px] text-rose-500 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-rose-400 inline-block flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};

/* ── SectionHead ── */
const SectionHead = ({ color, label }) => (
  <div className="flex items-center gap-3 mb-5">
    <span className={`w-1 h-5 rounded-full ${color}`} />
    <span className="text-[11px] font-extrabold uppercase tracking-[.1em] text-slate-500">
      {label}
    </span>
  </div>
);

/* ── PermCard ── */
const PermCard = ({ module, actions, onChange }) => {
  const entries = Object.entries(actions);
  const active  = entries.filter(([, d]) => d.is_active).length;
  const total   = entries.length;
  const allOn   = active === total;
  const pct     = total ? (active / total) * 100 : 0;

  const toggleAll = () =>
    entries.forEach(([action]) => onChange(module, action, !allOn));

  return (
    <div className={`
      bg-white rounded-2xl p-4 flex flex-col gap-3 transition-all duration-200 group
      ${allOn
        ? "border border-blue-200 shadow-[0_4px_20px_-4px_rgba(59,130,246,.2)]"
        : "border border-slate-100 hover:border-blue-100 hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,.08)]"
      }
    `}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors
            ${allOn ? "bg-blue-100" : "bg-slate-100 group-hover:bg-blue-50"}`}>
            <Shield size={13} className={allOn ? "text-blue-600" : "text-slate-500"} />
          </span>
          <span className="text-[12px] font-bold text-slate-700 truncate leading-tight" title={module}>
            {module}
          </span>
        </div>
        <button
          type="button"
          onClick={toggleAll}
          className={`
            flex items-center gap-1 flex-shrink-0
            text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all
            ${allOn
              ? "bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100"
              : "bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100"
            }
          `}
        >
          {allOn ? <><Ban size={9} /> Revoke</> : <><Zap size={9} /> All</>}
        </button>
      </div>

      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-sky-400 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {entries.map(([action, data]) => {
          const meta = CRUD_META[action.toLowerCase()] || {
            tag: action[0].toUpperCase(),
            tile: "bg-slate-50 border-slate-200",
            label: "text-slate-600",
            badge: "bg-slate-100 text-slate-500 border border-slate-200",
          };
          return (
            <label
              key={action}
              className={`
                flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer
                border transition-all
                ${data.is_active ? meta.tile : "bg-slate-50 border-slate-100 hover:border-slate-200"}
              `}
            >
              <span className="relative flex-shrink-0">
                <input
                  type="checkbox"
                  checked={data.is_active || false}
                  onChange={(e) => onChange(module, action, e.target.checked)}
                  className="sr-only peer"
                />
                <span className={`
                  w-[15px] h-[15px] rounded-[4px] border flex items-center justify-center transition-all
                  ${data.is_active
                    ? "bg-blue-500 border-blue-500"
                    : "bg-white border-slate-300 hover:border-blue-300"
                  }
                `}>
                  {data.is_active && (
                    <svg viewBox="0 0 10 8" width="9" height="7" fill="none"
                      stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="1 4 3.5 6.5 9 1" />
                    </svg>
                  )}
                </span>
              </span>
              <span className={`text-[11px] font-semibold capitalize flex-1 transition-colors
                ${data.is_active ? meta.label : "text-slate-400"}`}>
                {action}
              </span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 ${meta.badge}`}>
                {meta.tag}
              </span>
            </label>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
        <span className="text-[11px] font-medium text-slate-500">
          <span className={`font-bold ${allOn ? "text-blue-500" : "text-slate-700"}`}>{active}</span>
          {" / "}{total} active
        </span>
        <div className="flex items-end gap-[3px]">
          {entries.map(([action, data]) => {
            const h = { create: 10, read: 14, update: 12, delete: 8 }[action.toLowerCase()] || 10;
            return (
              <div key={action} className="w-[4px] rounded-sm transition-all duration-200"
                style={{ height: `${h}px`, background: data.is_active ? "#3b82f6" : "#e2e8f0" }} />
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ── DiscardDialog ── */
const DiscardDialog = ({ onConfirm, onCancel }) => (
  <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 backdrop-blur-[2px] rounded-3xl">
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-6 w-80 text-center">
      <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-3">
        <AlertCircle size={20} className="text-rose-500" />
      </div>
      <p className="font-bold text-[14px] text-slate-800 mb-1">Discard changes?</p>
      <p className="text-[12px] font-medium text-slate-500 mb-5">
        You have unsaved changes. Closing will lose everything you've entered.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel}
          className="flex-1 py-2 text-[13px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
          Keep editing
        </button>
        <button onClick={onConfirm}
          className="flex-1 py-2 text-[13px] font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-colors">
          Discard
        </button>
      </div>
    </div>
  </div>
);

/* ── Toast ── */
const Toast = ({ type, message, onDismiss }) => {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const styles =
    type === "success"
      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
      : "bg-rose-50 border-rose-200 text-rose-700";

  return (
    <div className={`
      fixed bottom-6 left-1/2 -translate-x-1/2 z-[60]
      flex items-center gap-2.5 px-5 py-3
      border rounded-2xl shadow-lg text-[13px] font-semibold
      animate-[slideUp_.25s_ease-out] ${styles}
    `}>
      {type === "success" ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
      {message}
      <button onClick={onDismiss} className="ml-2 opacity-50 hover:opacity-100 transition-opacity">
        <X size={12} />
      </button>
    </div>
  );
};

/* ── Sidebar ── */
const Sidebar = ({ step, mode, entityType, totalActive }) => (
  <aside
    className="hidden md:flex flex-col w-56 flex-shrink-0 rounded-l-3xl p-7 justify-between"
    style={{ background: "linear-gradient(160deg, #0f172a 0%, #1e3a5f 100%)" }}
  >
    <div>
      <div className="flex items-center gap-2.5 mb-10">
        <span
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "#3b82f6", boxShadow: "0 6px 20px -4px rgba(59,130,246,.55)" }}
        >
          <Building2 size={16} className="text-white" />
        </span>
        <div>
          <p className="text-white font-bold text-[13px] leading-none">
            {mode === "create" ? "New" : "Edit"}{" "}
            {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
          </p>
          <p className="text-[11px] font-medium mt-0.5" style={{ color: "#60a5fa" }}>Entity setup</p>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        {[
          { n: 1, label: "Details",     sub: "Company & employee" },
          { n: 2, label: "Permissions", sub: "Access control"     },
        ].map(({ n, label, sub }) => {
          const done    = step > n;
          const current = step === n;
          return (
            <div key={n} className={`relative flex items-start gap-3 px-3 py-3 rounded-xl transition-all
              ${current ? "bg-white/10" : "hover:bg-white/5"}`}>
              {n < 2 && <span className="absolute left-[23px] top-[44px] w-px h-5 bg-white/10" />}
              <span
                className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold mt-0.5 transition-all"
                style={
                  done    ? { background: "#34d399", color: "#fff" }
                  : current ? { background: "#3b82f6", color: "#fff", boxShadow: "0 0 0 3px rgba(59,130,246,.3)" }
                  :           { background: "rgba(255,255,255,.08)", color: "#475569" }
                }
              >
                {done ? <CheckCircle size={13} /> : n}
              </span>
              <div>
                <p className="text-[13px] font-semibold leading-none mb-0.5"
                  style={{ color: current ? "#fff" : done ? "rgba(255,255,255,.65)" : "#475569" }}>
                  {label}
                </p>
                <p className="text-[11px] font-medium leading-none"
                  style={{ color: current ? "#93c5fd" : "#334155" }}>
                  {sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>

    <div>
      {step === 2 && totalActive > 0 && (
        <div className="rounded-xl p-3 text-[12px] flex items-center gap-2"
          style={{ background: "rgba(59,130,246,.12)", border: "1px solid rgba(59,130,246,.25)", color: "#93c5fd" }}>
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse flex-shrink-0" />
          <span className="font-medium">
            <span className="font-extrabold" style={{ color: "#bfdbfe" }}>{totalActive}</span>{" "}
            permission{totalActive !== 1 ? "s" : ""} selected
          </span>
        </div>
      )}
    </div>
  </aside>
);

/* ── Main Modal ── */
const EntityModal = ({
  isOpen,
  onClose,
  entityType = "company",
  entityData,
  onSubmit,
  mode = "create",
}) => {
  const dispatch = useDispatch();

  // ✅ Split selectors — no inline object literal.
  // Each returns a primitive or stable reference so === passes correctly
  // and Redux doesn't schedule unnecessary re-renders.
  const permissions        = useSelector((state) => state.permissions.permissions);
  const permissionsLoading = useSelector((state) => state.permissions.permissionsLoading);
  const permissionsLoaded  = useSelector((state) => state.permissions.permissionsLoaded);

  const [formData,      setFormData]      = useState(initialFormState);
  const [errors,        setErrors]        = useState({});
  const [step,          setStep]          = useState(1);
  const [submitError,   setSubmitError]   = useState(null);
  const [toast,         setToast]         = useState(null);
  const [isDirty,       setIsDirty]       = useState(false);
  const [showDiscard,   setShowDiscard]   = useState(false);
  const [showChangePwd, setShowChangePwd] = useState(false);
  const formRef = useRef(null);

  const entityTenantId = entityData?.company?.tenant_id;

  // ✅ Permissions fetch guard — permissionsLoaded persists in Redux.
  // Permissions are fetched only once per app session regardless of how many
  // times the modal opens/closes. Stops repeated GET /permissions/ hits.
  useEffect(() => {
    if (isOpen && !permissionsLoaded) {
      dispatch(fetchPermissionsThunk());
    }
  }, [isOpen, permissionsLoaded, dispatch]);

  useEffect(() => {
    if (!isOpen || permissions.length === 0) return;
    const groupedPermissions = {};
    permissions.forEach((p) => {
      if (!groupedPermissions[p.module]) groupedPermissions[p.module] = {};
      groupedPermissions[p.module][p.action] = {
        ...p,
        is_active:
          mode === "edit" && entityData?.permissions
            ? entityData.permissions.some(
                (ep) => ep.module === p.module && ep.action === p.action
              )
            : false,
      };
    });
    if (mode === "edit" && entityData) {
      setFormData({
        company: {
          tenant_id: entityData.company?.tenant_id  || "",
          name:      entityData.company?.name       || "",
          address:   entityData.company?.address    || "",
          latitude:  entityData.company?.latitude   || "",
          longitude: entityData.company?.longitude  || "",
          is_active: entityData.company?.is_active  ?? true,
        },
        employee_email:    entityData.employee_email    || "",
        employee_phone:    entityData.employee_phone    || "",
        employee_password: "",
        permissions:       groupedPermissions,
      });
    } else {
      setFormData({ ...initialFormState, permissions: groupedPermissions });
    }
    setIsDirty(false);
  }, [entityTenantId, permissions, isOpen, mode, entityData]);

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormState);
      setErrors({});
      setStep(1);
      setSubmitError(null);
      setIsDirty(false);
      setShowDiscard(false);
      setShowChangePwd(false);
    }
  }, [isOpen]);

  const handleInputChange = (section, field, value) => {
    setIsDirty(true);
    if (section === "company") {
      setFormData((prev) => ({ ...prev, company: { ...prev.company, [field]: value } }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handlePermissionChange = (module, action, value) => {
    setIsDirty(true);
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...prev.permissions[module],
          [action]: { ...prev.permissions[module][action], is_active: value },
        },
      },
    }));
  };

  const grantAll = () =>
    Object.keys(formData.permissions).forEach((mod) =>
      Object.keys(formData.permissions[mod]).forEach((act) =>
        handlePermissionChange(mod, act, true)));

  const revokeAll = () =>
    Object.keys(formData.permissions).forEach((mod) =>
      Object.keys(formData.permissions[mod]).forEach((act) =>
        handlePermissionChange(mod, act, false)));

  const validateStep1 = () => {
    const newErrors = {};
    ["tenant_id", "name", "address"].forEach((key) => {
      if (!formData.company[key]?.trim())
        newErrors[key] = `${key.replace(/_/g, " ")} is required`;
    });
    const lat = parseFloat(formData.company.latitude);
    const lng = parseFloat(formData.company.longitude);
    if (!formData.company.latitude && formData.company.latitude !== 0)
      newErrors.latitude = "Latitude is required";
    else if (isNaN(lat) || lat < -90 || lat > 90)
      newErrors.latitude = "Latitude must be between -90 and 90";
    if (!formData.company.longitude && formData.company.longitude !== 0)
      newErrors.longitude = "Longitude is required";
    else if (isNaN(lng) || lng < -180 || lng > 180)
      newErrors.longitude = "Longitude must be between -180 and 180";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailVal   = formData.employee_email?.trim();
    const phoneVal   = formData.employee_phone?.trim();

    if (mode === "create") {
      if (!emailVal) newErrors.employee_email = "Email is required";
      else if (!emailRegex.test(emailVal)) newErrors.employee_email = "Enter a valid email address";
      if (!phoneVal) newErrors.employee_phone = "Phone is required";
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      if (!formData.employee_password) newErrors.employee_password = "Password is required";
      else if (!passwordRegex.test(formData.employee_password))
        newErrors.employee_password = "Must include uppercase, lowercase, number & special char";
    } else {
      if (emailVal && !emailRegex.test(emailVal))
        newErrors.employee_email = "Enter a valid email address";
      if (showChangePwd) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!formData.employee_password) newErrors.employee_password = "New password is required";
        else if (!passwordRegex.test(formData.employee_password))
          newErrors.employee_password = "Must include uppercase, lowercase, number & special char";
      }
    }
    setErrors(newErrors);
    return newErrors;
  };

  const preparePayload = () => {
    const permission_ids = [];
    Object.values(formData.permissions).forEach((module) => {
      Object.values(module).forEach((action) => {
        if (action.is_active && action.permission_id)
          permission_ids.push(action.permission_id);
      });
    });
    const lat = parseFloat(formData.company.latitude);
    const lng = parseFloat(formData.company.longitude);
    return {
      tenant_id:         formData.company.tenant_id.trim(),
      name:              formData.company.name.trim(),
      address:           formData.company.address.trim(),
      latitude:          isNaN(lat) ? null : lat,
      longitude:         isNaN(lng) ? null : lng,
      is_active:         formData.company.is_active,
      employee_email:    formData.employee_email.trim(),
      employee_phone:    formData.employee_phone.trim(),
      ...(formData.employee_password
        ? { employee_password: formData.employee_password }
        : {}),
      permission_ids: [...new Set(permission_ids)],
    };
  };

  const handleNext = () => {
    if (step !== 1) { setStep(2); return; }
    const newErrors = validateStep1();
    if (Object.keys(newErrors).length > 0) {
      requestAnimationFrame(() => {
        const firstErrorEl = formRef.current?.querySelector('[data-error="true"]');
        firstErrorEl?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }
    setStep(2);
  };

  const handleBack = () => setStep(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    try {
      const payload = preparePayload();
      await onSubmit(payload);
      setIsDirty(false);
      setToast({
        type: "success",
        message: mode === "create" ? "Company created successfully!" : "Company updated successfully!",
      });
    } catch (err) {
      const msg = err?.message || "Something went wrong. Please try again.";
      setSubmitError(msg);
      setToast({ type: "error", message: msg });
    }
  };

  const handleCloseRequest = () => {
    if (isDirty) setShowDiscard(true);
    else onClose();
  };

  const setCompanyData = useCallback((updater) => {
    setIsDirty(true);
    setFormData((prev) => ({
      ...prev,
      company: typeof updater === "function" ? updater(prev.company) : updater,
    }));
  }, []);

  const totalActive = Object.values(formData.permissions).reduce(
    (sum, mod) => sum + Object.values(mod).filter((a) => a.is_active).length, 0
  );
  const totalPerms = Object.values(formData.permissions).reduce(
    (sum, mod) => sum + Object.keys(mod).length, 0
  );

  if (!isOpen) return null;

  const visibleEmployeeFields = [
    { key: "employee_email", label: "Email", icon: Mail,  type: "text" },
    { key: "employee_phone", label: "Phone", icon: Phone, type: "text" },
  ];

  return (
    <>
      {toast && (
        <Toast type={toast.type} message={toast.message} onDismiss={() => setToast(null)} />
      )}

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div
          className="absolute inset-0 bg-slate-950/70 backdrop-blur-[3px]"
          onClick={handleCloseRequest}
        />

        {/* ✅ Font: Plus Jakarta Sans — structured, crisp at small sizes, dark-friendly */}
        <div
          className="
            relative z-10 flex w-full max-w-7xl max-h-[92vh]
            rounded-3xl overflow-hidden
            shadow-[0_32px_64px_-12px_rgba(0,0,0,.5)]
            ring-1 ring-white/10
          "
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {showDiscard && (
            <DiscardDialog
              onConfirm={() => { setShowDiscard(false); onClose(); }}
              onCancel={() => setShowDiscard(false)}
            />
          )}

          <Sidebar step={step} mode={mode} entityType={entityType} totalActive={totalActive} />

          <div className="flex flex-col flex-1 bg-white overflow-hidden rounded-r-3xl md:rounded-l-none rounded-l-3xl">

            {/* Panel header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 flex-shrink-0">
              <div>
                <h2 className="text-[15px] font-extrabold text-slate-800 tracking-tight leading-none">
                  {step === 1 ? "Company & Employee Details" : "Access Permissions"}
                </h2>
                <p className="text-[12px] font-medium text-slate-500 mt-1 leading-none">
                  {step === 1
                    ? "Fill in the required information below"
                    : "Select permissions to grant this company"}
                </p>
              </div>
              <button
                onClick={handleCloseRequest}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors flex-shrink-0"
              >
                <X size={14} />
              </button>
            </div>

            {/* Step 2: bulk action toolbar */}
            {step === 2 && (
              <div className="flex items-center justify-between px-7 py-3 border-b border-slate-100 bg-slate-50/70 flex-shrink-0">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[12px] font-semibold text-blue-800">
                    <span className="font-bold">{totalActive}</span>
                    <span className="text-blue-500 font-medium"> / {totalPerms}</span> active
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={grantAll}
                    className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg
                      bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-colors"
                  >
                    <Zap size={10} /> Grant All
                  </button>
                  <button
                    type="button"
                    onClick={revokeAll}
                    className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg
                      bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 transition-colors"
                  >
                    <Ban size={10} /> Revoke All
                  </button>
                </div>
              </div>
            )}

            {submitError && (
              <div className="mx-7 mt-4 flex items-center gap-2.5 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-[12px] text-rose-700 font-semibold">
                <AlertCircle size={14} className="flex-shrink-0 text-rose-500" />
                {submitError}
                <button onClick={() => setSubmitError(null)} className="ml-auto text-rose-400 hover:text-rose-600">
                  <X size={12} />
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto" ref={formRef}>

              {/* ══ STEP 1 ══ */}
              {step === 1 && (
                <form onSubmit={(e) => e.preventDefault()} className="px-7 py-6 space-y-8">
                  <div>
                    <SectionHead color="bg-blue-500" label="Company Information" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {COMPANY_FIELDS.map((f) => (
                        <Field
                          key={f.key}
                          def={f}
                          value={formData.company[f.key]}
                          onChange={(val) => handleInputChange("company", f.key, val)}
                          error={errors[f.key]}
                        />
                      ))}
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-[.08em] text-slate-500 mb-1.5">
                          Status
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setIsDirty(true);
                            handleInputChange("company", "is_active", !formData.company.is_active);
                          }}
                          className={`
                            w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border
                            text-[13px] font-semibold transition-all
                            ${formData.company.is_active
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : "bg-slate-50 border-slate-200 text-slate-600"}
                          `}
                        >
                          {formData.company.is_active
                            ? <ToggleRight size={18} className="text-emerald-500" />
                            : <ToggleLeft  size={18} className="text-slate-400"   />
                          }
                          {formData.company.is_active ? "Active" : "Inactive"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <SectionHead color="bg-sky-500" label="Employee Access" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {visibleEmployeeFields.map((f) => (
                        <Field
                          key={f.key}
                          def={f}
                          value={formData[f.key]}
                          onChange={(val) => handleInputChange("employee", f.key, val)}
                          error={errors[f.key]}
                          optional={mode === "edit"}
                        />
                      ))}
                      {mode === "create" ? (
                        <Field
                          def={{ key: "employee_password", label: "Password", icon: KeyRound, type: "password" }}
                          value={formData.employee_password}
                          onChange={(val) => handleInputChange("employee", "employee_password", val)}
                          error={errors.employee_password}
                        />
                      ) : (
                        <div className="flex flex-col">
                          <label className="block text-[11px] font-semibold uppercase tracking-[.08em] text-slate-500 mb-1.5">
                            Password
                          </label>
                          {!showChangePwd ? (
                            <button
                              type="button"
                              onClick={() => setShowChangePwd(true)}
                              className="w-full flex items-center gap-2 px-3 py-2.5
                                text-[13px] font-semibold text-blue-700
                                bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
                            >
                              <KeyRound size={14} /> Change password
                              <ChevronDown size={13} className="ml-auto" />
                            </button>
                          ) : (
                            <Field
                              def={{ key: "employee_password", label: "New Password", icon: KeyRound, type: "password" }}
                              value={formData.employee_password}
                              onChange={(val) => handleInputChange("employee", "employee_password", val)}
                              error={errors.employee_password}
                              optional={false}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <SectionHead color="bg-blue-400" label="Location on Map" />
                    <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                      <CompanyAddressMap
                        formData={formData.company}
                        setFormData={setCompanyData}
                        isReadOnly={false}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 pb-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="inline-flex items-center gap-2 px-6 py-2.5
                        bg-blue-600 hover:bg-blue-700 active:scale-[.97]
                        text-white text-[13px] font-bold rounded-xl
                        shadow-md shadow-blue-200 transition-all"
                    >
                      Next Step <ArrowRight size={15} />
                    </button>
                  </div>
                </form>
              )}

              {/* ══ STEP 2 — Permissions ══ */}
              {step === 2 && (
                <form onSubmit={handleSubmit} className="px-7 py-6 space-y-5">
                  {permissionsLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
                      <div className="w-9 h-9 rounded-full border-2 border-blue-300 border-t-blue-600 animate-spin" />
                      <p className="text-[13px] font-medium">Loading permissions…</p>
                    </div>
                  ) : Object.keys(formData.permissions).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                      <Shield size={36} className="text-slate-200" />
                      <p className="text-[13px] font-medium text-slate-500">No permissions available</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {Object.entries(formData.permissions).map(([module, actions]) => (
                        <PermCard
                          key={module}
                          module={module}
                          actions={actions}
                          onChange={handlePermissionChange}
                        />
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 pb-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="inline-flex items-center gap-2 px-5 py-2.5
                        bg-white hover:bg-slate-50 active:scale-[.97]
                        text-slate-700 text-[13px] font-bold
                        border border-slate-200 rounded-xl transition-all"
                    >
                      <ArrowLeft size={15} /> Back
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-6 py-2.5
                        bg-blue-600 hover:bg-blue-700 active:scale-[.97]
                        text-white text-[13px] font-bold rounded-xl
                        shadow-md shadow-blue-200 transition-all"
                    >
                      <Save size={14} />
                      {mode === "create" ? "Create Company" : "Save Changes"}
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EntityModal;
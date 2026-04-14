// src/companies/CompanyCard.jsx
import React, { useState, useMemo, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Building2, Truck, MapPin, Shield, Edit2, Power,
  Link2, Users, UserPlus, AlertTriangle, XCircle, CalendarDays,
} from "lucide-react";
import AssignEntityModal from "@components/modals/AssignEntityModal";
import { toggleCompanyStatusThunk } from "../redux/features/company/companyThunks";
import { fetchVendorsThunk } from "../redux/features/vendors/vendorThunk";

// ── Helpers ────────────────────────────────────────────────────────────────
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return isNaN(date.getTime())
    ? "N/A"
    : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const getInitials = (name = "") =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");

// ── Tooltip action button ──────────────────────────────────────────────────
const ActionBtn = ({ onClick, tooltip, colorClass, children, wide = false }) => (
  <button
    type="button"
    onClick={onClick}
    title={tooltip}
    aria-label={tooltip}
    className={`relative group/tip flex items-center justify-center gap-1
      flex-shrink-0 border transition-all duration-150 rounded-md
      ${wide ? "px-2.5 h-7 text-[11px] font-bold" : "w-7 h-7"}
      ${colorClass}`}
  >
    {children}
    <span className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2
      -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white text-[10px]
      font-semibold px-2 py-1 rounded-md opacity-0 group-hover/tip:opacity-100
      transition-opacity z-20">
      {tooltip}
      <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
    </span>
  </button>
);

// ── Vendor chips ───────────────────────────────────────────────────────────
const VendorChips = ({ vendors, loading, error }) => {
  if (loading)
    return (
      <div className="flex items-center gap-1.5 text-slate-400">
        <div className="w-3 h-3 border-2 border-slate-200 border-t-blue-400 rounded-full animate-spin" />
        <span className="text-[11px]">Loading…</span>
      </div>
    );
  if (error)
    return (
      <div className="flex items-center gap-1.5 text-rose-500">
        <XCircle className="w-3 h-3" />
        <span className="text-[11px]">Error loading vendors</span>
      </div>
    );
  if (!vendors.length)
    return <span className="text-[11px] text-slate-400 italic">No vendors assigned</span>;

  const unique = Array.from(
    new Map(vendors.map((v) => [v.vendor_id ?? v.name, v])).values()
  );
  return (
    <div className="flex flex-wrap gap-1.5">
      {unique.map((vendor, i) => (
        <span
          key={vendor.vendor_id ?? i}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full
            text-[10px] font-semibold border
            ${vendor.is_active
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-slate-100 border-slate-200 text-slate-500"
            }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0
            ${vendor.is_active ? "bg-emerald-500" : "bg-slate-400"}`} />
          <Truck className="w-2.5 h-2.5 flex-shrink-0" />
          {vendor.name}
        </span>
      ))}
    </div>
  );
};

// ── Main CompanyCard ───────────────────────────────────────────────────────
const CompanyCard = ({
  company,
  vendors = [],
  vendorsLoading,
  vendorsError,
  onEditCompany,
  isSuperAdmin = false,
}) => {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const isToggling = useRef(false);

  const [isActive,               setIsActive]               = useState(company.is_active);
  const [toggleError,            setToggleError]            = useState(null);
  const [isAssignOpen,           setAssignOpen]             = useState(false);
  const [locallyAssignedVendors, setLocallyAssignedVendors] = useState([]);

  const companyVendorsList = useMemo(() => {
    const fromProps = vendors.filter((v) => v.tenant_id === company.tenant_id);
    const merged    = [...fromProps, ...locallyAssignedVendors];
    return Array.from(new Map(merged.map((v) => [v.vendor_id, v])).values());
  }, [vendors, company.tenant_id, locallyAssignedVendors]);

  const handleToggle = async () => {
    if (isToggling.current) return;
    isToggling.current = true;
    setToggleError(null);
    const newStatus = !isActive;
    setIsActive(newStatus);
    try {
      await dispatch(toggleCompanyStatusThunk({ tenant_id: company.tenant_id })).unwrap();
    } catch (err) {
      console.error("Failed to toggle status:", err);
      setIsActive(!newStatus);
      setToggleError("Failed to update status. Please try again.");
      setTimeout(() => setToggleError(null), 3000);
    } finally {
      isToggling.current = false;
    }
  };

  // ── Navigate to existing superadmin pages filtered by tenant_id ─────────
  // Paths match AdminRoutes: /superadmin/teams, /superadmin/role-management
  const handleViewTeams = () =>
    navigate("/superadmin/teams", {
      state: {
        tenant_id:   company.tenant_id,
        companyName: company.name,
      },
    });

  const handleViewRoles = () =>
    navigate("/superadmin/role-management", {
      state: {
        tenant_id:   company.tenant_id,
        companyName: company.name,
      },
    });

  const initials = getInitials(company.name);

  return (
    <>
      <div className={`flex flex-col rounded-2xl overflow-hidden transition-all duration-200
        shadow-sm hover:shadow-lg
        ${isActive
          ? "border border-blue-200 hover:border-blue-300 hover:shadow-blue-100"
          : "border border-rose-200 hover:border-rose-300 hover:shadow-rose-100"
        }`}
      >
        {/* ── Gradient Header ── */}
        <div className={`relative px-4 pt-4 pb-5
          ${isActive
            ? "bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-600"
            : "bg-gradient-to-br from-rose-600 via-rose-500 to-pink-600"
          }`}
        >
          <div className="absolute inset-0 opacity-10"
            style={{backgroundImage:"radial-gradient(circle at 20% 50%, white 1px, transparent 1px),radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",backgroundSize:"24px 24px"}} />

          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1
            rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-300" : "bg-rose-200"}`} />
            <span className="text-[10px] font-bold text-white">{isActive ? "Active" : "Inactive"}</span>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <div className="w-11 h-11 rounded-xl bg-white/20 border border-white/30
              flex items-center justify-center flex-shrink-0">
              {initials
                ? <span className="text-[15px] font-extrabold text-white">{initials}</span>
                : <Building2 className="w-5 h-5 text-white" />
              }
            </div>
            <div className="min-w-0">
              <p className="text-[15px] font-extrabold text-white leading-tight truncate drop-shadow-sm">
                {company.name?.trim() || "Unknown Company"}
              </p>
              <p className="text-[11px] font-medium text-white/70 mt-0.5">
                {company.tenant_id || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 flex flex-col bg-white px-4 pt-3.5 pb-3 gap-3">
          <div className="grid grid-cols-3 gap-1.5">
            <div className="flex items-start gap-1.5 bg-slate-50 rounded-lg px-2.5 py-2 border border-slate-100">
              <MapPin className="w-3 h-3 text-slate-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Address</p>
                <p className="text-[11px] font-semibold text-slate-700 truncate">{company.address || "—"}</p>
              </div>
            </div>
            <div className="flex items-start gap-1.5 bg-slate-50 rounded-lg px-2.5 py-2 border border-slate-100">
              <Shield className="w-3 h-3 text-slate-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Policy</p>
                <p className="text-[11px] font-semibold text-slate-700 truncate">
                  {company.policy_package?.name || `${company.tenant_id}_Default`}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-1.5 bg-slate-50 rounded-lg px-2.5 py-2 border border-slate-100">
              <CalendarDays className="w-3 h-3 text-slate-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Created</p>
                <p className="text-[11px] font-semibold text-slate-700">{formatDate(company.created_at)}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Vendors</p>
            <VendorChips vendors={companyVendorsList} loading={vendorsLoading} error={vendorsError} />
          </div>
        </div>

        {/* ── Toggle error ── */}
        {toggleError && (
          <div className="mx-4 mb-2 flex items-center gap-2 bg-rose-50 border
            border-rose-200 text-rose-600 px-3 py-1.5 rounded-lg text-[11px] font-medium">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            {toggleError}
          </div>
        )}

        {/* ── Actions footer — TWO ROWS ── */}
        <div className={`border-t flex flex-col gap-1.5 px-3 py-2.5
          ${isActive ? "border-blue-100 bg-blue-50/60" : "border-rose-100 bg-rose-50/60"}`}
        >
          {/* Row 1 — Edit · Assign vendor · Deactivate/Activate */}
          <div className="flex items-center gap-1.5">
            <ActionBtn
              tooltip="Edit company"
              onClick={() => onEditCompany?.(company)}
              colorClass="border-blue-200 bg-blue-100 text-blue-700 hover:bg-blue-200"
              wide
            >
              <Edit2 size={13} />
              Edit
            </ActionBtn>

            <ActionBtn
              tooltip="Assign vendor"
              onClick={() => setAssignOpen(true)}
              colorClass="border-amber-200 bg-amber-100 text-amber-700 hover:bg-amber-200"
              wide
            >
              <Link2 size={13} />
              Assign vendor
            </ActionBtn>

            <div className="flex-1" />

            <button
              type="button"
              onClick={handleToggle}
              aria-label={isActive ? "Deactivate" : "Activate"}
              className={`flex items-center gap-1.5 px-2.5 h-7 rounded-md border
                text-[11px] font-bold transition-colors flex-shrink-0
                ${isActive
                  ? "border-rose-200 bg-rose-100 text-rose-700 hover:bg-rose-200"
                  : "border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                }`}
            >
              <Power size={12} />
              {isActive ? "Deactivate" : "Activate"}
            </button>
          </div>

          {/* Row 2 — Roles · Teams (navigate to existing pages) */}
          <div className="flex items-center gap-1.5">
            <ActionBtn
              tooltip="Opens RoleManagement filtered by this company"
              onClick={handleViewRoles}
              colorClass="border-purple-200 bg-purple-100 text-purple-700 hover:bg-purple-200"
              wide
            >
              <Shield size={13} />
              Roles
            </ActionBtn>

            <ActionBtn
              tooltip="Opens TeamManagement filtered by this company"
              onClick={handleViewTeams}
              colorClass="border-teal-200 bg-teal-100 text-teal-700 hover:bg-teal-200"
              wide
            >
              <Users size={13} />
              Teams
            </ActionBtn>
          </div>
        </div>
      </div>

      {/* ── Assign vendor modal (only modal needed here) ── */}
      <AssignEntityModal
        isOpen={isAssignOpen}
        onClose={() => setAssignOpen(false)}
        sourceEntity={{ id: company.tenant_id, type: "company", tenant_id: company.tenant_id }}
        targetEntities={vendors}
        assignedIds={companyVendorsList.map((v) => v.vendor_id)}
        onSaveSuccess={(newVendor) => {
          setLocallyAssignedVendors((prev) => {
            if (prev.some((v) => v.vendor_id === newVendor.vendor_id)) return prev;
            return [...prev, newVendor];
          });
          dispatch(fetchVendorsThunk());
        }}
      />
    </>
  );
};

export default CompanyCard;
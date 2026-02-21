// src/companies/CompanyCard.jsx
import React, { useState, useMemo, useRef } from "react";
import { useDispatch } from "react-redux";
import {
  Building2,
  Truck,
  Mail,
  Phone,
  MapPin,
  Link2,
  Edit2,
  Power,
  CheckCircle2,
  XCircle,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import AssignEntityModal from "@components/modals/AssignEntityModal";
import { toggleCompanyStatusThunk } from "../redux/features/company/companyThunks";
import { fetchVendorsThunk } from "../redux/features/vendors/vendorThunk";

// ✅ Fix #8 (minor): Moved outside component — no longer recreated on every render
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return isNaN(date.getTime())
    ? "N/A"
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

// ---------------------------------------------------------------------------
// CompanyVendorsList — sub-component
// ---------------------------------------------------------------------------
const CompanyVendorsList = ({ vendors, loading, error }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="flex items-center gap-2 text-gray-400">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="text-center text-red-500">
          <XCircle className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">Error loading vendors</p>
        </div>
      </div>
    );
  }

  if (!vendors.length) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="text-center text-gray-400">
          <Truck className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">No vendors assigned</p>
        </div>
      </div>
    );
  }

  // ✅ Fix #7: Log warning for vendors missing vendor_id; keep name as last-resort fallback
  const uniqueVendors = Array.from(
    new Map(
      vendors.map((v) => {
        if (!v.vendor_id) {
          console.warn("[CompanyVendorsList] Vendor missing vendor_id:", v);
        }
        return [v.vendor_id ?? v.name, v];
      })
    ).values()
  );

  return (
    <div className="space-y-2 h-32 overflow-y-auto">
      {uniqueVendors.map((vendor, index) => (
        <div
          key={`vendor-${vendor.vendor_id ?? index}`}
          className="group relative bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 p-3 rounded-lg border border-green-100 transition-all duration-200"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate mb-1">
                {vendor.name}
              </p>
              <div className="flex items-center gap-1">
                <Truck className="w-3 h-3 text-gray-600" />
                <p className="text-xs text-gray-600 truncate">
                  ID: {vendor.vendor_id || "N/A"}
                </p>
              </div>
            </div>
            <span
              className={`flex-shrink-0 px-2.5 py-1 text-xs font-semibold rounded-full ${
                vendor.is_active
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {vendor.is_active ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

// ---------------------------------------------------------------------------
// CompanyCard — main component
// ---------------------------------------------------------------------------

// ✅ Fix #5: Uses vendors/vendorsLoading/vendorsError props from CompanyList
// instead of calling useSelector directly — no Redux coupling needed here
const CompanyCard = ({
  company,
  vendors = [],
  vendorsLoading,
  vendorsError,
  onEditCompany,
}) => {
  const dispatch = useDispatch();

  // ✅ Fix #2: isActive initialized once from props; useEffect no longer overwrites it
  const [isActive, setIsActive] = useState(company.is_active);

  // ✅ Fix #3: Ref-based in-flight guard — no extra re-render on toggle
  const isToggling = useRef(false);

  // ✅ Fix #4: Local error state for toggle failure feedback
  const [toggleError, setToggleError] = useState(null);

  const [isAssignOpen, setAssignOpen] = useState(false);

  // ✅ Fix #1 + Fix #6: Only track vendors added locally before Redux re-syncs.
  // After onSaveSuccess we dispatch a re-fetch so Redux becomes the source of truth.
  // locallyAssignedVendors is only a short-lived optimistic buffer.
  const [locallyAssignedVendors, setLocallyAssignedVendors] = useState([]);

  // ✅ Fix #1: Derive vendor list from props (no redundant state mirror)
  // Merge Redux-sourced vendors with any locally added ones, then deduplicate
  const companyVendorsList = useMemo(() => {
    const fromProps = vendors.filter((v) => v.tenant_id === company.tenant_id);
    const merged = [...fromProps, ...locallyAssignedVendors];
    return Array.from(new Map(merged.map((v) => [v.vendor_id, v])).values());
  }, [vendors, company.tenant_id, locallyAssignedVendors]);

  // ✅ Fix #3 + Fix #4: Toggle with double-click guard and user-facing error
  const handleToggle = async () => {
    if (isToggling.current) return;
    isToggling.current = true;
    setToggleError(null);

    const newStatus = !isActive;
    setIsActive(newStatus);

    try {
      await dispatch(
        toggleCompanyStatusThunk({ tenant_id: company.tenant_id })
      ).unwrap();
    } catch (err) {
      console.error("Failed to toggle status:", err);
      setIsActive(!newStatus); // rollback optimistic update
      setToggleError("Failed to update status. Please try again.");
      setTimeout(() => setToggleError(null), 3000); // auto-dismiss
    } finally {
      isToggling.current = false;
    }
  };

  const handleOpenAssign = () => setAssignOpen(true);

  return (
    <>
      <div
        className={`relative group flex flex-col h-full rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white border-2 ${
          isActive
            ? "border-gray-200 hover:border-blue-300"
            : "border-red-200 hover:border-red-300"
        }`}
      >
        {/* Status Badge - Floating */}
        <div className="absolute top-4 right-4 z-10">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm ${
              isActive
                ? "bg-green-100/90 text-green-700 border border-green-300"
                : "bg-red-100/90 text-red-700 border border-red-300"
            }`}
          >
            {isActive ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active</span>
              </>
            ) : (
              <>
                <XCircle className="w-3.5 h-3.5" />
                <span>Inactive</span>
              </>
            )}
          </div>
        </div>

        {/* Header Section */}
        <div
          className={`relative p-6 ${
            isActive
              ? "bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600"
              : "bg-gradient-to-br from-red-500 via-red-600 to-rose-600"
          }`}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
          </div>

          <div className="relative flex items-start gap-4">
            <div className="flex-shrink-0 w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 shadow-lg">
              <Building2 className="w-7 h-7 text-white" />
            </div>

            <div className="flex-1 min-w-0 pt-1">
              <h3 className="text-xl font-bold text-white truncate mb-1 drop-shadow-sm">
                {/* ✅ Fix #9 (minor): trim() guards against empty-string names */}
                {company.name?.trim() || "Unknown Company"}
              </h3>
              <p className="text-blue-100 text-xs font-medium">
                Tenant ID: {company.tenant_id || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Contact Details Section */}
        <div className="flex-1 p-6 space-y-3 bg-gradient-to-b from-gray-50 to-white">
          {company.email && (
            <div className="flex items-center gap-3 group/item">
              <div className="flex-shrink-0 w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center group-hover/item:bg-blue-200 transition-colors">
                <Mail className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-medium mb-0.5">Email</p>
                <p className="text-sm text-gray-800 font-medium truncate">
                  {company.email}
                </p>
              </div>
            </div>
          )}

          {company.phone && (
            <div className="flex items-center gap-3 group/item">
              <div className="flex-shrink-0 w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center group-hover/item:bg-green-200 transition-colors">
                <Phone className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-medium mb-0.5">Phone</p>
                <p className="text-sm text-gray-800 font-medium">
                  {company.phone}
                </p>
              </div>
            </div>
          )}

          {company.address && (
            <div className="flex items-start gap-3 group/item">
              <div className="flex-shrink-0 w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center group-hover/item:bg-purple-200 transition-colors mt-0.5">
                <MapPin className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-medium mb-0.5">Address</p>
                <p className="text-sm text-gray-800 font-medium line-clamp-2">
                  {company.address}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 group/item">
            <div className="flex-shrink-0 w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center group-hover/item:bg-orange-200 transition-colors">
              <Calendar className="w-4 h-4 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 font-medium mb-0.5">Onboarded</p>
              <p className="text-sm text-gray-800 font-medium">
                {formatDate(company.created_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Assigned Vendors Section */}
        <div className="px-6 pb-4">
          <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Link2 className="w-4 h-4 text-green-600" />
                </div>
                <h4 className="text-sm font-bold text-gray-800">
                  Assigned Vendors
                </h4>
              </div>
              <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                {companyVendorsList.length}
              </span>
            </div>

            <CompanyVendorsList
              vendors={companyVendorsList}
              loading={vendorsLoading}
              error={vendorsError}
            />
          </div>
        </div>

        {/* Actions Footer */}
        <div className="mt-auto px-6 pb-6 space-y-2">

          {/* ✅ Fix #4: Toggle error banner — auto-dismisses after 3s */}
          {toggleError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-xs">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{toggleError}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* ✅ Fix #1 (minor): aria-label added for accessibility */}
            <button
              onClick={handleToggle}
              aria-label={isActive ? "Deactivate company" : "Activate company"}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 shadow-md hover:shadow-lg ${
                isActive
                  ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                  : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
              }`}
              title={isActive ? "Deactivate Company" : "Activate Company"}
            >
              <Power className="w-4 h-4" />
              {isActive ? "Deactivate" : "Activate"}
            </button>

            <button
              onClick={() => onEditCompany?.(company)}
              aria-label="Edit company"
              className="p-2.5 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
              title="Edit Company"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleOpenAssign}
              disabled={!isActive}
              aria-label="Assign vendor to company"
              className="p-2.5 bg-green-100 hover:bg-green-200 text-green-600 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              title="Assign Vendor"
            >
              <Link2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Inactive Overlay */}
        {!isActive && (
          <div className="absolute inset-0 bg-red-50/30 backdrop-blur-[1px] pointer-events-none rounded-2xl"></div>
        )}
      </div>

      {/* Assign Modal */}
      <AssignEntityModal
        isOpen={isAssignOpen}
        onClose={() => setAssignOpen(false)}
        sourceEntity={{
          id: company.tenant_id,
          type: "company",
          tenant_id: company.tenant_id,
        }}
        targetEntities={vendors}
        assignedIds={companyVendorsList.map((v) => v.vendor_id)}
        onSaveSuccess={(newVendor) => {
          // ✅ Fix #6: Optimistically add to local buffer; then re-fetch so Redux
          // becomes the single source of truth and local buffer can be cleared
          setLocallyAssignedVendors((prev) => {
            if (prev.some((v) => v.vendor_id === newVendor.vendor_id))
              return prev;
            return [...prev, newVendor];
          });
          dispatch(fetchVendorsThunk()); // sync Redux — will clear local buffer via memo
        }}
      />
    </>
  );
};

export default CompanyCard;
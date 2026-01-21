import React, { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Truck,
  Users,
  Phone,
  Mail,
  MapPin,
  Building2,
  Pencil,
  Trash2,
} from "lucide-react";
import { toggleVendorStatusThunk } from "../../redux/features/vendors/vendorThunk";
import ReusableButton from "../ui/ReusableButton";

const AssignedCompaniesList = ({ companies, loading, error }) => {
  if (loading && !companies.length) {
    return (
      <div className="text-center py-4 text-app-text-muted text-sm flex-1 flex items-center justify-center">
        Loading companies...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-400 text-sm flex-1 flex items-center justify-center">
        Error loading companies
      </div>
    );
  }

  if (!companies.length) {
    return (
      <div className="text-center py-4 text-app-text-muted text-sm flex-1 flex items-center justify-center">
        <div>
          <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
          No company assigned yet
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-2">
      {companies.map((company, index) => (
        <div
          key={company.id || `${company.name}-${index}`}
          className="flex items-center justify-between p-2 bg-app-tertiary rounded-lg hover:bg-blue-50 transition-colors"
        >
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-app-text-primary truncate">
              {company.name}
            </span>
            <span className="text-xs text-app-text-secondary truncate">
              {company.email}
            </span>
            <span className="text-xs text-app-text-secondary truncate">
              {company.phone}
            </span>
          </div>
          <span className="px-2 py-1 bg-sidebar-tertiary text-sidebar-primary text-xs font-medium rounded-full ml-2 flex-shrink-0">
            Partner
          </span>
        </div>
      ))}
    </div>
  );
};

const NewVendorCard = ({
  vendor = {},
  onAssignEntity,
  onDeleteVendor,
  onEditVendor,
}) => {
  const dispatch = useDispatch();
  const [isActive, setIsActive] = useState(vendor.is_active);

  // ✅ Update local toggle if vendor prop changes externally
  useEffect(() => {
    setIsActive(vendor.is_active);
  }, [vendor.is_active]);

  // ✅ Handle Toggle API + visual
  const handleToggle = async () => {
    const newStatus = !isActive;
    setIsActive(newStatus); // instant UI feedback
    dispatch(
      toggleVendorStatusThunk({
        vendorId: vendor.vendor_id,
        tenant_id: vendor.tenant_id,
      })
    );
  };

  // ✅ Company list setup
  const companyState = useSelector((state) => state.company || {});
  const allCompanies = useMemo(
    () => companyState.data || [],
    [companyState.data]
  );

  const tenantCompany = useMemo(
    () =>
      vendor.tenant_id
        ? allCompanies.filter((c) => c.tenant_id === vendor.tenant_id)
        : [],
    [allCompanies, vendor.tenant_id]
  );

  const companiesLoading = companyState.loading;
  const vendorCompaniesError = companyState.error;

  // ✅ Card styling based on active status - using your theme colors
  const cardBorderColor = isActive ? "border-app-border" : "border-red-300";
  const cardBackground = isActive ? "bg-app-surface" : "bg-red-50";
  const cardHeaderGradient = isActive
    ? "bg-gradient-to-r from-sidebar-primary to-sidebar-secondary"
    : "bg-gradient-to-r from-red-500 to-red-600";

  // ✅ Better readable date
  const onboardedDate = vendor.created_at
    ? new Date(vendor.created_at).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "N/A";

  return (
    <div
      className={`relative rounded-xl shadow-md border ${cardBorderColor} ${cardBackground} hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-[440px] group`}
    >
      {/* Header with gradient */}
      <div
        className={`${cardHeaderGradient} p-4 text-white flex-shrink-0 relative`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Truck className="w-6 h-6 text-white" />
            <h3 className="text-lg font-semibold truncate text-white">
              {vendor.name || "N/A"}
            </h3>
          </div>
          {/* Status indicator */}
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isActive ? "bg-green-400" : "bg-red-400"
              }`}
            ></div>
            <span className="text-sm font-medium">
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>

      {/* Vendor Details */}
      <div className="p-4 space-y-3 flex-shrink-0">
        <div className="flex items-center text-sm text-app-text-secondary group-hover:text-app-text-primary transition-colors">
          <Mail className="w-4 h-4 mr-2 text-sidebar-secondary" />
          <span className="truncate">{vendor.email || "N/A"}</span>
        </div>
        <div className="flex items-center text-sm text-app-text-secondary group-hover:text-app-text-primary transition-colors">
          <Phone className="w-4 h-4 mr-2 text-sidebar-secondary" />
          <span>{vendor.phone || "N/A"}</span>
        </div>
        <div className="flex items-center text-sm text-app-text-secondary group-hover:text-app-text-primary transition-colors">
          <Users className="w-4 h-4 mr-2 text-sidebar-secondary" />
          <span>{vendor.fleetSize ?? 0} vehicles</span>
        </div>
        <div className="flex items-start text-sm text-app-text-secondary group-hover:text-app-text-primary transition-colors">
          <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-sidebar-secondary" />
          <span className="line-clamp-2">{vendor.address || "N/A"}</span>
        </div>
      </div>

      {/* Assigned Company / Tenant */}
      <div className="pt-3 border-t border-app-border flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-2 px-4 flex-shrink-0">
          <div className="flex items-center text-sm font-medium text-app-text-primary">
            <Building2 className="w-4 h-4 mr-2 text-sidebar-secondary" />
            Tenant Company
          </div>
          <span
            className={`px-2 py-1 text-xs rounded-full font-medium ${
              isActive
                ? "bg-sidebar-tertiary text-sidebar-primary"
                : "bg-red-100 text-red-800"
            }`}
          >
            {tenantCompany.length}
          </span>
        </div>

        <AssignedCompaniesList
          companies={tenantCompany}
          loading={companiesLoading}
          error={vendorCompaniesError}
        />
      </div>

      {/* Footer with Actions */}
      <div className="px-4 py-3 bg-app-background border-t border-app-border flex justify-between items-center flex-shrink-0">
        <div className="flex flex-col">
          <span className="text-xs text-app-text-muted">Onboarded</span>
          <span className="text-sm font-semibold text-app-text-primary">
            {onboardedDate}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Status Button */}
          <button
            onClick={handleToggle}
            className={`px-3 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 font-medium text-sm ${
              isActive
                ? "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300"
                : "bg-green-50 hover:bg-green-100 text-green-600 border border-green-200 hover:border-green-300"
            }`}
            title={isActive ? "Deactivate Vendor" : "Activate Vendor"}
          >
            {isActive ? "Deactivate" : "Activate"}
          </button>

          {/* Edit Button */}
          <ReusableButton
            className="text-sidebar-primary hover:text-sidebar-secondary hover:bg-sidebar-tertiary"
            module="vendor"
            action="update"
            icon={Pencil}
            title="Edit"
            onClick={() => onEditVendor?.(vendor)}
            size={16}
            variant="ghost"
          />

          {/* Delete Button */}
          <ReusableButton
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
            module="vendor"
            action="delete"
            icon={Trash2}
            title="Delete"
            onClick={() => onDeleteVendor?.(vendor)}
            size={16}
            variant="ghost"
          />
        </div>
      </div>

      {/* ✅ Inactive Overlay Indicator */}
      {!isActive && (
        <div className="absolute inset-0 border-2 border-red-300 rounded-xl pointer-events-none opacity-70"></div>
      )}
    </div>
  );
};

export default NewVendorCard;

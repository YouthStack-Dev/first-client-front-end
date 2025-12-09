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
  Power,
  PowerOff,
} from "lucide-react";
import { toggleVendorStatusThunk } from "../../redux/features/vendors/vendorThunk";

const AssignedCompaniesList = ({ companies, loading, error }) => {
  if (loading && !companies.length) {
    return (
      <div className="text-center py-4 text-gray-400 text-sm flex-1 flex items-center justify-center">
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
      <div className="text-center py-4 text-gray-400 text-sm flex-1 flex items-center justify-center">
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
          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
        >
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-gray-800 truncate">
              {company.name}
            </span>
            <span className="text-xs text-gray-500 truncate">
              {company.email}
            </span>
            <span className="text-xs text-gray-500 truncate">
              {company.phone}
            </span>
          </div>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full ml-2 flex-shrink-0">
            Partner
          </span>
        </div>
      ))}
    </div>
  );
};

const VendorCard = ({ vendor = {}, onAssignEntity, onDeleteVendor }) => {
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

  const statusText = isActive ? "Active" : "Inactive";
  const statusColor = isActive
    ? "bg-green-700 text-white"
    : "bg-red-600 text-white";

  // ✅ Better readable date
  const onboardedDate = vendor.created_at
    ? new Date(vendor.created_at).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "N/A";

  return (
    <div className="relative bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col h-[440px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 text-white flex-shrink-0 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Truck className="w-6 h-6" />
            <h3 className="text-lg font-semibold truncate">
              {vendor.name || "N/A"}
            </h3>
          </div>
          <span className={`px-2 py-1 text-xs rounded-full ${statusColor}`}>
            {statusText}
          </span>
        </div>

        {/* ✅ Sleek Toggle Switch */}
        <button
          onClick={handleToggle}
          className={`absolute top-3 right-3 p-2 rounded-full shadow-lg transition-all duration-300 ${
            isActive
              ? "bg-green-100 hover:bg-green-200"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
          title={isActive ? "Deactivate Vendor" : "Activate Vendor"}
        ></button>
      </div>

      {/* Vendor Details */}
      <div className="p-4 space-y-3 flex-shrink-0">
        <div className="flex items-center text-sm text-gray-600">
          <Mail className="w-4 h-4 mr-2" />
          <span className="truncate">{vendor.email || "N/A"}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Phone className="w-4 h-4 mr-2" />
          <span>{vendor.phone || "N/A"}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Users className="w-4 h-4 mr-2" />
          <span>{vendor.fleetSize ?? 0} vehicles</span>
        </div>
        <div className="flex items-start text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2">{vendor.address || "N/A"}</span>
        </div>
      </div>

      {/* Assigned Company / Tenant */}
      <div className="pt-3 border-t border-gray-100 flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-2 px-4 flex-shrink-0">
          <div className="flex items-center text-sm font-medium text-gray-700">
            <Building2 className="w-4 h-4 mr-2" />
            Tenant Company
          </div>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {tenantCompany.length}
          </span>
        </div>

        <AssignedCompaniesList
          companies={tenantCompany}
          loading={companiesLoading}
          error={vendorCompaniesError}
        />
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center flex-shrink-0">
        <span className="text-sm font-semibold text-gray-700">
          {onboardedDate}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onAssignEntity?.(vendor)}
            className="p-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors"
            title="Edit Vendor"
          >
            <Pencil className="w-4 h-4" />
          </button>
          {/* <button
            onClick={() => onDeleteVendor?.(vendor)}
            className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
            title="Delete Vendor"
          >
            <Trash2 className="w-4 h-4" />
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default VendorCard;

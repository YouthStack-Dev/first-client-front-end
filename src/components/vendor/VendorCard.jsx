import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { Truck, Users, Phone, Mail, MapPin, Building2, Pencil } from "lucide-react"; // ✅ Added Pencil for edit icon

// List component for showing vendor's company/tenant
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
          key={company.id || `${company.name}-${index}`} // ✅ Unique key
          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
        >
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-gray-800 truncate">
              {company.name}
            </span>
            <span className="text-xs text-gray-500 truncate">{company.email}</span>
            <span className="text-xs text-gray-500 truncate">{company.phone}</span>
          </div>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full ml-2 flex-shrink-0">
            Partner
          </span>
        </div>
      ))}
    </div>
  );
};

const VendorCard = ({ vendor = {}, onAssignEntity }) => {
  const companyState = useSelector((state) => state.company || {});
  const allCompanies = useMemo(() => companyState.data || [], [companyState.data]);

  // Find the company/tenant this vendor belongs to
  const tenantCompany = useMemo(
    () =>
      vendor.tenant_id
        ? allCompanies.filter((c) => c.tenant_id === vendor.tenant_id)
        : [],
    [allCompanies, vendor.tenant_id]
  );

  const companiesLoading = companyState.loading;
  const vendorCompaniesError = companyState.error;

  const statusText = vendor.is_active ? "Active" : "Inactive";
  const statusColor = vendor.is_active
    ? "bg-green-800 text-white"
    : "bg-red-600 text-white";

  const onboardedDate = vendor.created_at
    ? new Date(vendor.created_at).toLocaleDateString()
    : "N/A";

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col h-[420px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 text-white flex-shrink-0">
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
        {/* ✅ Date in bold, no "Since:" */}
        <span className="text-sm font-semibold text-gray-700">
          {onboardedDate}
        </span>

        {/* ✅ Replaced button with icon */}
        <button
          onClick={() => onAssignEntity?.(vendor)}
          className="p-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors"
          title="Edit Vendor"
        >
          <Pencil className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default VendorCard;

import React, { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Truck,
  Building2,
  Pencil,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Power,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toggleVendorStatusThunk } from "../../redux/features/vendors/vendorThunk";

const AssignedCompaniesList = ({ companies, loading, error }) => {
  if (loading && !companies.length) {
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
          <p className="text-sm">Error loading companies</p>
        </div>
      </div>
    );
  }

  if (!companies.length) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="text-center text-gray-400">
          <Building2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">No company assigned</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-32 overflow-y-auto">
      {companies.map((company, index) => (
        <div
          key={company.id || `${company.name}-${index}`}
          className="group relative bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 p-3 rounded-lg border border-blue-100 transition-all duration-200"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate mb-1">
                {company.name}
              </p>
              <div className="space-y-0.5">
                {company.email && (
                  <p className="text-xs text-gray-600 truncate flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {company.email}
                  </p>
                )}
                {company.phone && (
                  <p className="text-xs text-gray-600 truncate flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {company.phone}
                  </p>
                )}
              </div>
            </div>
            <span className="flex-shrink-0 px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
              Partner
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

const NewVendorCard = ({
  vendor = {},
  company = null,
  onAssignEntity,
  onDeleteVendor,
  onEditVendor,
}) => {
  const dispatch = useDispatch();
const isActive = vendor.is_active;


  const handleToggle = async () => {
    const newStatus = !isActive;
    dispatch(
      toggleVendorStatusThunk({
        vendorId: vendor.vendor_id,
        tenant_id: vendor.tenant_id,
      })
    );
  };

  // Company list setup
  const companyState = useSelector((state) => state.company || {});
  const allCompanies = useMemo(
    () => companyState.data || [],
    [companyState.data]
  );

  const tenantCompany = useMemo(
    () =>
      vendor.tenant_id
        ? allCompanies.filter((c) => c.tenant_id === vendor.tenant_id)
        : company
        ? [company]
        : [],
    [allCompanies, vendor.tenant_id, company]
  );

  const companiesLoading = companyState.loading;
  const vendorCompaniesError = companyState.error;

  const onboardedDate = vendor.created_at
    ? new Date(vendor.created_at).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "N/A";

  return (
    <div
      className={`relative group rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white border-2 ${
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
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
        </div>

        <div className="relative flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 shadow-lg">
            <Truck className="w-7 h-7 text-white" />
          </div>

          {/* Vendor Name */}
          <div className="flex-1 min-w-0 pt-1">
            <h3 className="text-xl font-bold text-white truncate mb-1 drop-shadow-sm">
              {vendor.name || "Unknown Vendor"}
            </h3>
            <p className="text-blue-100 text-xs font-medium">
              Vendor ID: {vendor.vendor_id || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Contact Details Section */}
      <div className="p-6 space-y-3 bg-gradient-to-b from-gray-50 to-white">
        {/* Email */}
        <div className="flex items-center gap-3 group/item">
          <div className="flex-shrink-0 w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center group-hover/item:bg-blue-200 transition-colors">
            <Mail className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 font-medium mb-0.5">Email</p>
            <p className="text-sm text-gray-800 font-medium truncate">
              {vendor.email || "N/A"}
            </p>
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-center gap-3 group/item">
          <div className="flex-shrink-0 w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center group-hover/item:bg-green-200 transition-colors">
            <Phone className="w-4 h-4 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 font-medium mb-0.5">Phone</p>
            <p className="text-sm text-gray-800 font-medium">
              {vendor.phone || "N/A"}
            </p>
          </div>
        </div>

        {/* Onboarded Date */}
        <div className="flex items-center gap-3 group/item">
          <div className="flex-shrink-0 w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center group-hover/item:bg-purple-200 transition-colors">
            <Calendar className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 font-medium mb-0.5">
              Onboarded
            </p>
            <p className="text-sm text-gray-800 font-medium">{onboardedDate}</p>
          </div>
        </div>
      </div>

      {/* Assigned Companies Section */}
      <div className="px-6 pb-4">
        <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-indigo-600" />
              </div>
              <h4 className="text-sm font-bold text-gray-800">
                Assigned Companies
              </h4>
            </div>
            <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
              {tenantCompany.length}
            </span>
          </div>

          <AssignedCompaniesList
            companies={tenantCompany}
            loading={companiesLoading}
            error={vendorCompaniesError}
          />
        </div>
      </div>

      {/* Actions Footer */}
      <div className="px-6 pb-6 flex items-center gap-2">
        {/* Toggle Status */}
        <button
          onClick={handleToggle}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 shadow-md hover:shadow-lg ${
            isActive
              ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
              : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
          }`}
          title={isActive ? "Deactivate Vendor" : "Activate Vendor"}
        >
          <Power className="w-4 h-4" />
          {isActive ? "Deactivate" : "Activate"}
        </button>

        {/* Edit Button */}
        <button
          onClick={() => onEditVendor?.(vendor)}
          className="p-2.5 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
          title="Edit Vendor"
        >
          <Pencil className="w-4 h-4" />
        </button>

        {/* Delete Button */}
        <button
          onClick={() => onDeleteVendor?.(vendor)}
          className="p-2.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
          title="Delete Vendor"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Inactive Overlay */}
      {!isActive && (
        <div className="absolute inset-0 bg-red-50/30 backdrop-blur-[1px] pointer-events-none rounded-2xl"></div>
      )}
    </div>
  );
};

export default NewVendorCard;
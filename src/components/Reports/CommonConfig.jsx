import React from "react";
import SearchableSelect from "./SearchableSelect";

const CommonFilters = ({
  formData,
  handleChange,
  errors,
  loading,
  showTenant = true,
  showShift = false,
  showVendor = false,
  tenants = [],
  tenantsLoading = false,
  shifts = [],
  vendors = [],
  fetchShiftsLoading = false,
  fetchVendorsLoading = false,
  isSuperAdmin = false,
  currentUserTenant = "",
}) => {
  const handleTenantSelect = (value) => {
    handleChange("tenant_id", value);
    handleChange("shift_id", "");
    handleChange("vendor_id", "");
  };

  const isShiftsDisabled = loading || fetchShiftsLoading;
  const isVendorsDisabled = loading || fetchVendorsLoading;

  return (
    <div className="space-y-4">

      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Start Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            required
            value={formData.start_date}
            onChange={(e) => handleChange("start_date", e.target.value)}
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
              errors.start_date ? "border-red-300 bg-red-50" : "border-gray-300"
            } ${loading ? "bg-gray-100 cursor-not-allowed" : ""}`}
            disabled={loading}
          />
          {errors.start_date && (
            <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            End Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            required
            value={formData.end_date}
            onChange={(e) => handleChange("end_date", e.target.value)}
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
              errors.end_date ? "border-red-300 bg-red-50" : "border-gray-300"
            } ${loading ? "bg-gray-100 cursor-not-allowed" : ""}`}
            disabled={loading}
          />
          {errors.end_date && (
            <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>
          )}
        </div>
      </div>

      {/* Tenant — super admin only */}
      {showTenant && isSuperAdmin && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Tenant{" "}
            <span className="text-gray-400 text-xs font-normal">
              (Super Admin only)
            </span>
          </label>
          <SearchableSelect
            options={tenants}
            value={formData.tenant_id}
            onChange={handleTenantSelect}
            disabled={loading || tenantsLoading}
            placeholder={
              tenantsLoading ? "Loading tenants..." : "Select Tenant"
            }
            className={errors.tenant_id ? "border-red-300 bg-red-50" : ""}
          />
          {!formData.tenant_id && !tenantsLoading && (
            <p className="text-gray-500 text-xs mt-1">
              Select a tenant to filter data
            </p>
          )}
          {errors.tenant_id && (
            <p className="text-red-500 text-xs mt-1">{errors.tenant_id}</p>
          )}
        </div>
      )}

      {/* Current tenant info — non-superadmin */}
      {showTenant && !isSuperAdmin && currentUserTenant && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <svg
              className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-sm text-blue-800 font-medium">
                <strong>Tenant:</strong> {currentUserTenant}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Data is automatically filtered for your tenant.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Warning — super admin no tenant selected */}
      {showTenant && isSuperAdmin && !formData.tenant_id && !tenantsLoading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <svg
              className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-sm text-yellow-800 font-medium">
                Select a Tenant
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                Please select a tenant to filter available data.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Shift */}
      {showShift && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Shift
          </label>
          <SearchableSelect
            options={shifts}
            value={formData.shift_id}
            onChange={(value) => handleChange("shift_id", value)}
            disabled={isShiftsDisabled}
            placeholder={
              fetchShiftsLoading ? "Loading shifts..." : "Select Shift"
            }
            className={errors.shift_id ? "border-red-300 bg-red-50" : ""}
          />
          {errors.shift_id && (
            <p className="text-red-500 text-xs mt-1">{errors.shift_id}</p>
          )}
        </div>
      )}

      {/* Vendor */}
      {showVendor && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Vendor
          </label>
          <SearchableSelect
            options={vendors}
            value={formData.vendor_id}
            onChange={(value) => handleChange("vendor_id", value)}
            disabled={isVendorsDisabled}
            placeholder={
              fetchVendorsLoading ? "Loading vendors..." : "Select Vendor"
            }
            className={errors.vendor_id ? "border-red-300 bg-red-50" : ""}
          />
          {errors.vendor_id && (
            <p className="text-red-500 text-xs mt-1">{errors.vendor_id}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CommonFilters;
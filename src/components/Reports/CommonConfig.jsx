import React from "react";
import SearchableSelect from "./SearchableSelect";
import { logDebug } from "../../utils/logger";

const CommonConfig = ({
  formData,
  handleChange,
  errors,
  loading,
  userType = "admin",
  currentTenant = "",
  onTenantChange,
  tenants = [],
  shifts = [],
  vendors = [],
  fetchShiftsLoading = false,
  fetchVendorsLoading = false,
}) => {
  const isSuperAdmin = userType === "admin";
  const showTenantField = isSuperAdmin;

  // Handle tenant selection with immediate API call
  const handleTenantSelect = (value) => {
    // Update the form data
    handleChange("tenant_id", value);

    // Clear dependent fields when tenant changes
    handleChange("shift_id", "");
    handleChange("vendor_id", "");

    // Immediately trigger the API call for shifts and vendors
    if (onTenantChange && value) {
      onTenantChange(value);
    }
  };

  // Set initial tenant for non-superadmin users on component mount
  React.useEffect(() => {
    if (!isSuperAdmin && currentTenant && !formData.tenant_id) {
      logDebug("Setting initial tenant for non-superadmin:", currentTenant);
      handleChange("tenant_id", currentTenant);
    }
  }, [isSuperAdmin, currentTenant, formData.tenant_id, handleChange]);

  // Static options as fallback
  const staticShiftOptions = [
    { value: "", label: "All Shifts" },
    { value: "1", label: "Shift 1 - Morning (6 AM - 2 PM)" },
    { value: "2", label: "Shift 2 - Afternoon (2 PM - 10 PM)" },
    { value: "3", label: "Shift 3 - Night (10 PM - 6 AM)" },
  ];

  const staticVendorOptions = [
    { value: "", label: "All Vendors" },
    { value: "1", label: "Vendor 1 - Quick Transport Co." },
    { value: "2", label: "Vendor 2 - Safe Rides Inc." },
    { value: "3", label: "Vendor 3 - City Movers Ltd." },
  ];

  // Use dynamic data if available, otherwise static data
  const shiftOptions = shifts.length > 0 ? shifts : staticShiftOptions;
  const vendorOptions = vendors.length > 0 ? vendors : staticVendorOptions;

  // Determine if shift/vendor dropdowns should be disabled
  const isShiftsDisabled =
    loading || fetchShiftsLoading || (isSuperAdmin && !formData.tenant_id);
  const isVendorsDisabled =
    loading || fetchVendorsLoading || (isSuperAdmin && !formData.tenant_id);

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

      {/* Tenant Field - Only for Super Admin */}
      {showTenantField && (
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
            disabled={loading}
            placeholder="Select Tenant"
            className={errors.tenant_id ? "border-red-300 bg-red-50" : ""}
          />

          {/* Loading indicator */}
          {formData.tenant_id &&
            (fetchShiftsLoading || fetchVendorsLoading) && (
              <div className="flex items-center gap-2 mt-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-indigo-600"></div>
                <p className="text-indigo-600 text-xs">
                  Loading shifts and vendors...
                </p>
              </div>
            )}

          {/* Helper text */}
          {!formData.tenant_id && (
            <p className="text-gray-500 text-xs mt-1">
              Select a tenant to load available shifts and vendors
            </p>
          )}

          {errors.tenant_id && (
            <p className="text-red-500 text-xs mt-1">{errors.tenant_id}</p>
          )}
        </div>
      )}

      {/* Shift Field */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Shift
        </label>
        <SearchableSelect
          options={shiftOptions}
          value={formData.shift_id}
          onChange={(value) => handleChange("shift_id", value)}
          disabled={isShiftsDisabled}
          placeholder={
            isShiftsDisabled ? "Select tenant first..." : "Select Shift"
          }
          className={errors.shift_id ? "border-red-300 bg-red-50" : ""}
        />
        {isShiftsDisabled && !fetchShiftsLoading && (
          <p className="text-gray-500 text-xs mt-1">
            {isSuperAdmin && !formData.tenant_id
              ? "Select a tenant to enable shifts"
              : "Loading shifts..."}
          </p>
        )}
        {errors.shift_id && (
          <p className="text-red-500 text-xs mt-1">{errors.shift_id}</p>
        )}
      </div>

      {/* Vendor Field */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Vendor
        </label>
        <SearchableSelect
          options={vendorOptions}
          value={formData.vendor_id}
          onChange={(value) => handleChange("vendor_id", value)}
          disabled={isVendorsDisabled}
          placeholder={
            isVendorsDisabled ? "Select tenant first..." : "Select Vendor"
          }
          className={errors.vendor_id ? "border-red-300 bg-red-50" : ""}
        />
        {isVendorsDisabled && !fetchVendorsLoading && (
          <p className="text-gray-500 text-xs mt-1">
            {isSuperAdmin && !formData.tenant_id
              ? "Select a tenant to enable vendors"
              : "Loading vendors..."}
          </p>
        )}
        {errors.vendor_id && (
          <p className="text-red-500 text-xs mt-1">{errors.vendor_id}</p>
        )}
      </div>

      {/* Display current tenant info for non-superadmin users */}
      {!isSuperAdmin && currentTenant && (
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
                <strong>Current Tenant:</strong> {currentTenant}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Shifts and vendors are automatically filtered for your tenant.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty state when no tenant selected for super admin */}
      {isSuperAdmin && !formData.tenant_id && (
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
                Please select a tenant to view available shifts and vendors.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommonConfig;

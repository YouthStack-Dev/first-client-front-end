import { useState, useEffect } from "react";
import BookingModuleConfig from "./BookingModuleConfig";
import RouteModuleConfig from "./RouteModuleConfig";

const ConfigModal = ({
  isOpen,
  onClose,
  config,
  onSubmit,
  type,
  loading = false,
  error = null,
}) => {
  const [selectedModule, setSelectedModule] = useState("booking"); // "booking" or "route"
  const [formData, setFormData] = useState({
    start_date: "",
    end_date: "",
    tenant_id: "",
    shift_id: "",
    booking_status: [],
    route_status: [],
    vendor_id: "",
    include_unrouted: true,
    // Route-specific fields
    driver_id: "",
    vehicle_type: "",
    include_performance_metrics: false,
    include_route_optimization: false,
  });

  const [errors, setErrors] = useState({});

  // Reset form when modal opens/closes or module changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        start_date: "",
        end_date: "",
        tenant_id: "",
        shift_id: "",
        booking_status: [],
        route_status: [],
        vendor_id: "",
        include_unrouted: true,
        driver_id: "",
        vehicle_type: "",
        include_performance_metrics: false,
        include_route_optimization: false,
      });
      setErrors({});
      // Set default module based on type or config
      if (type === "routes" || config === "route") {
        setSelectedModule("route");
      } else {
        setSelectedModule("booking");
      }
    }
  }, [isOpen, type, config]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Required date validation
    if (!formData.start_date) {
      newErrors.start_date = "Start date is required";
    }
    if (!formData.end_date) {
      newErrors.end_date = "End date is required";
    }

    // Date range validation
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);

      if (start > end) {
        newErrors.end_date = "End date cannot be before start date";
      }

      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 365) {
        newErrors.end_date = "Date range cannot exceed 1 year";
      }
    }

    // Shift ID validation
    if (formData.shift_id && formData.shift_id < 0) {
      newErrors.shift_id = "Shift ID must be a positive number";
    }

    // Vendor ID validation
    if (formData.vendor_id && formData.vendor_id < 0) {
      newErrors.vendor_id = "Vendor ID must be a positive number";
    }

    // Driver ID validation (route module)
    if (
      selectedModule === "route" &&
      formData.driver_id &&
      formData.driver_id < 0
    ) {
      newErrors.driver_id = "Driver ID must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Add module information to form data
      const submitData = {
        ...formData,
        module: selectedModule,
        report_format: selectedModule === "booking" ? "booking" : "route",
      };
      onSubmit(submitData);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when field is updated
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const toggleArrayValue = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  // Select all/none for array fields
  const handleSelectAll = (field, options) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].length === options.length ? [] : options,
    }));
  };

  const isDownload = config === "download";

  // Get report type display name
  const getReportTypeDisplay = () => {
    const reportTypes = {
      bookings: "Bookings",
      routes: "Routes",
      vendors: "Vendors",
      drivers: "Drivers",
      shifts: "Shifts",
    };
    return reportTypes[type] || type;
  };

  // Get module display name
  const getModuleDisplay = () => {
    return selectedModule === "booking" ? "Booking" : "Route";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">
                {isDownload
                  ? `Download ${getReportTypeDisplay()} Report`
                  : `${getReportTypeDisplay()} Analytics`}
              </h2>
              <p className="text-indigo-100 mt-1">
                Configure parameters for your {getModuleDisplay().toLowerCase()}{" "}
                report
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-white/80 hover:text-white text-2xl font-light disabled:opacity-50"
            >
              ×
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-700">
              <span>⚠️</span>
              <span className="text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Module Selection */}
          {isDownload && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Report Format
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedModule("booking")}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedModule === "booking"
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                  }`}
                  disabled={loading}
                >
                  <div className="font-semibold">Booking Format</div>
                  <div className="text-xs mt-1 text-gray-600">
                    Includes booking status, unrouted bookings, and
                    booking-specific parameters
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedModule("route")}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedModule === "route"
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                  }`}
                  disabled={loading}
                >
                  <div className="font-semibold">Route Format</div>
                  <div className="text-xs mt-1 text-gray-600">
                    Includes route status, driver info, vehicle types, and
                    performance metrics
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
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
                  errors.start_date ? "border-red-300" : "border-gray-300"
                }`}
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
                  errors.end_date ? "border-red-300" : "border-gray-300"
                }`}
                disabled={loading}
              />
              {errors.end_date && (
                <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>
              )}
            </div>
          </div>

          {/* Common Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tenant ID{" "}
                <span className="text-gray-400 text-xs">(Admin only)</span>
              </label>
              <input
                type="text"
                value={formData.tenant_id}
                onChange={(e) => handleChange("tenant_id", e.target.value)}
                placeholder="e.g., SAM001"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Shift ID
              </label>
              <input
                type="number"
                min="0"
                value={formData.shift_id}
                onChange={(e) => handleChange("shift_id", e.target.value)}
                placeholder="e.g., 1"
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                  errors.shift_id ? "border-red-300" : "border-gray-300"
                }`}
                disabled={loading}
              />
              {errors.shift_id && (
                <p className="text-red-500 text-xs mt-1">{errors.shift_id}</p>
              )}
            </div>
          </div>

          {/* Vendor ID - Common for both modules */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Vendor ID
            </label>
            <input
              type="number"
              min="0"
              value={formData.vendor_id}
              onChange={(e) => handleChange("vendor_id", e.target.value)}
              placeholder="e.g., 5"
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                errors.vendor_id ? "border-red-300" : "border-gray-300"
              }`}
              disabled={loading}
            />
            {errors.vendor_id && (
              <p className="text-red-500 text-xs mt-1">{errors.vendor_id}</p>
            )}
          </div>

          {/* Module-specific configurations */}
          {isDownload && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {getModuleDisplay()} Parameters
              </h3>

              {selectedModule === "booking" ? (
                <BookingModuleConfig
                  formData={formData}
                  handleChange={handleChange}
                  toggleArrayValue={toggleArrayValue}
                  handleSelectAll={handleSelectAll}
                  errors={errors}
                  loading={loading}
                />
              ) : (
                <RouteModuleConfig
                  formData={formData}
                  handleChange={handleChange}
                  toggleArrayValue={toggleArrayValue}
                  handleSelectAll={handleSelectAll}
                  errors={errors}
                  loading={loading}
                />
              )}
            </div>
          )}

          {/* Analytics-specific fields */}
          {!isDownload && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="text-blue-500 mt-0.5">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-blue-800 font-medium">
                    {selectedModule === "booking" ? "Booking" : "Route"}{" "}
                    Analytics Preview
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    This will generate visual analytics and summary data for{" "}
                    {selectedModule === "booking" ? "bookings" : "routes"} in
                    the selected date range. No file will be downloaded.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {isDownload
                ? loading
                  ? `Preparing ${getModuleDisplay()} Download...`
                  : `Download ${getModuleDisplay()} Report`
                : loading
                ? `Generating ${getModuleDisplay()} Analytics...`
                : `View ${getModuleDisplay()} Analytics`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfigModal;

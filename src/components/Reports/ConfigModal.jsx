import { useState, useEffect, useCallback, useRef } from "react";
import BookingModuleConfig from "./BookingModuleConfig";
import RouteModuleConfig from "./RouteModuleConfig";
import CommonConfig from "./CommonConfig";
import { API_CLIENT } from "../../Api/API_Client";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../redux/features/auth/authSlice";
import { logDebug } from "../../utils/logger";

const ConfigModal = ({
  isOpen,
  onClose,
  config,
  onSubmit,
  type,
  loading = false,
}) => {
  const [selectedModule, setSelectedModule] = useState("booking");
  const [formData, setFormData] = useState({
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

  const [errors, setErrors] = useState({});
  const [tenants, setTenants] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [fetchShiftsLoading, setFetchShiftsLoading] = useState(false);
  const [fetchVendorsLoading, setFetchVendorsLoading] = useState(false);

  const user = useSelector(selectCurrentUser);
  const userType = user?.type;
  const isSuperAdmin = "admin" === userType;
  const currentUserTenant = user?.tenant_id || user?.tenant?.tenant_id;
  logDebug(" This is the current user tenant ID:", user);
  // Use ref to track initial data fetch
  const hasFetchedInitialData = useRef(false);

  // Reset the ref when modal closes
  useEffect(() => {
    if (!isOpen) {
      hasFetchedInitialData.current = false;
    }
  }, [isOpen]);

  const fetchTenants = async () => {
    try {
      const response = await API_CLIENT.get("/v1/tenants/");
      setTenants(
        response.data?.data?.items?.map((tenant) => ({
          value: tenant.tenant_id,
          label: `${tenant.name}`,
        }))
      );
    } catch (error) {
      console.error("Error fetching tenants:", error);
      // Fallback to static data
      setTenants([
        { value: "SAM001", label: "SAM001 - Main Campus" },
        { value: "SAM002", label: "SAM002 - Downtown Branch" },
        { value: "SAM003", label: "SAM003 - Westside Office" },
      ]);
    }
  };

  const fetchShiftsAndVendors = useCallback(async (tenantId) => {
    logDebug("Fetching shifts and vendors for tenant:", tenantId);
    if (!tenantId) return;

    try {
      setFetchShiftsLoading(true);
      setFetchVendorsLoading(true);

      // Fetch shifts for the tenant
      const shiftsResponse = await API_CLIENT.get(
        `/v1/shifts/?tenant_id=${tenantId}`
      );
      setShifts([
        { value: "", label: "All Shifts" },
        ...shiftsResponse.data?.data?.items?.map((shift) => ({
          value: shift.shift_id,
          label: `${shift.shift_code} - ${shift.shift_time}`,
        })),
      ]);

      // Fetch vendors for the tenant
      const vendorsResponse = await API_CLIENT.get(`/v1/vendors/`);
      setVendors([
        { value: "", label: "All Vendors" },
        ...vendorsResponse.data?.data?.items?.map((vendor) => ({
          value: vendor.vendor_id,
          label: `${vendor.name} - ${vendor.service_type}`,
        })),
      ]);
    } catch (error) {
      console.error("Error fetching shifts/vendors:", error);
      // Keep existing static data
    } finally {
      setFetchShiftsLoading(false);
      setFetchVendorsLoading(false);
    }
  }, []);
  logDebug(" This is the current user tenant ID:", currentUserTenant);
  useEffect(() => {
    if (isOpen && !hasFetchedInitialData.current) {
      // Reset form data
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

      // Set module based on type
      if (type === "routes" || config === "route") {
        setSelectedModule("route");
      } else {
        setSelectedModule("booking");
      }

      // Fetch initial data only once
      if (isSuperAdmin) {
        fetchTenants();
      } else if (currentUserTenant) {
        logDebug(" This is the current user tenant ID:", currentUserTenant);
        // For non-superadmin, fetch shifts and vendors for their tenant only once
        fetchShiftsAndVendors(currentUserTenant);
        hasFetchedInitialData.current = true;
      }
    }
  }, [
    isOpen,
    type,
    config,
    isSuperAdmin,
    currentUserTenant,
    fetchShiftsAndVendors,
  ]);

  const handleTenantChange = async (tenantId) => {
    if (tenantId) {
      await fetchShiftsAndVendors(tenantId);
    } else {
      setShifts([]);
      setVendors([]);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.start_date) {
      newErrors.start_date = "Start date is required";
    }
    if (!formData.end_date) {
      newErrors.end_date = "End date is required";
    }

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const submitData = {
        ...formData,
        module: selectedModule,
        report_format: selectedModule === "booking" ? "booking" : "route",
        // Ensure tenant_id is set for non-superadmin users
        tenant_id: isSuperAdmin ? formData.tenant_id : currentUserTenant,
      };
      onSubmit(submitData);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

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

  const handleSelectAll = (field, options) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].length === options.length ? [] : options,
    }));
  };

  const isDownload = config === "download";

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

  const getModuleDisplay = () => {
    return selectedModule === "booking" ? "Booking" : "Route";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isDownload ? "Download Report" : "View Analytics"}
            </h2>
            <p className="text-gray-600 mt-1">
              Configure parameters for {getReportTypeDisplay()}{" "}
              {isDownload ? "download" : "analytics"}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
          >
            <svg
              className="w-6 h-6 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

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

          {/* Common Configuration */}
          <CommonConfig
            formData={formData}
            handleChange={handleChange}
            errors={errors}
            loading={loading}
            userType={userType}
            currentTenant={currentUserTenant}
            onTenantChange={handleTenantChange}
            tenants={tenants}
            shifts={shifts}
            vendors={vendors}
            fetchShiftsLoading={fetchShiftsLoading}
            fetchVendorsLoading={fetchVendorsLoading}
          />

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

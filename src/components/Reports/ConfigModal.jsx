import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser } from "../../redux/features/auth/authSlice";
import { API_CLIENT } from "../../Api/API_Client";
import CommonFilters from "./CommonConfig";
import BookingModuleConfig from "./BookingModuleConfig";
import DelayFilters from "./DelayFilters";
import DriverFilters from "./DriverFilters";
import { REPORT_TYPES } from "../../staticData/StaticReport";
import {
  selectVendors,
  selectVendorsFetched,
  selectVendorsLoading,
  resetVendorFetched,
} from "../../redux/features/vendors/vendorSlice";
import { fetchVendorsThunk } from "../../redux/features/vendors/vendorThunk";
import {
  selectAllShifts,
  selectLoading as selectShiftsLoading,
} from "../../redux/features/shift/shiftSlice";
import { fetchShiftTrunk } from "../../redux/features/shift/shiftTrunk";

// ── ADD this action to shiftSlice.js reducers: resetShiftsLoaded(state) { state.loaded = false; }
// then import it here:
import { resetShiftsLoaded } from "../../redux/features/shift/shiftSlice";

const getDefaultFormData = () => {
  const today = new Date().toISOString().split("T")[0];
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  return {
    start_date: threeDaysAgo,
    end_date: today,
    tenant_id: "",
    shift_id: "",
    booking_status: [],
    route_status: [],
    vendor_id: "",
    include_unrouted: true,
    driver_id: "",
    delay_type: "",
    delay_category: "",
  };
};

const ConfigModal = ({
  isOpen,
  onClose,
  config,
  onSubmit,
  type,
  loading = false,
}) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState(getDefaultFormData());
  const [errors, setErrors] = useState({});
  const [tenants, setTenants] = useState([]);
  const [tenantsLoading, setTenantsLoading] = useState(false);

  const user = useSelector(selectCurrentUser);
  const isSuperAdmin = user?.roles?.includes("SuperAdmin") || user?.admin_id != null;
  const currentUserTenant = user?.tenant_id || user?.tenant?.tenant_id;

  const reduxVendors = useSelector(selectVendors);
  const vendorsFetched = useSelector(selectVendorsFetched);
  const vendorsLoading = useSelector(selectVendorsLoading);

  const reduxShifts = useSelector(selectAllShifts);
  const shiftsLoading = useSelector(selectShiftsLoading);
  const shiftsLoaded = useSelector((state) => state.shift.loaded);

//   console.log("=================================");
// console.log("[CONFIG MODAL] Selected Tenant:", formData.tenant_id);
// console.log("[CONFIG MODAL] Vendors Count:", reduxVendors?.length);
// console.log("[CONFIG MODAL] Vendors:", reduxVendors);
// console.log("=================================");

const filteredVendorList =
  isSuperAdmin && formData.tenant_id
    ? reduxVendors.filter(
        (vendor) => vendor?.tenant_id === formData.tenant_id
      )
    : reduxVendors;

// console.log(
//   "[CONFIG MODAL] Filtered Vendors Count:",
//   filteredVendorList.length
// );

const vendorOptions = [
  { value: "", label: "All Vendors" },
  ...filteredVendorList.map((v) => ({
    value: v.vendor_id,
    label: `${v.name}${v.service_type ? ` - ${v.service_type}` : ""}`,
  })),
];

  const shiftOptions = [
    { value: "", label: "All Shifts" },
    ...reduxShifts
      .filter(Boolean)
      .map((s) => ({
        value: s.shift_id,
        label: `${s.shift_code} - ${s.shift_time}`,
      })),
  ];

  const hasFetchedInitialData = useRef(false);

  // Reset ref when modal closes
  useEffect(() => {
    if (!isOpen) {
      hasFetchedInitialData.current = false;
    }
  }, [isOpen]);

  // Initial fetch on modal open
  useEffect(() => {
    if (isOpen && !hasFetchedInitialData.current) {
      setFormData(getDefaultFormData());
      setErrors({});
      hasFetchedInitialData.current = true;

      if (!isSuperAdmin) {
        // Regular admin — fetch vendors + shifts scoped to their tenant
        if (!vendorsFetched && !vendorsLoading) {
          dispatch(fetchVendorsThunk({ tenant_id: currentUserTenant }));
        }
        if (!shiftsLoaded && !shiftsLoading) {
          dispatch(fetchShiftTrunk({ tenant_id: currentUserTenant }));
        }
      } else {
        // Superadmin — only fetch tenant list; vendors+shifts wait for tenant selection
        fetchTenants();
      }
    }
  }, [isOpen, isSuperAdmin, vendorsFetched, vendorsLoading, shiftsLoaded, shiftsLoading, dispatch]);

  // Superadmin — re-fetch vendors + shifts when tenant is selected/changed
  useEffect(() => {
    if (isOpen && isSuperAdmin && formData.tenant_id) {
      dispatch(fetchShiftTrunk({ tenant_id: formData.tenant_id }));
      dispatch(fetchVendorsThunk({ tenant_id: formData.tenant_id }));
    }
  }, [formData.tenant_id, isOpen, isSuperAdmin, dispatch]);

  const fetchTenants = async () => {
    try {
      setTenantsLoading(true);
      const response = await API_CLIENT.get("/tenants/");
      setTenants(
        response.data?.data?.items?.map((t) => ({
          value: t.tenant_id,
          label: t.name,
        })) || []
      );
    } catch (error) {
      console.error("Error fetching tenants:", error);
      setTenants([]);
      setErrors((prev) => ({
        ...prev,
        tenant_id: "Failed to load tenants. Please try again.",
      }));
    } finally {
      setTenantsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      // Reset shift + vendor when superadmin switches tenant
      ...(field === "tenant_id" ? { shift_id: "", vendor_id: "" } : {}),
    }));

    // Reset fetched flags so tenant-change triggers fresh fetch
    if (field === "tenant_id" && isSuperAdmin) {
      dispatch(resetVendorFetched());
      dispatch(resetShiftsLoaded());
    }

    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.start_date) newErrors.start_date = "Start date is required";
    if (!formData.end_date)   newErrors.end_date   = "End date is required";
    if (formData.start_date && formData.end_date) {
      if (new Date(formData.start_date) > new Date(formData.end_date)) {
        newErrors.end_date = "End date cannot be before start date";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const submitData = {
      ...formData,
      tenant_id: isSuperAdmin ? formData.tenant_id : currentUserTenant,
    };
    onSubmit(submitData);
  };

  const isBookings   = type === REPORT_TYPES.BOOKINGS;
  const isDelays     = type === REPORT_TYPES.DELAYS;
  const isDriverDuty = type === REPORT_TYPES.DRIVER_DUTY;
  const isDownload   = config === "download";
  const isPreview    = config === "preview";

  const getTitle = () => {
    if (isDownload) return "Download Report";
    if (isPreview) {
      const map = {
        [REPORT_TYPES.BOOKINGS]:    "Preview Booking Report",
        [REPORT_TYPES.DELAYS]:      "Preview Delay Report",
        [REPORT_TYPES.DRIVER_DUTY]: "Preview Driver Duty Hours",
      };
      return map[type] || "Preview Report";
    }
    const map = {
      [REPORT_TYPES.BOOKINGS]:    "Booking Analytics",
      [REPORT_TYPES.DELAYS]:      "Delay Report",
      [REPORT_TYPES.DRIVER_DUTY]: "Driver Duty Hours",
    };
    return map[type] || "View Report";
  };

  const getSubtitle = () => {
    if (isPreview) {
      const map = {
        [REPORT_TYPES.BOOKINGS]:    "Select filters to preview booking data as a table",
        [REPORT_TYPES.DELAYS]:      "Select filters to preview delay data as a table",
        [REPORT_TYPES.DRIVER_DUTY]: "Select filters to preview driver duty hours as a table",
      };
      return map[type] || "Select filters to preview data as a table";
    }
    const map = {
      [REPORT_TYPES.BOOKINGS]:    "Configure filters for booking data",
      [REPORT_TYPES.DELAYS]:      "Configure filters for delay data",
      [REPORT_TYPES.DRIVER_DUTY]: "Configure filters for driver duty hours",
    };
    return map[type] || "Configure report parameters";
  };

  const getSubmitLabel = () => {
    if (isDownload) return loading ? "Preparing Download..." : "Download Report";
    if (isPreview)  return loading ? "Loading..."            : "Preview Report";
    const map = {
      [REPORT_TYPES.BOOKINGS]:    loading ? "Generating..." : "View Analytics",
      [REPORT_TYPES.DELAYS]:      loading ? "Loading..."    : "View Delay Report",
      [REPORT_TYPES.DRIVER_DUTY]: loading ? "Loading..."    : "View Duty Hours",
    };
    return map[type] || "Submit";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{getTitle()}</h2>
            <p className="text-gray-600 mt-1">{getSubtitle()}</p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* Common filters */}
          <CommonFilters
            formData={formData}
            handleChange={handleChange}
            errors={errors}
            loading={loading}
            showTenant={!isDriverDuty}
            showShift={isBookings}
            showVendor={isBookings && (isDownload || isPreview)}
            tenants={tenants}
            tenantsLoading={tenantsLoading}
            shifts={shiftOptions}
            vendors={vendorOptions}
            fetchShiftsLoading={shiftsLoading}
            fetchVendorsLoading={vendorsLoading}
            isSuperAdmin={isSuperAdmin}
            currentUserTenant={currentUserTenant}
          />

          {/* Booking filters — download and preview */}
          {isBookings && (isDownload || isPreview) && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Booking Filters
              </h3>
              <BookingModuleConfig
                formData={formData}
                handleChange={handleChange}
                toggleArrayValue={toggleArrayValue}
                handleSelectAll={handleSelectAll}
                errors={errors}
                loading={loading}
              />
            </div>
          )}

          {/* Booking analytics filters */}
          {isBookings && !isDownload && !isPreview && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Booking Filters
              </h3>
              <BookingModuleConfig
                formData={formData}
                handleChange={handleChange}
                toggleArrayValue={toggleArrayValue}
                handleSelectAll={handleSelectAll}
                errors={errors}
                loading={loading}
              />
            </div>
          )}

          {/* Delay filters */}
          {isDelays && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Delay Filters
              </h3>
              <DelayFilters
                formData={formData}
                handleChange={handleChange}
                loading={loading}
              />
            </div>
          )}

          {/* Driver duty filters */}
          {isDriverDuty && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Driver Filters
              </h3>
              <DriverFilters
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                loading={loading}
              />
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
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              )}
              {getSubmitLabel()}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfigModal;
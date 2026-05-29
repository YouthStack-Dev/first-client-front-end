import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import SearchableSelect from "./SearchableSelect";
import {
  NewfetchDriversThunk,
  driversSelectors,
  selectDriversLoading,
  clearDrivers,
} from "../../redux/features/manageDriver/newDriverSlice";
import { selectCurrentUser } from "../../redux/features/auth/authSlice";
import { useVendorOptions } from "../../hooks/useVendorOptions";

const DriverFilters = ({
  formData,
  handleChange,
  errors,
  loading,
}) => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const isVendorUser = user?.type === "vendor";

  const drivers = useSelector(driversSelectors.selectAll);
  const driversLoading = useSelector(selectDriversLoading);

  const [selectedVendor, setSelectedVendor] = useState(null);

  const { vendorOptions } = useVendorOptions(null, !isVendorUser);

  // For vendor users — fetch drivers automatically using their vendor_id
  useEffect(() => {
    if (isVendorUser && user?.vendor_id) {
      dispatch(NewfetchDriversThunk({ vendor_id: user.vendor_id }));
    }
    // Clear drivers on unmount
    return () => {
      dispatch(clearDrivers());
    };
  }, [isVendorUser, user?.vendor_id, dispatch]);

  // For admin/employee — fetch when vendor is selected
  const handleVendorChange = (option) => {
    setSelectedVendor(option);
    handleChange("driver_id", ""); // clear selected driver
    if (option?.value) {
      dispatch(NewfetchDriversThunk({ vendor_id: option.value }));
    } else {
      dispatch(clearDrivers());
    }
  };

  const driverOptions = [
    { value: "", label: "All Drivers" },
    ...drivers.map((d) => ({
      value: d.driver_id,
      label: d.name,
    })),
  ];

  const isDriverDisabled =
    loading ||
    driversLoading ||
    (!isVendorUser && !selectedVendor);

  return (
    <div className="space-y-6">

      {/* Vendor selector — only for non-vendor users */}
      {!isVendorUser && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Vendor
          </label>
          <SearchableSelect
            options={vendorOptions}
            value={selectedVendor?.value || ""}
            onChange={(value) => {
              const option = vendorOptions.find(
                (o) => String(o.value) === String(value)
              );
              handleVendorChange(option || null);
            }}
            disabled={loading}
            placeholder="Select Vendor"
          />
          {!selectedVendor && (
            <p className="text-gray-500 text-xs mt-1">
              Select a vendor to load drivers
            </p>
          )}
        </div>
      )}

      {/* Driver selector */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Driver
        </label>
        <SearchableSelect
          options={driverOptions}
          value={formData.driver_id || ""}
          onChange={(value) => handleChange("driver_id", value)}
          disabled={isDriverDisabled}
          placeholder={
            driversLoading
              ? "Loading drivers..."
              : !isVendorUser && !selectedVendor
              ? "Select vendor first..."
              : "Select Driver"
          }
          className={errors.driver_id ? "border-red-300 bg-red-50" : ""}
        />
        {driversLoading && (
          <div className="flex items-center gap-2 mt-2">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-indigo-600" />
            <p className="text-indigo-600 text-xs">Loading drivers...</p>
          </div>
        )}
        {errors.driver_id && (
          <p className="text-red-500 text-xs mt-1">{errors.driver_id}</p>
        )}
      </div>

    </div>
  );
};

export default DriverFilters;
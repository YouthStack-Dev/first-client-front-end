import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import { fetchVendorsThunk } from "../../redux/features/vendors/vendorThunk";
import { setSelectedVendor } from "../../redux/features/vendors/vendorSlice";
import { selectCurrentUser } from "../../redux/features/auth/authSlice";

// ✅ Inline memoized selector (Option 2 logic)
const selectVendorsByTenant = createSelector(
  [
    (state) => state.vendor?.vendorsByTenant || {},
    (_, tenantId) => tenantId,
  ],
  (vendorsByTenant, tenantId) => vendorsByTenant?.[tenantId] || []
);

const VendorSelector = ({ onChange }) => {
  const dispatch = useDispatch();
  let currentUser = useSelector(selectCurrentUser);

  // Handle refresh / fallback to sessionStorage
  if (!currentUser) {
    const stored = sessionStorage.getItem("currentUser");
    if (stored) currentUser = JSON.parse(stored);
  }

  const userType = currentUser?.type; // "employee" or "vendor"
  const tenantId = currentUser?.employee?.tenant_id || currentUser?.tenant_id;

  // ✅ Memoized selector usage
  const vendorsByTenant = useSelector((state) =>
    selectVendorsByTenant(state, tenantId)
  );

  const selectedVendor = useSelector((state) => state.vendor.selectedVendor);
  const loading = useSelector((state) => state.vendor.loading);

  // Fetch vendors if not cached
  useEffect(() => {
    if (userType === "employee" && tenantId) {
      if (!vendorsByTenant.length) {
        console.log("Fetching vendors for tenant:", tenantId);
        dispatch(fetchVendorsThunk({ tenant_id: tenantId }));
      } else {
        console.log("✅ Vendors already cached for tenant:", tenantId);
      }
    }
  }, [userType, tenantId, vendorsByTenant.length, dispatch]);

  // Auto-select vendor for vendor login
  useEffect(() => {
    if (
      userType === "vendor" &&
      currentUser?.vendor_user &&
      vendorsByTenant.length > 0
    ) {
      const vendor = vendorsByTenant.find(
        (v) => v.vendor_id === currentUser.vendor_user.vendor_id
      );
      if (
        vendor &&
        (!selectedVendor || selectedVendor.vendor_id !== vendor.vendor_id)
      ) {
        console.log("Auto-selecting vendor:", vendor);
        dispatch(setSelectedVendor(vendor));
        onChange?.(vendor);
      }
    }
  }, [userType, currentUser, vendorsByTenant, dispatch, selectedVendor, onChange]);

  // Handle dropdown change for employee
  const handleChange = (e) => {
    const value = e.target.value;

    if (value === "all") {
      const allVendorOption = { vendor_id: "all", name: "All Vendors" };
      dispatch(setSelectedVendor(allVendorOption));
      onChange?.(allVendorOption);
      return;
    }

    const vendor = vendorsByTenant.find(
      (v) => String(v.vendor_id) === String(value)
    );
    if (vendor) {
      dispatch(setSelectedVendor(vendor));
      onChange?.(vendor);
    }
  };

  // Vendor users don’t need dropdown
  if (userType === "vendor") return null;

  return (
    <div className="w-full sm:w-auto">
      {loading ? (
        <p className="text-gray-500 text-sm">Loading vendors...</p>
      ) : (
        <select
          value={selectedVendor?.vendor_id || "all"}
          onChange={handleChange}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
        >
          <option value="all">All Vendors</option>
          {vendorsByTenant.map((v) => (
            <option key={v.vendor_id} value={v.vendor_id}>
              {v.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default VendorSelector;

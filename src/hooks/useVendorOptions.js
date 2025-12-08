import { useSelector, useDispatch } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { fetchVendorsThunk } from "../redux/features/vendors/vendorThunk";

export const useVendorOptions = (tenantId = null) => {
  const dispatch = useDispatch();

  // Local flags to avoid double fetch (no need in slice)
  const [initialized, setInitialized] = useState(false);

  const { data: vendors = [], vendorsByTenant = {} } = useSelector(
    (state) => state.vendor || {}
  );

  // ⭐ Auto-fetch vendors when hook is first used
  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      dispatch(fetchVendorsThunk());
    }
  }, [initialized, dispatch]);

  // Pick vendor list
  const vendorList = tenantId ? vendorsByTenant[tenantId] || [] : vendors;

  const vendorOptions = [
    ...vendorList.map((vendor) => ({
      value: vendor.vendor_id,
      label: vendor.name,
    })),
  ];

  return vendorOptions;
};

import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { fetchVendorsThunk } from "../redux/features/vendors/vendorThunk";

export const useVendorOptions = (tenantId = null, shouldFetch = false) => {
  const dispatch = useDispatch();

  const {
    data: vendors = [],
      vendorsByTenant = {},
    fetched,
    loading,
  } = useSelector((state) => state.vendor || {});

  // 🔥 Fetch ONLY when shouldFetch is true
  useEffect(() => {
    if (shouldFetch && !fetched && !loading) {
      dispatch(fetchVendorsThunk());
    }
  }, [shouldFetch, fetched, loading, dispatch]);

  const vendorList = tenantId ? vendorsByTenant[tenantId] || [] : vendors;

  return vendorList.map((vendor) => ({
    value: vendor.vendor_id,
    label: vendor.name,
  }));
};

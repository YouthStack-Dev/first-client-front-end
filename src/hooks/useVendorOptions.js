import { useSelector } from "react-redux";

export const useVendorOptions = (tenantId = null) => {
  const { data: vendors = [], vendorsByTenant = {} } = useSelector(
    (state) => state.vendor || {}
  );

  // Choose vendor list: All vendors OR vendors of specific tenant
  const vendorList = tenantId ? vendorsByTenant[tenantId] || [] : vendors;

  const vendorOptions = [
    { value: "", label: "All Vendors" },
    ...vendorList.map((vendor) => ({
      value: vendor.vendor_id,
      label: vendor.name,
    })),
  ];

  return vendorOptions;
};

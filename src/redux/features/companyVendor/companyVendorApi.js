import { API_CLIENT } from '../../../Api/API_Client';

// 1️⃣ Fetch vendors assigned to a company
export const fetchVendorsByCompanyApi = (companyId) => {
  return API_CLIENT.get(`/api/companies/${companyId}/vendors`);
};

// 2️⃣ Assign vendors to a company
export const assignVendorsToCompanyApi = (companyId, vendorIds) => {
  return API_CLIENT.post(`/api/companies/${companyId}/vendors`, { vendorIds });
};

// 3️⃣ Fetch companies assigned to a vendor
export const fetchCompaniesByVendorApi = (vendorId) => {
  return API_CLIENT.get(`/api/vendors/${vendorId}/companies`);
};

// 4️⃣ Assign companies to a vendor
export const assignCompaniesToVendorApi = (vendorId, companyIds) => {
  return API_CLIENT.post(`/api/vendors/${vendorId}/companies`, { companyIds });
};
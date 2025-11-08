// import { createAsyncThunk } from "@reduxjs/toolkit";
// import {
//   fetchVendorsByCompanyApi,
//   assignVendorsToCompanyApi,
//   fetchCompaniesByVendorApi,
//   assignCompaniesToVendorApi,
// } from "./companyVendorApi";

// // 1️⃣ Fetch vendors assigned to a company
// export const fetchVendorsByCompanyThunk = createAsyncThunk(
//   "companyVendor/fetchVendorsByCompany",
//   async (companyId, { rejectWithValue }) => {
//     try {
//       const response = await fetchVendorsByCompanyApi(companyId);
//       return { companyId, data: response.data?.vendors || [] };
//     } catch (error) {
//       if (error.response?.status === 404) return { companyId, data: [] };
//       return rejectWithValue(
//         error.response?.data?.message || "Failed to fetch vendors for company"
//       );
//     }
//   }
// );

// // 2️⃣ Assign vendors to a company (with two-way update)
// export const assignVendorsToCompanyThunk = createAsyncThunk(
//   "companyVendor/assignVendorsToCompany",
//   async ({ companyId, vendorIds }, { dispatch, rejectWithValue }) => {
//     try {
//       const response = await assignVendorsToCompanyApi(companyId, vendorIds);

//       // ✅ Refetch vendors for this company
//       dispatch(fetchVendorsByCompanyThunk(companyId));

//       // DEDUPLICATION: Remove duplicate vendor IDs before dispatching
//       const uniqueVendorIds = [...new Set(vendorIds)];
//       uniqueVendorIds.forEach((vendorId) => {
//         dispatch(fetchCompaniesByVendorThunk(vendorId));
//       });

//       return { companyId, vendorIds, data: response.data };
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message || "Failed to assign vendors to company"
//       );
//     }
//   }
// );

// // 3️⃣ Fetch companies assigned to a vendor
// export const fetchCompaniesByVendorThunk = createAsyncThunk(
//   "companyVendor/fetchCompaniesByVendor",
//   async (vendorId, { rejectWithValue }) => {
//     try {
//       const response = await fetchCompaniesByVendorApi(vendorId);
//       return { vendorId, data: response.data?.companies || [] };
//     } catch (error) {
//       if (error.response?.status === 404) return { vendorId, data: [] };
//       return rejectWithValue(
//         error.response?.data?.message || "Failed to fetch companies for vendor"
//       );
//     }
//   }
// );

// // 4️⃣ Assign companies to a vendor (with two-way update)
// export const assignCompaniesToVendorThunk = createAsyncThunk(
//   "companyVendor/assignCompaniesToVendor",
//   async ({ vendorId, companyIds }, { dispatch, rejectWithValue }) => {
//     try {
//       const response = await assignCompaniesToVendorApi(vendorId, companyIds);

//       // ✅ Refetch companies for this vendor
//       dispatch(fetchCompaniesByVendorThunk(vendorId));

//       // ✅ Refetch vendors for affected companies so CompanyCard updates
//       // DEDUPLICATION: Remove duplicate company IDs before dispatching
//       const uniqueCompanyIds = [...new Set(companyIds)];
//       uniqueCompanyIds.forEach((companyId) => {
//         dispatch(fetchVendorsByCompanyThunk(companyId));
//       });

//       return { vendorId, companyIds, data: response.data };
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message || "Failed to assign companies to vendor"
//       );
//     }
//   }
// );
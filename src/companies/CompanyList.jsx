// src/companies/CompanyList.jsx
import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Building2, AlertTriangle } from "lucide-react";
import CompanyCard from "./CompanyCard";
import { fetchVendorsThunk } from "../redux/features/vendors/vendorThunk";
import {
  selectVendors,
  selectVendorsFetched,
  selectVendorsLoading,
  selectVendorsError,
} from "../redux/features/vendors/vendorSlice";

const CompanyList = ({ companies = [], onEditCompany }) => {
  const dispatch = useDispatch();

  // ✅ Split selectors — no inline object literal, no || {} fallback.
  // Each returns a primitive or the stable Redux array reference so
  // === equality passes correctly and no unnecessary re-renders occur.
  // Named selectors are imported from vendorSlice for consistency.
  const vendors        = useSelector(selectVendors);
  const vendorsFetched = useSelector(selectVendorsFetched);
  const vendorsLoading = useSelector(selectVendorsLoading);
  const vendorsError   = useSelector(selectVendorsError);

  // ✅ useRef removed — vendorsFetched lives in Redux and survives unmount/remount.
  //
  // WHY useRef FAILED HERE:
  //   CompanyList unmounts when you navigate away. On the next visit it remounts
  //   with hasFetchedVendors.current = false, so it re-fetched vendors on every
  //   single navigation — exactly the duplicate GET /vendors/ hits in the logs.
  //
  // WHY Redux fetched WORKS:
  //   Redux persists for the app lifetime. Once vendorsFetched = true it stays
  //   true across any number of mount/unmount cycles. The only way vendors
  //   re-fetch automatically is if fetched is explicitly reset via
  //   resetVendorFetched() — which is intentional (e.g. tenant context switch).
  //
  // NOTE: CompanyCard.onSaveSuccess still dispatches fetchVendorsThunk() directly
  // after a vendor assignment. That bypasses this guard intentionally — it's a
  // manual sync, not an initial load, and should always fire.
  useEffect(() => {
    if (!vendorsFetched) {
      dispatch(fetchVendorsThunk());
    }
  }, [vendorsFetched, dispatch]);

  const stats = useMemo(
    () => ({
      total:    companies.length,
      active:   companies.filter((c) => c.is_active === true).length,
      inactive: companies.filter((c) => c.is_active === false).length,
    }),
    [companies]
  );

  return (
    <div className="space-y-6">

      {/* Vendor fetch error — surfaces at list level so every card isn't broken silently */}
      {vendorsError && (
        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            Vendor data could not be loaded. Some card details may be incomplete.
          </span>
        </div>
      )}

      {/* Stats bar — only renders when there are companies */}
      {companies.length > 0 && (
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          role="region"
          aria-label="Company statistics"
        >
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Companies</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
            <div className="text-sm text-gray-600">Inactive</div>
          </div>
        </div>
      )}

      {/* Companies Grid */}
      {companies.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600">No companies found</h3>
          <p className="text-gray-500">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {companies.map((company, index) => {
            const key = company.tenant_id || company.id;
            if (!key) {
              console.warn(
                "[CompanyList] Company rendered without a stable unique ID:",
                company
              );
            }

            return (
              <CompanyCard
                key={key ?? `fallback-${index}`}
                company={company}
                vendors={vendors}
                vendorsLoading={vendorsLoading}
                vendorsError={vendorsError}
                onEditCompany={onEditCompany}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CompanyList;
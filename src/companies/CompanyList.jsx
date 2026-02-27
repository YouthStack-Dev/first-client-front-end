// src/companies/CompanyList.jsx
import React, { useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Building2, AlertTriangle } from "lucide-react";
import CompanyCard from "./CompanyCard";
import { fetchVendorsThunk } from "../redux/features/vendors/vendorThunk";

const CompanyList = ({ companies = [], onEditCompany }) => {
  const dispatch = useDispatch();

  // Redux vendor state
  const {
    data: vendors = [],
    loading: vendorsLoading,
    error: vendorsError,
  } = useSelector((state) => state.vendor || {});

  // ✅ Fix #1: Replace fragile vendors.length dependency with a hasFetched ref
  const hasFetchedVendors = useRef(false);

  useEffect(() => {
    if (!hasFetchedVendors.current) {
      hasFetchedVendors.current = true;
      dispatch(fetchVendorsThunk());
    }
  }, [dispatch]);

  // ✅ Fix #4: Memoize stat calculations instead of recomputing on every render
  const stats = useMemo(
    () => ({
      total: companies.length,
      active: companies.filter((c) => c.is_active === true).length,
      inactive: companies.filter((c) => c.is_active === false).length,
    }),
    [companies]
  );

  return (
    <div className="space-y-6">

      {/* ✅ Fix #3: Surface vendor fetch error at list level */}
      {vendorsError && (
        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            Vendor data could not be loaded. Some card details may be incomplete.
          </span>
        </div>
      )}

      {/* ✅ Fix #2: Stats bar only renders when there are companies to show */}
      {companies.length > 0 && (
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          role="region"
          aria-label="Company statistics" // ✅ Fix #8 (minor): accessibility
        >
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {stats.total}
            </div>
            <div className="text-sm text-gray-600">Total Companies</div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">
              {stats.active}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-red-600">
              {stats.inactive}
            </div>
            <div className="text-sm text-gray-600">Inactive</div>
          </div>
        </div>
      )}

      {/* Companies Grid */}
      {companies.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600">
            No companies found
          </h3>
          <p className="text-gray-500">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        // ✅ Fix #7 (minor): removed redundant 2xl:grid-cols-4 (xl already sets 4)
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {companies.map((company, index) => {
            // ✅ Fix #5: Drop unsafe company.name as key fallback; warn on missing ID
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
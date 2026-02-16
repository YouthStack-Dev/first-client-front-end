import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Building2 } from "lucide-react";
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

  // Fetch vendors once if not already fetched
  useEffect(() => {
    if (vendors.length === 0) {
      dispatch(fetchVendorsThunk());
    }
  }, [dispatch, vendors.length]);

  return (
    <div className="space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {companies.length}
          </div>
          <div className="text-sm text-gray-600">Total Companies</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">
            {companies.filter((c) => c.is_active === true).length}
          </div>
          <div className="text-sm text-gray-600">Active</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-red-600">
            {companies.filter((c) => c.is_active === false).length}
          </div>
          <div className="text-sm text-gray-600">Inactive</div>
        </div>
      </div>

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {companies.map((company) => (
            <CompanyCard
              key={company.tenant_id || company.id || company.name}
              company={company}
              vendors={vendors}
              vendorsLoading={vendorsLoading}
              vendorsError={vendorsError}
              onEditCompany={onEditCompany}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CompanyList;

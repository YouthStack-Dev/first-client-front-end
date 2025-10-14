import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Truck } from "lucide-react";
import VendorCard from "./VendorCard";
import { fetchVendorsThunk } from "../../redux/features/vendors/vendorThunk";
import { fetchCompaniesThunk } from "../../redux/features/company/companyThunks";

const VendorList = ({ onAssignEntity }) => {
  const dispatch = useDispatch();

  // Redux state
  const {
    data: vendors = [],
    loading: vendorLoading,
    error: vendorError,
  } = useSelector((state) => state.vendor || {});
  const {
    data: companies = [],
    loading: companyLoading,
    error: companyError,
  } = useSelector((state) => state.company || {});

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch vendors and companies
  useEffect(() => {
    if (!vendors.length) dispatch(fetchVendorsThunk());
    if (!companies.length) dispatch(fetchCompaniesThunk());
  }, [dispatch]);

  // Filter vendors by search and status
  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.email?.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus = true;
    if (statusFilter === "Active") matchesStatus = vendor.is_active === true;
    else if (statusFilter === "Inactive")
      matchesStatus = vendor.is_active === false;

    return matchesSearch && matchesStatus;
  });

  // Safely render error messages
  const renderError = (err) => {
    if (!err) return null;
    if (typeof err === "string") return err;
    if (err.message) return err.message;
    return JSON.stringify(err);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Loading/Error */}
      {(vendorLoading || companyLoading) && <p>Loading data...</p>}
      {(vendorError || companyError) && (
        <p className="text-red-500">
          Error: {renderError(vendorError) || renderError(companyError)}
        </p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {vendors.length}
          </div>
          <div className="text-sm text-gray-600">Total Vendors</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">
            {vendors.filter((v) => v.is_active === true).length}
          </div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-red-600">
            {vendors.filter((v) => v.is_active === false).length}
          </div>
          <div className="text-sm text-gray-600">Inactive</div>
        </div>
      </div>

      {/* Vendors Grid */}
      {filteredVendors.length === 0 && !(vendorLoading || companyLoading) ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600">
            No vendors found
          </h3>
          <p className="text-gray-500">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {filteredVendors.map((vendor, index) => (
            <VendorCard
              key={vendor._id || vendor.id || index}
              vendor={vendor}
              onAssignEntity={() => onAssignEntity?.(vendor)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorList;

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Building2 } from "lucide-react";
import CompanyCard from "./CompanyCard";
import { fetchVendorsThunk } from "../redux/features/vendors/vendorThunk";

const CompanyList = ({ companies = [], onEditCompany }) => {
  const dispatch = useDispatch();

  // Redux vendor state
  const { data: vendors = [], loading: vendorsLoading, error: vendorsError } =
    useSelector((state) => state.vendor);

  // Fetch vendors once if not already fetched
  useEffect(() => {
    if (vendors.length === 0) {
      dispatch(fetchVendorsThunk());
    }
  }, [dispatch]);

  // Local filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter companies based on search & status
  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.email &&
        company.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const companyStatus =
      company.status ?? (company.isActive ? "Active" : "Suspended");

    const matchesStatus =
      statusFilter === "all" || companyStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="Pending">Pending</option>
          <option value="Suspended">Suspended</option>
        </select>
      </div>

      {/* Companies Grid */}
      {filteredCompanies.length === 0 ? (
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
          {filteredCompanies.map((company) => (
            <CompanyCard
              key={company.id || company.name}
              company={company}
              vendors={vendors} // pass full vendor list; CompanyCard filters by tenant_id
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

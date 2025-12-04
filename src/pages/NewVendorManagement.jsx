import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import SearchInput from "@components/ui/SearchInput";
import ReusableButton from "@ui/ReusableButton";
import {
  createVendorThunk,
  updateVendorThunk,
  fetchVendorsThunk,
} from "../redux/features/vendors/vendorThunk";
import { fetchCompaniesThunk } from "../redux/features/company/companyThunks";
import {
  Plus,
  RefreshCw,
  Settings,
  Trash2,
  Download,
  Upload,
  Filter,
} from "lucide-react";
import ToolBar from "@ui/ToolBar";
import SelectField from "../components/ui/SelectField";
import VendorModalForm from "../components/modals/VendorModalForm";
import NewVendorCard from "../components/vendor/NewVendorCard";
import { selectCurrentUser } from "../redux/features/auth/authSlice";
import { logDebug } from "../utils/logger";

const NewVendorManagement = () => {
  const dispatch = useDispatch();

  // --- State Management ---
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCompany, setSelectedCompany] = useState("all");

  // --- Modals State ---
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [vendorModalMode, setVendorModalMode] = useState("create");
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  // --- Fixed User Selection with Null Checks ---
  const currentUser = useSelector(selectCurrentUser);
  const userType = currentUser?.type || "user"; // Default to "user" if null/undefined

  logDebug("Current user in Vendor Management:", currentUser);

  // --- Redux Data with Safe Defaults ---
  const {
    data: vendors = [],
    loading: vendorLoading = false,
    error: vendorError = null,
  } = useSelector((state) => state.vendor || {});

  const {
    data: companies = [],
    loading: companyLoading = false,
    error: companyError = null,
  } = useSelector((state) => state.company || {});

  // --- Filter Options ---
  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  // Company options for filter - with safe mapping
  const companyOptions = [
    { value: "all", label: "All Companies" },
    ...(companies?.map((company) => ({
      value: company?.tenant_id || company?._id || "unknown",
      label: company?.name || company?.companyName || "Unnamed Company",
    })) || []),
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!vendors || vendors.length === 0) {
        dispatch(fetchVendorsThunk());
      }
      if (!companies || companies.length === 0) {
        dispatch(fetchCompaniesThunk());
      }
    };

    fetchData();
  }, [dispatch, vendors, companies]);

  // --- Enhanced Filtering Logic with Safe Access ---
  const filteredVendors = (vendors || []).filter((vendor) => {
    if (!vendor) return false;

    // Search filter with safe access
    const vendorName = vendor.name || "";
    const vendorEmail = vendor.email || "";
    const vendorPhone = vendor.phone || "";

    const matchesSearch =
      vendorName.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      vendorEmail.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      vendorPhone.toLowerCase().includes(searchQuery.trim().toLowerCase());

    // Status filter with safe access
    let matchesStatus = true;
    if (selectedStatus === "active") matchesStatus = vendor.is_active === true;
    else if (selectedStatus === "inactive")
      matchesStatus = vendor.is_active === false;
    else if (selectedStatus === "pending")
      matchesStatus = vendor.status === "pending";
    else if (selectedStatus === "suspended")
      matchesStatus = vendor.status === "suspended";

    // Company filter - based on tenant_id association
    let matchesCompany = true;
    if (selectedCompany !== "all") {
      matchesCompany = vendor.tenant_id === selectedCompany;
    }

    return matchesSearch && matchesStatus && matchesCompany;
  });

  // Get company name for display with safe access
  const getCompanyName = (companyId) => {
    if (!companyId || !companies) return "Unknown Company";
    const company = companies.find(
      (comp) => comp?.id === companyId || comp?._id === companyId
    );
    return company
      ? company.name || company.companyName || "Unknown Company"
      : "Unknown Company";
  };

  // --- Handler Functions ---
  const handleSync = () => {
    setLoading(true);
    dispatch(fetchVendorsThunk());
    dispatch(fetchCompaniesThunk());
    setTimeout(() => {
      setLoading(false);
      console.log("Vendors synced");
    }, 1000);
  };

  const handleExportVendors = () => {
    console.log("Exporting vendors...");
    alert("Vendors exported successfully!");
  };

  const handleImportVendors = () => {
    console.log("Importing vendors...");
    alert("Vendor import initiated!");
  };

  const handleClearAllData = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all vendor data? This action cannot be undone."
      )
    ) {
      console.log("Clearing all vendor data...");
      alert("All vendor data cleared successfully!");
    }
  };

  const handleOpenConfig = () => {
    console.log("Opening vendor configuration...");
    alert("Vendor configuration opened!");
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedStatus("all");
    setSelectedCompany("all");
  };

  // Vendor modal handlers
  const handleAddVendor = () => {
    setVendorModalMode("create");
    setSelectedVendor(null);
    setIsVendorModalOpen(true);
  };

  const handleEditVendor = (vendor) => {
    setVendorModalMode("edit");
    setSelectedVendor(vendor);
    setIsVendorModalOpen(true);
  };

  const handleViewVendor = (vendor) => {
    setVendorModalMode("view");
    setSelectedVendor(vendor);
    setIsVendorModalOpen(true);
  };

  const handleVendorSubmit = (formData) => {
    if (vendorModalMode === "create") {
      dispatch(createVendorThunk(formData));
    } else if (vendorModalMode === "edit" && selectedVendor) {
      dispatch(
        updateVendorThunk({
          vendorId: selectedVendor.vendor_id,
          formData: formData,
        })
      );
    }
    setIsVendorModalOpen(false);
    setSelectedVendor(null);
    setIsAssignModalOpen(false);
  };

  const handleCloseVendorModal = () => {
    setIsVendorModalOpen(false);
    setSelectedVendor(null);
  };

  const handleCloseAssignModal = () => {
    setIsAssignModalOpen(false);
  };

  const handleDeleteVendor = (vendor) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${vendor?.name || "this vendor"}?`
      )
    ) {
      console.log("Deleting vendor:", vendor);
    }
  };

  return (
    <div>
      <ToolBar
        className="p-4 bg-white border rounded shadow-sm mb-4"
        searchBar={
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <SearchInput
              placeholder="Search vendors by name, email, or phone"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow"
            />
          </div>
        }
        rightElements={
          <div className="flex items-center gap-3 flex-wrap">
            {/* Import Button */}
            <ReusableButton
              module="Vendors"
              action="import"
              icon={Upload}
              title="Import vendors from CSV"
              onClick={handleImportVendors}
              className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 border border-gray-300"
              size={18}
            />

            {/* Status Filter */}
            <SelectField
              label="Status"
              value={selectedStatus}
              onChange={setSelectedStatus}
              options={statusOptions}
            />

            {/* Company Filter */}
            <SelectField
              label="Company"
              value={selectedCompany}
              onChange={setSelectedCompany}
              options={companyOptions}
              disabled={companyLoading}
            />

            {/* Sync Button */}
            <ReusableButton
              module="vendor"
              action="read"
              icon={RefreshCw}
              title="Synchronize vendor data"
              buttonName="Sync"
              onClick={handleSync}
              loading={loading}
              loadingText="Syncing..."
              className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 flex items-center gap-2 transition-colors duration-200"
              size={16}
            />

            {/* Filter Button */}
            <ReusableButton
              module="Vendors"
              action="filter"
              icon={Filter}
              title="Advanced filters"
              onClick={() => console.log("Open advanced filters")}
              className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-600 flex items-center gap-2 transition-colors duration-200"
              size={16}
              buttonName="Filters"
            />

            {/* Export Button */}
            <ReusableButton
              module="Vendors"
              action="export"
              icon={Download}
              title="Export vendors to CSV"
              onClick={handleExportVendors}
              className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 border border-gray-300"
              size={18}
            />

            {/* Clear Data Button */}
            <ReusableButton
              module="Vendors"
              action="delete"
              icon={Trash2}
              title="Clear all vendor data"
              onClick={handleClearAllData}
              className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 flex items-center gap-2 transition-colors duration-200"
              size={16}
              buttonName="Clear Data"
            />

            {/* Config Button */}
            <ReusableButton
              module="Vendors"
              action="configure"
              icon={Settings}
              title="Vendor configuration settings"
              onClick={handleOpenConfig}
              className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 flex items-center gap-2 transition-colors duration-200"
              size={16}
              buttonName="Config"
            />

            {/* Add Vendor Button */}
            <ReusableButton
              module="vendor"
              action="create"
              icon={Plus}
              title="Add new vendor"
              buttonName="Add Vendor"
              onClick={handleAddVendor}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 flex items-center gap-2 transition-colors duration-200"
              size={16}
            />
          </div>
        }
      />

      {/* Results Summary */}
      <div className="mb-4 px-4">
        <p className="text-sm text-gray-600">
          Showing {filteredVendors.length} of {vendors?.length || 0} vendors
          {selectedCompany !== "all" &&
            ` for ${getCompanyName(selectedCompany)}`}
        </p>
      </div>

      <div className="mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4 md:gap-6">
          {filteredVendors.map((vendor, index) => (
            <NewVendorCard
              key={vendor?._id || vendor?.id || `vendor-${index}`}
              vendor={vendor}
              onEditVendor={() => handleEditVendor(vendor)}
              onViewVendor={() => handleViewVendor(vendor)}
              onDeleteVendor={() => handleDeleteVendor(vendor)}
            />
          ))}
        </div>

        {/* No Results Message */}
        {filteredVendors.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-2">
              {!vendors || vendors.length === 0
                ? "No vendors found."
                : "No vendors match your filters."}
            </div>
            {(searchQuery ||
              selectedStatus !== "all" ||
              selectedCompany !== "all") && (
              <button
                onClick={handleClearFilters}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear filters to see all vendors
              </button>
            )}
          </div>
        )}

        {/* Vendor Modal Form for Create/Edit/View */}
        <VendorModalForm
          isOpen={isVendorModalOpen}
          onClose={handleCloseVendorModal}
          onSubmit={handleVendorSubmit}
          mode={vendorModalMode}
          vendorData={selectedVendor}
          loading={vendorLoading}
          userType={userType}
          tenants={(companies || []).map((company) => ({
            id: company?.id || company?._id,
            name: company?.name || company?.companyName,
            tenantId: company?.tenant_id || company?.id,
          }))}
        />

        {/* Assign Vendor Modal using VendorModalForm */}
        <VendorModalForm
          isOpen={isAssignModalOpen}
          onClose={handleCloseAssignModal}
          onSubmit={handleVendorSubmit}
          mode={vendorModalMode}
          loading={vendorLoading}
          userType={userType}
          tenants={(companies || []).map((company) => ({
            id: company?.id || company?._id,
            name: company?.name || company?.companyName,
            tenantId: company?.tenant_id || company?.id,
          }))}
        />
      </div>
    </div>
  );
};

export default NewVendorManagement;

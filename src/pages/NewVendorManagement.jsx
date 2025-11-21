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
import NewAssignEntityModal from "../components/modals/NewAssignEntityModal";
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

  // --- Modals State ---
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false); // Updated state name
  const [vendorModalMode, setVendorModalMode] = useState("create"); // 'create' | 'edit' | 'view'
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [vendorToAssign, setVendorToAssign] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const { type } = useSelector(selectCurrentUser);
  logDebug("Current user type:", type);
  // --- Redux Data ---
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

  // --- Filter Options ---
  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "pending", label: "Pending" },
    { value: "suspended", label: "Suspended" },
  ];

  // --- Fetch Data on Mount ---
  useEffect(() => {
    if (!vendors.length) dispatch(fetchVendorsThunk());
    if (!companies.length) dispatch(fetchCompaniesThunk());
  }, [dispatch]);

  // --- Filtering Logic ---
  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      vendor.name?.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      vendor.email?.toLowerCase().includes(searchQuery.trim().toLowerCase());

    let matchesStatus = true;
    if (selectedStatus === "active") matchesStatus = vendor.is_active === true;
    else if (selectedStatus === "inactive")
      matchesStatus = vendor.is_active === false;
    else if (selectedStatus === "pending")
      matchesStatus = vendor.status === "pending";
    else if (selectedStatus === "suspended")
      matchesStatus = vendor.status === "suspended";
    // else "all"

    return matchesSearch && matchesStatus;
  });

  // --- Handler Functions ---
  const handleSync = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      console.log("Vendors synced");
      alert("Vendors synchronized successfully!");
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

  // Updated vendor modal handlers
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

  const handleAssignEntity = (vendor) => {
    setVendorToAssign(vendor);
    setIsAssignModalOpen(true);
  };

  // Updated form submission handler
  const handleVendorSubmit = (formData) => {
    if (vendorModalMode === "create") {
      dispatch(createVendorThunk(formData));
    } else if (vendorModalMode === "edit" && selectedVendor) {
      dispatch(
        updateVendorThunk({
          id: selectedVendor.id,
          ...formData,
        })
      );
    }
    setIsVendorModalOpen(false);
    setSelectedVendor(null);
  };

  const handleCloseVendorModal = () => {
    setIsVendorModalOpen(false);
    setSelectedVendor(null);
  };

  const handleDeleteVendor = (vendor) => {
    if (window.confirm(`Are you sure you want to delete ${vendor.name}?`)) {
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
              placeholder="Search vendors"
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
            <SelectField
              label="Status"
              value={selectedStatus}
              onChange={setSelectedStatus}
              options={statusOptions}
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
              className="bg-indigo-600 text-white px-1 py-2 rounded-lg"
              size={18}
            />
          </div>
        }
      />
      <div className="mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4 md:gap-6">
          {filteredVendors.map((vendor, index) => (
            <NewVendorCard
              key={vendor._id || vendor.id || `vendor-${index}`}
              vendor={vendor}
              onAssignEntity={() => handleAssignEntity(vendor)}
              onEditVendor={() => handleEditVendor(vendor)}
              onViewVendor={() => handleViewVendor(vendor)}
              onDeleteVendor={() => handleDeleteVendor(vendor)}
            />
          ))}
        </div>
        {/* Vendor Modal Form for Create/Edit/View */}
        <VendorModalForm
          isOpen={isVendorModalOpen}
          onClose={handleCloseVendorModal}
          onSubmit={handleVendorSubmit}
          mode={vendorModalMode}
          vendorData={selectedVendor}
          loading={vendorLoading}
          userType={type || "user"} // or get this from your auth state
          tenants={[
            { id: 1, name: "NGNI Corporation", tenantId: "NGNI001" },
            { id: 2, name: "Tech Solutions Ltd", tenantId: "TECH002" },
            { id: 3, name: "Global Enterprises", tenantId: "GLBL003" },
            // ... more tenants from your API
          ]}
        />

        {/* Assign/Edit Vendor Modal */}
        <NewAssignEntityModal
          isOpen={isAssignModalOpen}
          onClose={() => {
            setIsAssignModalOpen(false);
            setVendorToAssign(null);
          }}
          sourceEntity={vendorToAssign}
        />
      </div>
    </div>
  );
};

export default NewVendorManagement;

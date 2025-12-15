import React, { useState, useEffect, useCallback } from "react";
import { Download, History } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import Select from "react-select";

import DriverFormModal from "../components/driver/NewDriverFrom";
import ToolBar from "../components/ui/ToolBar";
import SearchInput from "@components/ui/SearchInput";
import ReusableButton from "../components/ui/ReusableButton";
import SelectField from "../components/ui/SelectField";
import { useVendorOptions } from "../hooks/useVendorOptions";
import { logDebug } from "../utils/logger";
import { NewDriverList } from "../components/driver/NewDriverList";

// import { NewfetchDriversThunk } from "../redux/features/manageDriver/driverThunks";
import { selectCurrentUser } from "../redux/features/auth/authSlice";
import {
  driversSelectors,
  NewfetchDriversThunk,
  selectDriversLoading,
  selectDriversTotal,
} from "../redux/features/manageDriver/newDriverSlice";

const NewDriverManagement = () => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("All");

  // Local state for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showAuditModal, setShowAuditModal] = useState(false);

  // Get user information from Redux
  const user = useSelector(selectCurrentUser);

  const isVendorUser = user?.type === "vendor";

  // Get drivers data from Redux using selectors
  const drivers = useSelector(driversSelectors.selectAll);
  const loading = useSelector(selectDriversLoading);
  const totalItems = useSelector(selectDriversTotal);

  // Calculate total pages from Redux state
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const skip = (currentPage - 1) * itemsPerPage;
  const state = useSelector((state) => state.newDriver);
  const vendors = useVendorOptions();

  // Build params for fetching drivers
  const buildFetchParams = useCallback(() => {
    const params = {
      skip: skip,
      limit: itemsPerPage,
    };

    // Add vendor_id based on user type
    if (isVendorUser) {
      params.vendor_id = user.vendor_id;
    } else if (selectedVendor?.value) {
      params.vendor_id = selectedVendor.value;
    } else {
      // Non-vendor user without vendor selection - don't fetch
      return null;
    }

    // Add search term if provided
    if (searchTerm.trim() !== "") {
      params.search = searchTerm.trim();
    }

    // Add status filter if not "All"
    if (status !== "All") {
      params.status = status;
    }

    // Remove undefined/null values
    return Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value != null)
    );
  }, [
    skip,
    itemsPerPage,
    isVendorUser,
    user?.vendor_id,
    selectedVendor,
    searchTerm,
    status,
  ]);

  // Fetch drivers when filters change
  useEffect(() => {
    const fetchDrivers = () => {
      const fetchParams = buildFetchParams();

      // Only fetch if:
      // 1. Vendor user (always has vendor_id)
      // 2. Non-vendor user with vendor selected
      if (fetchParams) {
        dispatch(NewfetchDriversThunk(fetchParams));
      } else {
        console.log("Skipping fetch - no vendor selected");
      }
    };

    fetchDrivers();
  }, [buildFetchParams, dispatch]);

  // Handle search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== "" || searchTerm === "") {
        setCurrentPage(1);
        // The main useEffect will trigger the fetch
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset vendor selection when user changes (e.g., logout/login)
  useEffect(() => {
    if (isVendorUser) {
      setSelectedVendor(null); // Clear vendor selection for vendor users
    }
  }, [isVendorUser]);

  // ----------------------------
  // Modal Handlers
  // ----------------------------
  const handleOpenCreateModal = () => {
    // Don't allow creating drivers if no vendor is selected for non-vendor users
    if (!isVendorUser && !selectedVendor) {
      alert("Please select a vendor first to add drivers.");
      return;
    }

    setModalMode("create");
    setSelectedDriver(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (driver) => {
    setModalMode("edit");
    setSelectedDriver(driver);
    setIsModalOpen(true);
  };

  const handleOpenViewModal = (driver) => {
    setModalMode("view");
    setSelectedDriver(driver);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedDriver(null);
  };

  const handleSubmitSuccess = (message) => {
    alert(message);
    // Refresh the driver list by fetching with current filters
    const fetchParams = buildFetchParams();
    if (fetchParams) {
      dispatch(NewfetchDriversThunk(fetchParams));
    }
  };

  // ----------------------------
  // Pagination Handlers
  // ----------------------------
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (newLimit) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // ----------------------------
  // Vendor Dropdown Handler
  // ----------------------------
  const handleVendorSelect = (option) => {
    setSelectedVendor(option);
    setCurrentPage(1); // Reset to first page when vendor filter changes
  };

  // ----------------------------
  // Driver Status Toggle
  // ----------------------------
  const handleStatusToggle = (driver) => {
    logDebug("handle driver toggle", driver);
  };

  const handleStatusFilter = (value) => {
    setStatus(value);
    setCurrentPage(1); // Reset to first page when status filter changes
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatus("All");
    setCurrentPage(1);

    // For non-vendor users, also clear vendor selection
    if (!isVendorUser) {
      setSelectedVendor(null);
    }
  };

  // Build export params
  const buildExportParams = () => {
    const params = {};

    // Add vendor_id based on user type
    if (isVendorUser) {
      params.vendor_id = user.vendor_id;
    } else if (selectedVendor?.value) {
      params.vendor_id = selectedVendor.value;
    } else {
      return null; // No vendor selected for non-vendor user
    }

    // Add search term if provided
    if (searchTerm.trim() !== "") {
      params.search = searchTerm.trim();
    }

    // Add status filter if not "All"
    if (status !== "All") {
      params.status = status;
    }

    return params;
  };

  const handleExport = () => {
    const exportParams = buildExportParams();

    if (!exportParams) {
      alert("Please select a vendor to export drivers.");
      return;
    }

    alert(`Export with filters: ${JSON.stringify(exportParams)}`);
    // Implement actual export logic here
    // exportDriversCSV(exportParams);
  };

  // Check if we should show "No vendor selected" message
  const shouldShowNoVendorMessage = !isVendorUser && !selectedVendor;

  // Check if we have data to display
  const hasDataToDisplay = drivers.length > 0;

  // Check if we're in a valid state to fetch/show data
  const isValidFetchState = isVendorUser || selectedVendor;
  return (
    <div className="p-4 md:p-6">
      {/* Toolbar */}
      <ToolBar
        onAddClick={handleOpenCreateModal}
        module="driver"
        addButtonLabel="Driver"
        addButtonDisabled={shouldShowNoVendorMessage}
        searchBar={
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <SearchInput
              placeholder="Search drivers by name, license number, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow"
              disabled={shouldShowNoVendorMessage}
            />
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
              disabled={shouldShowNoVendorMessage && !isVendorUser}
            >
              Clear Filters
            </button>
          </div>
        }
        rightElements={
          <div className="flex flex-wrap items-center gap-3">
            <ReusableButton
              module="vendor-user"
              action="delete"
              icon={History}
              title="View Audit History"
              onClick={() => setShowAuditModal(true)}
              className="text-white bg-blue-600 px-3 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 transition-colors"
              disabled={shouldShowNoVendorMessage}
            />
            
            <ReusableButton
              module="driver"
              action="read"
              icon={Download}
              title="Export Driver CSV"
              onClick={handleExport}
              className="text-gray-600 hover:text-gray-800 p-2 rounded-lg bg-gray-100 hover:bg-green-100 border border-gray-300"
              size={18}
              disabled={shouldShowNoVendorMessage}
            />

            {/* Vendor Dropdown - Only show if user is NOT a vendor */}
            {!isVendorUser && (
              <div className="min-w-[200px]">
                <Select
                  options={vendors}
                  value={selectedVendor}
                  onChange={handleVendorSelect}
                  isSearchable={true}
                  placeholder="Select vendor..."
                  className="react-select-container"
                  classNamePrefix="react-select"
                  isClearable={true}
                />
              </div>
            )}

            {/* Status Filter */}
            <SelectField
              value={status}
              onChange={handleStatusFilter}
              options={[
                { label: "All Status", value: "All" },
                { label: "Active", value: "Active" },
                { label: "Inactive", value: "Inactive" },
              ]}
              className="min-w-[140px]"
              disabled={shouldShowNoVendorMessage}
            />
          </div>
        }
      />

      {/* Vendor Selection Required Message for Non-Vendor Users */}
      {shouldShowNoVendorMessage && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-center">
            <p className="text-yellow-800 font-medium">
              Please select a vendor to view drivers
            </p>
            <p className="text-yellow-600 text-sm mt-1">
              Choose a vendor from the dropdown above to see their drivers
            </p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && isValidFetchState ? (
        <div className="mt-6 text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading drivers...</p>
        </div>
      ) : !loading && isValidFetchState ? (
        <>
          {/* Results Count with Vendor Info */}
          <div className="mt-4 mb-2 text-sm text-gray-600">
            Showing {drivers?.length} of {totalItems} drivers
            {isVendorUser ? (
              <span className="ml-2 text-blue-600">
                (Vendor: {user.vendor_name || user.vendor_id})
              </span>
            ) : selectedVendor ? (
              <span className="ml-2 text-blue-600">
                (Vendor: {selectedVendor.label})
              </span>
            ) : null}
          </div>

          {/* No Results Message */}
          {!hasDataToDisplay && (
            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
              <p className="text-gray-600">No drivers found</p>
              <p className="text-gray-500 text-sm mt-1">
                {searchTerm
                  ? "Try adjusting your search term"
                  : "No drivers available for this vendor"}
              </p>
            </div>
          )}

          {/* Driver List with Pagination - Only show if we have data */}
          {hasDataToDisplay && (
            <NewDriverList
              drivers={drivers}
              onEdit={handleOpenEditModal}
              onView={handleOpenViewModal}
              onStatusToggle={handleStatusToggle}
              // Pagination Props
              showPagination={true}
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          )}
        </>
      ) : null}

      {/* Driver Form Modal */}
      <DriverFormModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        mode={modalMode}
        driverData={selectedDriver}
        onSubmitSuccess={handleSubmitSuccess}
        vendorId={isVendorUser ? user.vendor_id : selectedVendor?.value}
      />

      {/* Audit History Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Audit History</h2>
              <button
                onClick={() => setShowAuditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <p className="text-gray-600">
              Audit history functionality to be implemented.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewDriverManagement;

import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import { Plus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { DriverList } from "@components/driver/DriverList";
import ToolBar from "@components/ui/ToolBar";
import Pagination from "@components/ui/Pagination";
import FilterBadges from "@components/ui/FilterBadges";
import StatusIndicator from "@components/ui/StatusIndicator";
import SearchInput from "@components/ui/SearchInput";
import SelectField from "@components/ui/SelectField";
import { toast } from "react-toastify";
import {
  setSearchTerm,
  resetFilters,
  setPage,
  updateDriverStatus,
  selectPaginatedDrivers,
  selectLoading,
  selectError,
  selectStatusOptions,
  selectActiveFilters,
  selectCounts,
  selectFilteredDrivers,
} from "../redux/features/manageDriver/driverSlice";
import DriverForm from "@components/driver/DriverForm";
import Modal from "@components/modals/Modal";
import ConfirmationModal from "@components/modals/ConfirmationModal";
import {
  fetchDriversThunk,
  toggleDriverStatusThunk,
  fetchDriversByVendorThunk,
} from "../redux/features/manageDriver/driverThunks";
import VendorSelector from "../components/vendor/vendordropdown";
import { logDebug } from "../utils/logger";

function ManageDrivers() {
  const dispatch = useDispatch();
  const drivers = useSelector(selectPaginatedDrivers);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const statusOptions = useSelector(selectStatusOptions);
  const activeFilters = useSelector(selectActiveFilters);
  const counts = useSelector(selectCounts);
  const filters = useSelector((state) => state.drivers.filters);
  const pagination = useSelector((state) => state.drivers.pagination);
  const driversEntities = useSelector((state) => state.drivers.entities);
  const driversIds = useSelector((state) => state.drivers.ids);
  const currentUser = useSelector((state) => state.auth.user);
  const userType = currentUser?.type;

  // Track selected vendor
  const [selectedVendorId, setSelectedVendorId] = useState(null);

  // Modal and form state
  const [showModal, setShowModal] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [selectedDriver, setSelectedDriver] = useState(null);

  // State for SelectField
  const [selectedCompanyId, setSelectedCompanyId] = useState("all");

  // Existing selectors
  const statusFilterValue = useSelector(
    (state) => state.drivers.filters.statusFilter
  );
  const verificationFilterValue = useSelector(
    (state) => state.drivers.filters.verificationFilter
  );
  const searchTermValue = useSelector(
    (state) => state.drivers.filters.searchTerm
  );
  const paginationSkip = useSelector((state) => state.drivers.pagination.skip);
  const paginationLimit = useSelector(
    (state) => state.drivers.pagination.limit
  );
  const filteredDriversLength = useSelector(
    (state) => selectFilteredDrivers(state).length
  );

  const hasFetched = useSelector((state) => state.drivers.hasFetched);
  const currentPage = Math.floor(paginationSkip / paginationLimit) + 1;
  const [confirmationModal, setConfirmationModal] = useState({
    show: false,
    title: "",
    message: "",
    onConfirm: () => {},
    onCancel: () => {},
  });

  // Track the last fetched page to prevent refetching when going back
  const lastFetchedPage = useRef(0);

  // Handle vendor selection - only fetch when vendor is selected
  const handleVendorSelect = useCallback(
    (vendor) => {
      const vendorId = vendor.vendor_id;
      setSelectedVendorId(vendorId);

      // Reset to first page when changing vendor
      dispatch(setPage(1));

      if (vendorId === "all" || vendorId === "ALL") {
        console.log("🌍 Fetching ALL drivers (tenant-wide)");
        dispatch(fetchDriversThunk());
        return;
      }

      console.log("🚗 Fetching drivers for vendor:", vendorId);
      dispatch(fetchDriversByVendorThunk(vendorId));
    },
    [dispatch]
  );

  // Fetch drivers only on component mount if we need initial data
  // But we're changing to only fetch on vendor select
  // So we'll remove the initial fetch
  useEffect(() => {
    // Optionally, you can fetch a default vendor's data on mount
    // For example, if user has a default vendor assigned
    // Otherwise, leave it empty so no drivers are fetched initially
    console.log("Component mounted - waiting for vendor selection");
  }, [dispatch]);

  // Handle company change
  const handleCompanyChange = (value) => {
    setSelectedCompanyId(value);
    console.log("Selected company:", value);

    // If you have vendor selection, you might want to refetch
    // when company changes if company is different from vendor
    if (selectedVendorId && selectedVendorId !== "all") {
      // Re-fetch for the selected vendor
      dispatch(fetchDriversByVendorThunk(selectedVendorId));
    }
  };

  // Local filtered drivers
  const filteredDrivers = useMemo(() => {
    return driversIds
      .map((id) => driversEntities[id])
      .filter((driver) => {
        const matchesStatus =
          filters.statusFilter === "all" ||
          (filters.statusFilter === "active" && driver.is_active) ||
          (filters.statusFilter === "inactive" && !driver.is_active);

        const matchesVerification =
          filters.verificationFilter === "all" ||
          (filters.verificationFilter === "pending" &&
            driver.verification_status?.toLowerCase() === "pending") ||
          (filters.verificationFilter === "verified" &&
            driver.verification_status?.toLowerCase() === "verified");

        const term = filters.searchTerm.toLowerCase();
        const matchesSearch =
          !term ||
          driver.name?.toLowerCase().includes(term) ||
          driver.email?.toLowerCase().includes(term) ||
          driver.phone?.toLowerCase().includes(term) ||
          driver.license_number?.toLowerCase().includes(term);

        // Add company filter if needed
        const matchesCompany =
          selectedCompanyId === "all" ||
          driver.company_id === selectedCompanyId ||
          driver.vendor_id === selectedCompanyId;

        return (
          matchesStatus &&
          matchesVerification &&
          matchesSearch &&
          matchesCompany
        );
      });
  }, [driversEntities, driversIds, filters, selectedCompanyId]);

  // Handle pagination for current vendor
  useEffect(() => {
    if (selectedVendorId && currentPage > lastFetchedPage.current) {
      if (selectedVendorId === "all") {
        dispatch(fetchDriversThunk(currentPage));
      } else {
        // For vendor-specific pagination, you might need to adjust your thunk
        dispatch(
          fetchDriversByVendorThunk({
            vendorId: selectedVendorId,
            page: currentPage,
          })
        );
      }
      lastFetchedPage.current = currentPage;
    }
  }, [currentPage, selectedVendorId, dispatch]);

  // Modal handlers
  const openCreateModal = () => {
    setFormMode("create");
    setSelectedDriver(null);
    setShowModal(true);
  };

  const openEditModal = (driver) => {
    setFormMode("edit");
    setSelectedDriver(driver);
    setShowModal(true);
  };

  const openViewModal = (driver) => {
    setFormMode("view");
    setSelectedDriver(driver);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDriver(null);
    setFormMode("create");
  };

  const handleFormSuccess = () => {
    // Refresh drivers for the current vendor after form success
    if (selectedVendorId) {
      if (selectedVendorId === "all") {
        dispatch(fetchDriversThunk(currentPage));
      } else {
        dispatch(fetchDriversByVendorThunk(selectedVendorId));
      }
    }
    closeModal();
  };

  logDebug("this is the selected vendor ", selectedVendorId);

  const handleStatusToggle = (driver) => {
    setConfirmationModal({
      show: true,
      title: "Confirm Status Change",
      message: `Are you sure you want to ${
        driver.is_active ? "deactivate" : "activate"
      } this driver?`,
      onConfirm: async () => {
        try {
          const updatedDriver = await dispatch(
            toggleDriverStatusThunk(driver.driver_id)
          ).unwrap();

          dispatch(
            updateDriverStatus({
              driverId: updatedDriver.driver_id,
              isActive: updatedDriver.is_active,
            })
          );

          toast.success(
            `Driver has been ${
              updatedDriver.is_active ? "activated" : "deactivated"
            } successfully!`
          );

          // Refresh the list for current vendor
          if (selectedVendorId) {
            if (selectedVendorId === "all") {
              dispatch(fetchDriversThunk(currentPage));
            } else {
              dispatch(fetchDriversByVendorThunk(selectedVendorId));
            }
          }
        } catch (err) {
          toast.error(err.message || "Failed to update driver status.");
        } finally {
          setConfirmationModal({ ...confirmationModal, show: false });
        }
      },
      onCancel: () => {
        setConfirmationModal({ ...confirmationModal, show: false });
      },
    });
  };

  const handlePageChange = (page) => {
    dispatch(setPage(page));
  };

  const handleSearch = (term) => {
    dispatch(setSearchTerm(term));
  };

  const handleClearSearch = () => {
    dispatch(setSearchTerm(""));
  };

  const handleFilterReset = () => {
    dispatch(resetFilters());
    setSelectedCompanyId("all");
    // Note: We don't reset the vendor selection here
    // as that would clear the loaded data
  };

  const getModalTitle = () => {
    switch (formMode) {
      case "create":
        return "Add New Driver";
      case "edit":
        return "Edit Driver";
      case "view":
        return "View Driver Details";
      default:
        return "Driver Form";
    }
  };

  // Show empty state when no vendor is selected
  if (!selectedVendorId && !loading) {
    return (
      <div className="space-y-4">
        <ToolBar
          className="p-4 bg-white border rounded-lg shadow-sm mb-6"
          rightElements={
            <div className="flex items-center gap-3">
              {/* Company filter using SelectField */}
              <SelectField
                label="Select Company"
                value={selectedCompanyId}
                onChange={handleCompanyChange}
                options={statusOptions.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
                placeholder="All Companies"
                className="min-w-[200px]"
              />

              {userType === "employee" && (
                <VendorSelector onChange={handleVendorSelect} />
              )}

              {/* Reset Filters Button */}
              <button
                onClick={handleFilterReset}
                className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 
          hover:bg-blue-50 rounded-md transition-colors"
              >
                Reset Filters
              </button>

              {/* Add Driver Button - disabled until vendor selected */}
              <button
                onClick={openCreateModal}
                disabled={!selectedVendorId}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow transition ${
                  selectedVendorId
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <Plus size={16} /> Add Driver
              </button>
            </div>
          }
          searchBar={
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <SearchInput
                placeholder="Search by name, email, phone, or license number"
                value={searchTermValue}
                onChange={handleSearch}
                onClear={handleClearSearch}
                className="flex-grow"
                disabled={!selectedVendorId}
              />
            </div>
          }
        />

        <div className="flex justify-center items-center h-64 bg-white rounded-lg border">
          <div className="text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Vendor Selected
            </h3>
            <p className="text-gray-500 mb-4">
              {userType === "employee"
                ? "Please select a vendor from the dropdown above to view drivers."
                : "Please wait while we load drivers for your account."}
            </p>
            {userType === "employee" && (
              <p className="text-sm text-gray-400">
                Use the vendor selector to choose a vendor and view their
                drivers
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading drivers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ToolBar
        className="p-4 bg-white border rounded-lg shadow-sm mb-6"
        rightElements={
          <div className="flex items-center gap-3">
            {/* Company filter using SelectField */}
            <SelectField
              label="Select Company"
              value={selectedCompanyId}
              onChange={handleCompanyChange}
              options={statusOptions.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              placeholder="All Companies"
              className="min-w-[200px]"
            />

            {userType === "employee" && (
              <VendorSelector
                onChange={handleVendorSelect}
                value={selectedVendorId}
              />
            )}

            {/* Reset Filters Button */}
            <button
              onClick={handleFilterReset}
              className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 
          hover:bg-blue-50 rounded-md transition-colors"
            >
              Reset Filters
            </button>

            {/* Add Driver Button */}
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            >
              <Plus size={16} /> Add Driver
            </button>
          </div>
        }
        searchBar={
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <SearchInput
              placeholder="Search by name, email, phone, or license number"
              value={searchTermValue}
              onChange={handleSearch}
              onClear={handleClearSearch}
              className="flex-grow"
            />
          </div>
        }
      />

      {/* Active filters display */}
      {activeFilters.length > 0 && (
        <FilterBadges filters={activeFilters} onClear={handleFilterReset} />
      )}

      {/* Status indicators - only show if we have drivers */}
      {driversIds.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatusIndicator
            label="Total Drivers"
            value={counts.total}
            icon="users"
            className="bg-blue-50 text-blue-600"
          />
          <StatusIndicator
            label="Active Drivers"
            value={counts.active}
            icon="check-circle"
            className="bg-green-50 text-green-600"
          />
          <StatusIndicator
            label="Pending Verifications"
            value={counts.pendingVerifications}
            icon="clock"
            className="bg-yellow-50 text-yellow-600"
            tooltip="Drivers with pending document verifications"
          />
          <StatusIndicator
            label="Expired Documents"
            value={counts.expiredDocuments}
            icon="alert-triangle"
            className="bg-red-50 text-red-600"
            tooltip="Drivers with expired licenses or badges"
          />
        </div>
      )}

      {driversIds.length === 0 && !loading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-lg border">
          <div className="text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Drivers Found
            </h3>
            <p className="text-gray-500">
              {selectedVendorId === "all"
                ? "No drivers found for all vendors."
                : "No drivers found for the selected vendor."}
            </p>
          </div>
        </div>
      ) : (
        <>
          <DriverList
            drivers={drivers}
            onEdit={openEditModal}
            onView={openViewModal}
            onStatusToggle={handleStatusToggle}
          />

          <Pagination
            currentPage={Math.floor(paginationSkip / paginationLimit) + 1}
            totalPages={Math.ceil(filteredDriversLength / paginationLimit)}
            onPageChange={handlePageChange}
            className="mt-4"
          />
        </>
      )}

      {/* Driver Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={getModalTitle()}
        size="xl"
      >
        <DriverForm
          initialData={selectedDriver}
          mode={formMode}
          onClose={handleFormSuccess}
          vendorId={selectedVendorId !== "all" ? selectedVendorId : null}
        />
      </Modal>

      <ConfirmationModal
        show={confirmationModal.show}
        title={confirmationModal.title}
        message={confirmationModal.message}
        onConfirm={confirmationModal.onConfirm}
        onCancel={confirmationModal.onCancel}
      />
    </div>
  );
}

export default React.memo(ManageDrivers);

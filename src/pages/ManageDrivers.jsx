import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Plus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

// UI Components
import { DriverList } from "@components/driver/DriverList";
import ToolBar from "@components/ui/ToolBar";
import Pagination from "@components/ui/Pagination";
import FilterBadges from "@components/ui/FilterBadges";
import StatusIndicator from "@components/ui/StatusIndicator";
import ReusableButton from "@components/ui/ReusableButton";
import VendorSelector from "../components/vendor/vendordropdown";

// Redux
import {
  setSearchTerm,
  setStatusFilter,
  setVerificationFilter,
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
  setSelectedDriverVendor,
} from "../redux/features/manageDriver/driverSlice";
import {
  toggleDriverStatusThunk,
  fetchDriversByVendorThunk,
} from "../redux/features/manageDriver/driverThunks";

// Modals
import DriverForm from "@components/driver/DriverForm";
import Modal from "@components/modals/Modal";
import ConfirmationModal from "@components/modals/ConfirmationModal";

// ============================================================================
// REDUX SELECTORS & STATE
// ============================================================================
function ManageDrivers() {
  const dispatch = useDispatch();

  // Driver data selectors
  const drivers = useSelector(selectPaginatedDrivers);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const filters = useSelector((state) => state.drivers.filters);
  const pagination = useSelector((state) => state.drivers.pagination);
  const hasFetched = useSelector((state) => state.drivers.hasFetched);

  // UI & filter selectors
  const statusOptions = useSelector(selectStatusOptions);
  const activeFilters = useSelector(selectActiveFilters);
  const counts = useSelector(selectCounts);
  const filteredDriversLength = useSelector((state) =>
    selectFilteredDrivers(state).length
  );

  // User & vendor selectors
  const currentUser = useSelector((state) => state.auth.user);
  const selectedVendor = useSelector((state) => state.drivers.selectedVendor);

  // ============================================================================
  // LOCAL STATE
  // ============================================================================

  // Modal management
  const [showModal, setShowModal] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [selectedDriver, setSelectedDriver] = useState(null);

  // Confirmation dialog
  const [confirmationModal, setConfirmationModal] = useState({
    show: false,
    title: "",
    message: "",
    onConfirm: () => {},
    onCancel: () => {},
  });

  // Pagination tracking
  const lastFetchedPage = useRef(0);

  // Derived state
  const currentPage = Math.floor(pagination.skip / pagination.limit) + 1;
  const isVendorUser = !!currentUser?.vendor_user;
  const statusFilterValue = filters.statusFilter;
  const searchTermValue = filters.searchTerm;

  // ============================================================================
  // EFFECTS: DATA FETCHING
  // ============================================================================

  /**
   * Initial fetch: Load drivers for current vendor user on mount
   */
  useEffect(() => {
    if (!hasFetched && isVendorUser && currentUser?.vendor_user?.vendor_id) {
      dispatch(fetchDriversByVendorThunk(currentUser.vendor_user.vendor_id));
    }
  }, [dispatch, hasFetched, isVendorUser, currentUser]);

  /**
   * Pagination fetch: Load next page when pagination changes
   */
  useEffect(() => {
    if (!hasFetched) return;

    const vendorToFetch =
      selectedVendor || currentUser?.vendor_user?.vendor_id;

    const shouldFetch =
      vendorToFetch && currentPage > lastFetchedPage.current && !drivers.length;

    if (shouldFetch) {
      dispatch(fetchDriversByVendorThunk(vendorToFetch));
      lastFetchedPage.current = currentPage;
    }
  }, [currentPage, hasFetched, drivers.length, dispatch, selectedVendor, currentUser]);

  // ============================================================================
  // HANDLERS: MODAL OPERATIONS
  // ============================================================================

  /**
   * Open create driver modal (with vendor validation for non-vendor users)
   */
  const handleOpenCreateModal = useCallback(() => {
    if (!isVendorUser && !selectedVendor) {
      toast.error("Please select a vendor before adding a driver.");
      return;
    }
    setFormMode("create");
    setSelectedDriver(null);
    setShowModal(true);
  }, [isVendorUser, selectedVendor]);

  /**
   * Open edit driver modal
   */
  const handleOpenEditModal = useCallback((driver) => {
    setFormMode("edit");
    setSelectedDriver(driver);
    setShowModal(true);
  }, []);

  /**
   * Open view driver modal
   */
  const handleOpenViewModal = useCallback((driver) => {
    setFormMode("view");
    setSelectedDriver(driver);
    setShowModal(true);
  }, []);

  /**
   * Close modal and reset state
   */
  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setSelectedDriver(null);
    setFormMode("create");
  }, []);

  /**
   * Handle successful form submission: refresh driver list
   */
  const handleFormSuccess = useCallback(() => {
    const vendorToFetch =
      selectedVendor || currentUser?.vendor_user?.vendor_id;

    if (vendorToFetch) {
      dispatch(fetchDriversByVendorThunk(vendorToFetch));
    }
    handleCloseModal();
  }, [selectedVendor, currentUser, dispatch, handleCloseModal]);

  // ============================================================================
  // HANDLERS: DRIVER ACTIONS
  // ============================================================================

  /**
   * Toggle driver active/inactive status with confirmation
   */
  const handleStatusToggle = useCallback((driver) => {
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
        } catch (err) {
          toast.error(err?.message || "Failed to update driver status.");
        } finally {
          setConfirmationModal((prev) => ({ ...prev, show: false }));
        }
      },
      onCancel: () => {
        setConfirmationModal((prev) => ({ ...prev, show: false }));
      },
    });
  }, [dispatch]);

  // ============================================================================
  // HANDLERS: VENDOR SELECTION
  // ============================================================================

  /**
   * Handle vendor dropdown change: store selection and fetch drivers
   */
  const handleVendorSelect = useCallback(
    (vendor) => {
      const vendorId = vendor.vendor_id;

      dispatch(setSelectedDriverVendor(vendorId));
      dispatch(setPage(1));

      if (vendorId) {
        dispatch(fetchDriversByVendorThunk(vendorId));
      }
    },
    [dispatch]
  );

  // ============================================================================
  // HANDLERS: FILTERS & SEARCH
  // ============================================================================

  /**
   * Handle status filter change
   */
  const handleStatusFilterChange = useCallback(
    (value) => {
      dispatch(setStatusFilter(value));
    },
    [dispatch]
  );

  /**
   * Handle search input change
   */
  const handleSearchChange = useCallback(
    (term) => {
      dispatch(setSearchTerm(term));
    },
    [dispatch]
  );

  /**
   * Reset all filters to defaults
   */
  const handleResetFilters = useCallback(() => {
    dispatch(resetFilters());
  }, [dispatch]);

  /**
   * Handle pagination page change
   */
  const handlePageChange = useCallback(
    (page) => {
      dispatch(setPage(page));
    },
    [dispatch]
  );

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  /**
   * Get modal title based on form mode
   */
  const getModalTitle = () => {
    const titles = {
      create: "Add New Driver",
      edit: "Edit Driver",
      view: "View Driver Details",
    };
    return titles[formMode] || "Driver Form";
  };

  /**
   * Loading state render
   */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading drivers...</div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: MAIN UI
  // ============================================================================

  return (
    <div className="space-y-4">
      {/* Toolbar with filters and actions */}
      <ToolBar
        leftElements={<FilterSection />}
        rightElements={<ActionSection />}
        searchBar={<SearchBar />}
      />

      {/* Active filters display */}
      {activeFilters.length > 0 && (
        <FilterBadges filters={activeFilters} onClear={handleResetFilters} />
      )}

      {/* Status indicators */}
      <StatusIndicatorsGrid />

      {/* Driver list */}
      <DriverList
        drivers={drivers}
        onEdit={handleOpenEditModal}
        onView={handleOpenViewModal}
        onStatusToggle={handleStatusToggle}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(filteredDriversLength / pagination.limit)}
        onPageChange={handlePageChange}
        className="mt-4"
      />

      {/* Driver form modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={getModalTitle()}
        size="xl"
      >
        <DriverForm
          initialData={
            formMode === "create" && selectedVendor
              ? { vendor: { vendor_id: selectedVendor } }
              : selectedDriver
          }
          mode={formMode}
          onClose={handleFormSuccess}
        />
      </Modal>

      {/* Confirmation dialog */}
      <ConfirmationModal
        show={confirmationModal.show}
        title={confirmationModal.title}
        message={confirmationModal.message}
        onConfirm={confirmationModal.onConfirm}
        onCancel={confirmationModal.onCancel}
      />
    </div>
  );

  // ============================================================================
  // COMPONENT: FILTER SECTION (LEFT TOOLBAR)
  // ============================================================================

  function FilterSection() {
    return (
      <div className="flex flex-wrap gap-2">
        {/* Status filter dropdown */}
        <div className="relative">
          <select
            className="appearance-none border border-gray-300 rounded-md pl-3 pr-8 py-2 text-sm 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            bg-white text-gray-700 shadow-sm"
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            value={statusFilterValue}
            aria-label="Filter by status"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {/* Vendor selector (for non-vendor users only) */}
        {!isVendorUser && (
          <VendorSelector onChange={handleVendorSelect} />
        )}
      </div>
    );
  }

  // ============================================================================
  // COMPONENT: ACTION SECTION (RIGHT TOOLBAR)
  // ============================================================================

  function ActionSection() {
    return (
      <div className="flex gap-2 items-center">
        {/* Reset filters button */}
        <button
          onClick={handleResetFilters}
          className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 
          hover:bg-blue-50 rounded-md transition-colors"
          aria-label="Reset all filters"
        >
          Reset Filters
        </button>

        {/* Add driver button */}
        <ReusableButton
          module="driver"
          action="create"
          icon={Plus}
          title="Add Driver"
          buttonName="Add Driver"
          onClick={handleOpenCreateModal}
          size={16}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        />
      </div>
    );
  }

  // ============================================================================
  // COMPONENT: SEARCH BAR
  // ============================================================================

  function SearchBar() {
    return (
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search by name, Driver Code, license..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md 
          text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 
          focus:border-blue-500"
          onChange={(e) => handleSearchChange(e.target.value)}
          value={searchTermValue}
          aria-label="Search drivers"
        />
      </div>
    );
  }

  // ============================================================================
  // COMPONENT: STATUS INDICATORS GRID
  // ============================================================================

  function StatusIndicatorsGrid() {
    return (
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
    );
  }
}

export default React.memo(ManageDrivers);

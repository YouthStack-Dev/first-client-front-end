import React, { useEffect, useRef, useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { DriverList } from "@components/driver/DriverList";
import ToolBar from "@components/ui/ToolBar";
import Pagination from "@components/ui/Pagination";
import FilterBadges from "@components/ui/FilterBadges";
import StatusIndicator from "@components/ui/StatusIndicator";
import { toast } from "react-toastify";
import {
  setSearchTerm,
  setStatusFilter,
  setVerificationFilter,
  resetFilters,
  setPage,
  setDriversLoading,
  setDriversError,
  setDriversData,
  updateDriverStatus,
  selectPaginatedDrivers,
  selectLoading,
  selectError,
  selectStatusOptions,
  // selectVerificationOptions,
  selectActiveFilters,
  selectCounts,
  selectFilteredDrivers,
} from "../redux/features/manageDriver/driverSlice";
import DriverForm from "@components/driver/DriverForm";
import Modal from "@components/modals/Modal";
import ConfirmationModal from "@components/modals/ConfirmationModal";
import { fetchDriversThunk, toggleDriverStatusThunk } from "../redux/features/manageDriver/driverThunks";

function ManageDrivers() {
  const dispatch = useDispatch();
  const drivers = useSelector(selectPaginatedDrivers);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const statusOptions = useSelector(selectStatusOptions);
  // const verificationOptions = useSelector(selectVerificationOptions);
  const activeFilters = useSelector(selectActiveFilters);
  const counts = useSelector(selectCounts);
  const filters = useSelector((state) => state.drivers.filters);
  const pagination = useSelector((state) => state.drivers.pagination);
  const driversEntities = useSelector((state) => state.drivers.entities);
  const driversIds = useSelector((state) => state.drivers.ids);

  // Modal and form state
  const [showModal, setShowModal] = useState(false);
  const [formMode, setFormMode] = useState("create"); // 'create', 'edit', 'view'
  const [selectedDriver, setSelectedDriver] = useState(null);

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
  const allDrivers = useSelector((state) => state.drivers.ids);
  const currentPage = Math.floor(paginationSkip / paginationLimit) + 1;
  const [confirmationModal, setConfirmationModal] = useState({
    show: false,
    title: "",
    message: "",
    onConfirm: () => { },
    onCancel: () => { },
  });

  // Track the last fetched page to prevent refetching when going back
  const lastFetchedPage = useRef(0);

  // Fetch drivers once
  useEffect(() => {
    if (!hasFetched) {
      dispatch(fetchDriversThunk());
    }
  }, [dispatch]);

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

        return matchesStatus && matchesVerification && matchesSearch;
      });
  }, [driversEntities, driversIds, filters]);



  useEffect(() => {
    // Fetch drivers if:
    // 1. We haven't fetched any data yet (initial load)
    // 2. We're moving to a new page that hasn't been fetched before
    if (!hasFetched || (currentPage > lastFetchedPage.current && !allDrivers.length)) {
      fetchDriversThunk(currentPage);
    }
  }, [currentPage, hasFetched, allDrivers.length, dispatch, paginationLimit]);

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
    // Refresh drivers data after successful create/update
    fetchDriversThunk(currentPage);
    closeModal();
  };

  const handleStatusToggle = (driver) => {
    setConfirmationModal({
      show: true,
      title: "Confirm Status Change",
      message: `Are you sure you want to ${driver.is_active ? "deactivate" : "activate"
        } this driver?`,
      onConfirm: async () => {
        try {
          // Dispatch the thunk and unwrap result
          const updatedDriver = await dispatch(toggleDriverStatusThunk(driver.driver_id)).unwrap();

          // Update local Redux state if needed
          dispatch(
            updateDriverStatus({
              driverId: updatedDriver.driver_id,
              isActive: updatedDriver.is_active,
            })
          );

          // Show success toast
          toast.success(
            `Driver has been ${updatedDriver.is_active ? "activated" : "deactivated"
            } successfully!`
          );
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

  const handleFilterReset = () => {
    dispatch(resetFilters());
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

  if (loading) {
  return (
    <div className="flex justify-center items-center h-64">
      Loading...
    </div>
  );
}

  return (
    <div className="space-y-4">
      {/* {error && (
          <div className="p-3 mb-4 text-sm bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-md">
            {error}
          </div>
      )} */}
      <ToolBar
        leftElements={
          <div className="flex flex-wrap gap-2">
            {/* Status filter dropdown */}
            <div className="relative">
              <select
                className="appearance-none border border-gray-300 rounded-md pl-3 pr-8 py-2 text-sm 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                bg-white text-gray-700 shadow-sm"
                onChange={(e) => dispatch(setStatusFilter(e.target.value))}
                value={statusFilterValue}
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
          </div>
        }
        rightElements={
          <div className="flex gap-2 items-center">
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
              onChange={(e) => handleSearch(e.target.value)}
              value={searchTermValue}
            />
          </div>
        }
      />


      {/* Active filters display */}
      {activeFilters.length > 0 && (
        <FilterBadges filters={activeFilters} onClear={handleFilterReset} />
      )}

      {/* Status indicators */}
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

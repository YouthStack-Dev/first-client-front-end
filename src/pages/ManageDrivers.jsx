import React, { useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { DriverList } from '../components/driver/DriverList';
import ToolBar from '../components/ui/ToolBar';
import Pagination from '../components/ui/Pagination';
import FilterBadges from '../components/ui/FilterBadges';
import StatusIndicator from '../components/ui/StatusIndicator';
import { API_CLIENT } from '../Api/API_Client';
import {  
  setSearchTerm, setVendorFilter, setStatusFilter, setVerificationFilter, resetFilters,
  setPage, setDriversLoading, setDriversError, setDriversData, updateDriverStatus, 
  selectPaginatedDrivers, selectLoading, selectError, selectVendorOptions, selectStatusOptions,
  selectVerificationOptions, selectActiveFilters, selectCounts, selectFilteredDrivers
} from '../redux/features/manageDriver/driverSlice';
import DriverForm from '../components/driver/DriverForm';
import Modal from '../components/modals/Modal';
import { logDebug } from '../utils/logger';
import ConfirmationModal from '../components/modals/ConfirmationModal';

function ManageDrivers() {
  const dispatch = useDispatch();
  const drivers = useSelector(selectPaginatedDrivers);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const vendorOptions = useSelector(selectVendorOptions);
  const statusOptions = useSelector(selectStatusOptions);
  const verificationOptions = useSelector(selectVerificationOptions);
  const activeFilters = useSelector(selectActiveFilters);
  const counts = useSelector(selectCounts);
  
  // Modal and form state
  const [showModal, setShowModal] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create', 'edit', 'view'
  const [selectedDriver, setSelectedDriver] = useState(null);
  
  // Existing selectors
  const vendorFilterValue = useSelector(state => state.drivers.filters.vendorFilter);
  const statusFilterValue = useSelector(state => state.drivers.filters.statusFilter);
  const verificationFilterValue = useSelector(state => state.drivers.filters.verificationFilter);
  const searchTermValue = useSelector(state => state.drivers.filters.searchTerm);
  const paginationSkip = useSelector(state => state.drivers.pagination.skip);
  const paginationLimit = useSelector(state => state.drivers.pagination.limit);
  const filteredDriversLength = useSelector(state => selectFilteredDrivers(state).length);

  const hasFetched = useSelector(state => state.drivers.hasFetched);
  const allDrivers = useSelector(state => state.drivers.ids);
  const currentPage = Math.floor(paginationSkip / paginationLimit) + 1;
  const [confirmationModal, setConfirmationModal] = useState({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: () => {}
  });
  // Track the last fetched page to prevent refetching when going back
  const lastFetchedPage = useRef(0);

  // Fetch drivers data
  const fetchDrivers = async (page = 1) => {
    try {
      dispatch(setDriversLoading(true));
      const response = await API_CLIENT.get(`/vendors/tenants/drivers/`, {
        params: {
          skip: (page - 1) * paginationLimit,
          limit: 100 // Consider making this dynamic based on your needs
        }
      });
      dispatch(setDriversData(response.data || []));
      lastFetchedPage.current = page;
    } catch (err) {
      dispatch(setDriversError(err.message));
    }
  };

  // Fetch vendors for the form
  const fetchVendors = async () => {
    try {
      const response = await API_CLIENT.get('/vendors/');
      return response.data || [];
    } catch (err) {
      console.error('Error fetching vendors:', err);
      return [];
    }
  };

  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    // Fetch vendors when component mounts
    fetchVendors().then(setVendors);
  }, []);

  useEffect(() => {
    // Fetch drivers if:
    // 1. We haven't fetched any data yet (initial load)
    // 2. We're moving to a new page that hasn't been fetched before
    if (!hasFetched || (currentPage > lastFetchedPage.current && !allDrivers.length)) {
      fetchDrivers(currentPage);
    }
  }, [currentPage, hasFetched, allDrivers.length, dispatch, paginationLimit]);

  // Modal handlers
  const openCreateModal = () => {
    setFormMode('create');
    setSelectedDriver(null);
    setShowModal(true);
  };

  const openEditModal = (driver) => {
    setFormMode('edit');
    setSelectedDriver(driver);
    setShowModal(true);
  };

  const openViewModal = (driver) => {
    setFormMode('view');
    setSelectedDriver(driver);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDriver(null);
    setFormMode('create');
  };

  const handleFormSuccess = () => {
    // Refresh drivers data after successful create/update
    // fetchDrivers(currentPage);
    closeModal();
  };

  const handleStatusToggle = (driver) => {
    setConfirmationModal({
      show: true,
      title: 'Confirm Status Change',
      message: `Are you sure you want to ${driver.is_active ? 'deactivate' : 'activate'} this driver?`,
      onConfirm: async () => {
        try {
          dispatch(setDriversLoading(true));
          await API_CLIENT.patch(`/vendors/${driver.vendor.vendor_id}/drivers/${driver.driver_id}/status`);
          dispatch(updateDriverStatus({
            driverId: driver.driver_id,
            isActive: !driver.is_active
          }));
          // Show success message
        } catch (err) {
          dispatch(setDriversError(err.message));
        } finally {
          dispatch(setDriversLoading(false));
          setConfirmationModal({ ...confirmationModal, show: false });
        }
      },
      onCancel: () => {
        setConfirmationModal({ ...confirmationModal, show: false });
      }
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
      case 'create':
        return 'Add New Driver';
      case 'edit':
        return 'Edit Driver';
      case 'view':
        return 'View Driver Details';
      default:
        return 'Driver Form';
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;

  return (
    <div className="space-y-4">
      <ToolBar
        addButtonLabel="Add Driver"
        addButtonIcon={<Plus size={16} />}
        onAddClick={openCreateModal}
        className="mb-6"
        leftElements={
          <div className="flex flex-wrap gap-2">
            {/* Vendor filter dropdown */}
            <div className="relative">
              <select
                className="appearance-none border border-gray-300 rounded-md pl-3 pr-8 py-2 text-sm 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  bg-white text-gray-700 shadow-sm"
                onChange={(e) => dispatch(setVendorFilter(e.target.value))}
                value={vendorFilterValue}
              >
                {vendorOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

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
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Verification filter dropdown */}
            <div className="relative">
              <select
                className="appearance-none border border-gray-300 rounded-md pl-3 pr-8 py-2 text-sm 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  bg-white text-gray-700 shadow-sm"
                onChange={(e) => dispatch(setVerificationFilter(e.target.value))}
                value={verificationFilterValue}
              >
                {verificationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        }
        rightElements={
          <button
            onClick={handleFilterReset}
            className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 
              hover:bg-blue-50 rounded-md transition-colors"
          >
            Reset Filters
          </button>
        }
        searchBar={
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name, email, phone or license..."
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
        <FilterBadges 
          filters={activeFilters} 
          onClear={handleFilterReset}
        />
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
          vendors={vendors}
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
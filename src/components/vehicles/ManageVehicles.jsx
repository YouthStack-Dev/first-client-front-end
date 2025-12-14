import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import ToolBar from "@components/ui/ToolBar";
import Modal from "@components/modals/Modal";
import VehicleForm from "./VehicleForm";
import { toast } from "react-toastify";
import {
  fetchVehiclesThunk,
  toggleVehicleStatus,
} from "../../redux/features/manageVehicles/vehicleThunk";
import { updateVehicle } from "../../redux/features/manageVehicles/vehicleSlice";
import { selectCurrentUser } from "../../redux/features/auth/authSlice";
import {
  selectPaginatedVehicles,
  selectLoading,
} from "../../redux/features/manageVehicles/vehicleSelectors";
import VehicleList from "./VehicleList";
import Select from "react-select";
import { Plus } from "lucide-react";
import { useVendorOptions } from "@hooks/useVendorOptions";

const ManageVehicles = () => {
  const dispatch = useDispatch();
  const allVehicles = useSelector(selectPaginatedVehicles);
  const loading = useSelector(selectLoading);
  const currentUser = useSelector(selectCurrentUser);
  const userType = currentUser?.type;

  // Determine if user is a vendor
  const isVendorUser = userType === "vendor";

  // Local states
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [vehicleModal, setVehicleModal] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [hasFetched, setHasFetched] = useState(false);
  const vendorSelectOptions = useVendorOptions();

  // If user is vendor, automatically select their vendor
  useEffect(() => {
    if (
      isVendorUser &&
      currentUser?.vendor_id &&
      vendorSelectOptions.length > 0
    ) {
      const vendorOption = vendorSelectOptions.find(
        (option) => option.value === currentUser.vendor_id
      );
      if (vendorOption) {
        setSelectedVendor(vendorOption);
      }
    }
  }, [isVendorUser, currentUser?.vendor_id, vendorSelectOptions]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      // Reset to first page when search changes
      setPagination((prev) => ({
        ...prev,
        page: 1,
        skip: 0,
      }));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    skip: 0,
    total: 0,
    hasMore: false,
  });

  // Search options for react-select (auto-suggestions based on vehicle types)
  const searchOptions = useMemo(() => {
    if (!searchInput) return [];

    // Get unique vehicle types from current vehicles
    const vehiclesFromRedux = allVehicles?.items || allVehicles || [];

    const types = [
      ...new Set(
        vehiclesFromRedux
          .filter((vehicle) =>
            vehicle.vehicle_type
              ?.toLowerCase()
              .includes(searchInput.toLowerCase())
          )
          .map((vehicle) => vehicle.vehicle_type)
          .filter(Boolean) // Remove null/undefined values
      ),
    ];

    return types.map((type) => ({
      value: type,
      label: type,
    }));
  }, [allVehicles, searchInput]);

  // Prepare parameters for API call
  const getFetchParams = () => {
    const params = {
      skip: pagination.skip,
      limit: pagination.limit,
    };

    if (isVendorUser && currentUser?.vendor_id) {
      params.vendor_id = currentUser.vendor_id;
    } else if (selectedVendor?.value) {
      params.vendor_id = selectedVendor.value;
    }

    return params;
  };

  // Check if we should fetch vehicles
  const shouldFetchVehicles = () => {
    // Vendor user: always fetch (we have their vendor_id)
    if (isVendorUser && currentUser?.vendor_id) {
      return true;
    }

    // Non-vendor user: only fetch if vendor is selected
    if (!isVendorUser && selectedVendor?.value) {
      return true;
    }

    return false;
  };

  // Fetch vehicles with pagination and vendor filter
  const fetchVehicles = () => {
    if (!shouldFetchVehicles()) {
      return; // Don't fetch if conditions aren't met
    }

    const params = getFetchParams();
    dispatch(fetchVehiclesThunk(params));
    setHasFetched(true);
  };

  // Fetch vehicles based on conditions
  useEffect(() => {
    // Reset pagination when vendor changes
    setPagination((prev) => ({
      ...prev,
      page: 1,
      skip: 0,
    }));

    fetchVehicles();
  }, [dispatch, selectedVendor, pagination.skip, pagination.limit]);

  // Initial fetch for vendor users on component mount
  useEffect(() => {
    if (isVendorUser && currentUser?.vendor_id && !hasFetched) {
      fetchVehicles();
    }
  }, [isVendorUser, currentUser?.vendor_id, hasFetched]);

  // Update pagination when new data comes in
  useEffect(() => {
    if (allVehicles?.pagination) {
      setPagination((prev) => ({
        ...prev,
        total: allVehicles.pagination.total,
        hasMore: allVehicles.pagination.hasMore,
      }));
    }
  }, [allVehicles?.pagination]);

  const handleEdit = (vehicle) => {
    setEditVehicle(vehicle);
    setVehicleModal(true);
  };

  const handleView = (vehicle) => {
    setEditVehicle(vehicle);
    setVehicleModal(true);
  };

  const handleToggle = async (vehicleId) => {
    const vehiclesArray = allVehicles?.items || allVehicles || [];
    const vehicle = vehiclesArray.find((v) => v.vehicle_id === vehicleId);
    if (!vehicle) return;

    const newStatus = !vehicle.is_active;

    // Update local state
    dispatch(updateVehicle({ ...vehicle, is_active: newStatus }));

    try {
      const result = await dispatch(
        toggleVehicleStatus({ vehicleId, isActive: newStatus })
      ).unwrap();

      toast.success(
        `Vehicle ${vehicle.rc_number || vehicleId} is now ${
          newStatus ? "Active" : "Inactive"
        }`
      );

      // Refresh the list
      fetchVehicles();
    } catch (err) {
      // Revert state on failure
      dispatch(updateVehicle(vehicle));
      toast.error(err?.message || "Failed to update vehicle status");
    }
  };

  const onPrev = () => {
    if (pagination.page > 1) {
      setPagination((prev) => ({
        ...prev,
        page: prev.page - 1,
        skip: Math.max(0, prev.skip - prev.limit),
      }));
    }
  };

  const onNext = () => {
    if (pagination.page < Math.ceil(pagination.total / pagination.limit)) {
      setPagination((prev) => ({
        ...prev,
        page: prev.page + 1,
        skip: prev.skip + prev.limit,
      }));
    }
  };

  const handleVendorChange = (option) => {
    setSelectedVendor(option);
    setHasFetched(false);
    // Reset to first page when filter changes
    setPagination((prev) => ({
      ...prev,
      page: 1,
      skip: 0,
      total: 0, // Reset total when changing vendors
      hasMore: false,
    }));
  };

  const handleStatusChange = (selectedOption) => {
    setStatusFilter(selectedOption.value);
    // Reset to first page when filter changes
    setPagination((prev) => ({
      ...prev,
      page: 1,
      skip: 0,
    }));
  };

  const handleSearchChange = (selectedOption) => {
    if (selectedOption) {
      setSearchInput(selectedOption.value);
    } else {
      setSearchInput("");
      setSearchTerm("");
    }
  };

  const handleInputChangeRaw = (inputValue) => {
    setSearchInput(inputValue);
  };

  // Status options for react-select
  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "true", label: "Active" },
    { value: "false", label: "Inactive" },
  ];

  const handleStatusFilterChange = (selectedOption) => {
    setStatusFilter(selectedOption.value);
    // Reset to first page when filter changes
    setPagination((prev) => ({
      ...prev,
      page: 1,
      skip: 0,
    }));
  };

  // Get vehicles from Redux - handle both array and object with items property
  const vehiclesFromRedux = allVehicles?.items || allVehicles || [];

  // Check if current vehicles match the selected vendor
  const shouldDisplayVehicles = () => {
    if (isVendorUser && currentUser?.vendor_id) {
      // Vendor users can always see vehicles (their own)
      return vehiclesFromRedux.length > 0;
    }

    if (!isVendorUser) {
      // Non-vendor users need to have selected a vendor
      if (!selectedVendor?.value) {
        return false; // No vendor selected, don't show vehicles
      }

      // Check if the displayed vehicles belong to the selected vendor
      if (vehiclesFromRedux.length > 0) {
        // If vehicles exist, check if they match the selected vendor
        const firstVehicle = vehiclesFromRedux[0];
        return firstVehicle.vendor_id === selectedVendor.value;
      }
    }

    return vehiclesFromRedux.length > 0;
  };

  // Filter vehicles based on all criteria (client-side filtering)
  const filteredVehicles = useMemo(() => {
    if (!shouldDisplayVehicles()) return [];

    const searchLower = searchTerm.toLowerCase();

    return vehiclesFromRedux.filter((vehicle) => {
      // Filter by search term
      if (searchTerm) {
        const matchesSearch =
          vehicle.rc_number?.toLowerCase().includes(searchLower) ||
          vehicle.vehicle_type?.toLowerCase().includes(searchLower) ||
          vehicle.vehicle_make?.toLowerCase().includes(searchLower) ||
          vehicle.vehicle_model?.toLowerCase().includes(searchLower) ||
          vehicle.capacity?.toString().includes(searchTerm) ||
          vehicle.vendor_name?.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      // Filter by status
      if (statusFilter !== "all") {
        const isActive = statusFilter === "true";
        if (vehicle.is_active !== isActive) return false;
      }

      return true;
    });
  }, [vehiclesFromRedux, searchTerm, statusFilter, shouldDisplayVehicles]);

  // Calculate pagination for filtered vehicles
  const totalFilteredPages =
    Math.ceil(filteredVehicles.length / pagination.limit) || 1;

  // Get paginated vehicles from filtered list
  const displayVehicles = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    return filteredVehicles.slice(startIndex, endIndex);
  }, [filteredVehicles, pagination.page, pagination.limit]);

  // Show message when no vendor is selected for non-vendor users
  const showNoVendorMessage = !isVendorUser && !selectedVendor?.value;

  // Show message when no vehicles found (after vendor is selected)
  const showNoVehiclesMessage =
    !loading &&
    shouldDisplayVehicles() &&
    filteredVehicles.length === 0 &&
    !showNoVendorMessage;

  // Show loading when fetching
  const showLoading = loading && shouldFetchVehicles();

  return (
    <div className="space-y-4">
      <ToolBar
        module="vehicle"
        className="p-4 bg-white border rounded-lg shadow-sm mb-6"
        onAddClick={() => {
          setEditVehicle(null);
          setVehicleModal(true);
        }}
        addButtonLabel="Vehicle"
        addButtonDisabled={!isVendorUser && !selectedVendor?.value}
        rightElements={
          <div className="flex items-center gap-3">
            <Select
              options={searchOptions}
              value={
                searchInput ? { value: searchInput, label: searchInput } : null
              }
              onChange={handleSearchChange}
              onInputChange={handleInputChangeRaw}
              placeholder="Search ..."
              isClearable
              isSearchable
              className="react-select-container"
              classNamePrefix="react-select"
              styles={{
                container: (base) => ({
                  ...base,
                  width: "250px",
                }),
              }}
            />
            <Select
              options={statusOptions}
              value={
                statusOptions.find((opt) => opt.value === statusFilter) ||
                statusOptions[0]
              }
              onChange={handleStatusFilterChange}
              className="react-select-container"
              classNamePrefix="react-select"
              styles={{
                container: (base) => ({
                  ...base,
                  width: "150px",
                }),
              }}
            />
            {/* Only show vendor filter for non-vendor users */}
            {!isVendorUser && (
              <Select
                onChange={handleVendorChange}
                options={vendorSelectOptions}
                value={selectedVendor}
                isSearchable={true}
                placeholder="Select vendor..."
                className="react-select-container"
                classNamePrefix="react-select"
                isClearable={true}
                styles={{
                  container: (base) => ({
                    ...base,
                    width: "200px",
                  }),
                }}
              />
            )}
          </div>
        }
      />

      {/* Show messages */}
      {showNoVendorMessage && (
        <div className="p-8 text-center border rounded-lg bg-gray-50">
          <p className="text-gray-600">
            Please select a vendor to view vehicles
          </p>
        </div>
      )}

      {showLoading && (
        <div className="p-8 text-center border rounded-lg bg-gray-50">
          <p className="text-gray-600">Loading vehicles...</p>
        </div>
      )}

      {showNoVehiclesMessage && (
        <div className="p-8 text-center border rounded-lg bg-gray-50">
          <p className="text-gray-600">
            No vehicles found for {selectedVendor?.label}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>
      )}

      {/* Vehicle Table - Only show when we should display vehicles */}
      {shouldDisplayVehicles() && !showLoading && (
        <VehicleList
          vehicles={displayVehicles}
          onNext={onNext}
          onPrev={onPrev}
          currentPage={pagination.page}
          totalPages={totalFilteredPages}
          isLoading={loading}
          handleEdit={handleEdit}
          handleView={handleView}
          handleToggle={handleToggle}
          totalItems={filteredVehicles.length}
          showFilterSummary={statusFilter !== "all" || searchTerm}
          filterInfo={
            (statusFilter !== "all" || searchTerm) && (
              <div className="text-sm text-gray-600 mb-2">
                Showing {Math.min(displayVehicles.length, pagination.limit)} of{" "}
                {filteredVehicles.length} vehicles
                {statusFilter !== "all" &&
                  ` • Status: ${
                    statusOptions.find((opt) => opt.value === statusFilter)
                      ?.label
                  }`}
                {searchTerm && ` • Search: "${searchTerm}"`}
              </div>
            )
          }
        />
      )}

      {/* Show vehicles from different vendor message */}
      {!isVendorUser &&
        selectedVendor?.value &&
        vehiclesFromRedux.length > 0 &&
        vehiclesFromRedux[0]?.vendor_id !== selectedVendor.value &&
        !showLoading && (
          <div className="p-4 text-center border rounded-lg bg-yellow-50">
            <p className="text-yellow-700">
              Vehicles displayed are from a different vendor. Please select "
              {selectedVendor.label}" to view their vehicles.
            </p>
          </div>
        )}

      {/* Modal */}
      <Modal
        isOpen={vehicleModal}
        onClose={() => setVehicleModal(false)}
        title={editVehicle ? "Edit Vehicle" : "Add Vehicle"}
        size="xl"
        hideFooter={true}
      >
        <VehicleForm
          mode={editVehicle ? "edit" : "create"}
          initialData={editVehicle || {}}
          onFormChange={() => {}}
          onClose={() => setVehicleModal(false)}
          isEdit={!!editVehicle}
          vendorId={
            isVendorUser ? currentUser?.vendor_id : selectedVendor?.value
          }
        />
      </Modal>
    </div>
  );
};

export default ManageVehicles;

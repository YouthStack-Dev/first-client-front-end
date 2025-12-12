import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Plus } from "lucide-react";
import Select from "react-select";

import VehicleTypeList from "./VehicleTypeList.jsx"; // Your new component
import { ReusablePagination } from "@ui/ReusablePagination"; // Your pagination component
import ToolBar from "@components/ui/ToolBar";
import { useVendorOptions } from "@hooks/useVendorOptions";
import { logDebug } from "../../utils/logger";
import VehicleFormModal from "../modals/VehicleFormModal";
import { fetchVendorVehicleTypes } from "../../redux/features/managevehicletype/vehicleTypeThunks";

// Selector for current user
const selectCurrentUser = (state) => state.auth.user;
// Updated selectors for vehicle type state
const selectVehicleTypes = (state) => state.vehicleType || {};
const selectVehicleTypesLoading = (state) =>
  state.vehicleType?.loading || false;
const selectVehicleTypesItems = (state) => {
  const vehicleTypeState = state.vehicleType || {};
  return (
    vehicleTypeState.allIds?.map((id) => vehicleTypeState.byId?.[id]) || []
  );
};
const selectVendorVehicleTypes = (state, vendorId) => {
  const vehicleTypeState = state.vehicleType || {};
  return vehicleTypeState.vendorById?.[vendorId] || [];
};

const ManageVehicleTypes = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const vehicleTypesState = useSelector(selectVehicleTypes);
  const loading = useSelector(selectVehicleTypesLoading);
  const allVehicleTypes = useSelector(selectVehicleTypesItems);
  const userType = "employee"; // This should come from your auth state

  // Local state for vendor selection
  const [selectedVendor, setSelectedVendor] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Use the vendor options hook
  const vendorSelectOptions = useVendorOptions();
  logDebug("Vendor options:", vendorSelectOptions);

  // Local UI state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  // Check if user is vendor
  const isVendorUser = userType === "vendor";

  // Get vendor-specific vehicle types
  const vendorVehicleTypes = useSelector((state) =>
    selectVendorVehicleTypes(state, selectedVendor?.value)
  );

  // Handle vendor selection from react-select
  const handleVendorChange = (option) => {
    setSelectedVendor(option);
    setCurrentPage(1); // Reset to first page when vendor changes
    console.log("Selected vendor:", option);

    // If a vendor is selected and user is not vendor, fetch vehicle types
    if (option && !isVendorUser) {
      fetchVehicleTypesForVendor(option.value);
    }
  };

  // Function to fetch vehicle types for a vendor
  const fetchVehicleTypesForVendor = (vendorId, skip = 0, limit = 100) => {
    if (vendorId) {
      const params = {
        vendorId,
        skip,
        limit,
      };
      dispatch(fetchVendorVehicleTypes(params));
    }
  };

  // Status filter options for react-select
  const statusOptions = [
    { value: null, label: "All Status" },
    { value: true, label: "Active" },
    { value: false, label: "Inactive" },
  ];

  // Table headers for VehicleTypeList
  const headers = [
    { label: "Vehicle Type Name", key: "name", className: "text-left" },
    { label: "Description", key: "description", className: "text-left" },
    { label: "Seats", key: "seats", className: "text-center" },
    {
      label: "Active",
      key: "is_active",
      className: "text-center",
      render: (item) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            item.is_active
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {item.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  // Get vehicle types data based on user type and selected vendor
  const getVehicleTypesData = () => {
    if (isVendorUser && currentUser?.vendor_id) {
      return vendorVehicleTypes || [];
    } else if (selectedVendor) {
      return vendorVehicleTypes || [];
    }
    return [];
  };

  // Filter data based on search, status
  const vehicleTypes = getVehicleTypesData();
  const filteredData = vehicleTypes.filter((item) => {
    if (!item) return false;

    // Search filter
    const matchesSearch =
      searchInput === "" ||
      item.name?.toLowerCase().includes(searchInput.toLowerCase()) ||
      (item.description &&
        item.description.toLowerCase().includes(searchInput.toLowerCase()));

    // Status filter
    const matchesStatus =
      statusFilter === null || item.is_active === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination calculations
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Handlers
  const handleStatusFilterChange = (selectedOption) => {
    setStatusFilter(selectedOption.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleSearchChange = (selectedOption) => {
    if (selectedOption) {
      setSearchInput(selectedOption.value);
    } else {
      setSearchInput("");
    }
    setCurrentPage(1); // Reset to first page when search changes
  };

  const handleInputChangeRaw = (inputValue, { action }) => {
    if (action === "input-change") {
      setSearchInput(inputValue);
      setCurrentPage(1); // Reset to first page when typing
    }
  };

  // Search options for autocomplete
  const searchOptions = vehicleTypes
    .map((item) => ({
      value: item?.name || "",
      label: `${item?.name || ""} (${item?.seats || 0} seats)`,
    }))
    .filter((option) => option.value);

  // Vehicle form handlers
  const handleAddClick = () => {
    setEditingVehicle(null);
    setIsModalOpen(true);
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleDelete = (vehicle) => {
    if (window.confirm(`Are you sure you want to delete "${vehicle.name}"?`)) {
      // Implement actual delete API call here
      console.log("Delete vehicle:", vehicle);
      // After delete, refresh the data
      if (isVendorUser && currentUser?.vendor_id) {
        fetchVehicleTypesForVendor(currentUser.vendor_id);
      } else if (selectedVendor) {
        fetchVehicleTypesForVendor(selectedVendor.value);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVehicle(null);
  };

  const handleSubmitForm = async (formData) => {
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (editingVehicle) {
        console.log("Update vehicle:", formData);
      } else {
        console.log("Add new vehicle:", formData);
      }

      handleCloseModal();

      // Refresh data after adding/editing
      if (isVendorUser && currentUser?.vendor_id) {
        fetchVehicleTypesForVendor(currentUser.vendor_id);
      } else if (selectedVendor) {
        fetchVehicleTypesForVendor(selectedVendor.value);
      }
    } catch (error) {
      console.error("Error saving vehicle type:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  // Set initial vendor based on user type and fetch vehicle types
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
        fetchVehicleTypesForVendor(vendorOption.value);
      }
    }
  }, [isVendorUser, vendorSelectOptions, currentUser]);

  // Reset to first page when vendor changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedVendor, isVendorUser]);

  return (
    <>
      <ToolBar
        module="vehicle-type"
        className="p-4 bg-white border rounded-lg shadow-sm mb-6"
        onAddClick={handleAddClick}
        addButtonLabel="Add Vehicle Type"
        addButtonIcon={<Plus size={16} />}
        rightElements={
          <div className="flex items-center gap-3">
            <Select
              options={searchOptions}
              value={
                searchInput ? { value: searchInput, label: searchInput } : null
              }
              onChange={handleSearchChange}
              onInputChange={handleInputChangeRaw}
              placeholder="Search vehicle types..."
              isClearable
              isSearchable
              className="react-select-container"
              classNamePrefix="react-select"
              styles={{
                container: (base) => ({
                  ...base,
                  minWidth: "200px",
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
                  minWidth: "150px",
                }),
              }}
            />
            {!isVendorUser && (
              <Select
                options={vendorSelectOptions}
                value={selectedVendor}
                onChange={handleVendorChange}
                isSearchable={true}
                placeholder="Select vendor..."
                className="react-select-container"
                classNamePrefix="react-select"
                isClearable={true}
                styles={{
                  container: (base) => ({
                    ...base,
                    minWidth: "200px",
                  }),
                }}
              />
            )}
          </div>
        }
      />

      <VehicleTypeList
        items={paginatedData}
        headers={headers}
        loading={loading || vehicleTypesState.vendorLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage={
          (selectedVendor || isVendorUser) && !loading
            ? "No vehicle types found. Click 'Add Vehicle Type' to create one."
            : selectedVendor || isVendorUser
            ? "Loading vehicle types..."
            : "Please select a vendor to view vehicle types."
        }
        className="mb-4"
      />

      {totalItems > 0 && (
        <ReusablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          showItemsPerPage={true}
          showPageNumbers={true}
          className="mt-4"
        />
      )}

      <VehicleFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitForm}
        title={editingVehicle ? "Edit Vehicle Type" : "Add New Vehicle Type"}
        initialData={editingVehicle || {}}
        isSubmitting={isSubmitting}
        isVendorUser={isVendorUser}
        selectedVendorId={
          isVendorUser ? currentUser?.vendor_id : selectedVendor?.value
        }
      />
    </>
  );
};

export default ManageVehicleTypes;

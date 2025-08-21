import React, { useState, useEffect } from "react";
import { Modal } from "../SmallComponents";
import VehicleForm from "./VehicleForm";
import ToolBar from "../ui/ToolBar";
import VehicleList from "./VehicleList";
import SearchInput from "../ui/SearchInput";
import ActiveFilterToggle from "../ui/ActiveFilterToggle";

const ManageVehicles = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [vehicleModal, setVehicleModal] = useState(false);
  const [viewActive, setViewActive] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [vendorFilter, setVendorFilter] = useState("all");
  const [editVehicle, setEditVehicle] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicles, setSelectedVehicles] = useState([]);

  // Static vendor data
  const vendors = [
    { id: "all", name: "All Vendors" },
    { id: "abc-motors", name: "ABC Motors" },
    { id: "xyz-fleet", name: "XYZ Fleet" },
    { id: "premium-cars", name: "Premium Cars Ltd" },
    { id: "city-autos", name: "City Autos" },
    { id: "metro-vehicles", name: "Metro Vehicles" }
  ];

  useEffect(() => {
    // Dummy data initialization
    setVehicles([
      {
        id: "v1",
        vehicleId: "V12345",
        registrationNo: "KA01AB1234",
        model: "Hyundai i20",
        contractType: "Lease",
        vendor: "ABC Motors",
        vendorId: "abc-motors",
        driverName: "John Doe",
        driverMobile: "9876543210",
        garageName: "AutoFix Garage",
        deviceImei: "123456789012345",
        simNumber: "9876543210",
        isActive: true,
      },
      {
        id: "v2",
        vehicleId: "V54321",
        registrationNo: "KA05CD5678",
        model: "Tata Nexon",
        contractType: "Owned",
        vendor: "XYZ Fleet",
        vendorId: "xyz-fleet",
        driverName: "Jane Smith",
        driverMobile: "9123456789",
        garageName: "Speed Garage",
        deviceImei: "987654321098765",
        simNumber: "9123456789",
        isActive: false,
      },
      {
        id: "v3",
        vehicleId: "V67890",
        registrationNo: "KA03EF9012",
        model: "Maruti Swift",
        contractType: "Lease",
        vendor: "Premium Cars Ltd",
        vendorId: "premium-cars",
        driverName: "Mike Johnson",
        driverMobile: "9123456701",
        garageName: "Quick Fix Garage",
        deviceImei: "123456789012346",
        simNumber: "9123456701",
        isActive: true,
      },
      {
        id: "v4",
        vehicleId: "V09876",
        registrationNo: "KA07GH3456",
        model: "Honda City",
        contractType: "Owned",
        vendor: "City Autos",
        vendorId: "city-autos",
        driverName: "Sarah Wilson",
        driverMobile: "9123456702",
        garageName: "City Garage",
        deviceImei: "123456789012347",
        simNumber: "9123456702",
        isActive: true,
      },
    ]);
  }, []);

  // Filter vehicles based on search term and vendor filter
  const filteredVehicles = vehicles
    .filter((v) => v.isActive === viewActive)
    .filter((v) => {
      const matchesSearch = v.registrationNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           v.vehicleId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           v.driverName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesVendor = vendorFilter === "all" || v.vendorId === vendorFilter;
      
      return matchesSearch && matchesVendor;
    });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const paginatedVehicles = filteredVehicles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [filteredVehicles.length, totalPages]);

  const handleEdit = (vehicle) => {
    setEditVehicle(vehicle);
    setVehicleModal(true);
  };

  const handleToggleStatus = (vehicle) => {
    const updatedVehicles = vehicles.map((v) =>
      v.id === vehicle.id ? { ...v, isActive: !v.isActive } : v
    );
    setVehicles(updatedVehicles);
  };

  const handleView = (vehicle) => {
    setEditVehicle(vehicle);
    setVehicleModal(true);
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSelectItem = (vehicle, isSelected) => {
    setSelectedVehicles(prev => 
      isSelected 
        ? [...prev, vehicle] 
        : prev.filter(v => v.id !== vehicle.id)
    );
  };

  const handleDelete = (vehicle) => {
    console.log('Delete vehicle:', vehicle);
  };

  const handleSearch = (query) => {
    setSearchTerm(query);
  };

  const handleVendorFilterChange = (e) => {
    setVendorFilter(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setVendorFilter("all");
  };

  const hasActiveFilters = searchTerm !== "" || vendorFilter !== "all";

  return (
    <div className="p-4 space-y-4">
      <ToolBar
        className="mb-4 bg-white shadow-sm p-2 rounded-lg"

        rightElements={
        <ActiveFilterToggle
  viewActive={viewActive}
  setViewActive={setViewActive}
  activeCount={vehicles.filter(v => v.isActive).length}
  inactiveCount={vehicles.filter(v => !v.isActive).length}
  activeDotColor="green"
  inactiveDotColor="gray"
/>
}
        searchBar={
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <SearchInput
              placeholder="Search by Vehicle No, ID, or Driver"
              value={searchTerm}
              onChange={handleSearch}
              className="flex-grow"
            />
            
            
            <div className="flex gap-2 items-center">
              {/* Vendor Filter Dropdown */}
              <div className="relative">
                <select
                  value={vendorFilter}
                  onChange={handleVendorFilterChange}
                  className="pl-3 pr-8 py-2 border border-app-border rounded-lg focus:ring-2 focus:ring-sidebar-primary-500 focus:border-sidebar-primary-500 outline-none w-full sm:w-auto"
                >
                  {vendors.map(vendor => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-sm text-sidebar-primary-600 hover:text-sidebar-primary-700 transition-colors whitespace-nowrap"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        }
        onAddClick={() => {
          setEditVehicle(null);
          setVehicleModal(true);
        }}
        addButtonLabel="Add Vehicle"
      />


      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredVehicles.length} of {vehicles.length} vehicles
        {hasActiveFilters && " (filtered)"}
      </div>

      {/* Table */}
      <VehicleList
        vehicles={paginatedVehicles}
        onNext={handleNext}
        onPrev={handlePrev}
        currentPage={currentPage}
        totalPages={totalPages}
        handleEdit={handleEdit}
        handleView={handleView}
        handleDelete={handleDelete}
        handleToggleStatus={handleToggleStatus}
        selectedItems={selectedVehicles}
        onSelectItem={handleSelectItem}
        isLoading={false}
      />

      {/* Modal */}
      <Modal
        isOpen={vehicleModal}
        onClose={() => {
          setVehicleModal(false);
          setEditVehicle(null);
        }}
        title={editVehicle ? "Edit Vehicle" : "Add Vehicle"}
        size="xl"
      >
        <VehicleForm
          initialData={ editVehicle || {} }
          // onSuccess={() => {
          //   setVehicleModal(false);
          //   setEditVehicle(null);
          // }}
          onClose={() => {
            setVehicleModal(false);
            setEditVehicle(null);
          }}

          
          vendors={vendors.filter(v => v.id !== "all")} // Pass vendors to form
        />
      </Modal>
    </div>
  );
};

export default React.memo(ManageVehicles);
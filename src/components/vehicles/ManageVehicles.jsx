import React, { useState, useEffect } from "react";
import { Modal } from "../SmallComponents";
import VehicleForm from "./VehicleForm";
import ToolBar from "../ui/ToolBar";
import VehicleList from "./VehicleList";
import SearchInput from "../ui/SearchInput";
import ActiveFilterToggle from "../ui/ActiveFilterToggle";
import { useDispatch, useSelector } from "react-redux";
import { logDebug } from "../../utils/logger";
import { fetchVendors } from "../../redux/features/managevendors/vendorThunks";
import { fetchVehicles } from "../../redux/features/manageVehicles/vehicleThunk";

const ManageVehicles = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [vehicleModal, setVehicleModal] = useState(false);
  const [viewActive, setViewActive] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [vendorFilter, setVendorFilter] = useState("all");
  const [editVehicle, setEditVehicle] = useState(null);
  const [selectedVehicles, setSelectedVehicles] = useState([]);
    const dispatch =useDispatch()

    const {vendors ,loading ,error}  = useSelector((state)=>state.vendor)

    const { byIds, allIds, total } = useSelector((state) => state.vehicle.vehicles);

    // Convert IDs to array of vehicle objects
    const vehicles = allIds.map((id) => byIds[id]);
    

    useEffect(() => {
      if (vendors.length === 0) {
        console.log("fetching vendors...");
        dispatch(fetchVendors());

      }

    
    if (vendorFilter !=="all") {


      dispatch(fetchVehicles({vendorId:vendorFilter}))
      
    } 
      
    }, [vendors ,dispatch ,vendorFilter]);


   logDebug("This are the vehicle of " ,vehicles)
    
   logDebug(" the arraya and obj " ,byIds, allIds,  total)

  // Filter vehicles based on search term and vendor filter
  const filteredVehicles = vehicles
   


  // const itemsPerPage = 10;
  // const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  // const paginatedVehicles = filteredVehicles.slice(
  //   (currentPage - 1) * itemsPerPage,
  //   currentPage * itemsPerPage
  // );

  // useEffect(() => {
  //   if (currentPage > totalPages) {
  //     setCurrentPage(1);
  //   }
  // }, [filteredVehicles.length, totalPages]);

  const handleEdit = (vehicle) => {
    setEditVehicle(vehicle);
    setVehicleModal(true);
  };

  const handleToggleStatus = (vehicle) => {
    const updatedVehicles = vehicles.map((v) =>
      v.id === vehicle.id ? { ...v, isActive: !v.isActive } : v
    );
    // setVehicles(updatedVehicles);
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
  // activeCount={vehicles.filter(v => v.isActive).length}
  // inactiveCount={vehicles.filter(v => !v.isActive).length}
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
              <div className="relative"> <select value={vendorFilter}
               onChange={(e)=>setVendorFilter(e.target.value)}
            className="pl-3 pr-8 py-2 border border-app-border rounded-lg focus:ring-2
             focus:ring-sidebar-primary-500 focus:border-sidebar-primary-500 outline-none w-full sm:w-auto" >
    <option value="all" disabled> Select Vendor  </option>
    {vendors.map((vendor) => (
      <option key={vendor.vendor_id} value={vendor.vendor_id}>
        {vendor.vendor_name}
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
      {/* <div className="text-sm text-gray-600">
        Showing {filteredVehicles.length} of {vehicles.length} vehicles
        {hasActiveFilters && " (filtered)"}
      </div> */}

      {/* Table */}
      <VehicleList
        vehicles={vehicles}
        onNext={handleNext}
        onPrev={handlePrev}
        currentPage={currentPage}

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
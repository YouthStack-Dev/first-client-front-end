import React, { useState, useEffect } from "react";
import {
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  Eye,
} from "lucide-react";
import { Modal } from "../SmallComponents";
import ToolBar from "../ui/ToolBar";
import VehicleForm from "./VehicleForm";

const VehicleList = ({
  vehicles,
  onNext,
  onPrev,
  currentPage,
  totalPages,
  isLoading,
  handleEdit,
  handleView,
  handleToggleStatus,
}) => {
  return (
    <div className="rounded-lg border bg-white shadow-sm mt-4">
      <div className="overflow-auto max-h-[500px]">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr className="text-left text-gray-700">
              <th className="px-4 py-2">S. No.</th>
              <th className="px-4 py-2">Vehicle Id</th>
              <th className="px-4 py-2">Vehicle No.</th>
              <th className="px-4 py-2">Model</th>
              <th className="px-4 py-2">Contract Type</th>
              <th className="px-4 py-2">Vendor</th>
              <th className="px-4 py-2">Driver</th>
              <th className="px-4 py-2">Garage Name</th>
              <th className="px-4 py-2">Device IMEI</th>
              <th className="px-4 py-2">Device SIM</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="11" className="text-center p-4 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : vehicles.length === 0 ? (
              <tr>
                <td colSpan="11" className="text-center p-4 text-gray-500">
                  No vehicles found
                </td>
              </tr>
            ) : (
              vehicles.map((vehicle, index) => (
                <tr key={vehicle.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">
                    {index + 1 + (currentPage - 1) * 10}
                  </td>
                  <td className="px-4 py-2">{vehicle.vehicleId}</td>
                  <td className="px-4 py-2">{vehicle.registrationNo}</td>
                  <td className="px-4 py-2">{vehicle.model}</td>
                  <td className="px-4 py-2">{vehicle.contractType}</td>
                  <td className="px-4 py-2">{vehicle.vendor}</td>
                  <td className="px-4 py-2">
                    {vehicle.driverName} ({vehicle.driverMobile})
                  </td>
                  <td className="px-4 py-2">{vehicle.garageName}</td>
                  <td className="px-4 py-2">{vehicle.deviceImei}</td>
                  <td className="px-4 py-2">{vehicle.simNumber}</td>
                  <td className="px-4 py-2 text-center">
                  <div className="flex justify-center items-center gap-2">
  {/* View */}
  <button
    onClick={() => handleView(vehicle)}
    className="flex items-center gap-1 px-3 py-1 text-sm border rounded text-gray-600 border-gray-400 hover:bg-gray-50"
  >
    <Eye size={14} />
    
  </button>

  {/* Edit */}
  <button
    onClick={() => handleEdit(vehicle)}
    className="flex items-center gap-1 px-3 py-1 text-sm border rounded text-blue-600 border-blue-600 hover:bg-blue-50"
  >
    <Edit size={14} />
   
  </button>

  {/* Delete */}
  <button
    onClick={() => handleDelete(vehicle)}
    className="flex items-center gap-1 px-3 py-1 text-sm border rounded text-red-600 border-red-600 hover:bg-red-50"
  >
    <Trash2 size={14} />
  </button>
</div>

                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 py-4">
        <button
          onClick={onPrev}
          disabled={currentPage === 1}
          className={`flex items-center gap-2 px-4 py-2 rounded ${
            currentPage === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          <ChevronLeft size={18} />
          Prev
        </button>
        <span className="text-sm text-gray-700 font-medium">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={onNext}
          disabled={currentPage === totalPages}
          className={`flex items-center gap-2 px-4 py-2 rounded ${
            currentPage === totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Next
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

const ManageVehicles = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [vehicleModal, setVehicleModal] = useState(false);
  const [viewActive, setViewActive] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editVehicle, setEditVehicle] = useState(null);
  const [vehicles, setVehicles] = useState([]);

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
        driverName: "Jane Smith",
        driverMobile: "9123456789",
        garageName: "Speed Garage",
        deviceImei: "987654321098765",
        simNumber: "9123456789",
        isActive: false,
      },
    ]);
  }, []);

  const filteredVehicles = vehicles
    .filter((v) => v.isActive === viewActive)
    .filter((v) =>
      v.registrationNo?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

  const onPrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const onNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

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

  return (
    <div className="p-4 space-y-4">
  
  <ToolBar
  className="mb-4 bg-white shadow-sm p-2 rounded-lg"
  
  leftContent={
    <div className="flex items-center gap-2 w-full md:w-80">
      <Search className="text-gray-500" size={18} />
      <input
        type="text"
        placeholder="Search by Registration Number"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
        className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  }

  onAddClick={()=> setVehicleModal(true)}
  addButtonLabel="Add"
/>


      {/* Table */}
      <VehicleList
        vehicles={paginatedVehicles}
        onNext={onNext}
        onPrev={onPrev}
        currentPage={currentPage}
        totalPages={totalPages}
        isLoading={false}
        handleEdit={handleEdit}
        handleView={handleView}
        handleToggleStatus={handleToggleStatus}
      />

      {/* Modal */}
      <Modal
        isOpen={vehicleModal}
        onClose={() => setVehicleModal(false)}
        title={editVehicle ? "Edit Vehicle" : "Add Vehicle"}
        size="xl"
      >
        <VehicleForm
          defaultValues={editVehicle}
          onSuccess={() => setVehicleModal(false)}
        />

      </Modal>
    </div>
  );
};

export default React.memo(ManageVehicles);

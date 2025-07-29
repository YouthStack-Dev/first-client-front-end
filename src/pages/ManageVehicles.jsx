import React, { useState, useEffect } from "react";
import {
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { Modal } from "../components/SmallComponents";
import HeaderWithActionNoRoute from "../components/HeaderWithActionNoRoute";
import { useModulePermission } from "../hooks/userModulePermission";
import PermissionDenied from "../components/PermissionDenied";
import VehicleForm from "../components/VehicleForm";

const VehicleList = ({
  vehicles,
  menuOpen,
  setMenuOpen,
  onNext,
  onPrev,
  currentPage,
  totalPages,
  isLoading,
  handleEdit,
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
                      <button
                        onClick={() => handleEdit(vehicle)}
                        className="flex items-center gap-1 px-3 py-1 text-sm border rounded hover:bg-blue-50 text-blue-600 border-blue-600"
                      >
                        <Edit size={14} />
                        Manage
                      </button>
                      <button
                        onClick={() => handleToggleStatus(vehicle)}
                        className={`flex items-center gap-1 px-3 py-1 text-sm border rounded ${
                          vehicle.isActive
                            ? "text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                            : "text-green-600 border-green-600 hover:bg-green-50"
                        }`}
                      >
                        <Trash2 size={14} />
                        {vehicle.isActive ? "Deactivate" : "Activate"}
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

function ManageVehicles() {
  const [currentPage, setCurrentPage] = useState(1);
  const [vehicleModal, setVehicleModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);
  const [viewActive, setViewActive] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editVehicle, setEditVehicle] = useState(null);
  const { canRead, canWrite, notFound } = useModulePermission("vehicle_management");

  if (notFound) return <PermissionDenied />;

const isLoading = false;
const data ={}
  const dummyVehicle = {
    id: "dummy-1",
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
  };

  const vehicles = data?.vehicles?.length > 0 ? data.vehicles : [dummyVehicle];

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
    const updatedStatus = !vehicle.isActive;
    console.log(
      `Toggling status for ${vehicle.vehicleId} to ${updatedStatus ? "Active" : "Inactive"}`
    );
  };

  return (
    <div className="p-4 space-y-4">
      <HeaderWithActionNoRoute
        title="Manage Vehicles"
        buttonLabel="Add Vehicle"
        onButtonClick={() => {
          setEditVehicle(null);
          setVehicleModal(true);
        }}
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-1/2">
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

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700 font-medium">Inactive</span>
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={viewActive}
            onChange={() => setViewActive(!viewActive)}
          />
          <span className="text-sm text-gray-700 font-medium">Active</span>
        </div>
      </div>

      {/* Table */}
      <VehicleList
        vehicles={paginatedVehicles}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        onNext={onNext}
        onPrev={onPrev}
        currentPage={currentPage}
        totalPages={totalPages}
        isLoading={isLoading}
        handleEdit={handleEdit}
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
}

export default React.memo(ManageVehicles);

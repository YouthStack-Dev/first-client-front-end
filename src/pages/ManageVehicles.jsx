import React, { useState } from "react";
import {
  Edit,
  MoreVertical,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Modal, InputField } from "../components/SmallComponents";
import { useGetVehiclesQuery } from "../redux/rtkquery/clientRtk";

const VehicleList = React.memo(
  ({
    vehicles,
    menuOpen,
    setMenuOpen,
    onNext,
    onPrev,
    currentPage,
    totalPages,
    isLoading,
    handleEdit,
    handleDelete,
  }) => (
    <div className="rounded-lg overflow-hidden shadow-sm mt-2">
      <div className="overflow-auto h-[620px]">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-50 border-b sticky top-0">
            <tr className="text-left text-gray-600">
              <th className="px-4 py-3 w-1/3">Vehicle Name</th>
              <th className="px-4 py-3 w-1/3">Vendor ID</th>
              <th className="px-4 py-3 w-1/3">Created At</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">
                  Loading vehicles...
                </td>
              </tr>
            ) : vehicles?.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">
                  No vehicles found
                </td>
              </tr>
            ) : (
              vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{vehicle.name}</td>
                  <td className="px-4 py-3">{vehicle.vendorId}</td>
                  <td className="px-4 py-3">
                    {new Date(vehicle.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-center relative">
                    <button
                      onClick={() =>
                        menuOpen === vehicle.id
                          ? setMenuOpen(null)
                          : setMenuOpen(vehicle.id)
                      }
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <MoreVertical size={20} className="text-gray-600" />
                    </button>
                    {menuOpen === vehicle.id && (
                      <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg border p-2 z-10">
                        <button
                          onClick={() => handleEdit(vehicle)}
                          className="flex flex-col items-center px-3 py-2 text-gray-700 hover:bg-gray-50"
                        >
                          <Edit size={18} color="blue" />
                          <span className="text-xs">Manage</span>
                        </button>
                        <button
                          onClick={() => handleDelete(vehicle.id)}
                          className="flex flex-col items-center px-3 py-2 text-gray-700 hover:bg-gray-50"
                        >
                          <Trash2 size={18} color="red" />
                          <span className="text-xs">Delete</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-4">
        <button
          onClick={onPrev}
          disabled={currentPage === 1}
          className={`flex items-center gap-2 px-4 py-2 rounded transition 
            ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
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
          className={`flex items-center gap-2 px-4 py-2 rounded transition 
            ${
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
  )
);

function ManageVehicles() {
  const [currentPage, setCurrentPage] = useState(1);
  const [vehicleModal, setVehicleModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);

  const { data, isLoading } = useGetVehiclesQuery();
  const vehicles = data?.vehicles || [];

  const itemsPerPage = 10;
  const totalPages = Math.ceil((vehicles.length || 0) / itemsPerPage);

  const paginatedVehicles = vehicles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const onPrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const onNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  const handleVehicleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const vehicleName = formData.get("vehicleName");
    console.log("Add vehicle:", { vehicleName });
    setVehicleModal(false);
  };

  const handleEdit = (vehicle) => {
    console.log("Edit vehicle", vehicle);
  };

  const handleDelete = (vehicleId) => {
    console.log("Delete vehicle ID", vehicleId);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-2">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-gray-800">Manage Vehicles</h1>
        <button
          onClick={() => setVehicleModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Vehicle
        </button>
      </div>

      {/* Add Vehicle Modal */}
      <Modal
        isOpen={vehicleModal}
        onClose={() => setVehicleModal(false)}
        title="Add New Vehicle"
        onSubmit={handleVehicleSubmit}
      >
        <InputField
          label="Vehicle Name"
          name="vehicleName"
          placeholder="Enter vehicle name"
          required
        />
      </Modal>

      {/* Vehicle List */}
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
        handleDelete={handleDelete}
      />
    </div>
  );
}

export default React.memo(ManageVehicles);

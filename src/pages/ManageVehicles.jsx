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
import HeaderWithAction from "../components/HeaderWithAction";
import { useModulePermission } from "../hooks/userModulePermission";
import PermissionDenied from "../components/PermissionDenied";


// ⬇️ Separated for readability
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
    <div className="rounded-lg border bg-white shadow-sm mt-4">
      <div className="overflow-auto max-h-[600px]">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr className="text-left text-gray-700 text-sm">
              <th className="px-4 py-3">Vehicle Name</th>
              <th className="px-4 py-3">Vendor ID</th>
              <th className="px-4 py-3">Created At</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="4" className="text-center p-4 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : vehicles.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center p-4 text-gray-500">
                  No vehicles found
                </td>
              </tr>
            ) : (
              vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{vehicle.name}</td>
                  <td className="px-4 py-3">{vehicle.vendorId}</td>
                  <td className="px-4 py-3">
                    {new Date(vehicle.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-center relative">
                    <button
                      onClick={() =>
                        setMenuOpen(menuOpen === vehicle.id ? null : vehicle.id)
                      }
                      className="hover:bg-gray-100 p-2 rounded-full"
                    >
                      <MoreVertical size={18} />
                    </button>
                    {menuOpen === vehicle.id && (
                      <div className="absolute right-0 mt-2 bg-white rounded shadow border z-10">
                        <button
                          onClick={() => handleEdit(vehicle)}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 w-full"
                        >
                          <Edit size={16} className="text-blue-600" />
                          Manage
                        </button>
                        <button
                          onClick={() => handleDelete(vehicle.id)}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 w-full"
                        >
                          <Trash2 size={16} className="text-red-500" />
                          Delete
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

      {/* Pagination Controls */}
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
  )
);

function ManageVehicles() {
  const [currentPage, setCurrentPage] = useState(1);
  const [vehicleModal, setVehicleModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);
  const { canRead, canWrite, notFound } = useModulePermission("vehicles");

  if (notFound) return <PermissionDenied />;

  const { data, isLoading } = useGetVehiclesQuery();
  const vehicles = data?.vehicles || [];

  const itemsPerPage = 10;
  const totalPages = Math.ceil(vehicles.length / itemsPerPage);
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

  const handleEdit = (vehicle) => console.log("Edit vehicle:", vehicle);
  const handleDelete = (id) => console.log("Delete vehicle ID:", id);

  return (
    <div className="p-4 space-y-4">
      <HeaderWithAction
        title="Manage Vehicles"
        buttonLabel="Add Vehicle"
        onButtonClick={() => setVehicleModal(true)}
      />

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

      {/* Add Modal */}
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
    </div>
  );
}

export default React.memo(ManageVehicles);

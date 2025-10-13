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
}) => {
  return (
    <div className="rounded-lg border bg-white shadow-sm mt-4">
      <div className="overflow-auto max-h-[500px]">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr className="text-left text-gray-700">
              <th className="px-4 py-2">S. No.</th>
              <th className="px-4 py-2">Vehicle Type</th>
              <th className="px-4 py-2">Vendor</th>
              <th className="px-4 py-2">RC Number</th>
              <th className="px-4 py-2">Driver</th>
              <th className="px-4 py-2">RC Expiry</th>
              <th className="px-4 py-2">Insurance Expiry</th>
              <th className="px-4 py-2">Permit Expiry</th>
              <th className="px-4 py-2">PUC Expiry</th>
              <th className="px-4 py-2">Fitness Expiry</th>
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
                  <td className="px-4 py-2">{vehicle.vehicleType || "-"}</td>
                  <td className="px-4 py-2">{vehicle.vendor || "-"}</td>
                  <td className="px-4 py-2">{vehicle.rc_number || "-"}</td>
                  <td className="px-4 py-2">{vehicle.driverName || "-"}</td>
                  <td className="px-4 py-2">{vehicle.rc_expiry_date || "-"}</td>
                  <td className="px-4 py-2">{vehicle.insurance_expiry_date || "-"}</td>
                  <td className="px-4 py-2">{vehicle.permit_expiry_date || "-"}</td>
                  <td className="px-4 py-2">{vehicle.puc_expiry_date || "-"}</td>
                  <td className="px-4 py-2">{vehicle.fitness_expiry_date || "-"}</td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={() => handleView(vehicle)}
                        className="flex items-center gap-1 px-3 py-1 text-sm border rounded text-gray-600 border-gray-400 hover:bg-gray-50"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleEdit(vehicle)}
                        className="flex items-center gap-1 px-3 py-1 text-sm border rounded text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => console.log("delete", vehicle.id)}
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
  const [filters, setFilters] = useState({
    rc_number: "",
    is_active: null,
  });
  const [editVehicle, setEditVehicle] = useState(null);
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    setVehicles([
      {
        id: "v1",
        vehicleType: "Truck",
        vendor: "ABC Motors",
        rc_number: "KA01AB1234",
        driverName: "John Doe",
        rc_expiry_date: "2025-12-31",
        insurance_expiry_date: "2025-11-30",
        permit_expiry_date: "2025-10-31",
        puc_expiry_date: "2025-09-30",
        fitness_expiry_date: "2026-01-15",
        isActive: true,
      },
      {
        id: "v2",
        vehicleType: "Trailer",
        vendor: "XYZ Fleet",
        rc_number: "KA05CD5678",
        driverName: "Jane Smith",
        rc_expiry_date: "2025-08-31",
        insurance_expiry_date: "2025-07-30",
        permit_expiry_date: "2025-06-30",
        puc_expiry_date: "2025-05-31",
        fitness_expiry_date: "2025-12-20",
        isActive: false,
      },
    ]);
  }, []);

  const filteredVehicles = vehicles
    .filter((v) =>
      filters.rc_number
        ? v.rc_number.toLowerCase().includes(filters.rc_number.toLowerCase())
        : true
    )
    .filter((v) =>
      filters.is_active !== null ? v.isActive === filters.is_active : true
    );

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const paginatedVehicles = filteredVehicles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [filteredVehicles.length, totalPages]);

  const onPrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const onNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  const handleEdit = (vehicle) => {
    setEditVehicle(vehicle);
    setVehicleModal(true);
  };
  const handleView = (vehicle) => {
    setEditVehicle(vehicle);
    setVehicleModal(true);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 bg-white shadow-sm p-4 rounded-lg">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search RC Number..."
              value={filters.rc_number}
              onChange={(e) =>
                setFilters({ ...filters, rc_number: e.target.value })
              }
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
            />
          </div>

          {/* Status Dropdown */}
          <select
            value={filters.is_active === null ? "" : filters.is_active.toString()}
            onChange={(e) => {
              const value = e.target.value;
              setFilters({
                ...filters,
                is_active: value === "" ? null : value === "true",
              });
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {/* Add Vehicle Button */}
        <button
          onClick={() => setVehicleModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full sm:w-auto"
        >
          Add Vehicle
        </button>
      </div>

      <VehicleList
        vehicles={paginatedVehicles}
        onNext={onNext}
        onPrev={onPrev}
        currentPage={currentPage}
        totalPages={totalPages}
        isLoading={false}
        handleEdit={handleEdit}
        handleView={handleView}
      />

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

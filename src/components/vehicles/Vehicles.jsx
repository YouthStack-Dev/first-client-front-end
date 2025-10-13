import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import {fetchVehiclesThunk} from "../../redux/features/manageVehicles/vehicleThunk";
import {
  setRcNumberFilter,
  setStatusFilter,
  setPage,
  setVendorFilter,
} from "../../redux/features/manageVehicles/vehicleSlice";

// Selectors come from the selectors file
import {
  selectPaginatedVehicles,
  selectVehicleCounts,
  selectFilters,
  selectPagination,
  selectLoading,
} from "../../redux/features/manageVehicles/vehicleSelectors";

const VehicleList = ({
  vehicles,
  onNext,
  onPrev,
  currentPage,
  totalPages,
  isLoading,
  handleEdit,
  handleView,
}) => (
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
              <tr key={vehicle.vehicle_id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{index + 1 + (currentPage - 1) * 10}</td>
                <td className="px-4 py-2">{vehicle.vehicle_type_name || "-"}</td>
                <td className="px-4 py-2">{vehicle.vendor_name || "-"}</td>
                <td className="px-4 py-2">{vehicle.rc_number || "-"}</td>
                <td className="px-4 py-2">{vehicle.driver_name || "-"}</td>
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
                      onClick={() => console.log("delete", vehicle.vehicle_id)}
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
        className="flex items-center gap-2 px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
      >
        <ChevronLeft size={18} />
        Prev
      </button>
      <span className="text-sm text-gray-700 font-medium">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={onNext}
        className="flex items-center gap-2 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
      >
        Next
        <ChevronRight size={18} />
      </button>
    </div>
  </div>
);

const ManageVehicles = () => {
  const dispatch = useDispatch();
  const vehicles = useSelector(selectPaginatedVehicles);
  const filters = useSelector(selectFilters);
  const pagination = useSelector(selectPagination);
  const { total } = useSelector(selectVehicleCounts);
  const loading = useSelector(selectLoading);


  const [vehicleModal, setVehicleModal] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);


useEffect(() => {
  dispatch(fetchVehiclesThunk());
}, [
  dispatch,
  filters.rc_number,
  filters.vehicle_type_id,
  filters.driver_id,
  filters.is_active,
  filters.vendor_id,
  pagination.skip,
  pagination.limit,
]);


  const totalPages = Math.ceil(total / pagination.limit) || 1;

  const handleEdit = (vehicle) => {
    setEditVehicle(vehicle);
    setVehicleModal(true);
  };
  const handleView = (vehicle) => {
    setEditVehicle(vehicle);
    setVehicleModal(true);
  };

  const onPrev = () => {
    if (pagination.skip > 0)
      dispatch(setPage((pagination.skip / pagination.limit)));
  };
  const onNext = () => {
    const nextPage = pagination.skip / pagination.limit + 2;
    if (nextPage <= totalPages) dispatch(setPage(nextPage));
  };

  return (
    <div className="p-4 space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 bg-white shadow-sm p-4 rounded-lg">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Unified Search */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search RC Number..."
              value={filters.rc_number}
              onChange={(e) => dispatch(setRcNumberFilter(e.target.value))}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
            />
          </div>

          {/* Status Dropdown */}
          <select
            value={filters.is_active}
            onChange={(e) => dispatch(setStatusFilter(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
          >
            <option value="all">All Status</option>
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

      {/* Vehicle Table */}
      <VehicleList
        vehicles={vehicles}
        onNext={onNext}
        onPrev={onPrev}
        currentPage={pagination.skip / pagination.limit + 1}
        totalPages={totalPages}
        isLoading={loading}
        handleEdit={handleEdit}
        handleView={handleView}
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

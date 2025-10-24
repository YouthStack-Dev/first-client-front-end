import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Edit, Eye } from "lucide-react";
import ReusableButton from "../ui/ReusableButton";
import ReusableToggleButton from "../ui/ReusableToggleButton";
import Modal from "@components/modals/Modal";
import VehicleForm from "./VehicleForm";
import { toast } from "react-toastify";
import { fetchVehiclesThunk, toggleVehicleStatus} from "../../redux/features/manageVehicles/vehicleThunk";
import {
  setRcNumberFilter,
  setStatusFilter,
  setPage,
   updateVehicle, 
} from "../../redux/features/manageVehicles/vehicleSlice";

import {
  selectPaginatedVehicles,
  selectVehicleCounts,
  selectFilters,
  selectPagination,
  selectLoading,
  selectHasFetched,
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
 
  handleToggle,
}) => (
  <div className="rounded-lg border bg-white shadow-sm mt-4">
    <div className="overflow-auto max-h-[500px]">
      <table className="min-w-full border-collapse text-sm">
        <thead className="bg-gray-100 sticky top-0 z-10">
          <tr className="text-left text-gray-700">
            <th className="px-4 py-2">S. No.</th>
            <th className="px-4 py-2">Vehicle Type ID</th>
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
              <td colSpan="10" className="text-center p-4 text-gray-500">
                Loading...
              </td>
            </tr>
          ) : vehicles.length === 0 ? (
            <tr>
              <td colSpan="10" className="text-center p-4 text-gray-500">
                No vehicles found
              </td>
            </tr>
          ) : (
            vehicles.map((vehicle, index) => (
              <tr
                key={vehicle.vehicle_id}
                className="border-t hover:bg-gray-50 transition-all"
              >
                <td className="px-4 py-2">
                  {index + 1 + (currentPage - 1) * 10}
                </td>
                <td className="px-4 py-2">{vehicle.vehicle_type_id || "-"}</td>
                <td className="px-4 py-2">{vehicle.rc_number || "-"}</td>
                <td className="px-4 py-2">
                  {vehicle.driver_id ? vehicle.driver_id : "Unassigned"}
                </td>
                <td className="px-4 py-2">
                  {vehicle.rc_expiry_date?.split("T")[0] || "-"}
                </td>
                <td className="px-4 py-2">
                  {vehicle.insurance_expiry_date?.split("T")[0] || "-"}
                </td>
                <td className="px-4 py-2">
                  {vehicle.permit_expiry_date?.split("T")[0] || "-"}
                </td>
                <td className="px-4 py-2">
                  {vehicle.puc_expiry_date?.split("T")[0] || "-"}
                </td>
                <td className="px-4 py-2">
                  {vehicle.fitness_expiry_date?.split("T")[0] || "-"}
                </td>
                <td className="px-4 py-2 text-center">
                  <div className="flex justify-center items-center gap-4">
                    <div className="flex gap-2">
                      <ReusableButton
                        module="vehicle"
                        action="read"
                        icon={Eye}
                        title="View Vehicle"
                        onClick={() => handleView(vehicle)}
                        className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all"
                      />
                      <ReusableButton
                        module="vehicle"
                        action="update"
                        icon={Edit}
                        title="Edit Vehicle"
                        onClick={() => handleEdit(vehicle)}
                        className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all"
                      />
                    </div>

                    <ReusableToggleButton
                      module="vehicle"
                      action="update"
                      isChecked={vehicle.is_active ?? true}
                      onToggle={() => handleToggle(vehicle.vehicle_id)}
                      labels={{ on: "Active", off: "Inactive" }}
                      size="small"
                      className="scale-90"
                    />
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
  const hasFetched = useSelector(selectHasFetched);

  const [vehicleModal, setVehicleModal] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);

  // Fetch all vehicles on mount
  useEffect(() => {
    if (!hasFetched) {
      dispatch(fetchVehiclesThunk());
    }
  }, [dispatch, hasFetched]);

  const totalPages = Math.ceil(total / pagination.limit) || 1;

  const handleEdit = (vehicle) => {
    setEditVehicle(vehicle);
    setVehicleModal(true);
  };

  const handleView = (vehicle) => {
    setEditVehicle(vehicle);
    setVehicleModal(true);
  };
const handleToggle = (vehicleId) => {
  const vehicle = vehicles.find((v) => v.vehicle_id === vehicleId);
  if (!vehicle) return;

  const newStatus = !vehicle.is_active;

  // Optimistically update state
  dispatch(updateVehicle({ ...vehicle, is_active: newStatus }));

  // Call API
  dispatch(toggleVehicleStatus({ vehicleId, isActive: newStatus }))
    .unwrap()
    .then(() => {
      toast.success(
        `Vehicle ${vehicle.rc_number || vehicleId} is now ${newStatus ? "Active" : "Inactive"}`
      );
    })
    .catch((err) => {
      // Revert state if API fails
      dispatch(updateVehicle(vehicle));
      toast.error(err || "Failed to update vehicle status");
    });
};


  const onPrev = () => {
    const prevPage = pagination.skip / pagination.limit;
    if (prevPage > 0) dispatch(setPage(prevPage));
  };

  const onNext = () => {
    const nextPage = pagination.skip / pagination.limit + 2;
    if (nextPage <= totalPages) dispatch(setPage(nextPage));
  };

  return (
    <div className="p-4 space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white shadow-sm p-4 rounded-lg">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Search RC Number */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search RC Number..."
              value={filters.rc_number}
              onChange={(e) => dispatch(setRcNumberFilter(e.target.value))}
              className="pl-3 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
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
          onClick={() => {
            setEditVehicle(null);
            setVehicleModal(true);
          }}
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
        handleToggle={handleToggle}
      />

      {/* Modal */}
      <Modal
          isOpen={vehicleModal}
          onClose={() => setVehicleModal(false)}
          title={editVehicle ? "Edit Vehicle" : "Add Vehicle"}
          size="xl"
          hideFooter={true}
        >
          <VehicleForm
            initialData={editVehicle}
            onFormChange={() => {}}
            onClose={() => setVehicleModal(false)} // <-- important
            isEdit={!!editVehicle}
          />
        </Modal>
    </div>
  );
};

export default React.memo(ManageVehicles);

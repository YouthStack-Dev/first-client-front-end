
import React, { useState, useEffect, useCallback } from "react";
import {
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import HeaderWithActionNoRoute from "../components/HeaderWithActionNoRoute";
import { useModulePermission } from "../hooks/userModulePermission";
import PermissionDenied from "../components/PermissionDenied";
import VehicleForm from "../components/VehicleForm";
import { fetchVendors } from "../redux/features/manageVendors/vendorThunks";
import { fetchVehicleTypes } from "../redux/features/managevehicletype/vehicleTypeThunks";
import {fetchVehicles,deleteVehicleThunk,} from "../redux/features/manageVehicles/vehicleThunk";
import { toast } from "react-toastify";

// Vehicle Table Component
const VehicleList = React.memo(
  ({ vehicles, onNext, onPrev, currentPage, totalPages, isLoading, error, handleEdit, handleDelete }) => {
    const errorMessage = typeof error === "string"
      ? error
      : error?.detail
      ? Array.isArray(error.detail)
        ? error.detail.map((e) => e.msg || JSON.stringify(e)).join(", ")
        : JSON.stringify(error.detail)
      : error
      ? JSON.stringify(error)
      : "";

    return (
      <div className="rounded-lg border bg-white shadow-sm mt-4">
        <div className="overflow-auto max-h-[500px]">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr className="text-left text-gray-700">
                <th className="px-4 py-2">S. No.</th>
                <th className="px-4 py-2">Vehicle Code</th>
                <th className="px-4 py-2">Registration No.</th>
                <th className="px-4 py-2">Vehicle Type</th>
                <th className="px-4 py-2">Vendor</th>
                <th className="px-4 py-2">Driver</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="text-center p-4 text-gray-500">Loading vehicles...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="8" className="text-center p-4 text-red-500">
                    Failed to load vehicles: {errorMessage}
                  </td>
                </tr>
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center p-4 text-gray-500">No vehicles found</td>
                </tr>
              ) : (
                vehicles.map((vehicle, index) => (
                  <tr key={`${vehicle.vehicle_id}-${index}`} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{index + 1 + (currentPage - 1) * 10}</td>
                    <td className="px-4 py-2">{vehicle.vehicle_code}</td>
                    <td className="px-4 py-2">{vehicle.reg_number}</td>
                    <td className="px-4 py-2">{vehicle.vehicle_type_id}</td>
                    <td className="px-4 py-2">{vehicle.vendor_id}</td>
                    <td className="px-4 py-2">{vehicle.driver_id}</td>
                    <td className="px-4 py-2">{vehicle.description}</td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => handleEdit(vehicle)}
                          className="flex items-center gap-1 px-3 py-1 text-sm border rounded hover:bg-blue-50 text-blue-600 border-blue-600"
                        >
                          <Edit size={14} /> Manage
                        </button>
                        <button
                          onClick={() => handleDelete(vehicle)}
                          className="flex items-center gap-1 px-3 py-1 text-sm border rounded text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={14} /> Delete
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
            className={`flex items-center gap-2 px-4 py-2 rounded ${currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
          >
            <ChevronLeft size={18} /> Prev
          </button>
          <span className="text-sm text-gray-700 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={onNext}
            disabled={vehicles.length < 10}
            className={`flex items-center gap-2 px-4 py-2 rounded ${vehicles.length < 10
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"}`}
          >
            Next <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  }
);

function ManageVehicles() {
  const dispatch = useDispatch();
  const { vendors, vendorLoading, vehicleTypes, vehicleTypeLoading } = useSelector(
    (state) => ({
      vendors: state.vendor.vendors,
      vendorLoading: state.vendor.loading,
      vehicleTypes: state.vehicleType.vehicleTypes,
      vehicleTypeLoading: state.vehicleType.loading,
    }),
    shallowEqual
  );
  
  const { vehicles, status, error } = useSelector((state) => state.vehicle);
  const { user } = useSelector((state) => state.auth);

  const [selectedVendor, setSelectedVendor] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [vehicleModal, setVehicleModal] = useState(false);
  const [viewActive, setViewActive] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editVehicle, setEditVehicle] = useState(null);

  const { notFound } = useModulePermission("vehicle_management");
  if (notFound) return <PermissionDenied />;

  const tenantId = user?.tenant_id || 1;
  const itemsPerPage = 10;
  const offset = (currentPage - 1) * itemsPerPage;



  // Fetch vendors
  useEffect(() => {
    if (tenantId && vendors.length === 0 && !vendorLoading) {
      dispatch(fetchVendors({ skip: 0, limit: 100,}));
    }
  }, [vendors.length, vendorLoading, dispatch]);

  // Fetch vehicle types
  useEffect(() => {
    if ( vehicleTypes.length === 0 && !vehicleTypeLoading) {
      dispatch(fetchVehicleTypes(tenantId))
        .unwrap()
        .catch(() => toast.error("Failed to load vehicle types"));
    }
  }, [tenantId, vehicleTypes.length, vehicleTypeLoading, dispatch]);



  
  // Fetch vehicles
  useEffect(() => {
    if (!selectedVendor) {
      console.log("[fetchVehicles] ❌ Skipped — No vendor selected");
      return;
    }
    console.log("[fetchVehicles] 📡 Fetching vehicles...", {
      vendorId: selectedVendor,
      status: viewActive ? "active" : "inactive",
      offset,
      limit: itemsPerPage,
    });

    dispatch(fetchVehicles({
      vendorId: selectedVendor,
      status: viewActive ? "active" : "inactive",
      offset,
      limit: itemsPerPage,
    }))
      .unwrap()
      .then((res) => console.log("[fetchVehicles] ✅ Success:", res))
      .catch((err) => {
        console.error("[fetchVehicles] ❌ Failed:", err);
        toast.error("Failed to load vehicles");
      });
  }, [selectedVendor, viewActive, offset, itemsPerPage, dispatch]);







  const filteredVehicles = vehicles.filter((v) =>
    v.reg_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(vehicles.length / itemsPerPage));

  const onPrev = useCallback(() => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  }, [currentPage]);

  const onNext = useCallback(() => {
    if (vehicles.length === itemsPerPage) setCurrentPage((prev) => prev + 1);
  }, [vehicles.length]);

  const handleEdit = useCallback((vehicle) => {
    setEditVehicle(vehicle);
    setVehicleModal(true);
  }, []);

  const handleDelete = useCallback(
    (vehicle) => {
      if (window.confirm(`Delete vehicle ${vehicle.vehicle_code} (${vehicle.reg_number})?`)) {
        dispatch(deleteVehicleThunk({
          vendor_id: vehicle.vendor_id,
          vehicle_id: vehicle.vehicle_id,
        }))
          .unwrap()
          .then(() => {
            toast.success("Vehicle deleted successfully");
            if (selectedVendor) {
              dispatch(fetchVehicles({
                vendorId: selectedVendor,
                status: viewActive ? "active" : "inactive",
                offset,
                limit: itemsPerPage,
              }));
            }
          })
          .catch(() => toast.error("Failed to delete vehicle"));
      }
    },
    [dispatch, selectedVendor, viewActive, offset, itemsPerPage]
  );

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

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-1/3">
          <Search className="text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search by Registration Number"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="w-full md:w-1/3">
          <select
            value={selectedVendor}
            onChange={(e) => {
              
              
              setSelectedVendor(e.target.value || "");
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Vendor</option>
            {vendors.map((vendor) => (
              <option key={ vendor.vendor_id} value={String( vendor.vendor_id)}>
                {vendor.vendor_name || `Vendor ${vendor.id || vendor.vendor_id}`}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-700 font-medium">Inactive</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={viewActive}
              onChange={() => {
                setViewActive((prev) => !prev);
                setCurrentPage(1);
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600 transition-all"></div>
            <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all peer-checked:translate-x-5"></div>
          </label>
          <span className="text-sm text-gray-700 font-medium">Active</span>
        </div>
      </div>

      <VehicleList
        vehicles={filteredVehicles}
        onNext={onNext}
        onPrev={onPrev}
        currentPage={currentPage}
        totalPages={totalPages}
        isLoading={status === "loading"}
        error={error}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />

      {/* Vehicle Form Modal */}
      {vehicleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-4xl p-6 relative">
            <button
              onClick={() => setVehicleModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold mb-4">
              {editVehicle ? "Edit Vehicle" : "Add Vehicle"}
            </h2>
            <VehicleForm
              isEdit={!!editVehicle}
              initialData={editVehicle}
              vendors={vendors}
              vehicleTypes={vehicleTypes}
              onClose={() => setVehicleModal(false)}
              onSuccess={() => {
                toast.success(editVehicle ? "Vehicle updated successfully" : "Vehicle added successfully");
                if (selectedVendor) {
                  dispatch(fetchVehicles({
                    vendorId: selectedVendor,
                    status: viewActive ? "active" : "inactive",
                    offset,
                    limit: itemsPerPage,
                  }));
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(ManageVehicles);

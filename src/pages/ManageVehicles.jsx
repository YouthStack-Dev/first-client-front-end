import React, { useState, useEffect, useCallback, useRef } from "react";
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
import { fetchVendors } from "../redux/features/managevendors/vendorThunks";
import { fetchVehicleTypes } from "../redux/features/managevehicletype/vehicleTypeThunks";
import { fetchVehicles,deleteVehicleThunk  } from "../redux/features/manageVehicles/vehicleThunk";

const VehicleList = React.memo(
  ({
    vehicles,
    onNext,
    onPrev,
    currentPage,
    totalPages,
    isLoading,
    error,
    handleEdit,
    handleToggleStatus,
    handleDelete,
  }) => {
    const errorMessage =
      typeof error === "string"
        ? error
        : error?.detail || JSON.stringify(error);

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
                  <td colSpan="8" className="text-center p-4 text-gray-500">
                    Loading vehicles...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="8" className="text-center p-4 text-red-500">
                    Failed to load vehicles: {errorMessage}
                  </td>
                </tr>
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center p-4 text-gray-500">
                    No vehicles found
                  </td>
                </tr>
              ) : (
                vehicles.map((vehicle, index) => (
                  <tr
                    key={vehicle.vehicle_id}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="px-4 py-2">
                      {index + 1 + (currentPage - 1) * 10}
                    </td>
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
                          <Edit size={14} />
                          Manage
                        </button>
                        <button
                        onClick={() => handleDelete(vehicle)}
                        className="flex items-center gap-1 px-3 py-1 text-sm border rounded text-red-600 border-red-600 hover:bg-red-50">
                        <Trash2 size={14} />
                        Delete
                      </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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
  }
);

function ManageVehicles() {
  const dispatch = useDispatch();
  const hasFetched = useRef(false);

  const { vendors, vendorLoading, vehicleTypes, vehicleTypeLoading } =
    useSelector((state) => ({
      vendors: state.vendor.vendors,
      vendorLoading: state.vendor.loading,
      vehicleTypes: state.vehicleType.vehicleTypes,
      vehicleTypeLoading: state.vehicleType.loading,
    }), shallowEqual);

  const { vehicles, total, status, error } = useSelector((state) => state.vehicle);
  const tenantId = useSelector((state) => state.auth.user?.tenant_id);

  const [selectedVendor, setSelectedVendor] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [vehicleModal, setVehicleModal] = useState(false);
  const [viewActive, setViewActive] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editVehicle, setEditVehicle] = useState(null);

  const { notFound } = useModulePermission("vehicle_management");
  if (notFound) return <PermissionDenied />;

  const itemsPerPage = 10;
  const offset = (currentPage - 1) * itemsPerPage;

  // 🚚 Fetch vendors
  useEffect(() => {
    if (tenantId && vendors.length === 0 && !vendorLoading) {
      dispatch(fetchVendors({ skip: 0, limit: 100, tenant_id: tenantId }));
    } else {
    }
  }, [dispatch, tenantId, vendors.length, vendorLoading]);

  //  console.log("Vehicle Types:", vehicleTypes);


  // 🚗 Fetch vehicle types
  useEffect(() => {
    if (vehicleTypes.length === 0 && !vehicleTypeLoading) {
      console.log("🚗 Fetching vehicle types...");
      dispatch(fetchVehicleTypes());
    } else {
    }
  }, [dispatch, vehicleTypes.length, vehicleTypeLoading]);


  // 🛻 Fetch vehicles
      useEffect(() => {
        if (!selectedVendor) {
          console.log("🚫 No vendor selected. Skipping fetch");
          return;
        }
        console.log("✅ Running fetch for selectedVendor:", selectedVendor);
        dispatch(
          fetchVehicles({
            vendorId: selectedVendor,
            status: viewActive ? "active" : "inactive",
            offset: 0,
            limit: 10,
          })
        );
      }, [selectedVendor, viewActive, dispatch]);



  const filteredVehicles = vehicles.filter((v) =>
    v.reg_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );



  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));

  const onPrev = useCallback(() => {
    if (currentPage > 1) {
      console.log("⬅️ Going to previous page");
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);

  const onNext = useCallback(() => {
    if (currentPage < totalPages) {
      console.log("➡️ Going to next page");
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage, totalPages]);

  const handleEdit = useCallback((vehicle) => {
    console.log("✏️ Editing vehicle:", vehicle);
    setEditVehicle(vehicle);
    setVehicleModal(true);
  }, []);


  const handleDelete = useCallback(
  (vehicle) => {
    const vendorId = selectedVendor || localStorage.getItem("selectedVendor");

    if (!vendorId) {
      console.warn("🚫 No vendor selected. Skipping delete.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      dispatch(
        deleteVehicleThunk({
          vendor_id: vendorId,
          vehicle_id: vehicle.vehicle_id,
        })
      );
    }
  },
  [dispatch, selectedVendor]
);



  const handleToggleStatus = useCallback((vehicle) => {
    const updatedStatus = !vehicle.is_active;
    console.log(`${updatedStatus ? "✅ Activating" : "🛑 Deactivating"} vehicle:`, vehicle.vehicle_id);
    // 🔧 TODO: Add activate/deactivate API call
  }, []);

  return (
    <div className="p-4 space-y-4">
      <HeaderWithActionNoRoute
        title="Manage Vehicles"
        buttonLabel="Add Vehicle"
        onButtonClick={() => {
          console.log("➕ Opening add vehicle modal");
          setEditVehicle(null);
          setVehicleModal(true);
        }}
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* 🔍 Search Box */}
        <div className="flex items-center gap-2 w-full md:w-1/3">
          <Search className="text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search by Registration Number"
            value={searchTerm}
            onChange={(e) => {
              console.log("🔍 Search term changed:", e.target.value);
              setSearchTerm(e.target.value);
            }}
            className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 🏷️ Vendor Dropdown */}
        <div className="w-full md:w-1/3">
          <select
            value={selectedVendor}
          onChange={(e) => {
               const vendorId = Number(e.target.value);
              if (vendorId) {
                console.log("🏷️ Vendor selected:", vendorId);
                setSelectedVendor(vendorId);
                setCurrentPage(1);
                  setVehicleModal(false);
              localStorage.setItem("selectedVendor", vendorId);
              } else {
                console.log("❌ Vendor selection cleared");
                setSelectedVendor("");
              }
            }}
            className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Vendor</option>
            {vendors.map((vendor) => {
              const id = vendor.id || vendor.vendor_id;
              const name =
                // vendor.name ||
                vendor.vendor_name ||
                `Vendor ${id}`;
              return (
                <option key={id} value={String(id)}>
                  {name}
                </option>
              );
            })}
          </select>
        </div>

        {/* 🔄 Active/Inactive Toggle */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-700 font-medium">Inactive</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={viewActive}
              onChange={() => {
                console.log("🔁 Toggling status view:", !viewActive);
                setViewActive((prev) => !prev);
                setCurrentPage(1);
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 transition-all duration-300"></div>
            <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all duration-300 peer-checked:translate-x-5"></div>
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
        handleToggleStatus={handleToggleStatus}
        handleDelete={handleDelete}
      />

      {/* 🚪 Modal */}
      {vehicleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-4xl p-6 relative">
            <button
              onClick={() => {
                console.log("❌ Closing modal");
                setVehicleModal(false);
              }}
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
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(ManageVehicles);



// import React, { useState, useEffect, useRef } from "react";
// import {
//   Edit,
//   Trash2,
//   ChevronLeft,
//   ChevronRight,
//   Search,
// } from "lucide-react";
// import { useDispatch, useSelector, shallowEqual } from "react-redux";
// import HeaderWithActionNoRoute from "../components/HeaderWithActionNoRoute";
// import { useModulePermission } from "../hooks/userModulePermission";
// import PermissionDenied from "../components/PermissionDenied";
// import VehicleForm from "../components/VehicleForm";
// import { fetchVendors } from "../redux/features/managevendors/vendorThunks";
// import { fetchVehicleTypes } from "../redux/features/managevehicletype/vehicleTypeThunks";
// import { fetchVehicles, deleteVehicleThunk } from "../redux/features/manageVehicles/vehicleThunk";

// const ITEMS_PER_PAGE = 10;

// const VehicleList = React.memo(({ vehicles, onNext, onPrev, currentPage, totalPages, isLoading, error, handleEdit, handleDelete }) => {
//   const errorMessage = typeof error === "string" ? error : error?.detail || JSON.stringify(error);

//   return (
//     <div className="rounded-lg border bg-white shadow-sm mt-4">
//       <div className="overflow-auto max-h-[500px]">
//         <table className="min-w-full border-collapse text-sm">
//           <thead className="bg-gray-100 sticky top-0 z-10">
//             <tr className="text-left text-gray-700">
//               {['S. No.', 'Vehicle Code', 'Registration No.', 'Vehicle Type', 'Vendor', 'Driver', 'Description', 'Actions'].map((text, i) => (
//                 <th key={i} className="px-4 py-2">{text}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {isLoading ? (
//               <tr><td colSpan="8" className="text-center p-4 text-gray-500">Loading vehicles...</td></tr>
//             ) : error ? (
//               <tr><td colSpan="8" className="text-center p-4 text-red-500">Failed to load vehicles: {errorMessage}</td></tr>
//             ) : vehicles.length === 0 ? (
//               <tr><td colSpan="8" className="text-center p-4 text-gray-500">No vehicles found</td></tr>
//             ) : (
//               vehicles.map((vehicle, index) => (
//                 <tr key={vehicle.vehicle_id} className="border-t hover:bg-gray-50">
//                   <td className="px-4 py-2">{index + 1 + (currentPage - 1) * ITEMS_PER_PAGE}</td>
//                   <td className="px-4 py-2">{vehicle.vehicle_code}</td>
//                   <td className="px-4 py-2">{vehicle.reg_number}</td>
//                   <td className="px-4 py-2">{vehicle.vehicle_type_name || vehicle.vehicle_type_id}</td>
//                   <td className="px-4 py-2">{vehicle.vendor_name || vehicle.vendor_id}</td>
//                   <td className="px-4 py-2">{vehicle.driver_id}</td>
//                   <td className="px-4 py-2">{vehicle.description}</td>
//                   <td className="px-4 py-2 text-center">
//                     <div className="flex justify-center items-center gap-2">
//                       <button onClick={() => handleEdit(vehicle)} className="flex items-center gap-1 px-3 py-1 text-sm border rounded hover:bg-blue-50 text-blue-600 border-blue-600">
//                         <Edit size={14} /> Manage
//                       </button>
//                       <button onClick={() => handleDelete(vehicle)} className="flex items-center gap-1 px-3 py-1 text-sm border rounded text-red-600 border-red-600 hover:bg-red-50">
//                         <Trash2 size={14} /> Delete
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       <div className="flex justify-center items-center gap-4 py-4">
//         <button
//           onClick={() => onPrev()}
//           disabled={currentPage === 1}
//           className={`flex items-center gap-2 px-4 py-2 rounded ${currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
//         >
//           <ChevronLeft size={18} /> Prev
//         </button>
//         <span className="text-sm text-gray-700 font-medium">Page {currentPage} of {totalPages}</span>
//         <button
//           onClick={() => onNext()}
//           disabled={currentPage === totalPages}
//           className={`flex items-center gap-2 px-4 py-2 rounded ${currentPage === totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}
//         >
//           Next <ChevronRight size={18} />
//         </button>
//       </div>
//     </div>
//   );
// });

// function ManageVehicles() {
//   const dispatch = useDispatch();
//   const { notFound } = useModulePermission("vehicle_management");
//   if (notFound) return <PermissionDenied />;

//   const tenantId = useSelector((state) => state.auth.user?.tenant_id);
//   const { vendors, vendorLoading, vehicleTypes, vehicleTypeLoading } = useSelector(
//     (state) => ({
//       vendors: state.vendor.vendors,
//       vendorLoading: state.vendor.loading,
//       vehicleTypes: state.vehicleType.vehicleTypes,
//       vehicleTypeLoading: state.vehicleType.loading,
//     }),
//     shallowEqual
//   );
//   const { vehicles, total, status, error } = useSelector((state) => state.vehicle);

//   const [selectedVendor, setSelectedVendor] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [vehicleModal, setVehicleModal] = useState(false);
//   const [viewActive, setViewActive] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [editVehicle, setEditVehicle] = useState(null);

//   const offset = (currentPage - 1) * ITEMS_PER_PAGE;
//   const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

//   // Keep track of last fetch params to avoid duplicate calls
//   const lastFetchParams = useRef({ vendorId: null, status: null, offset: null });

//   // Fetch vendors once on mount
//   useEffect(() => {
//     console.log(`[ManageVehicles] useEffect - Checking vendors: tenantId=${tenantId}, vendorsCount=${vendors.length}, vendorLoading=${vendorLoading}`);
//     if (tenantId && vendors.length === 0 && !vendorLoading) {
//       console.log("[ManageVehicles] Dispatching fetchVendors...");
//       dispatch(fetchVendors({ skip: 0, limit: 100, tenant_id: tenantId }));
//     }
//   }, [dispatch, tenantId, vendors.length, vendorLoading]);

//   // Reset current page when vendor or viewActive changes
//   useEffect(() => {
//     console.log(`[ManageVehicles] Reset currentPage to 1 due to selectedVendor or viewActive change. selectedVendor=${selectedVendor} viewActive=${viewActive}`);
//     setCurrentPage(1);
//   }, [selectedVendor, viewActive]);

//   // Fetch vehicles when selectedVendor, viewActive, or offset changes (with guard)
//   useEffect(() => {
//     if (!selectedVendor) {
//       console.log("[ManageVehicles] No selectedVendor, skipping fetchVehicles");
//       return;
//     }
//     if (
//       lastFetchParams.current.vendorId === selectedVendor &&
//       lastFetchParams.current.status === (viewActive ? "active" : "inactive") &&
//       lastFetchParams.current.offset === offset
//     ) {
//       console.log("[ManageVehicles] Fetch params unchanged, skipping fetchVehicles");
//       return;
//     }
//     console.log(`[ManageVehicles] Fetching vehicles with: vendorId=${selectedVendor}, status=${viewActive ? "active" : "inactive"}, offset=${offset}, limit=${ITEMS_PER_PAGE}`);
//     lastFetchParams.current = {
//       vendorId: selectedVendor,
//       status: viewActive ? "active" : "inactive",
//       offset,
//     };
//     dispatch(fetchVehicles({ vendorId: selectedVendor, status: viewActive ? "active" : "inactive", offset, limit: ITEMS_PER_PAGE }));
//   }, [selectedVendor, viewActive, offset, dispatch]);


//   const filteredVehicles = vehicles.filter((v) => v.reg_number?.toLowerCase().includes(searchTerm.toLowerCase()));

//   const onPrev = () => {
//     if (currentPage > 1) {
//       console.log(`[ManageVehicles] Pagination prev clicked. Current page: ${currentPage}`);
//       setCurrentPage((prev) => prev - 1);
//     }
//   };
//   const onNext = () => {
//     if (currentPage < totalPages) {
//       console.log(`[ManageVehicles] Pagination next clicked. Current page: ${currentPage}`);
//       setCurrentPage((prev) => prev + 1);
//     }
//   };

//   const handleAddVehicleClick = async () => {
//     if (!selectedVendor) {
//       alert("Please select a vendor before adding a vehicle.");
//       return;
//     }
//     try {
//       console.log("[ManageVehicles] handleAddVehicleClick - Fetching vehicle types and vehicles before opening modal...");
//       await dispatch(fetchVehicleTypes()).unwrap();
//       await dispatch(fetchVehicles({ vendorId: selectedVendor, status: viewActive ? "active" : "inactive", offset: 0, limit: ITEMS_PER_PAGE })).unwrap();
//       setEditVehicle(null);
//       setVehicleModal(true);
//       console.log("[ManageVehicles] Vehicle modal opened for adding new vehicle.");
//     } catch (error) {
//       console.error("[ManageVehicles] Error fetching data before Add Vehicle:", error);
//     }
//   };

//   const handleEdit = (vehicle) => {
//     console.log("[ManageVehicles] handleEdit - Editing vehicle:", vehicle);
//     setEditVehicle(vehicle);
//     setVehicleModal(true);
//   };

//   const handleDelete = (vehicle) => {
//     const vendorId = selectedVendor || localStorage.getItem("selectedVendor");
//     if (vendorId && window.confirm("Are you sure you want to delete this vehicle?")) {
//       console.log(`[ManageVehicles] handleDelete - Deleting vehicle id=${vehicle.vehicle_id} for vendor id=${vendorId}`);
//       dispatch(deleteVehicleThunk({ vendor_id: vendorId, vehicle_id: vehicle.vehicle_id }));
//     }
//   };

//   return (
//     <div className="p-4 space-y-4">
//       <HeaderWithActionNoRoute
//         title="Manage Vehicles"
//         buttonLabel="Add Vehicle"
//         onButtonClick={handleAddVehicleClick}
//       />

//       <div className="flex flex-wrap items-center justify-between gap-4">
//         <div className="flex items-center gap-2 w-full md:w-1/3">
//           <Search className="text-gray-500" size={18} />
//           <input
//             type="text"
//             placeholder="Search by Registration Number"
//             value={searchTerm}
//             onChange={(e) => {
//               console.log(`[ManageVehicles] Search input changed to: ${e.target.value}`);
//               setSearchTerm(e.target.value);
//             }}
//             className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         <div className="w-full md:w-1/3">
//           <select
//             value={selectedVendor}
//             onChange={(e) => {
//               const vendorId = Number(e.target.value);
//               console.log(`[ManageVehicles] Vendor selected: ${vendorId}`);
//               if (vendorId) {
//                 setSelectedVendor(vendorId);
//                 setVehicleModal(false);
//                 localStorage.setItem("selectedVendor", vendorId);
//               } else {
//                 setSelectedVendor("");
//               }
//             }}
//             className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             <option value="">Select Vendor</option>
//             {vendors.map((vendor) => (
//               <option key={vendor.id || vendor.vendor_id} value={vendor.id || vendor.vendor_id}>
//                 {vendor.vendor_name || `Vendor ${vendor.id || vendor.vendor_id}`}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="flex items-center gap-3">
//           <span className="text-sm text-gray-700 font-medium">Inactive</span>
//           <label className="relative inline-flex items-center cursor-pointer">
//             <input
//               type="checkbox"
//               checked={viewActive}
//               onChange={() => {
//                 console.log(`[ManageVehicles] Toggle viewActive from ${viewActive} to ${!viewActive}`);
//                 setViewActive((prev) => !prev);
//               }}
//               className="sr-only peer"
//             />
//             <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 transition-all duration-300"></div>
//             <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all duration-300 peer-checked:translate-x-5"></div>
//           </label>
//           <span className="text-sm text-gray-700 font-medium">Active</span>
//         </div>
//       </div>

//       <VehicleList
//         vehicles={filteredVehicles}
//         onNext={onNext}
//         onPrev={onPrev}
//         currentPage={currentPage}
//         totalPages={totalPages}
//         isLoading={status === "loading"}
//         error={error}
//         handleEdit={handleEdit}
//         handleDelete={handleDelete}
//       />

//       {vehicleModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
//           <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-4xl p-6 relative">
//             <button
//               onClick={() => {
//                 console.log("[ManageVehicles] Vehicle modal closed");
//                 setVehicleModal(false);
//               }}
//               className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
//             >
//               ✕
//             </button>
//             <h2 className="text-xl font-semibold mb-4">
//               {editVehicle ? "Edit Vehicle" : "Add Vehicle"}
//             </h2>
//             <VehicleForm
//               isEdit={!!editVehicle}
//               initialData={editVehicle}
//               vendors={vendors}
//               vehicleTypes={vehicleTypes}
//             />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default React.memo(ManageVehicles);

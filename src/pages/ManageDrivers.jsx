// import React, { useState, useEffect } from 'react';
// import { Edit, Trash2 } from 'lucide-react';
// import { useDispatch, useSelector } from 'react-redux';
// import { toast } from 'react-toastify';
// import DriverToolbar from '../components/driver/DriverToolbar';
// import DriverForm from '../components/driver/DriverForm';
// import { DriverTableHeaders } from '../staticData/DriverData';
// import { fetchVendors } from '../redux/features/managevendors/vendorThunks';
// import {
//   getTenantDriversAPI,
//   getFilteredDrivers,
//   createDriverAPI,
//   updateDriverAPI,
//   patchDriverStatusAPI,
// } from '../redux/features/manageDriver/driverApi';

// // ---------- LOGGING HELPER ----------
// const log = (label, ...data) => {
//   console.log(`📢 [DRIVERS] ${label}`, ...data);
// };

// const getValueByKeyPath = (obj, keyPath) =>
//   keyPath.split('.').reduce((acc, key) => acc?.[key], obj) ?? '—';

// const getDriverStatus = (driver) => (driver.is_active ? 'ACTIVE' : 'INACTIVE');

// // ---------- DriverList ----------
// const DriverList = ({ drivers, onEdit, onDelete, onStatusToggle }) => {
//   const visibleHeaders = DriverTableHeaders.filter(h => h.key !== 'documentsUploaded');

//   return (
//     <div className="rounded-lg overflow-hidden shadow-sm mt-2">
//       <div className="overflow-auto h-[620px]">
//         <table className="min-w-full border-collapse">
//           <thead className="bg-gray-50 border-b sticky top-0">
//             <tr className="text-left text-gray-600">
//               {visibleHeaders.map(header => (
//                 <th key={header.key} className="px-4 py-3 whitespace-nowrap">
//                   {header.label}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {drivers.length === 0 ? (
//               <tr>
//                 <td colSpan={visibleHeaders.length} className="p-4 text-center text-gray-500">
//                   No drivers found
//                 </td>
//               </tr>
//             ) : (
//               drivers.map((driver, index) => (
//                 <tr key={driver.driver_id} className="border-b hover:bg-gray-50 transition">
//                   {visibleHeaders.map(header => (
//                     <td key={header.key} className="px-4 py-3 text-sm">
//                       {header.key === 's_no' ? (
//                         index + 1
//                       ) : header.key === 'actions' ? (
//                         <div className="flex gap-2 items-center justify-center">
//                           <button
//                             onClick={() => onStatusToggle(driver)}
//                             title="Click to toggle status"
//                             className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer ${
//                               getDriverStatus(driver) === 'ACTIVE'
//                                 ? 'bg-green-100 text-green-800'
//                                 : 'bg-red-100 text-red-800'
//                             }`}
//                           >
//                             {getDriverStatus(driver)}
//                           </button>
//                           <button onClick={() => onEdit(driver)} className="p-1 hover:bg-gray-100 rounded-full">
//                             <Edit size={16} color="blue" />
//                           </button>
//                           <button onClick={() => onDelete(driver.driver_id)} className="p-1 hover:bg-gray-100 rounded-full">
//                             <Trash2 size={16} color="red" />
//                           </button>
//                         </div>
//                       ) : (
//                         getValueByKeyPath(driver, header.key)
//                       )}
//                     </td>
//                   ))}
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// // ---------- ManageDrivers ----------
// function ManageDrivers() {
//   const dispatch = useDispatch();
//   const { vendors } = useSelector(state => state.vendor);
//   const { user } = useSelector(state => state.auth);
//   const tenantId = user?.tenant_id || 1;

//   const [allDrivers, setAllDrivers] = useState([]);
//   const [filteredDrivers, setFilteredDrivers] = useState([]);
//   const [filters, setFilters] = useState({ vendorId: 'All', driverStatus: '' });
//   const [modalState, setModalState] = useState({ show: false, isEditing: false, editData: null, selectedVendorId: null });
//   const [loading, setLoading] = useState(false);

//   // Fetch vendors initially
//   useEffect(() => {
//     if (tenantId && vendors.length === 0) {
//       log("Trigger → Fetch Vendors API", { tenantId });
//       dispatch(fetchVendors({ skip: 0, limit: 100, tenant_id: tenantId }))
//         .unwrap()
//         .then(res => log("✅ Vendors fetched", res))
//         .catch(err => log("❌ Vendor fetch failed", err));
//     }
//   }, [tenantId, vendors.length, dispatch]);

//   // Fetch drivers when vendor changes
//   useEffect(() => {
//     if (vendors.length > 0) {
//       log("Trigger → Vendor Change", { selectedVendorId: filters.vendorId });
//       loadDrivers(filters.vendorId);
//     }
//   }, [filters.vendorId, vendors]);

//   // Filter status changes
//   useEffect(() => {
//     log("Trigger → Status Filter Change", { newStatus: filters.driverStatus });
//     filterDriversByStatus(filters.driverStatus, allDrivers);
//   }, [filters.driverStatus, allDrivers]);

//   const loadDrivers = async (vendorId = 'All') => {
//     setLoading(true);
//     log("API Call → Fetch Drivers", { vendorId, endpoint: vendorId === 'All' ? "/drivers/tenant" : `/drivers?vendorId=${vendorId}` });
//     try {
//       const res = vendorId === 'All' ? await getTenantDriversAPI() : await getFilteredDrivers(vendorId, {});
//       const drivers = Array.isArray(res?.data) ? res.data : res?.data?.data || [];
//       log("✅ Drivers fetched", { count: drivers.length, data: drivers });
//       setAllDrivers(drivers);
//       filterDriversByStatus(filters.driverStatus, drivers);
//     } catch (err) {
//       log("❌ Fetch drivers failed", err);
//       setAllDrivers([]);
//       setFilteredDrivers([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filterDriversByStatus = (status = '', drivers = allDrivers) => {
//   log("Filter → By Status", { status, totalBefore: drivers.length });

//   const isNoFilter = !status || status === 'All';
//   const filtered = isNoFilter
//     ? drivers
//     : drivers.filter(d => (status === 'ACTIVE' ? d.is_active : !d.is_active));

//   log("Filter → Result Count", filtered.length);
//   setFilteredDrivers(filtered);
// };


//   const handleFilterChange = (newFilters) => {
//     log("UI Action → Filter Change", newFilters);
//     setFilters(newFilters);
//   };

//   const handleEditDriver = (driver) => {
//     log("UI Action → Edit Driver Clicked", driver);
//     setModalState({
//       show: true,
//       isEditing: true,
//       editData: driver,
//       editingDriverId: driver.driver_id,
//       selectedVendorId: driver.vendor?.vendor_id || null,
//     });
//   };

//   const handleAddDriver = () => {
//     log("UI Action → Add Driver Clicked");
//     setModalState({ show: true, isEditing: false, editData: null, selectedVendorId: null });
//   };

//   const handleDeleteDriver = (id) => {
//     log("UI Action → Delete Driver Clicked", { driverId: id });
//     if (window.confirm('Are you sure you want to delete this driver?')) {
//       log("Soft Delete → Removing driver from state", { driverId: id });
//       setAllDrivers(prev => prev.filter(d => d.driver_id !== id));
//       setFilteredDrivers(prev => prev.filter(d => d.driver_id !== id));
//     }
//   };

//   const handleStatusToggle = async (driver) => {
//     const current = getDriverStatus(driver);
//     const next = current === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
//     const confirmChange = window.confirm(`Change status from ${current} to ${next}?`);
//     if (!confirmChange) return;

//     log("API Call → Toggle Driver Status", {
//       driverId: driver.driver_id,
//       vendorId: driver.vendor.vendor_id,
//       from: current,
//       to: next,
//       endpoint: `/drivers/${driver.driver_id}/status`
//     });

//     try {
//       await patchDriverStatusAPI(driver.vendor.vendor_id, driver.driver_id, { status: next });
//       log("✅ Status updated successfully");
//       loadDrivers(filters.vendorId);
//     } catch (err) {
//       log("❌ Status update failed", err);
//       alert('Failed to update status');
//     }
//   };

//   const handleSave = async (formData) => {
//     const { isEditing, selectedVendorId, editingDriverId } = modalState;
//     const vendorId = Number(selectedVendorId || formData.vendor);

//     if (!vendorId || Number.isNaN(vendorId)) {
//       toast.error('Vendor not selected.');
//       return;
//     }

//     const payload = { ...formData, vendor_id: vendorId };
//     let apiType = isEditing ? "Edit" : "Add";

//     log(`API Call → ${apiType} Driver`, {
//       vendorId,
//       driverId: isEditing ? editingDriverId : null,
//       payload,
//       endpoint: isEditing
//         ? `/vendors/${vendorId}/drivers/${editingDriverId}`
//         : `/vendors/${vendorId}/drivers`
//     });

//     try {
//       let response;
//       if (isEditing) {
//         if (!editingDriverId) {
//           toast.error('Driver ID missing for update.');
//           return;
//         }
//         response = await updateDriverAPI(vendorId, editingDriverId, payload);
//       } else {
//         response = await createDriverAPI(vendorId, payload);
//       }

//       const success = response?.data?.driver_id || response?.status === 201;
//       if (success) {
//         log(`✅ ${apiType} Driver Success`, response?.data);
//         toast.success(isEditing ? 'Driver updated successfully!' : 'Driver created successfully!');
//         closeModal();
//         if (filters?.vendorId) {
//           loadDrivers(filters.vendorId);
//         }
//       } else {
//         log(`❌ ${apiType} Driver Failed`, response);
//         toast.error('Something went wrong while saving the driver.');
//       }
//     } catch (err) {
//       log(`❌ ${apiType} Driver API Error`, err);
//       toast.error('Failed to save driver. Please try again.');
//     }
//   };

//   const closeModal = () => {
//     log("UI Action → Close Modal");
//     setModalState({
//       show: false,
//       isEditing: false,
//       editData: null,
//       selectedVendorId: null,
//       editingDriverId: null,
//     });
//   };

//   return (
//     <>
//       <DriverToolbar
//         vendors={[{ id: 'All', name: 'All' }, ...vendors.map(v => ({ id: v.vendor_id, name: v.vendor_name }))]}
//         onFilterChange={handleFilterChange}
//         onBulkUpload={() => log("UI Action → Bulk Upload Clicked")}
//         onManageCompliance={() => log("UI Action → Manage Compliance Clicked")}
//         onAddDriver={handleAddDriver}
//       />

//       {loading ? (
//         <p className="p-4 text-gray-500">Loading drivers...</p>
//       ) : (
//         <DriverList
//           drivers={filteredDrivers}
//           onEdit={handleEditDriver}
//           onDelete={handleDeleteDriver}
//           onStatusToggle={handleStatusToggle}
//         />
//       )}

//       {modalState.show && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
//           <div className="bg-white rounded-lg shadow max-w-5xl w-full max-h-[90vh] overflow-y-auto p-4">
//             <DriverForm
//               initialData={modalState.editData}
//               isEdit={modalState.isEditing}
//               onSave={handleSave}
//               onClose={closeModal}
//               vendors={vendors}
//             />
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// export default React.memo(ManageDrivers);


import React, { useState, useEffect, useRef } from 'react';
import { Edit } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import DriverToolbar from '../components/driver/DriverToolbar';
import DriverForm from '../components/driver/DriverForm';
import { DriverTableHeaders } from '../staticData/DriverData';
import { fetchVendors } from '../redux/features/managevendors/vendorThunks';
import {
  getTenantDriversAPI,
  getFilteredDrivers,
  patchDriverStatusAPI,
} from '../redux/features/manageDriver/driverApi';

// Logging helper
const log = (label, ...data) => console.log(`📢 [DRIVERS] ${label}`, ...data);

// Safely access nested object keys from a dot-separated path string
const getValueByKeyPath = (obj, keyPath) =>
  keyPath.split('.').reduce((acc, key) => acc?.[key], obj) ?? '—';

// Get driver status string from boolean
const getDriverStatus = (driver) => (driver.is_active ? 'ACTIVE' : 'INACTIVE');

// DriverList component to display the drivers table
const DriverList = ({ drivers, onEdit, onStatusToggle }) => {
  const visibleHeaders = DriverTableHeaders.filter(h => h.key !== 'documentsUploaded');

  return (
    <div className="rounded-lg overflow-hidden shadow-sm mt-2">
      <div className="overflow-auto h-[620px]">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-50 border-b sticky top-0">
            <tr className="text-left text-gray-600">
              {visibleHeaders.map(header => (
                <th key={header.key} className="px-4 py-3 whitespace-nowrap">
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {drivers.length === 0 ? (
              <tr>
                <td colSpan={visibleHeaders.length} className="p-4 text-center text-gray-500">
                  No drivers found
                </td>
              </tr>
            ) : (
              drivers.map((driver, index) => (
                <tr key={driver.driver_id} className="border-b hover:bg-gray-50 transition">
                  {visibleHeaders.map(header => (
                    <td key={header.key} className="px-4 py-3 text-sm">
                      {header.key === 's_no' ? (
                        index + 1
                      ) : header.key === 'actions' ? (
                        <div className="flex gap-2 items-center justify-center">
                          <button
                            onClick={() => onStatusToggle(driver)}
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              getDriverStatus(driver) === 'ACTIVE'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {getDriverStatus(driver)}
                          </button>
                          <button
                            onClick={() => onEdit(driver)}
                            className="p-1 hover:bg-gray-100 rounded-full"
                            title="Edit Driver"
                          >
                            <Edit size={16} color="blue" />
                          </button>
                        </div>
                      ) : (
                        getValueByKeyPath(driver, header.key)
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Main ManageDrivers component
function ManageDrivers() {
  const dispatch = useDispatch();
  const { vendors } = useSelector(state => state.vendor);
  const { user } = useSelector(state => state.auth);
  const tenantId = user?.tenant_id || 1;

  const [drivers, setDrivers] = useState([]);
  const [filters, setFilters] = useState({ vendorId: 'ALL', driverStatus: 'ALL' });
  const [modalState, setModalState] = useState({
    show: false,
    isEditing: false,
    editData: null,
    selectedVendorId: null,
  });
  const [loading, setLoading] = useState(false);

  const didMountRef = useRef(false);

  // Fetch vendors on mount if not already fetched
  useEffect(() => {
    if (vendors.length === 0) {
      dispatch(fetchVendors({ skip: 0, limit: 100, tenant_id: tenantId }))
        .unwrap()
        .catch(err => log("❌ Vendor fetch failed", err));
    }
  }, [tenantId, dispatch, vendors.length]);

  // Fetch drivers on initial mount and whenever filters or vendors change
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      if (vendors.length > 0) {
        fetchDrivers(filters.vendorId, filters.driverStatus);
      }
      return;
    }
    if (vendors.length > 0) {
      fetchDrivers(filters.vendorId, filters.driverStatus);
    }
  }, [filters, vendors.length]);

  // Fetch drivers from API based on filters
  const fetchDrivers = async (vendorId, status) => {
    setLoading(true);

    try {
      const vendorIdNorm = vendorId.toUpperCase();
      let driverStatusNorm = status.toUpperCase();

      if (driverStatusNorm !== 'ACTIVE' && driverStatusNorm !== 'INACTIVE') {
        driverStatusNorm = 'ALL';
      }

      if (vendorIdNorm === 'ALL') {
        if (driverStatusNorm === 'ALL') {
          const res = await getTenantDriversAPI();
          const allDrivers = res?.data || res?.data?.data || [];
          setDrivers(allDrivers);
        } else {
          setDrivers([]);
          toast.warning(`Cannot filter by status "${driverStatusNorm}" when vendor is set to All.`);
        }
      } else {
        const res = await getFilteredDrivers(vendorIdNorm, {});
        let allDrivers = res?.data || res?.data?.data || [];

        if (driverStatusNorm !== 'ALL') {
          allDrivers = allDrivers.filter(driver => {
            const driverStatus = driver.is_active ? 'ACTIVE' : 'INACTIVE';
            return driverStatus === driverStatusNorm;
          });
        }

        setDrivers(allDrivers);
        log("✅ Filtered Drivers fetched (frontend filtered)", { count: allDrivers.length });
      }
    } catch (err) {
      log("❌ Fetch drivers failed", err);
      setDrivers([]);
      toast.error('Failed to fetch drivers.');
    } finally {
      setLoading(false);
    }
  };

  // Handle filters change
  const handleFilterChange = (newFilters) => {
    log("UI → Filter Change", newFilters);
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Handle driver status toggle with optimistic update
  const handleStatusToggle = (driver) => {
    const current = getDriverStatus(driver);
    const next = current === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    if (!window.confirm(`Change status from ${current} to ${next}?`)) return;

    // Optimistically update UI
    setDrivers(prevDrivers =>
      prevDrivers.map(d =>
        d.driver_id === driver.driver_id ? { ...d, is_active: next === 'ACTIVE' } : d
      )
    );

    patchDriverStatusAPI(driver.vendor.vendor_id, driver.driver_id, { status: next })
      .then(() => {
        toast.success('Status updated successfully');
        // Optional: refresh list from backend to sync
        fetchDrivers(filters.vendorId, filters.driverStatus);
      })
      .catch(() => {
        toast.error('Failed to update status');
        // Revert UI change on failure
        setDrivers(prevDrivers =>
          prevDrivers.map(d =>
            d.driver_id === driver.driver_id ? { ...d, is_active: current === 'ACTIVE' } : d
          )
        );
      });
  };

  return (
    <>
      <DriverToolbar
        vendors={[{ id: 'ALL', name: 'All' }, ...vendors.map(v => ({ id: v.vendor_id, name: v.vendor_name }))]}
        statusOptions={[
          { id: 'ALL', name: 'All' },
          { id: 'ACTIVE', name: 'Active' },
          { id: 'INACTIVE', name: 'Inactive' }
        ]}
        onFilterChange={handleFilterChange}
        onAddDriver={() => setModalState({ show: true, isEditing: false, editData: null, selectedVendorId: null })}
      />

      {loading ? (
        <p className="p-4 text-gray-500">Loading drivers...</p>
      ) : (
        <DriverList
          drivers={drivers}
          onEdit={(driver) => setModalState({
            show: true,
            isEditing: true,
            editData: driver,
            selectedVendorId: driver.vendor?.vendor_id || null,
          })}
          onStatusToggle={handleStatusToggle}
        />
      )}

      {modalState.show && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow max-w-5xl w-full max-h-[90vh] overflow-y-auto p-4">
            <DriverForm
              initialData={modalState.editData}
              isEdit={modalState.isEditing}
              onSave={() => fetchDrivers(filters.vendorId, filters.driverStatus)}
              onClose={() => setModalState({ show: false, isEditing: false, editData: null, selectedVendorId: null })}
              vendors={vendors}
            />
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default React.memo(ManageDrivers);

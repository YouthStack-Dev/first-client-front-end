import React, { useState, useEffect, useRef } from 'react';
import { Edit } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import DriverToolbar from '../components/driver/DriverToolbar';
import DriverForm from '../components/driver/DriverForm';
import { DriverTableHeaders } from '../staticData/DriverData';
import { fetchVendors } from '../redux/features/manageVendors/vendorThunks';
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


useEffect(() => {
  if (vendors.length === 0) {
    dispatch(fetchVendors({ skip: 0, limit: 100 }))
      .unwrap()
      .catch(err => log("❌ Vendor fetch failed", err));
  }
}, [dispatch, vendors.length]);



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

 
  const handleFilterChange = (newFilters) => {
    log("UI → Filter Change", newFilters);
    setFilters(prev => ({ ...prev, ...newFilters }));
  };


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

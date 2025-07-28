import React, { useState, useEffect } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import DriverToolbar from '../components/driver/DriverToolbar';
import DriverForm from '../components/driver/DriverForm';
import { DriverTableHeaders } from '../staticData/DriverData';
import { fetchVendors } from '../redux/features/managevendors/vendorThunks';
import {
  getTenantDriversAPI,
  getFilteredDrivers,
  createDriverAPI,
  updateDriverAPI,
  patchDriverStatusAPI,
} from '../redux/features/manageDriver/driverApi';

// Helpers
const getValueByKeyPath = (obj, keyPath) =>
  keyPath.split('.').reduce((acc, key) => acc?.[key], obj) ?? '—';

const getDriverStatus = (driver) => (driver.is_active ? 'ACTIVE' : 'INACTIVE');

// DriverList Component
const DriverList = ({ drivers, onEdit, onDelete, onStatusToggle }) => {
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
                            title="Click to toggle status"
                            className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer ${
                              getDriverStatus(driver) === 'ACTIVE'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {getDriverStatus(driver)}
                          </button>
                          <button onClick={() => onEdit(driver)} className="p-1 hover:bg-gray-100 rounded-full">
                            <Edit size={16} color="blue" />
                          </button>
                          <button onClick={() => onDelete(driver.driver_id)} className="p-1 hover:bg-gray-100 rounded-full">
                            <Trash2 size={16} color="red" />
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

// Main Component
function ManageDrivers() {
  const dispatch = useDispatch();
  const { vendors } = useSelector(state => state.vendor);
  const { user } = useSelector(state => state.auth);
  const tenantId = user?.tenant_id || 1;

  const [allDrivers, setAllDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [filters, setFilters] = useState({ vendorId: 'All', driverStatus: '' });
  const [modalState, setModalState] = useState({ show: false, isEditing: false, editData: null, selectedVendorId: null });
  const [loading, setLoading] = useState(false);

  // Fetch vendors initially
  useEffect(() => {
    if (tenantId && vendors.length === 0) {
      dispatch(fetchVendors({ skip: 0, limit: 100, tenant_id: tenantId }));
    }
  }, [tenantId, vendors.length, dispatch]);

  // Fetch drivers when vendor changes
  useEffect(() => {
    if (vendors.length > 0) {
      loadDrivers(filters.vendorId);
    }
  }, [filters.vendorId, vendors]);

  // Filter status changes
  useEffect(() => {
    filterDriversByStatus(filters.driverStatus, allDrivers);
  }, [filters.driverStatus, allDrivers]);

  const loadDrivers = async (vendorId = 'All') => {
    setLoading(true);
    try {
      const res = vendorId === 'All' ? await getTenantDriversAPI() : await getFilteredDrivers(vendorId, '', '');
      const drivers = Array.isArray(res?.data) ? res.data : res?.data?.data || [];
      setAllDrivers(drivers);
      filterDriversByStatus(filters.driverStatus, drivers);
    } catch (err) {
      console.error('Fetch drivers failed:', err);
      setAllDrivers([]);
      setFilteredDrivers([]);
    } finally {
      setLoading(false);
    }
  };

  const filterDriversByStatus = (status = '', drivers = allDrivers) => {
    const filtered = status
      ? drivers.filter(d => (status === 'ACTIVE' ? d.is_active : !d.is_active))
      : drivers;
    setFilteredDrivers(filtered);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleEditDriver = (driver) => {
    setModalState({
      show: true,
      isEditing: true,
      editData: driver,
      selectedVendorId: driver.vendor?.vendor_id || null,
    });
  };

  const handleAddDriver = () => {
    setModalState({ show: true, isEditing: false, editData: null, selectedVendorId: null });
  };

  const handleDeleteDriver = (id) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      setAllDrivers(prev => prev.filter(d => d.driver_id !== id));
      setFilteredDrivers(prev => prev.filter(d => d.driver_id !== id));
    }
  };

  const handleStatusToggle = async (driver) => {
    const current = getDriverStatus(driver);
    const next = current === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const confirmChange = window.confirm(`Change status from ${current} to ${next}?`);
    if (!confirmChange) return;

    try {
      await patchDriverStatusAPI(driver.vendor.vendor_id, driver.driver_id, { status: next });
      loadDrivers(filters.vendorId);
    } catch (err) {
      console.error('Status update failed:', err);
      alert('Failed to update status');
    }
  };

  const handleSave = async (formData) => {
    const { isEditing, selectedVendorId } = modalState;
    const vendorId = selectedVendorId || formData.vendor_id;
    if (!vendorId) return alert('Vendor not selected.');

    try {
      const response = isEditing
        ? await updateDriverAPI(vendorId, formData)
        : await createDriverAPI(vendorId, formData);

      const success = response?.data?.id || response?.status === 201;
      if (success) {
        alert(isEditing ? 'Driver updated successfully!' : 'Driver created successfully!');
        closeModal();
        loadDrivers(filters.vendorId);
      } else {
        alert('Something went wrong while saving the driver.');
      }
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save driver.');
    }
  };

  const closeModal = () => {
    setModalState({ show: false, isEditing: false, editData: null, selectedVendorId: null });
  };

  return (
    <>
      <DriverToolbar
        vendors={[{ id: 'All', name: 'All' }, ...vendors.map(v => ({ id: v.vendor_id, name: v.vendor_name }))]}
        onFilterChange={handleFilterChange}
        onBulkUpload={() => alert('Bulk Upload clicked')}
        onManageCompliance={() => alert('Manage Compliance clicked')}
        onAddDriver={handleAddDriver}
      />

      {loading ? (
        <p className="p-4 text-gray-500">Loading drivers...</p>
      ) : (
        <DriverList
          drivers={filteredDrivers}
          onEdit={handleEditDriver}
          onDelete={handleDeleteDriver}
          onStatusToggle={handleStatusToggle}
        />
      )}

      {modalState.show && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow max-w-5xl w-full max-h-[90vh] overflow-y-auto p-4">
            <DriverForm
              initialData={modalState.editData}
              isEdit={modalState.isEditing}
              onSave={handleSave}
              onClose={closeModal}
              vendors={vendors}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default React.memo(ManageDrivers);

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DriverFormUI from '../components/driver/DriverForm';
import ToolBar from '../components/ui/ToolBar';
import { DriverListUI } from '../components/driver/DriverListUI';
import BulkUploadButton from '../components/ui/BulkUploadButton';
import SearchInput from '../components/SearchInput';
import { API_CLIENT } from '../Api/API_Client';
import Modal from '../components/modals/Modal';

const DriverManagement = () => {
  // Data states
  const [vendors, setVendors] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filters
  const [filters, setFilters] = useState({ 
    driverStatus: 'ACTIVE', 
    vendorId: 'All' 
  });

  // Modal state
  const [modalState, setModalState] = useState({ 
    show: false, 
    isEditing: false, 
    editData: null 
  });

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const fetchDrivers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API_CLIENT.get(`/drivers`, {
        params: {
          status: filters.driverStatus,
          vendorId: filters.vendorId === 'All' ? null : filters.vendorId,
          search: searchTerm || null
        }
      });
      setDrivers(response.data);
      setFilteredDrivers(response.data); // Initially, all drivers are shown
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch drivers');
      console.error('Error fetching drivers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch vendors from API
  const fetchVendors = async () => {
    try {
      const response = await API_CLIENT.get(`/vendors`);
      setVendors(response.data.vendors);
    } catch (err) {
      console.error('Error fetching vendors:', err);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchVendors();
    fetchDrivers();
  }, []);

  // Refetch drivers when filters or search term changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDrivers();
    }, 300); // Debounce to avoid too many API calls
    
    return () => clearTimeout(timer);
  }, [filters, searchTerm]);

  // Event handlers
  const onFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const onBulkUpload = async (file) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(`${API_BASE_URL}/drivers/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Refresh drivers after successful upload
      fetchDrivers();
      return { success: true, message: 'Bulk upload successful' };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Bulk upload failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const onAddDriver = () => {
    setModalState({ show: true, isEditing: false, editData: null });
  };

  const onEdit = (driver) => {
    setModalState({ show: true, isEditing: true, editData: driver });
  };

  const onDelete = async (driverId) => {
    try {
      await axios.delete(`${API_BASE_URL}/drivers/${driverId}`);
      fetchDrivers(); // Refresh the list
    } catch (err) {
      console.error('Error deleting driver:', err);
    }
  };

  const onStatusToggle = async (driverId, status) => {
    try {
      await axios.patch(`${API_BASE_URL}/drivers/${driverId}/status`, { status });
      fetchDrivers(); // Refresh the list
    } catch (err) {
      console.error('Error updating driver status:', err);
    }
  };

  const onSave = async (driverData) => {
    try {
      if (modalState.isEditing) {
        await axios.put(`${API_BASE_URL}/drivers/${driverData.id}`, driverData);
      } else {
        await axios.post(`${API_BASE_URL}/drivers`, driverData);
      }
      fetchDrivers(); // Refresh the list
      setModalState({ show: false, isEditing: false, editData: null });
    } catch (err) {
      console.error('Error saving driver:', err);
    }
  };

  const onCloseModal = () => {
    setModalState({ show: false, isEditing: false, editData: null });
  };

  // Config
  const emptyMessage = error || 'No drivers found';
  const statusConfig = {
    active: { class: 'bg-green-100 text-green-800', label: 'ACTIVE' },
    inactive: { class: 'bg-red-100 text-red-800', label: 'INACTIVE' },
  };

  return (
    <>
      <ToolBar
        className="bg-gray-100 p-4 rounded shadow mb-6"
        onAddClick={onAddDriver}
        rightContent={<BulkUploadButton onBulkUpload={onBulkUpload} />}
        addButtonLabel="Add Driver"
        leftContent={
          <div className="flex items-center gap-4">
            <SearchInput 
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search drivers..."
            />
            
            <select
              value={filters.driverStatus}
              onChange={(e) => onFilterChange('driverStatus', e.target.value)}
              className="max-w-[150px] border border-gray-300 rounded-lg px-3 py-1.5 text-sm 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         hover:border-blue-400 transition-colors duration-200 text-gray-700 flex-shrink-0"
            >
              <option value="" disabled>Select Driver Status</option>
              <option value="ACTIVE">Active Driver</option>
              <option value="INACTIVE">Inactive Driver</option>
            </select>
        
            {vendors.length > 0 && (
              <div className="flex items-center gap-2">
                <label className="font-semibold">Vendor:</label>
                <select
                  value={filters.vendorId}
                  onChange={(e) => onFilterChange('vendorId', e.target.value)}
                  className="max-w-[150px] border border-gray-300 rounded px-2 py-1 flex-shrink-0"
                >
                  <option value="All">All</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        }
      />

      <DriverListUI
        drivers={filteredDrivers}
        headers={headers}
        onEdit={onEdit}
        onDelete={onDelete}
        onStatusToggle={onStatusToggle}
        loading={loading}
        emptyMessage={emptyMessage}
        statusConfig={statusConfig}
      />

<Modal
  isOpen={modalState.show}
  onClose={onCloseModal}
  title={modalState.isEditing ? "Edit Driver" : "Add Driver"}
  size="xl" // or "lg" or any size you want based on your Modal's prop
>
  <DriverFormUI
    initialData={modalState.editData}
    isEdit={modalState.isEditing}
    onSave={onSave}
    vendors={vendors}
  />
</Modal>

    </>
  );
};

export default DriverManagement;
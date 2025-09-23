import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useDispatch } from 'react-redux';
import EntityModal from '../components/EntityModal';
import VendorList from '../components/vendor/VendorList';
import { createVendorThunk, updateVendorThunk } from '../redux/features/vendors/vendorThunk';

const VendorManagement = () => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedVendor, setSelectedVendor] = useState(null);

  const handleCreate = () => {
    setModalMode('create');
    setSelectedVendor(null);
    setIsModalOpen(true);
  };

  const handleEdit = (vendor) => {
    setModalMode('edit');
    setSelectedVendor(vendor);
    setIsModalOpen(true);
  };

  const handleSubmit = (formData) => {
    if (modalMode === 'create') {
      dispatch(createVendorThunk(formData));
    } else if (modalMode === 'edit') {
      dispatch(updateVendorThunk({ id: selectedVendor.id, ...formData }));
    }
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Vendor Management</h1>
            <p className="text-gray-600">Manage all registered transportation vendors</p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Vendor
          </button>
        </div>

        <VendorList onEditVendor={handleEdit} />

        <EntityModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          entityType="vendor"
          entityData={selectedVendor}
          onSubmit={handleSubmit}
          mode={modalMode}
        />
      </div>
    </div>
  );
};

export default VendorManagement;

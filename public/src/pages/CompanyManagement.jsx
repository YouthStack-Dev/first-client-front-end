import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus } from 'lucide-react';
import EntityModal from '../components/EntityModal';
import CompanyList from '../companies/CompanyList';
import { 
  fetchCompaniesThunk, 
  createCompanyThunk, 
  updateCompanyThunk 
} from '../redux/features/company/companyThunks';

const CompanyManagement = () => {
  const dispatch = useDispatch();
  const { data: companies = [], loading, error, updating } = useSelector((state) => state.company || {});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedEntity, setSelectedEntity] = useState(null);

useEffect(() => {
  if (companies.length === 0) {
    dispatch(fetchCompaniesThunk());
  }
}, [dispatch]);

  // Open modal in create mode
  const handleCreate = () => {
    setModalMode('create');
    setSelectedEntity(null);
    setIsModalOpen(true);
  };

  // Open modal in edit mode with prefilled data
  const handleEdit = (company) => {
    setModalMode('edit');
    setSelectedEntity(company);
    setIsModalOpen(true);
  };

  // Handle form submission
 const handleSubmit = async (formData) => {
  try {
    if (modalMode === 'create') {
      // Wait for the thunk to finish
      const result = await dispatch(createCompanyThunk(formData)).unwrap();
      console.log('Created company:', result);
    } else if (modalMode === 'edit' && selectedEntity) {
      const result = await dispatch(
        updateCompanyThunk({ companyId: selectedEntity.id, formData })
      ).unwrap();
      console.log('Updated company:', result);
    }

    setIsModalOpen(false);
  } catch (error) {
    console.error('Failed to save company:', error);
  }
};


  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Companies Management</h1>
            <p className="text-gray-600">Manage all registered transportation companies</p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Company
          </button>
        </div>

        {/* Company List */}
        {loading ? (
          <p>Loading companies...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : (
          <CompanyList
            companies={companies}
            onEditCompany={handleEdit} // pass edit handler
          />
        )}

        {/* Entity Modal */}
        <EntityModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          entityType="company"
          entityData={selectedEntity}  // prefill data for edit
          onSubmit={handleSubmit}
          mode={modalMode}             // 'create' or 'edit'
        />
      </div>
    </div>
  );
};

export default CompanyManagement;

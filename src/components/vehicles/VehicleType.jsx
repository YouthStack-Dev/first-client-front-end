import { useState, useEffect } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import {  Modal } from '../SmallComponents';
import DynamicTable from '../DynamicTable';
import ToolBar from '../ui/ToolBar';
import usePermission from '../../hooks/userModulePermission';
import PermissionDenied from '../PermissionDenied';
import { API_CLIENT } from '../../Api/API_Client';
import { toast } from 'react-toastify';
import { logDebug } from '../../utils/logger';
import InputField from '../InputField';

const ManageVehicleTypes = () => {
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const { canDelete, canRead, canWrite } = usePermission('manage-vehicleType');


  useEffect(() => {
    if (canRead) {
      fetchVehicleTypes();
    }
  }, [canRead]);

  const fetchVehicleTypes = async () => {
    try {
      setLoading(true);
      const response = await API_CLIENT.get('/vehicles/get-all-vehicle-types');
      const data =response.data.data.vehicleTypes
      setVehicleTypes(data);
    } catch (error) {
      console.error('Error fetching vehicle types:', error);
      toast.error('Failed to load vehicle types');
    } finally {
      setLoading(false);
    }
  };

  if (!canRead) {
    return <PermissionDenied />;
  }

  const headers = [
    { label: 'Vehicle Type Name', key: 'name' },
    { label: 'Description', key: 'description' },
    { label: 'Capacity', key: 'capacity' },
    { label: 'Fuel Type', key: 'fuel' },
    // { label: 'Company ID', key: 'companyId' } // Add if needed
  ];

  const formFields = [
    { label: 'Vehicle Type Name *', name: 'name', type: 'text', required: true },
    { label: 'Description', name: 'description', type: 'textarea' },
    { label: 'Capacity *', name: 'capacity', type: 'number', required: true, min: 1 },
    {
      label: 'Fuel Type *',
      name: 'fuel',
      type: 'select',
      options: ['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'CNG'],
      required: true,
    },
  ];

  const handleSelectItem = (item, isSelected) => {
    setSelectedItems(prev => 
      isSelected 
        ? [...prev, item] 
        : prev.filter(i => i.id !== item.id)
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      name: formData.name,
      description: formData.description,
      capacity: Number(formData.capacity),
      fuel: formData.fuel,
    };
logDebug('Submitting vehicle type:', payload);
    // try {
    //   if (editingId) {
    //     await API_CLIENT.put(`/vehicle-types/${editingId}`, payload);
    //     toast.success('Vehicle type updated successfully');
    //   } else {
    //     await API_CLIENT.post('/vehicle-types', payload);
    //     toast.success('Vehicle type created successfully');
    //   }
      
    //   fetchVehicleTypes();
    //   setIsModalOpen(false);
    //   setFormData({});
    //   setEditingId(null);
    // } catch (error) {
    //   console.error('Error saving vehicle type:', error);
    //   toast.error(error.response?.data?.message || 'Failed to save vehicle type');
    // }
  };

  const handleEdit = (row) => {
    setEditingId(row.id);
    setFormData({
      name: row.name,
      description: row.description,
      capacity: row.capacity,
      fuel: row.fuel,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (row) => {
    if (window.confirm(`Are you sure you want to delete "${row.name}"?`)) {
      try {
        await API_CLIENT.delete(`/vehicle-types/${row.id}`);
        toast.success('Vehicle type deleted successfully');
        fetchVehicleTypes();
      } catch (error) {
        console.error('Error deleting vehicle type:', error);
        toast.error('Failed to delete vehicle type');
      }
    }
  };

  return (
    <>
      <ToolBar
        className="mb-4 bg-white shadow-sm p-2 rounded-lg"
        onAddClick={() => {
          setFormData({});
          setEditingId(null);
          setIsModalOpen(true);
        }}
        addButtonLabel="Add Vehicle Type"
        disabled={!canWrite}
      />

      <DynamicTable
        headers={headers}
        data={vehicleTypes}
        loading={loading}
        onSelectItem={handleSelectItem}
        selectedItems={selectedItems}
        renderActions={(row) => (
          <div className="flex gap-2">
            {canWrite && (
              <button
                onClick={() => handleEdit(row)}
                className="text-blue-600 hover:bg-gray-100 p-1.5 rounded"
                title="Edit"
              >
                <Edit size={18} />
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => handleDelete(row)}
                className="text-red-600 hover:bg-gray-100 p-1.5 rounded"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        )}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        title={editingId ? 'Edit Vehicle Type' : 'Add Vehicle Type'}
      >
        <div className="space-y-4">
          {formFields.map((field) => (
            <InputField
              key={field.name}
              {...field}
              value={formData[field.name] || ''}
              onChange={handleInputChange}
            />
          ))}
        </div>
      </Modal>
    </>
  );
};

export default ManageVehicleTypes;



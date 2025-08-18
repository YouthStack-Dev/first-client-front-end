import { useEffect, useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import {  Modal } from '../SmallComponents';
import DynamicTable from '../DynamicTable';
import ToolBar from "../ui/ToolBar";
import { API_CLIENT } from '../../Api/API_Client';
import { toast } from 'react-toastify';
import { logDebug } from '../../utils/logger';
import InputField from '../InputField';
import { fetchVehicleTypes } from '../../redux/features/managevehicletype/vehicleTypeThunks';
import { useDispatch, useSelector } from 'react-redux';
import { setFormData } from '../../redux/features/managevehicletype/vehicleTypeSlice';

const ManageVehicleTypes = () => {

  const dispatch = useDispatch();
  const { vehicleTypes, isModalOpen, formData, editingId } = useSelector((state) => state.vehicleType);
  const { user } = useSelector((state) => state.auth);
    const tenantId = user?.tenant_id;

 

  const capitalizeFirst = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';
  
  const formFields = [
    { label: 'Vehicle Type Name *', name: 'vehicle_type_name', type: 'text', required: true },
    { label: 'Description', name: 'description', type: 'textarea' },
    { label: 'Capacity *', name: 'capacity', type: 'number', required: true, min: 1 },
    { label: 'Fuel Type *',name: 'fuel_type',type: 'select', options: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'],required: true,},
    { label: 'Comment', name: 'comment', type: 'textarea' },
  ];
  
  const headers = [
    { label: 'Vehicle Type Name', key: 'name', className: 'w-1/4' },
    { label: 'Description', key: 'description', className: 'w-1/3' },
    { label: 'Total Capacity', key: 'capacity', className: 'w-1/6' },
    { label: 'Fuel Type', key: 'fuel_type', className: 'w-1/6' },
  ];
  

  useEffect(() => {
    if (tenantId && vehicleTypes.length === 0) {
      dispatch(fetchVehicleTypes(tenantId))
        .unwrap()
        .catch(() => {
          toast.error('Failed to load vehicle types');
        });
    }
  }, [tenantId, dispatch, vehicleTypes.length]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    dispatch(setFormData({ ...formData, [name]: value }));
  };

  const validateForm = () => {
    for (const field of formFields) {
      if (field.required) {
        const val = formData[field.name];
        if (!val || (typeof val === 'string' && val.trim() === '')) {
          toast.error(`Please fill the required field: ${field.label}`);
          return false;
        }
        if (field.type === 'number' && Number(val) < (field.min || 0)) {
          toast.error(`${field.label} must be at least ${field.min}`);
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const payload = {
      name: formData.vehicle_type_name,
      description: formData.description,
      capacity: Number(formData.capacity),
      fuel_type: formData.fuel_type?.toLowerCase(),
      comment: formData.comment,
      vendor_id: vendorId,
    };

    try {
      if (editingId) {
        await dispatch(updateVehicleType({ id: editingId, ...payload })).unwrap();
        toast.success('Vehicle Type updated successfully');
      } else {
        await dispatch(createVehicleType(payload)).unwrap();
        toast.success('Vehicle Type created successfully');
      }
      await dispatch(fetchVehicleTypes(vendorId)).unwrap();
    } catch {
      toast.error(`Failed to ${editingId ? 'update' : 'create'} vehicle type`);
    } finally {
      dispatch(toggleModal(false));
      dispatch(resetForm());
      dispatch(setEditingId(null));
    }
  };

  const handleEdit = (row) => {
    dispatch(setEditingId(row.vehicle_type_id));
    dispatch(
      setFormData({
        vehicle_type_name: row.name,
        description: row.description,
        capacity: row.capacity,
        fuel_type: capitalizeFirst(row.fuel_type),
        comment: row.comment || '',
      })
    );
    dispatch(toggleModal(true));
  };

  const handleDelete = async (row) => {
    if (!window.confirm('Are you sure?')) return;

    try {
      await dispatch(deleteVehicleType(row.vehicle_type_id)).unwrap();
      toast.success('Vehicle Type deleted successfully');
      await dispatch(fetchVehicleTypes(vendorId)).unwrap();
    } catch {
      toast.error('Failed to delete vehicle type');
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
   
      />
    <DynamicTable
          headers={headers}
          data={vehicleTypes}
          onMenuToggle={() => {}}
          renderActions={(row) => (
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(row)}
                className="text-blue-600 text-sm flex items-center gap-1"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => handleDelete(row)}
                className="text-red-600 text-sm flex items-center gap-1"
              >
                <Trash2 size={16} /> 
              </button>
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



import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { API_CLIENT } from '../../Api/API_Client';
import { logDebug, logError } from '../../utils/logger';

const DepartmentForm = ({ onClose, onSuccess, initialData = null }) => {
  const isEditMode = Boolean(initialData);
  const [formData, setFormData] = useState({ department_name: '', description: '' });

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        department_name: initialData.department_name || '',
        description: initialData.description || ''
      });
    }
  }, [isEditMode, initialData]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isEditMode
        ? `/departments/${initialData.id}`
        : '/departments/';

      const method = isEditMode ? 'put' : 'post';
      const { data } = await API_CLIENT[method](endpoint, formData);
      toast.success(isEditMode ? 'Team updated successfully' : 'Team created successfully');

      // Notify parent so it can update Redux
      onSuccess(data);

    } catch (error) {

      logError(" this is the error  " ,error)
      toast.error(error.response?.data?.detail || '');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Team Name</label>
        <input
          type="text"
          name="department_name"
          value={formData.department_name}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="mr-2 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          className={`px-4 py-2 rounded text-white ${isEditMode ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {isEditMode ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};


export default DepartmentForm;
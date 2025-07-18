import React, { useState } from 'react';
import PopupModal from './PopupModal';
import { log } from '../utils/logger';

const TeamForm = ({ isOpen, onClose, onSubmit }) => {
  // use camelCase for local state
  const [departmentName, setDepartmentName] = useState('');
  const [description, setDescription] = useState('');

  const resetForm = () => {
    setDepartmentName('');
    setDescription('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      department_name: departmentName,  // payload uses snake_case
      description,
    };
    log("This is the team creation data", formData);
    onSubmit(formData);
    resetForm();     // ✅ clear fields
    onClose();
  };

  const handleCancel = () => {
    resetForm();     // clear fields on cancel too
    onClose();
  };

  return (
    <PopupModal title="Create Department" isOpen={isOpen} onClose={handleCancel}>
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div>
          <label className="block font-medium mb-1">Department Name *</label>
          <input
            type="text"
            value={departmentName}
            onChange={(e) => setDepartmentName(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={handleCancel} className="bg-gray-200 px-4 py-2 rounded">
            Cancel
          </button>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            Create
          </button>
        </div>
      </form>
    </PopupModal>
  );
};

export default TeamForm;

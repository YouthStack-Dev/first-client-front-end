
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PopupModal from './PopupModal';

import { createDepartment, updateDepartment } from '../redux/features/manageTeam/manageTeamThunks';

const TeamForm = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { editingTeamId, teams } = useSelector((state) => state.manageTeam);

  const isEditing = Boolean(editingTeamId);
  const [departmentName, setDepartmentName] = useState('');
  const [description, setDescription] = useState('');

  // Update form fields when editingTeamId changes
  useEffect(() => {
    if (isEditing) {
      const team = teams.find((team) => team.department_id === editingTeamId);
      if (team) {
        setDepartmentName(team.department_name || '');
        setDescription(team.description || '');
      }
    } else {
      setDepartmentName('');
      setDescription('');
    }
  }, [editingTeamId, teams, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      department_name: departmentName,
      description,
    };

    if (isEditing) {
      await dispatch(updateDepartment({ id: editingTeamId, data: payload }));
    } else {
      await dispatch(createDepartment(payload));
    }

    setDepartmentName('');
    setDescription('');
    onClose();
  };

  const handleCancel = () => {
    setDepartmentName('');
    setDescription('');
    onClose();
  };

  return (
    <PopupModal title={isEditing ? 'Edit Department' : 'Create Department'} isOpen={isOpen} onClose={handleCancel}>
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
            {isEditing ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </PopupModal>
  );
};

export default TeamForm;
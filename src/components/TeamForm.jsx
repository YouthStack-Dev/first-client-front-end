import React, { useState } from 'react';
import PopupModal from './PopupModal';

const TeamForm = ({ isOpen, onClose, onSubmit }) => {
  const [teamName, setTeamName] = useState('');
  const [managers, setManagers] = useState(['']);
  const [shiftCategory, setShiftCategory] = useState('Default');
  const [description, setDescription] = useState('');
  const [notifyTo, setNotifyTo] = useState('');

  const handleManagerChange = (index, value) => {
    const updated = [...managers];
    updated[index] = value;
    setManagers(updated);
  };

  const addManager = () => setManagers([...managers, '']);
  const removeManager = (index) => {
    const updated = managers.filter((_, i) => i !== index);
    setManagers(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      teamName,
      managers,
      shiftCategory,
      description,
      notifyTo,
    };
    onSubmit(formData);
    onClose();
  };

  return (
    <PopupModal title="Create Team" isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div>
          <label className="block font-medium mb-1">Team Name *</label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Team Manager</label>
          {managers.map((manager, index) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <input
                type="text"
                value={manager}
                onChange={(e) => handleManagerChange(index, e.target.value)}
                placeholder="Search here (Ctrl+E)"
                className="flex-1 border px-3 py-2 rounded"
              />
              {index === 0 ? (
                <button type="button" onClick={addManager} className="text-green-600 font-bold text-lg">+</button>
              ) : (
                <button type="button" onClick={() => removeManager(index)} className="text-red-600 font-bold text-lg">−</button>
              )}
            </div>
          ))}
        </div>

        <div>
          <label className="block font-medium mb-1">Shift Category</label>
          <select
            value={shiftCategory}
            onChange={(e) => setShiftCategory(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="Default">Default</option>
            <option value="Morning">Morning</option>
            <option value="Night">Night</option>
          </select>
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

        <div>
          <label className="block font-medium mb-1">
            Send Notification To <span title="Enter email addresses">ℹ️</span>
          </label>
          <input
            type="email"
            value={notifyTo}
            onChange={(e) => setNotifyTo(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={onClose} className="bg-gray-200 px-4 py-2 rounded">
            Cancel
          </button>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            Update
          </button>
        </div>
      </form>
    </PopupModal>
  );
};

export default TeamForm;

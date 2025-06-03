import React, { useState } from 'react';
import PermissionSelector from './PermissionSelector';
import { TEMPLATES } from './utils';
import { ChevronLeft } from 'lucide-react';

const RoleForm = ({ role, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    id: role.id,
    name: role.name,
    description: role.description,
    permissions: { ...role.permissions },
  });

  const [nameError, setNameError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === 'name' && !value.trim()) {
      setNameError('Role name is required');
    } else if (name === 'name') {
      setNameError('');
    }
  };

  const handlePermissionsChange = (permissions) => {
    setFormData({
      ...formData,
      permissions,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setNameError('Role name is required');
      return;
    }

    onSave(formData);
  };

  const applyTemplate = (templateKey) => {
    const template = TEMPLATES[templateKey];
    setFormData({
      ...formData,
      name: formData.name || template.name,
      description: formData.description || template.description,
      permissions: { ...template.permissions },
    });
  };

  return (
    <div className="p-6">
      <button
        onClick={onCancel}
        className="mb-4 flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to roles
      </button>

      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {role.id === 0 ? 'Create New Role' : 'Edit Role'}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-y-6 mb-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Role Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border ${
                nameError ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
              placeholder="Enter role name"
            />
            {nameError && <p className="mt-1 text-sm text-red-600">{nameError}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Describe the purpose of this role"
            />
          </div>
        </div>

        {role.id === 0 && (
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">Start with a template:</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyTemplate('admin')}
                className="px-3 py-1.5 text-sm bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors"
              >
                Administrator
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('editor')}
                className="px-3 py-1.5 text-sm bg-emerald-50 text-emerald-700 rounded-md hover:bg-emerald-100 transition-colors"
              >
                Editor
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('viewer')}
                className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
              >
                Viewer
              </button>
            </div>
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Permissions</h3>
          <PermissionSelector
            permissions={formData.permissions}
            onChange={handlePermissionsChange}
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {role.id === 0 ? 'Create Role' : 'Update Role'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoleForm;

import React from 'react';
import { Check, X } from 'lucide-react';
import {
  MODULES,
  countEnabledPermissions,
  getTotalPermissionsCount,
} from './utils';

const PermissionSelector = ({ permissions, onChange }) => {
  const enabledCount = countEnabledPermissions(permissions);
  const totalCount = getTotalPermissionsCount(permissions);
  const percentage = Math.round((enabledCount / totalCount) * 100);

  const handlePermissionChange = (moduleName, action) => {
    const updatedModulePermissions = {
      ...permissions[moduleName],
      [action]: !permissions[moduleName]?.[action],
    };
    onChange({
      ...permissions,
      [moduleName]: updatedModulePermissions,
    });
  };

  const handleSelectAll = () => {
    const newPermissions = {};
    Object.entries(MODULES).forEach(([moduleName, actions]) => {
      newPermissions[moduleName] = {};
      actions.forEach((action) => {
        newPermissions[moduleName][action] = true;
      });
    });
    onChange(newPermissions);
  };

  const handleClearAll = () => {
    const newPermissions = {};
    Object.entries(MODULES).forEach(([moduleName, actions]) => {
      newPermissions[moduleName] = {};
      actions.forEach((action) => {
        newPermissions[moduleName][action] = false;
      });
    });
    onChange(newPermissions);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-300 shadow-sm p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-700">
            {enabledCount} of {totalCount} permissions enabled
          </p>
          <div className="w-64 h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleSelectAll}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            <Check className="w-4 h-4 mr-1" />
            Select All
          </button>
          <button
            onClick={handleClearAll}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            <X className="w-4 h-4 mr-1" />
            Clear All
          </button>
        </div>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(MODULES).map(([moduleName, actions]) => (
          <div
            key={moduleName}
            className="border rounded-lg p-4 shadow-sm bg-gray-50 hover:shadow-md transition-shadow"
          >
            <h3 className="text-sm font-semibold text-gray-800 mb-3">{moduleName}</h3>
            <div className="flex flex-wrap gap-2">
              {actions.map((action) => (
                <label
                  key={action}
                  className="inline-flex items-center text-sm gap-1 text-gray-700"
                >
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-indigo-600"
                    checked={permissions?.[moduleName]?.[action] || false}
                    onChange={() => handlePermissionChange(moduleName, action)}
                  />
                  {action}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PermissionSelector;

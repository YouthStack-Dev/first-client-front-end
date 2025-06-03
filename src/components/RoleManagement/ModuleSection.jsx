import React, { useState } from 'react';
import { MODULES } from './utils';
import { ChevronDown, ChevronUp, CheckSquare, Square } from 'lucide-react';

const ModuleSection = ({ moduleName, permissions, onChange }) => {
  const [expanded, setExpanded] = useState(true);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const handleToggleAll = () => {
    const allEnabled = Object.values(permissions).every(value => value === true);
    const newPermissions = { ...permissions };

    MODULES[moduleName].forEach(action => {
      newPermissions[action] = !allEnabled;
    });

    onChange(moduleName, newPermissions);
  };

  const handleTogglePermission = (action) => {
    onChange(moduleName, {
      ...permissions,
      [action]: !permissions[action],
    });
  };

  const enabledCount = Object.values(permissions).filter(Boolean).length;
  const totalCount = Object.keys(permissions).length;
  const allEnabled = enabledCount === totalCount;
  const someEnabled = enabledCount > 0 && enabledCount < totalCount;

  return (
    <div className="bg-white">
      <div 
        className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={toggleExpanded}
      >
        <div className="flex items-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleAll();
            }}
            className="mr-3 text-gray-500 hover:text-indigo-600 focus:outline-none"
            aria-label={allEnabled ? "Disable all permissions" : "Enable all permissions"}
          >
            {allEnabled ? (
              <CheckSquare className="h-5 w-5 text-indigo-600" />
            ) : someEnabled ? (
              <div className="h-5 w-5 border-2 border-indigo-600 rounded-sm flex items-center justify-center">
                <div className="w-2 h-2 bg-indigo-600 rounded-sm"></div>
              </div>
            ) : (
              <Square className="h-5 w-5" />
            )}
          </button>

          <h3 className="text-sm font-medium text-gray-900">{moduleName}</h3>

          <div className="ml-2 flex items-center">
            {Object.entries(permissions).map(([action, enabled]) => (
              enabled && (
                <span 
                  key={action} 
                  className="ml-1 px-1.5 py-0.5 text-xs rounded bg-indigo-100 text-indigo-800"
                >
                  {action}
                </span>
              )
            ))}
          </div>
        </div>

        <div className="flex items-center">
          <span className="text-xs text-gray-500 mr-2">
            {enabledCount}/{totalCount}
          </span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-4 py-2 pb-3 bg-gray-50 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {MODULES[moduleName].map(action => (
            <label 
              key={action}
              className="inline-flex items-center p-2 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={permissions[action] || false}
                onChange={() => handleTogglePermission(action)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 capitalize">{action}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModuleSection;

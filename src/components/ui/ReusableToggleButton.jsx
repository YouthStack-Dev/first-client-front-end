// components/ui/ReusableToggleButton.jsx
import React, { useState } from 'react';
import { logDebug } from '@utils/logger';

const ReusableToggleButton = ({
  module,
  action,
  isChecked = false,
  onToggle,
  labels = { on: 'Active', off: 'Inactive' },
  loading = false,
  disabled = false,
  className = "",
  size = "default"
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  const getPermissions = () => {
    const userPermissions = sessionStorage.getItem('userPermissions');
    if (userPermissions) {
      const { permissions } = JSON.parse(userPermissions) || [];
      return permissions;
    }
    return [];
  };

  const permissions = getPermissions();

  const hasPermission = () => {
    if (!module || !action) return true;
    const modulePermission = permissions.find(p => p.module === module);
    return modulePermission?.action.includes(action);
  };

  const handleToggle = (e) => {
    e?.stopPropagation();
    if (!disabled && !loading) {
      onToggle?.(!isChecked);
    }
  };

  const sizeClasses = {
    small: "w-8 h-4 after:h-3 after:w-3",
    default: "w-10 h-5 after:h-4 after:w-4",
    large: "w-12 h-6 after:h-5 after:w-5"
  };

  const textSizes = {
    small: "text-xs",
    default: "text-xs",
    large: "text-sm"
  };



  if (!hasPermission()) {
    return null;
  }

  return (
    <div className="relative inline-flex items-center">
      <label 
        className={`relative inline-flex items-center cursor-pointer ${className} ${
          disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <input 
          type="checkbox" 
          className="sr-only peer" 
          checked={isChecked}
          onChange={handleToggle}
          disabled={disabled || loading}
        />
        <div className={`${sizeClasses[size]} rounded-full peer ${
          isChecked
            ? 'bg-blue-500' 
            : 'bg-gray-300'
        } ${
          loading ? 'opacity-50' : ''
        } peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:transition-all`}>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white"></div>
            </div>
          )}
        </div>
        <span className={`ml-2 font-medium ${textSizes[size]} ${
          isChecked ? 'text-blue-700' : 'text-gray-700'
        }`}>
          {isChecked ? labels.on : labels.off}
        </span>
      </label>
      
      {/* Tooltip */}
      {loading && (
        <div className={`absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap transition-opacity duration-150 ${
          showTooltip ? 'opacity-100 visible' : 'opacity-0 invisible'
        } z-50`}>
          Updating...
        </div>
      )}
    </div>
  );
};

export default ReusableToggleButton;
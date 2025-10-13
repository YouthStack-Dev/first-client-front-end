import React, { useState } from 'react';
import { icons } from 'lucide-react';
import { logDebug } from '@utils/logger';

const DefaultIcon = icons.AlertCircle || icons.Info;

const ReusableButton = ({
  module,
  action,
  icon: IconComponent,
  title,
  buttonName,
  onClick,
  size = 16,
  className = "text-sidebar-danger-600 hover:text-sidebar-danger-700 transition-colors",
  disabled = false
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

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      alert('Default: No function provided');
    }
  };

  const IconToUse = IconComponent || DefaultIcon;

  if (!hasPermission()) {
    return null;
  }

  return (
    <div className="relative inline-flex">
      <button
        className={`inline-flex items-center justify-center p-1 rounded ${className} ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        disabled={disabled}
      >
        <IconToUse size={size} />
        {buttonName && (
          <span className="ml-2">{buttonName}</span>
        )}
      </button>
      
      {/* Custom Tailwind Tooltip */}
    {title && (
  <div className={`absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap transition-opacity duration-150 ${
    showTooltip ? 'opacity-100 visible' : 'opacity-0 invisible'
  } z-50`}>
    {title}
  </div>
)}
    </div>
  );
};

export default ReusableButton;
export const permissions =  [
  {
      "module": "booking",
      "action": [
          "read",
          "create",
          "update",
          "delete"
      ]
  },
  {
      "module": "driver",
      "action": [
          "delete",
          "update",
          "create",
          "read"
      ]
  },
  {
      "module": "employee",
      "action": [
          "delete",
          "create",
          "update",
          "read"
      ]
  },
  {
      "module": "route-booking",
      "action": [
          "create",
          "update",
          "delete",
          "read"
      ]
  },
  {
      "module": "route",
      "action": [
          "create",
          "read",
          "update",
          "delete"
      ]
  },
  {
      "module": "shift",
      "action": [
          "create",
          "read",
          "update",
          "delete"
      ]
  },
  {
      "module": "team",
      "action": [
          "delete",
          "create",
          "read",
          "update"
      ]
  },
  {
      "module": "admin.tenant",
      "action": [
          "create",
          "read",
          "update",
          "delete"
      ]
  },
  {
      "module": "vehicle",
      "action": [
          "create",
          "read",
          "update",
          "delete"
      ]
  },
  {
      "module": "vehicle-type",
      "action": [
          "create",
          "read",
          "update",
          "delete"
      ]
  },
  {
      "module": "vendor",
      "action": [
          "create",
          "read",
          "update",
          "delete"
      ]
  },
  {
      "module": "vendor-user",
      "action": [
          "delete",
          "create",
          "read",
          "update"
      ]
  },
  {
      "module": "weekoff-config",
      "action": [
          "create",
          "read",
          "update",
          "delete"
      ]
  },
  {
      "module": "cutoff",
      "action": [
          "delete",
          "update",
          "create",
          "read"
      ]
  },
  {
      "module": "permissions",
      "action": [
          "create",
          "read",
          "update",
          "delete"
      ]
  },
  {
      "module": "policy",
      "action": [
          "create",
          "read",
          "update",
          "delete"
      ]
  },
  {
      "module": "role",
      "action": [
          "create",
          "read",
          "update",
          "delete"
      ]
  }
]
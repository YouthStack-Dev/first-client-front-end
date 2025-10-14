import React from 'react';
import { logDebug } from '../../utils/logger';
import { toast } from 'react-toastify';

const tabs = [
  { id: 'personalDetails', label: 'PERSONAL DETAILS' },
  { id: 'documents', label: 'DOCUMENTS' },
];

const DriverTabNavigation = ({ activeTab, errors = {}, onTabChange, validateTab }) => {
  logDebug('Driver errors', errors);

  const handleTabClick = (tabId) => {
    if (tabId === activeTab) return;

    // Validate current tab before switching
    if (validateTab) {
      const currentErrors = validateTab(activeTab);
      if (Object.keys(currentErrors).length > 0) {
        toast.error("Please fix errors in this tab before switching");
        return; // Block tab switch
      }
    }

    onTabChange(tabId);
  };

  return (
    <div className="border-b border-gray-200">
      <div className="flex">
        {tabs.map(({ id, label }) => {
          const isActive = activeTab === id;
          const hasError = !!errors[id]; // boolean

          const baseStyle = 'py-3 px-6 font-medium text-sm focus:outline-none relative';
          const activeStyle = 'border-b-2 border-blue-600 text-blue-600 bg-blue-50';
          const inactiveStyle = 'text-gray-500 hover:text-gray-700 hover:border-gray-300';
          const errorStyle = hasError && !isActive ? 'text-red-600' : '';

          return (
            <button
              key={id}
              className={`${baseStyle} ${isActive ? activeStyle : inactiveStyle} ${errorStyle}`}
              onClick={() => handleTabClick(id)}
              aria-label={`${label}${hasError ? ' - Error in this section' : ''}`}
            >
              {label}
              {hasError && (
                <div
                  className="absolute -right-1 -top-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs"
                  aria-hidden="true"
                >
                  !
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DriverTabNavigation;

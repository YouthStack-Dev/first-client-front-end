import React from 'react';

const DriverTabNavigation = ({ activeTab, errors, onTabChange }) => {
  const tabs = [
    { id: 'personalDetails', label: 'PERSONAL DETAILS' },
    { id: 'documents', label: 'DOCUMENTS' }
  ];

  return (
    <div className="border-b  border-gray-200">
      <div className="flex">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const hasError = errors[tab.id];

          return (
            <button
              key={tab.id}
              className={`
                py-3 px-6 font-medium text-sm focus:outline-none relative
                ${isActive 
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50' 
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
                ${hasError && !isActive ? 'text-red-600' : ''}
              `}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
              {hasError && (
                <div className="absolute -right-1 -top-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs">
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

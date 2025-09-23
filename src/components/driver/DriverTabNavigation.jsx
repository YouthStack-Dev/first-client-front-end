import React from 'react';
import PropTypes from 'prop-types';

const DriverTabNavigationUI = ({ 
  tabs = [
    { id: 'personalDetails', label: 'PERSONAL DETAILS' },
    { id: 'documents', label: 'DOCUMENTS' },
  ],
  activeTab = 'personalDetails',
  errors = {},
  onTabChange = () => {},
  disabledTabs = [],
  tabStyleConfig = {
    base: 'py-3 px-6 font-medium text-sm focus:outline-none relative',
    active: 'border-b-2 border-blue-600 text-blue-600 bg-blue-50',
    inactive: 'text-gray-500 hover:text-gray-700 hover:border-gray-300',
    error: 'text-red-600',
    errorIndicator: 'absolute -right-1 -top-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs'
  }
}) => {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex" aria-label="Driver form tabs">
        {tabs.map(({ id, label, icon }) => {
          const isActive = activeTab === id;
          const hasError = errors[id];
          const isDisabled = disabledTabs.includes(id);
          
          return (
            <button
              key={id}
              className={`
                ${tabStyleConfig.base}
                ${isActive ? tabStyleConfig.active : tabStyleConfig.inactive}
                ${hasError && !isActive ? tabStyleConfig.error : ''}
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onClick={() => !isDisabled && onTabChange(id)}
              disabled={isDisabled}
              aria-current={isActive ? 'page' : undefined}
              aria-label={`${label}${hasError ? ' - Error in this section' : ''}`}
            >
              <div className="flex items-center">
                {icon && <span className="mr-2">{icon}</span>}
                {label}
              </div>
              {hasError && (
                <div
                  className={tabStyleConfig.errorIndicator}
                  aria-hidden="true"
                >
                  !
                </div>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

DriverTabNavigationUI.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    icon: PropTypes.node
  })),
  activeTab: PropTypes.string,
  errors: PropTypes.object,
  onTabChange: PropTypes.func,
  disabledTabs: PropTypes.arrayOf(PropTypes.string),
  tabStyleConfig: PropTypes.shape({
    base: PropTypes.string,
    active: PropTypes.string,
    inactive: PropTypes.string,
    error: PropTypes.string,
    errorIndicator: PropTypes.string
  })
};

export default DriverTabNavigationUI;
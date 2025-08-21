import React from 'react';

const ActiveFilterToggle = ({
  viewActive,
  setViewActive,
  activeCount,
  inactiveCount,
  activeLabel = "Active",
  inactiveLabel = "Inactive",
  // Responsive settings
  responsive = true,
  mobileCollapse = true,
  // Custom class overrides
  containerClass = "flex bg-gray-100 p-1 rounded-lg border border-gray-200 w-fit",
  buttonBaseClass = "flex items-center px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-all duration-200",
  activeButtonClass = "bg-white shadow-sm border border-gray-200 text-blue-600",
  inactiveButtonClass = "text-gray-500 hover:text-gray-700 hover:bg-gray-50",
  activeDotClass = "w-2 h-2 rounded-full bg-green-500 mr-2",
  inactiveDotClass = "w-2 h-2 rounded-full bg-gray-400 mr-2",
  countBaseClass = "ml-2 text-xs px-2 py-0.5 rounded-full",
  activeCountClass = "bg-blue-100 text-blue-600",
  inactiveCountClass = "bg-gray-100 text-gray-600",
  className = ""
}) => {
  // For mobile collapsed view (shows only icons and counts)
  if (mobileCollapse && responsive) {
    return (
      <div className={`${containerClass} ${className}`}>
        <button
          onClick={() => setViewActive(true)}
          className={`${buttonBaseClass} ${
            viewActive ? activeButtonClass : inactiveButtonClass
          }`}
          aria-label={activeLabel}
        >
          <div className={activeDotClass}></div>
          {/* Show full text on medium screens and up, only count on small screens */}
          <span className="hidden sm:inline">{activeLabel}</span>
          {viewActive && (
            <span className={`${countBaseClass} ${activeCountClass}`}>
              {activeCount}
            </span>
          )}
          {!viewActive && (
            <span className="sm:hidden ml-1 text-xs">{activeCount}</span>
          )}
        </button>
        
        <button
          onClick={() => setViewActive(false)}
          className={`${buttonBaseClass} ${
            !viewActive ? activeButtonClass : inactiveButtonClass
          }`}
          aria-label={inactiveLabel}
        >
          <div className={inactiveDotClass}></div>
          {/* Show full text on medium screens and up, only count on small screens */}
          <span className="hidden sm:inline">{inactiveLabel}</span>
          {!viewActive && (
            <span className={`${countBaseClass} ${inactiveCountClass}`}>
              {inactiveCount}
            </span>
          )}
          {viewActive && (
            <span className="sm:hidden ml-1 text-xs">{inactiveCount}</span>
          )}
        </button>
      </div>
    );
  }

  // Standard responsive version
  return (
    <div className={`${containerClass} ${className}`}>
      <button
        onClick={() => setViewActive(true)}
        className={`${buttonBaseClass} ${
          viewActive ? activeButtonClass : inactiveButtonClass
        }`}
      >
        <div className={activeDotClass}></div>
        {/* Responsive text - full on medium+, truncated on small */}
        <span className="hidden sm:inline">{activeLabel}</span>
        <span className="sm:hidden">Active</span>
        {viewActive && (
          <span className={`${countBaseClass} ${activeCountClass}`}>
            {activeCount}
          </span>
        )}
      </button>
      
      <button
        onClick={() => setViewActive(false)}
        className={`${buttonBaseClass} ${
          !viewActive ? activeButtonClass : inactiveButtonClass
        }`}
      >
        <div className={inactiveDotClass}></div>
        {/* Responsive text - full on medium+, truncated on small */}
        <span className="hidden sm:inline">{inactiveLabel}</span>
        <span className="sm:hidden">Inactive</span>
        {!viewActive && (
          <span className={`${countBaseClass} ${inactiveCountClass}`}>
            {inactiveCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default ActiveFilterToggle;
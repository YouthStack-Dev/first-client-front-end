import React from 'react';

const ToolBar = ({
  title,
  subtitle,
  onAddClick,
  addButtonLabel,
  addButtonIcon,
  className = '',
  searchBar = null,
  leftElements = null,
  rightElements = null,
  mobileLayout = 'stacked', // 'stacked' or 'compact'
  searchBarPriority = true, // Whether search bar takes priority on mobile
}) => {
  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      {/* Header section */}
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h2 className="text-xl font-semibold text-gray-800">{title}</h2>}
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}

      {/* Toolbar content - Responsive layout */}
      <div className="flex flex-col lg:flex-row items-stretch justify-between gap-4">
        {/* Left side - Search and filters */}
        <div className={`flex-1 flex flex-col ${mobileLayout === 'stacked' ? 'gap-3' : 'sm:flex-row sm:items-center gap-2'}`}>
          {searchBar && (
            <div className={`${searchBarPriority ? 'flex-1 min-w-0' : 'w-full'} ${mobileLayout === 'compact' ? 'sm:flex-1' : ''}`}>
              {searchBar}
            </div>
          )}
          
          {leftElements && (
            <div className={`flex flex-wrap items-center gap-2 ${mobileLayout === 'stacked' ? 'w-full' : ''}`}>
              {leftElements}
            </div>
          )}
        </div>

        {/* Right side - Actions and buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          {rightElements}
          {onAddClick && (
            <button
              onClick={onAddClick}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white 
                text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none 
                focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors
                shadow-sm hover:shadow-md whitespace-nowrap min-w-[fit-content]"
            >
              {addButtonIcon}
              <span>{addButtonLabel}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ToolBar;
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

      {/* Toolbar content */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Left side - Search and filters */}
        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {searchBar && (
            <div className="flex-1 min-w-[200px] max-w-xl">
              {searchBar}
            </div>
          )}
          {leftElements && (
            <div className="flex flex-wrap gap-2">
              {leftElements}
            </div>
          )}
        </div>

        {/* Right side - Actions and buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {rightElements}
          {onAddClick && (
            <button
              onClick={onAddClick}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white 
                text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none 
                focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors
                shadow-sm hover:shadow-md"
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
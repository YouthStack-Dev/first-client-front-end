import React from 'react';
import PropTypes from 'prop-types';

const DriverToolbarUI = ({ 
  // Filter related props
  filters = {
    driverStatus: 'All',
    vendorId: 'All'
  },
  vendorOptions = [],
  statusOptions = [
    { value: 'ACTIVE', label: 'Active Driver' },
    { value: 'INACTIVE', label: 'Inactive Driver' }
  ],
  
  // Action related props
  showAddDriver = true,
  showBulkUpload = false,
  showManageCompliance = false,
  
  // Event handlers
  onFilterChange = () => {},
  onAddDriver = () => {},
  onBulkUpload = () => {},
  onManageCompliance = () => {},
  
  // Customization
  className = '',
  buttonClasses = 'px-4 py-2 rounded hover:opacity-90',
  selectClasses = 'border border-gray-300 rounded px-2 py-1'
}) => {
  return (
    <div className={`flex flex-wrap items-center justify-between bg-gray-100 p-4 rounded shadow mb-6 space-y-4 md:space-y-0 ${className}`}>
      {/* Filters Section */}
      <div className="flex flex-wrap items-center gap-4 md:gap-6">
        {/* Driver Status Filter */}
        <div className="flex items-center gap-2">
          <label className="font-semibold">Driver Status:</label>
          <select 
            title="Driver Status"
            value={filters.driverStatus}
            onChange={(e) => onFilterChange('driverStatus', e.target.value)}
            className={selectClasses}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Vendor Filter */}
        {vendorOptions.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="font-semibold">Vendor:</label>
            <select 
              title="Vendor"
              value={filters.vendorId}
              onChange={(e) => onFilterChange('vendorId', e.target.value)}
              className={selectClasses}
            >
              {vendorOptions.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Actions Section */}
      <div className="flex flex-wrap gap-2 md:gap-4">
        {showAddDriver && (
          <button
            onClick={onAddDriver}
            className={`bg-blue-600 text-white ${buttonClasses}`}
            aria-label="Add Driver"
            title="Add Driver"
          >
            Add Driver
          </button>
        )}

        {showBulkUpload && (
          <button
            onClick={onBulkUpload}
            className={`bg-blue-600 text-white ${buttonClasses}`}
            aria-label="Bulk Upload"
            title="Bulk Upload"
          >
            Bulk Upload
          </button>
        )}

        {showManageCompliance && (
          <button
            onClick={onManageCompliance}
            className={`bg-green-600 text-white ${buttonClasses}`}
            aria-label="Manage Compliance"
            title="Manage Compliance"
          >
            Manage Compliance
          </button>
        )}
      </div>
    </div>
  );
};

DriverToolbarUI.propTypes = {
  filters: PropTypes.shape({
    driverStatus: PropTypes.string,
    vendorId: PropTypes.string
  }),
  vendorOptions: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  })),
  statusOptions: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired
  })),
  showAddDriver: PropTypes.bool,
  showBulkUpload: PropTypes.bool,
  showManageCompliance: PropTypes.bool,
  onFilterChange: PropTypes.func,
  onAddDriver: PropTypes.func,
  onBulkUpload: PropTypes.func,
  onManageCompliance: PropTypes.func,
  className: PropTypes.string,
  buttonClasses: PropTypes.string,
  selectClasses: PropTypes.string
};

DriverToolbarUI.defaultProps = {
  filters: {
    driverStatus: 'All',
    vendorId: 'All'
  },
  vendorOptions: [],
  statusOptions: [
    { value: 'ACTIVE', label: 'Active Driver' },
    { value: 'INACTIVE', label: 'Inactive Driver' }
  ],
  showAddDriver: true,
  showBulkUpload: false,
  showManageCompliance: false
};

export default DriverToolbarUI;
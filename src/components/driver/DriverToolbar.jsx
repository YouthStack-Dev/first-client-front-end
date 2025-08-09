import React, { useState } from 'react';

const DriverToolbar = ({ vendors = [], onFilterChange, onAddDriver, onBulkUpload, onManageCompliance }) => {
  const [driverStatus, setDriverStatus] = useState('ALL');
  const [vendorId, setVendorId] = useState('ALL');

  const handleStatusChange = (e) => {
    const status = e.target.value;
    setDriverStatus(status);
    onFilterChange({ driverStatus: status, vendorId });
  };

  const handleVendorChange = (e) => {
    const selectedVendorId = e.target.value;
    setVendorId(selectedVendorId);
    onFilterChange({ driverStatus, vendorId: selectedVendorId });
  };

  return (
    <div className="flex flex-wrap items-center justify-between bg-gray-100 p-4 rounded shadow mb-6 space-y-4 md:space-y-0">
      {/* Filters Section */}
      <div className="flex flex-wrap items-center space-x-6">
        {/* Driver Status */}
        <div className="flex items-center space-x-2">
          <label className="font-semibold">Driver Status:</label>
          <select
            title="Driver Status"
            value={driverStatus}
            onChange={handleStatusChange}
            className="border border-gray-300 rounded px-2 py-1"
          >
            <option value="ALL">All</option>
            <option value="ACTIVE">Active Driver</option>
            <option value="INACTIVE">Inactive Driver</option>
            {/* <option value="BLACKLIST">Blacklisted Driver</option> */}
          </select>
        </div>

        {/* Vendor */}
        <div className="flex items-center space-x-2">
          <label className="font-semibold">Vendor:</label>
          <select
            title="vendor"
            value={vendorId}
            onChange={handleVendorChange}
            className="border border-gray-300 rounded px-2 py-1"
          >
            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Actions Section */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={onAddDriver}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          aria-label="Add Driver"
          title="Add Driver"
        >
          Add Driver
        </button>

        {/* Uncomment if needed */}
        {/* 
        <button
          onClick={onBulkUpload}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          aria-label="Bulk Upload"
          title="Bulk Upload"
        >
          Bulk Upload
        </button>

        <button
          onClick={onManageCompliance}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          aria-label="Manage Compliance"
          title="Manage Compliance"
        >
          Manage Compliance
        </button> 
        */}
      </div>
    </div>
  );
};

export default DriverToolbar;

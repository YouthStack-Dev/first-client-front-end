import React, { useState } from 'react';

const DriverToolbar = ({ vendors = [], onFilterChange, onBulkUpload, onManageCompliance }) => {
  const [driverStatus, setDriverStatus] = useState('All');
  const [vendorType, setVendorType] = useState('All');

  const handleStatusChange = (e) => {
    const value = e.target.value;
    setDriverStatus(value);
    onFilterChange?.({ driverStatus: value, vendorType });
  };

  const handleVendorChange = (e) => {
    const value = e.target.value;
    setVendorType(value);
    onFilterChange?.({ driverStatus, vendorType: value });
  };

  return (
    <div className="flex flex-wrap items-center justify-between bg-gray-100 p-4 rounded shadow mb-6">
      {/* Driver Status Filter */}
      <div className="flex space-x-4 items-center">
        <label className="font-semibold mr-2">Driver Status:</label>
        <select
          value={driverStatus}
          onChange={handleStatusChange}
          className="border border-gray-300 rounded px-2 py-1"
        >
          <option value="All">All</option>
          <option value="Active">Active Driver</option>
          <option value="Inactive">Inactive Driver</option>
          <option value="Blacklisted">Blacklisted Driver</option>
        </select>
      </div>

      {/* Vendor Type Filter */}
      <div className="flex space-x-4 items-center mt-2 md:mt-0">
        <label className="font-semibold mr-2">Vendor Type:</label>
        <select
          value={vendorType}
          onChange={handleVendorChange}
          className="border border-gray-300 rounded px-2 py-1"
        >
          <option value="All">All</option>
          {vendors.map((vendor) => (
            <option key={vendor.id} value={vendor.type}>
              {vendor.type}
            </option>
          ))}
        </select>
      </div>

      {/* Buttons */}
      <div className="flex space-x-4 mt-4 md:mt-0">
        <button
          onClick={onBulkUpload}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none"
        >
          Bulk Upload
        </button>
        <button
          onClick={onManageCompliance}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 focus:outline-none"
        >
          Manage Compliance
        </button>
      </div>
    </div>
  );
};

export default DriverToolbar;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DriverToolbar = ({ vendors = [], onFilterChange, onBulkUpload, onManageCompliance }) => {
  const [driverStatus, setDriverStatus] = useState('All');
  const [vendorId, setVendorId] = useState('All');
  const navigate = useNavigate();

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
          <label htmlFor="driverStatus" className="font-semibold">Driver Status:</label>
          <select
            id="driverStatus"
            name="driverStatus"
            value={driverStatus}
            onChange={handleStatusChange}
            className="border border-gray-300 rounded px-2 py-1"
            aria-label="Filter by driver status"
          >
            <option value="ALL">All</option>
            <option value="ACTIVE">Active Driver</option>
            <option value="INACTIVE">Inactive Driver</option>
          </select>
        </div>

        {/* Vendor */}
        <div className="flex items-center space-x-2">
          <label htmlFor="vendorSelect" className="font-semibold">Vendor:</label>
          <select
            id="vendorSelect"
            name="vendorSelect"
            value={vendorId}
            onChange={handleVendorChange}
            className="border border-gray-300 rounded px-2 py-1"
            aria-label="Filter by vendor"
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
          onClick={() => navigate('/driver-form')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          aria-label="Add new driver"
        >
          Add Driver
        </button>
        <button
          onClick={onBulkUpload}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          aria-label="Bulk upload drivers"
        >
          Bulk Upload
        </button>
        <button
          onClick={onManageCompliance}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          aria-label="Manage driver compliance"
        >
          Manage Compliance
        </button>
      </div>
    </div>
  );
};

export default DriverToolbar;

import React, { useState } from 'react';
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
const VehicleList = ({
    vehicles = [],
    onNext,
    onPrev,
    currentPage = 1,
    totalPages = 1,
    isLoading = false,
    handleEdit,
    handleView,
    handleToggleStatus,
    handleDelete,
    selectedItems = [],
    onSelectItem,
  }) => {



    const [selectAll, setSelectAll] = useState(false);
  
    // Add serial numbers to vehicles data
    const vehiclesWithSerial = vehicles.map((vehicle, index) => ({
      ...vehicle,
      serialNumber: index + 1 + (currentPage - 1) * 10
    }));
  
    // Handle select all checkbox
    const handleSelectAll = () => {
      const newSelectAll = !selectAll;
      setSelectAll(newSelectAll);
      
      if (newSelectAll) {
        vehiclesWithSerial.forEach(vehicle => {
          if (!selectedItems.includes(vehicle.id)) {
            onSelectItem?.(vehicle.id);
          }
        });
      } else {
        vehiclesWithSerial.forEach(vehicle => {
          if (selectedItems.includes(vehicle.id)) {
            onSelectItem?.(vehicle.id);
          }
        });
      }
    };
  
    // Handle individual item select
    const handleItemSelect = (vehicleId) => {
      onSelectItem?.(vehicleId);
    };
  
    // Loading skeleton row
    const LoadingSkeleton = () => (
      <>
        {[...Array(5)].map((_, index) => (
          <tr key={index} className="border-b border-gray-200">
            <td className="px-6 py-4">
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </td>
            <td className="px-6 py-4">
              <div className="h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
            </td>
            <td className="px-6 py-4">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center justify-center">
                <div className="h-6 w-11 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-4 w-12 bg-gray-200 rounded ml-2 animate-pulse"></div>
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
            </td>
            <td className="px-6 py-4">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
            </td>
            <td className="px-6 py-4">
              <div className="space-y-1">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="flex gap-2">
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </td>
          </tr>
        ))}
      </>
    );
  
    // Status toggle component
    const StatusToggle = ({ vehicle, onToggle }) => {
      const isActive = vehicle.isActive === true;
      
      return (
        <div className="flex items-center justify-center">
          <button
            onClick={() => onToggle?.(vehicle)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isActive ? 'bg-green-500' : 'bg-gray-300'
            }`}
            title={`Click to ${isActive ? 'deactivate' : 'activate'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isActive ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`ml-2 text-xs font-medium ${
            isActive ? 'text-green-700' : 'text-gray-500'
          }`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      );
    };
  
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
  
  
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  S. No.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle No.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <LoadingSkeleton />
              ) : vehiclesWithSerial.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0M15 17a2 2 0 104 0" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-lg font-medium">No vehicles found</p>
                      <p className="text-gray-400 text-sm">Add some vehicles to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                vehiclesWithSerial.map((vehicle) => (
                  <tr 
                    key={vehicle.vehicle_id} 
                    className={`hover:bg-gray-50 transition-colors ${
                      selectedItems.includes(vehicle.vehicle_id) ? 'bg-blue-50' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(vehicle.vehicle_id)}
                        onChange={() => handleItemSelect(vehicle.vehicle_id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
  
                    {/* Serial Number */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {vehicle.serialNumber}
                    </td>
  
                    {/* Vehicle ID */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {vehicle.vehicle_code}
                      </span>
                    </td>
  
                    {/* Registration Number */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-blue-600">
                        {vehicle.reg_number}
                      </span>
                    </td>
  
                    {/* Model */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {vehicle.model}
                    </td>
  
                    {/* Vendor */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {vehicle.vendor}
                      </span>
                    </td>
  
                    {/* Driver Info */}
                    <td className="px-6 py-4">
                      {vehicle.driverName ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {vehicle.driverName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {vehicle.driverMobile}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">No driver assigned</span>
                      )}
                    </td>
  
                    {/* Status Toggle */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusToggle vehicle={vehicle} onToggle={handleToggleStatus} />
                    </td>
  
                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex justify-center items-center gap-2">
                        {/* View Button */}
                        <button
                          onClick={() => handleView?.(vehicle)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Vehicle"
                        >
                          <Eye size={16} />
                        </button>
  
                        {/* Edit Button */}
                        <button
                          onClick={() => handleEdit?.(vehicle)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit Vehicle"
                        >
                          <Edit size={16} />
                        </button>
  
                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete?.(vehicle)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Vehicle"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
  
        {/* Pagination */}
        {!isLoading && vehiclesWithSerial.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onPrev}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <button
                  onClick={onNext}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  
  export default VehicleList;
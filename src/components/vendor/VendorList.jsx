import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Truck } from 'lucide-react';
import VendorCard from './VendorCard';
import { fetchVendorsThunk } from '../../redux/features/vendors/vendorThunk';

const VendorList = ({ onEditVendor }) => {
  const dispatch = useDispatch();
  const { data: vendors = [], loading, error } = useSelector(state => state.vendor);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');


useEffect(() => {
  if (vendors.length === 0) {
    dispatch(fetchVendorsThunk());
  }
}, [dispatch]);

  // Filter vendors by search term and status
  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch =
      vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="Pending">Pending</option>
          <option value="Suspended">Suspended</option>
        </select>
      </div>

      {/* Loading/Error */}
      {loading && <p>Loading vendors...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{vendors.length}</div>
          <div className="text-sm text-gray-600">Total Vendors</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">
            {vendors.filter(v => v.status === 'Active').length}
          </div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">
            {vendors.filter(v => v.status === 'Pending').length}
          </div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-red-600">
            {vendors.filter(v => v.status === 'Suspended').length}
          </div>
          <div className="text-sm text-gray-600">Suspended</div>
        </div>
      </div>

      {/* Vendors Grid */}
      {filteredVendors.length === 0 && !loading ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600">No vendors found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {filteredVendors.map(vendor => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              onEdit={() => onEditVendor?.(vendor)} // ✅ pass edit handler
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorList;

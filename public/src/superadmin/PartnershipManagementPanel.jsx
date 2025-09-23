import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Check, Building2, Truck, Link2, Unlink } from 'lucide-react';

const PartnershipManagementPanel = () => {
  const [companies, setCompanies] = useState([
    { id: 1, name: 'ABC Logistics', vendors: [101, 102] },
    { id: 2, name: 'XYZ Transport', vendors: [101] },
    { id: 3, name: 'Global Shipping Co.', vendors: [103] },
    { id: 4, name: 'Fast Delivery Inc.', vendors: [] },
  ]);

  const [vendors, setVendors] = useState([
    { id: 101, name: 'City Truckers', companies: [1, 2] },
    { id: 102, name: 'Regional Haulers', companies: [1] },
    { id: 103, name: 'Express Movers', companies: [3] },
    { id: 104, name: 'Heavy Load Specialists', companies: [] },
  ]);

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('assign');

  // Filter companies and vendors based on search
  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const assignVendorToCompany = (companyId, vendorId) => {
    setCompanies(prev => prev.map(company =>
      company.id === companyId
        ? { ...company, vendors: [...company.vendors, vendorId] }
        : company
    ));

    setVendors(prev => prev.map(vendor =>
      vendor.id === vendorId
        ? { ...vendor, companies: [...vendor.companies, companyId] }
        : vendor
    ));
  };

  const removeVendorFromCompany = (companyId, vendorId) => {
    setCompanies(prev => prev.map(company =>
      company.id === companyId
        ? { ...company, vendors: company.vendors.filter(id => id !== vendorId) }
        : company
    ));

    setVendors(prev => prev.map(vendor =>
      vendor.id === vendorId
        ? { ...vendor, companies: vendor.companies.filter(id => id !== companyId) }
        : vendor
    ));
  };

  const getVendorName = (vendorId) => {
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor ? vendor.name : 'Unknown Vendor';
  };

  const getCompanyName = (companyId) => {
    const company = companies.find(c => c.id === companyId);
    return company ? company.name : 'Unknown Company';
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Partnership Management</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('assign')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'assign'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Assign Partnerships
          </button>
          <button
            onClick={() => setActiveTab('view')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'view'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            View All
          </button>
        </div>
      </div>

      {activeTab === 'assign' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Companies Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Companies
            </h3>
            <div className="mb-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredCompanies.map(company => (
                <div
                  key={company.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedCompany?.id === company.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedCompany(company)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{company.name}</span>
                    <span className="text-sm text-gray-500">
                      {company.vendors.length} vendors
                    </span>
                  </div>
                  {company.vendors.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Vendors: </span>
                      {company.vendors.map(vendorId => getVendorName(vendorId)).join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Vendors Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Truck className="w-5 h-5 mr-2" />
              Vendors
            </h3>
            <div className="mb-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vendors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredVendors.map(vendor => (
                <div
                  key={vendor.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedVendor?.id === vendor.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedVendor(vendor)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{vendor.name}</span>
                    <span className="text-sm text-gray-500">
                      {vendor.companies.length} companies
                    </span>
                  </div>
                  {vendor.companies.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Companies: </span>
                      {vendor.companies.map(companyId => getCompanyName(companyId)).join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Assignment Controls */}
          <div className="lg:col-span-2 bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Link2 className="w-5 h-5 mr-2" />
              Assignment Controls
            </h3>
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
              <div className="flex-1">
                <div className="text-sm text-gray-600">Selected Company</div>
                <div className="font-medium">
                  {selectedCompany ? selectedCompany.name : 'None selected'}
                </div>
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-600">Selected Vendor</div>
                <div className="font-medium">
                  {selectedVendor ? selectedVendor.name : 'None selected'}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    if (selectedCompany && selectedVendor) {
                      assignVendorToCompany(selectedCompany.id, selectedVendor.id);
                    }
                  }}
                  disabled={!selectedCompany || !selectedVendor}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Assign
                </button>
                <button
                  onClick={() => {
                    if (selectedCompany && selectedVendor) {
                      removeVendorFromCompany(selectedCompany.id, selectedVendor.id);
                    }
                  }}
                  disabled={!selectedCompany || !selectedVendor}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-4 h-4 mr-2" />
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'view' && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">All Partnerships</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {companies.map(company => (
              <div key={company.id} className="bg-white p-4 rounded-lg border">
                <h4 className="font-semibold text-blue-600 flex items-center">
                  <Building2 className="w-4 h-4 mr-2" />
                  {company.name}
                </h4>
                <div className="mt-2">
                  <span className="text-sm text-gray-600">Assigned Vendors:</span>
                  {company.vendors.length === 0 ? (
                    <div className="text-sm text-gray-400 italic mt-1">No vendors assigned</div>
                  ) : (
                    <ul className="mt-1 space-y-1">
                      {company.vendors.map(vendorId => {
                        const vendor = vendors.find(v => v.id === vendorId);
                        return vendor ? (
                          <li key={vendorId} className="flex items-center justify-between text-sm">
                            <span>{vendor.name}</span>
                            <button
                              onClick={() => removeVendorFromCompany(company.id, vendorId)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Unlink className="w-4 h-4" />
                            </button>
                          </li>
                        ) : null;
                      })}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnershipManagementPanel;
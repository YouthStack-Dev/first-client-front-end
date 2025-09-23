import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Truck, Users, Phone, Mail, MapPin, Building2 } from 'lucide-react';
import AssignEntityModal from '../layout/AssignEntityModal';
import { fetchCompaniesThunk } from '../../redux/features/company/companyThunks';
import { fetchCompaniesByVendorThunk, assignCompaniesToVendorThunk } from '../../redux/features/companyVendor/companyVendorThunks';

const VendorCard = ({ vendor = {}, onEdit }) => {
  const dispatch = useDispatch();

  // Global state slices
  const companyState = useSelector(state => state.company || {});
  const companyVendorState = useSelector(state => state.companyVendor || {});

  // All companies (for assignment modal)
  const allCompanies = useMemo(() => companyState.data || [], [companyState.data]);

  // Companies assigned to this vendor
  const assignedCompanies = useMemo(() => 
    companyVendorState.companiesByVendor?.[vendor.id] || [], 
    [companyVendorState.companiesByVendor, vendor.id]
  );

  // Check if this vendor's companies are already loaded
  const companiesLoaded = useMemo(() => 
    vendor.id in companyVendorState.companiesByVendor,
    [companyVendorState.companiesByVendor, vendor.id]
  );

  // Check if this vendor's companies are currently loading
  const companiesLoading = useMemo(() => 
    companyVendorState.loadingVendors?.[vendor.id] || false,
    [companyVendorState.loadingVendors, vendor.id]
  );

  const vendorCompaniesError = companyVendorState.error || null;
  const assigning = companyVendorState.assigning || false;

  const [isAssignOpen, setAssignOpen] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // Fetch companies assigned to this vendor if not cached
  useEffect(() => {
    if (vendor.id && !companiesLoaded && !companiesLoading && !hasFetched) {
      dispatch(fetchCompaniesByVendorThunk(vendor.id));
      setHasFetched(true);
    }
  }, [vendor.id, companiesLoaded, companiesLoading, hasFetched, dispatch]);

  // Reset hasFetched when vendor changes
  useEffect(() => {
    setHasFetched(false);
  }, [vendor.id]);

  // Open assignment modal & fetch all companies if not loaded
  const handleOpenAssign = () => {
    if (allCompanies.length === 0) {
      dispatch(fetchCompaniesThunk());
    }
    setAssignOpen(true);
  };

  // Save assigned companies
  const handleAssignSave = (selectedCompanyIds) => {
    dispatch(assignCompaniesToVendorThunk({ vendorId: vendor.id, companyIds: selectedCompanyIds }));
    setAssignOpen(false);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col h-[420px]">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Truck className="w-6 h-6" />
              <h3 className="text-lg font-semibold truncate">{vendor.name || 'N/A'}</h3>
            </div>
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                vendor.isActive ? 'bg-green-800 text-white' : 'bg-red-600 text-white'
              }`}
            >
              {vendor.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Vendor Details */}
        <div className="p-4 space-y-3 flex-shrink-0">
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="w-4 h-4 mr-2" />
            <span className="truncate">{vendor.email || 'N/A'}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="w-4 h-4 mr-2" />
            <span>{vendor.phone || 'N/A'}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users className="w-4 h-4 mr-2" />
            <span>{vendor.fleetSize ?? 0} vehicles</span>
          </div>
          <div className="flex items-start text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{vendor.address || 'N/A'}</span>
          </div>
        </div>

        {/* Assigned Companies */}
        <div className="pt-3 border-t border-gray-100 flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-2 px-4 flex-shrink-0">
            <div className="flex items-center text-sm font-medium text-gray-700">
              <Building2 className="w-4 h-4 mr-2" />
              Assigned Companies
            </div>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {assignedCompanies.length} companies
            </span>
          </div>

          {companiesLoading && !assignedCompanies.length ? (
            <div className="text-center py-4 text-gray-400 text-sm flex-1 flex items-center justify-center">
              Loading companies...
            </div>
          ) : vendorCompaniesError ? (
            <div className="text-center py-4 text-red-400 text-sm flex-1 flex items-center justify-center">
              Error loading companies
            </div>
          ) : assignedCompanies.length === 0 ? (
            <div className="text-center py-4 text-gray-400 text-sm flex-1 flex items-center justify-center">
              <div>
                <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                No companies assigned yet
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-2">
              {assignedCompanies.map((company) => (
                <div key={company.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-gray-800 truncate">{company.name}</span>
                    <span className="text-xs text-gray-500 truncate">{company.email}</span>
                    <span className="text-xs text-gray-500 truncate">{company.phone}</span>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full ml-2 flex-shrink-0">
                    Partner
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center flex-shrink-0">
          <span className="text-xs text-gray-500 whitespace-nowrap">
            Since: {vendor.onboardedAt ? new Date(vendor.onboardedAt).toLocaleDateString() : 'N/A'}
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit?.(vendor)}
              className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
            >
              Edit
            </button>
            <button
              onClick={handleOpenAssign}
              className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              Assign Company
            </button>
          </div>
        </div>
      </div>

      {/* Assign Entity Modal */}
      <AssignEntityModal
        isOpen={isAssignOpen}
        onClose={() => setAssignOpen(false)}
        sourceEntity={{ id: vendor.id, name: vendor.name, type: 'vendor' }}
        targetEntities={allCompanies}
        assignedIds={assignedCompanies.map(c => c.id)}
        renderItem={(company, isSelected) => (
          <div
            className={`p-3 border rounded-lg cursor-pointer transition-all mb-2 ${
              isSelected ? 'bg-blue-100 border-blue-400' : 'bg-white hover:bg-gray-50'
            }`}
          >
            <div className="font-medium text-gray-800">{company.name}</div>
            <div className="text-xs text-gray-500">{company.email}</div>
            <div className="text-xs text-gray-500">{company.phone}</div>
          </div>
        )}
        onSave={handleAssignSave}
        loading={assigning}
      />
    </>
  );
};

export default VendorCard;
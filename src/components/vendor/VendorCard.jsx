import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Truck, Users, Phone, Mail, MapPin, Building2 } from 'lucide-react';
import AssignEntityModal from '../layout/AssignEntityModal';
import { fetchCompaniesThunk } from '../../redux/features/company/companyThunks';
import { assignCompaniesToVendorThunk } from '../../redux/features/companyVendor/companyVendorThunks';

// Separate component for assigned companies list
const AssignedCompaniesList = ({ companies, loading, error }) => {
  if (loading && !companies.length) {
    return (
      <div className="text-center py-4 text-gray-400 text-sm flex-1 flex items-center justify-center">
        Loading companies...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-400 text-sm flex-1 flex items-center justify-center">
        Error loading companies
      </div>
    );
  }

  if (!companies.length) {
    return (
      <div className="text-center py-4 text-gray-400 text-sm flex-1 flex items-center justify-center">
        <div>
          <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
          No companies assigned yet
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-2">
      {companies.map((company) => (
        <div
          key={company.id}
          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
        >
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
  );
};

const VendorCard = ({ vendor = {} }) => {
  const dispatch = useDispatch();

  const companyState = useSelector((state) => state.company || {});
  const companyVendorState = useSelector((state) => state.companyVendor || {});

  const allCompanies = useMemo(() => companyState.data || [], [companyState.data]);

  const assignedCompanies = useMemo(
    () => companyVendorState.companiesByVendor?.[vendor.vendor_id] || [],
    [companyVendorState.companiesByVendor, vendor.vendor_id]
  );

  const companiesLoading = useMemo(
    () => companyVendorState.loadingVendors?.[vendor.vendor_id] || false,
    [companyVendorState.loadingVendors, vendor.vendor_id]
  );

  const vendorCompaniesError = companyVendorState.error || null;
  const assigning = companyVendorState.assigning || false;

  const [isAssignOpen, setAssignOpen] = useState(false);

  const handleOpenAssign = () => {
    if (!allCompanies.length) {
      dispatch(fetchCompaniesThunk());
    }
    setAssignOpen(true);
  };

  // Async-safe assign
  const handleAssignSave = async (selectedCompanyIds) => {
    try {
      await dispatch(
        assignCompaniesToVendorThunk({
          vendorId: vendor.vendor_id,
          companyIds: selectedCompanyIds,
        })
      ).unwrap();
      setAssignOpen(false);
    } catch (err) {
      console.error('Assign companies failed:', err);
      // Optional: show toast notification here
    }
  };

  const statusText = vendor.is_active ? 'Active' : 'Inactive';
  const statusColor = vendor.is_active ? 'bg-green-800 text-white' : 'bg-red-600 text-white';
  const onboardedDate = vendor.created_at ? new Date(vendor.created_at).toLocaleDateString() : 'N/A';

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
            <span className={`px-2 py-1 text-xs rounded-full ${statusColor}`}>{statusText}</span>
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

          <AssignedCompaniesList
            companies={assignedCompanies}
            loading={companiesLoading}
            error={vendorCompaniesError}
          />
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center flex-shrink-0">
          <span className="text-xs text-gray-500 whitespace-nowrap">Since: {onboardedDate}</span>
          <div className="flex space-x-2">
            <button
              onClick={handleOpenAssign}   // 👈 opens AssignEntityModal
              className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
            >
              Edit
            </button>
          </div>
        </div>
      </div>

      {/* Assign Entity Modal */}
      <AssignEntityModal
        isOpen={isAssignOpen}
        onClose={() => setAssignOpen(false)}
        sourceEntity={{ id: vendor.vendor_id, name: vendor.name, type: 'vendor' }}
        targetEntities={allCompanies}
        assignedIds={assignedCompanies.map((c) => c.id)}
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

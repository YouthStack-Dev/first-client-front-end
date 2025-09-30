import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Building2, Truck, Mail, Phone, MapPin, Link2 } from "lucide-react";
import AssignEntityModal from "../components/modals/AssignEntityModal";
import { fetchVendorsThunk } from "../redux/features/vendors/vendorThunk";
import {
  fetchVendorsByCompanyThunk,
  assignVendorsToCompanyThunk,
} from "../redux/features/companyVendor/companyVendorThunks";

const CompanyCard = ({ company, onEditCompany }) => {
  const dispatch = useDispatch();

  // Redux slices
  const vendorState = useSelector((state) => state.vendor || {});
  const companyVendorState = useSelector((state) => state.companyVendor || {});

  // All vendors (for assignment modal)
  const allVendors = useMemo(() => vendorState.data || [], [vendorState.data]);

  // Vendors assigned to this company
  const companyVendorsList = useMemo(() => {
    const vendors = companyVendorState.vendorsByCompany?.[company.id];
    return Array.isArray(vendors) ? vendors : [];
  }, [companyVendorState.vendorsByCompany, company.id]);

  const vendorsLoading = vendorState.loading || false;
  const companyVendorsLoading = companyVendorState.loading || false;
  const companyVendorsError = companyVendorState.error || null;
  const assigning = companyVendorState.assigning || false;

  const [isAssignOpen, setAssignOpen] = useState(false);


  // Fetch assigned vendors if not already loaded
useEffect(() => {
  if (company?.id && !companyVendorState.vendorsByCompany[company.id]) {
    dispatch(fetchVendorsByCompanyThunk(company.id));
  }
}, [company?.id, dispatch]); 


  // Open modal and ensure all vendors loaded
  const handleOpenAssign = () => {
    if (allVendors.length === 0) {
      dispatch(fetchVendorsThunk());
    }
    setAssignOpen(true);
  };

  // Save assigned vendors
const handleAssignSave = (selectedVendorIds) => {
  dispatch(assignVendorsToCompanyThunk({ companyId: company.id, vendorIds: selectedVendorIds }));
  setAssignOpen(false);
};


  return (
    <>
      <div className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col h-[420px]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Building2 className="w-6 h-6" />
              <h3 className="text-lg font-semibold truncate">{company.name}</h3>
            </div>
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                company.isActive ? "bg-blue-800 text-white" : "bg-gray-400 text-white"
              }`}
            >
              {company.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {/* Company Details */}
        <div className="p-4 space-y-3 flex-shrink-0">
          {company.email && (
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="w-4 h-4 mr-2" />
              <span className="truncate">{company.email}</span>
            </div>
          )}
          {company.phone && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="w-4 h-4 mr-2" />
              <span>{company.phone}</span>
            </div>
          )}
          {company.address && (
            <div className="flex items-start text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">{company.address}</span>
            </div>
          )}
        </div>

        {/* Vendors Section */}
        <div className="pt-3 border-t border-gray-100 flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-2 px-4 flex-shrink-0">
            <div className="flex items-center text-sm font-medium text-gray-700">
              <Link2 className="w-4 h-4 mr-2" />
              Assigned Vendors
            </div>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {companyVendorsList.length} vendors
            </span>
          </div>

          {companyVendorsLoading ? (
            <div className="text-center py-4 text-gray-400 text-sm flex-1 flex items-center justify-center">
              Loading vendors...
            </div>
          ) : companyVendorsError ? (
            <div className="text-center py-4 text-red-400 text-sm flex-1 flex items-center justify-center">
              Error loading vendors
            </div>
          ) : companyVendorsList.length === 0 ? (
            <div className="text-center py-4 text-gray-400 text-sm flex-1 flex items-center justify-center">
              <div>
                <Truck className="w-8 h-8 mx-auto mb-2 opacity-50" />
                No vendors assigned yet
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-4 pb-2">
              <div className="space-y-2">
                {companyVendorsList.map((vendor) => (
                  <div
                    key={vendor.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <Truck className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-800 truncate">
                        {vendor.name}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ml-2 flex-shrink-0 ${
                        vendor.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {vendor.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center flex-shrink-0">
          <span className="text-xs text-gray-500 whitespace-nowrap">
            Created: {company.createdAt ? new Date(company.createdAt).toLocaleDateString() : "N/A"}
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => onEditCompany?.(company)}
              className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              Edit
            </button>
            <button
              onClick={handleOpenAssign}
              className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
            >
              Assign Vendor
            </button>
          </div>
        </div>
      </div>

      {/* Assign Entity Modal */}
      <AssignEntityModal
        isOpen={isAssignOpen}
        onClose={() => setAssignOpen(false)}
        sourceEntity={{ id: company.id, name: company.name, type: "company" }}
        targetEntities={allVendors}
        assignedIds={companyVendorsList.map((v) => v.id)}
        onSave={handleAssignSave}
        loading={assigning}
      />
    </>
  );
};

export default CompanyCard;

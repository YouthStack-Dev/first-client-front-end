import React, { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Building2,
  Truck,
  Mail,
  Phone,
  MapPin,
  Link2,
  Edit2,
  Power,
  PowerOff,
} from "lucide-react";
import AssignEntityModal from "@components/modals/AssignEntityModal";
import { toggleCompanyStatusThunk } from "../redux/features/company/companyThunks";

const CompanyVendorsList = ({ vendors, loading, error }) => {
  if (loading) {
    return (
      <div className="text-center py-4 text-gray-400 text-sm flex-1 flex items-center justify-center">
        Loading vendors...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-400 text-sm flex-1 flex items-center justify-center">
        Error loading vendors
      </div>
    );
  }

  if (!vendors.length) {
    return (
      <div className="text-center py-4 text-gray-400 text-sm flex-1 flex items-center justify-center">
        <div>
          <Truck className="w-8 h-8 mx-auto mb-2 opacity-50" />
          No vendors assigned yet
        </div>
      </div>
    );
  }

  const uniqueVendors = Array.from(
    new Map(vendors.map((v) => [v.vendor_id || v.name, v])).values()
  );

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-2">
      <div className="space-y-2">
        {uniqueVendors.map((vendor, index) => (
          <div
            key={`vendor-${vendor.vendor_id ?? index}`}
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
                vendor.is_active
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {vendor.is_active ? "Active" : "Inactive"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const CompanyCard = ({ company, onEditCompany }) => {
  const dispatch = useDispatch();
  const vendorState = useSelector((state) => state.vendor || {});
  const allVendors = useMemo(() => vendorState.data || [], [vendorState.data]);
  const [isActive, setIsActive] = useState(company.is_active);
  const [isAssignOpen, setAssignOpen] = useState(false);
  const [companyVendorsListState, setCompanyVendorsListState] = useState([]);

  const companyVendorsList = useMemo(() => {
    return allVendors.filter((v) => v.tenant_id === company.tenant_id);
  }, [allVendors, company.tenant_id]);

  const companyVendorsLoading = vendorState.loading || false;
  const companyVendorsError = vendorState.error || null;

  useEffect(() => {
    setIsActive(company.is_active);
    setCompanyVendorsListState(companyVendorsList);
  }, [company.is_active, companyVendorsList]);

  const handleToggle = async () => {
    const newStatus = !isActive;
    setIsActive(newStatus);
    try {
      await dispatch(
        toggleCompanyStatusThunk({ tenant_id: company.tenant_id })
      ).unwrap();
    } catch (err) {
      console.error("Failed to toggle status:", err);
      setIsActive(!newStatus); // revert on failure
    }
  };

  const handleOpenAssign = () => setAssignOpen(true);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString();
  };

  return (
    <>
      <div
        className={`bg-white rounded-xl shadow-md border hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col h-[420px] relative ${
          isActive ? "border-gray-200" : "border-red-300"
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 text-white flex-shrink-0 relative ${
            isActive
              ? "bg-gradient-to-r from-blue-600 to-blue-700"
              : "bg-gradient-to-r from-red-500 to-red-600"
          }`}
        >
          <div className="flex items-center space-x-3">
            <Building2 className="w-6 h-6" />
            <h3 className="text-lg font-semibold truncate">{company.name}</h3>
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
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                isActive
                  ? "bg-blue-100 text-blue-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {companyVendorsListState.length} vendors
            </span>
          </div>

          <CompanyVendorsList
            vendors={companyVendorsListState}
            loading={companyVendorsLoading}
            error={companyVendorsError}
          />
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-bold text-gray-700 whitespace-nowrap">
              {formatDate(company.created_at)}
            </span>
            <button
              onClick={handleToggle}
              className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
                isActive
                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                  : "bg-red-100 text-red-800 hover:bg-red-200"
              }`}
              title={isActive ? "Deactivate Company" : "Activate Company"}
            >
              {isActive ? (
                <>
                  <Power className="w-4 h-4" />
                  <span>Active</span>
                </>
              ) : (
                <>
                  <PowerOff className="w-4 h-4" />
                  <span>Inactive</span>
                </>
              )}
            </button>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onEditCompany?.(company)}
              className={`p-2 rounded-full text-white transition-colors ${
                isActive
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-500 hover:bg-gray-600"
              }`}
              title="Edit Company"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleOpenAssign}
              className={`p-2 rounded-full text-white transition-colors ${
                isActive
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-500 hover:bg-gray-600"
              }`}
              title="Assign Vendor"
              disabled={companyVendorsLoading || !isActive}
            >
              <Link2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      <AssignEntityModal
        isOpen={isAssignOpen}
        onClose={() => setAssignOpen(false)}
        sourceEntity={{
          id: company.tenant_id,
          type: "company",
          tenant_id: company.tenant_id,
        }}
        targetEntities={allVendors}
        assignedIds={companyVendorsListState.map((v) => v.vendor_id)}
        onSaveSuccess={(newVendor) => {
          setCompanyVendorsListState((prev) => {
            if (prev.some((v) => v.vendor_id === newVendor.vendor_id))
              return prev;
            return [...prev, newVendor];
          });
        }}
      />
    </>
  );
};

export default CompanyCard;

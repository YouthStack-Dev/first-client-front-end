  import React, { useState, useMemo, useEffect } from "react";
  import { useDispatch, useSelector } from "react-redux";
  import { Building2, Truck, Mail, Phone, MapPin, Link2 } from "lucide-react";
  import AssignEntityModal from "../components/layout/AssignEntityModal";

  // Vendor list component
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

    // Remove duplicate vendors by vendor_id
    const uniqueVendors = Array.from(
      new Map(vendors.map(v => [v.vendor_id || v.name, v])).values()
    );

    return (
      <div className="flex-1 overflow-y-auto px-4 pb-2">
        <div className="space-y-2">
          {uniqueVendors.map((vendor, index) => (
            <div
              key={vendor.vendor_id || `${vendor.name}-${index}`} // fallback key
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

    const [companyVendorsListState, setCompanyVendorsListState] = useState([]);
    const [isAssignOpen, setAssignOpen] = useState(false);

    const companyVendorsList = useMemo(() => {
      return allVendors.filter((v) => v.tenant_id === company.tenant_id);
    }, [allVendors, company.tenant_id]);

    const companyVendorsLoading = vendorState.loading || false;
    const companyVendorsError = vendorState.error || null;

    // Sync local state with Redux vendor list
    useEffect(() => {
      setCompanyVendorsListState(companyVendorsList);
    }, [companyVendorsList]);

    const handleOpenAssign = () => setAssignOpen(true);

    const handleAssignSave = async (vendorData) => {
      try {
        // Dispatch createVendorThunk (adjust import if needed)
        const newVendor = await dispatch(
          createVendorThunk({
            ...vendorData,
            tenant_id: company.tenant_id,
          })
        ).unwrap();

        // Prevent duplicates
        setCompanyVendorsListState((prev) => {
          if (prev.some((v) => v.vendor_id === newVendor.vendor_id)) return prev;
          return [...prev, newVendor];
        });

        setAssignOpen(false);
      } catch (err) {
        console.error("Create vendor failed:", err);
      }
    };

    const formatDate = (dateString) => {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString();
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
                  company.is_active ? "bg-green-600 text-white" : "bg-red-400 text-white"
                }`}
              >
                {company.is_active ? "Active" : "Inactive"}
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
            <span className="text-xs text-gray-500 whitespace-nowrap">
              Created: {formatDate(company.created_at)}
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
                disabled={companyVendorsLoading}
                aria-label="Assign vendor to company"
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
          sourceEntity={{
            id: company.tenant_id,
            // name: company.name,
            type: "company",
            tenant_id: company.tenant_id,
          }}
          targetEntities={allVendors}
          assignedIds={companyVendorsListState.map((v) => v.vendor_id)}
          onSave={handleAssignSave}
          onSaveSuccess={(newVendor) => {
            setCompanyVendorsListState((prev) => {
              if (prev.some((v) => v.vendor_id === newVendor.vendor_id)) return prev;
              return [...prev, newVendor];
            });
          }}
        />
      </>
    );
  };

  export default CompanyCard;

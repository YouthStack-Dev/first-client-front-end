// src/pages/CompanyManagement.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus } from "lucide-react";
import EntityModal from "@components/EntityModal";
import CompanyList from "../companies/CompanyList";
import {
  fetchCompaniesThunk,
  createCompanyThunk,
  updateTenantThunk,
  fetchCompanyByIdThunk, // fetch full tenant details including permissions
} from "../redux/features/company/companyThunks";

const CompanyManagement = () => {
  const dispatch = useDispatch();
  const { data: companies = [], loading, error } = useSelector(
    (state) => state.company || {}
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' or 'edit'
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [loadingTenant, setLoadingTenant] = useState(false);
  const [tenantCache, setTenantCache] = useState({}); // cache for fetched tenants

  // Fetch companies once on component mount
  useEffect(() => {
    if (companies.length === 0) {
      dispatch(fetchCompaniesThunk());
    }
  }, [dispatch, companies.length]);

  // Open modal in create mode
  const handleCreate = () => {
    setModalMode("create");
    setSelectedEntity(null);
    setIsModalOpen(true);
  };

  // Open modal in edit mode with full tenant data including permissions
  const handleEdit = async (company) => {
    setModalMode("edit");

    // If tenant already cached, use it
    if (tenantCache[company.tenant_id]) {
      setSelectedEntity(tenantCache[company.tenant_id]);
      setIsModalOpen(true);
      return;
    }

    setLoadingTenant(true);

    try {
      const response = await dispatch(fetchCompanyByIdThunk(company.tenant_id)).unwrap();

      const entity = {
        id: company.id,
        company: {
          tenant_id: response.tenant.tenant_id,
          name: response.tenant.name,
          address: response.tenant.address,
           latitude: response.tenant.latitude,     // ✅ Added
          longitude: response.tenant.longitude, 
          is_active: response.tenant.is_active,
        },
        employee_email: response.tenant.employee?.email || "",
        employee_phone: response.tenant.employee?.phone || "",
        permissions: response.admin_policy?.permissions || [],
      };

      // Cache the tenant for future edits
      setTenantCache((prev) => ({ ...prev, [company.tenant_id]: entity }));

      setSelectedEntity(entity);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch tenant details:", err);
    } finally {
      setLoadingTenant(false);
    }
  };

  // Handle form submission from modal
const handleSubmit = async (formData) => {
  try {
    if (modalMode === "create") {
      await dispatch(createCompanyThunk(formData)).unwrap();
    } else if (modalMode === "edit" && selectedEntity) {
      // 🟢 Dispatch the update request
      const updatedTenant = await dispatch(
        updateTenantThunk({
          tenantId: selectedEntity?.company?.tenant_id,
          data: formData,
        })
      ).unwrap();

      const tenantId = selectedEntity?.company?.tenant_id;

      // 🟢 Safely update tenantCache (avoid undefined errors)
      setTenantCache((prev) => {
        const existingTenant = prev[tenantId] || { company: {} };

        return {
          ...prev,
          [tenantId]: {
            ...existingTenant,
            company: {
              ...existingTenant.company,
              ...updatedTenant,
            },
          },
        };
      });
    }

    // 🟢 Close modal after success
    setIsModalOpen(false);
  } catch (err) {
    console.error("Failed to save company:", err);
  }
};




  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Companies Management
            </h1>
            <p className="text-gray-600">
              Manage all registered transportation companies
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Company
          </button>
        </div>

        {/* Company List */}
        {loading ? (
          <p>Loading companies...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : (
          <CompanyList companies={companies} onEditCompany={handleEdit} />
        )}

        {/* Entity Modal */}
        <EntityModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          entityType="company"
          entityData={selectedEntity}
          onSubmit={handleSubmit}
          mode={modalMode}
          loading={loadingTenant} 
        />
      </div>
    </div>
  );
};

export default CompanyManagement;
